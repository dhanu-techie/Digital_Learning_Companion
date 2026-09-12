const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');

class UserRepository {
  async findByUsername(username) {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0] || null;
  }

  async findByEmail(email) {
    const [rows] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  }

  async ensureDefaultSchool() {
    const [schools] = await db.query('SELECT id FROM schools LIMIT 1');
    if (schools[0]) return schools[0].id;

    const organizationId = uuidv4();
    const schoolId = uuidv4();
    await db.query(
      'INSERT INTO organizations (id, name, code) VALUES (?, ?, ?)',
      [organizationId, 'Rural Education Mission Trust', 'REMT_ORG']
    );
    await db.query(
      `INSERT INTO schools (id, organization_id, name, code, district, state)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [schoolId, organizationId, 'Govt Higher Secondary School - District A', 'GHSS_DIST_A', 'Dharmapuri', 'Tamil Nadu']
    );
    return schoolId;
  }

  async findById(id) {
    const [rows] = await db.query('SELECT id, school_id, username, email, role, first_name, last_name, preferred_language, avatar_url, status FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  }

  async createUser(userData) {
    const { id, schoolId, username, email, phoneNumber, passwordHash, role, firstName, lastName, preferredLanguage } = userData;
    await db.query(
      `INSERT INTO users (id, school_id, username, email, phone_number, password_hash, role, first_name, last_name, preferred_language)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, schoolId || null, username, email || null, phoneNumber || null, passwordHash, role, firstName, lastName, preferredLanguage || 'en']
    );
    return this.findById(id);
  }

  async createStudentProfile(studentData) {
    const { id, userId, rollNumber, grade, board, dateOfBirth } = studentData;
    await db.query(
      `INSERT INTO students (id, user_id, roll_number, grade, board, date_of_birth)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, userId, rollNumber || null, grade, board, dateOfBirth || null]
    );
  }

  async findStudentByUserId(userId) {
    const [rows] = await db.query(
      `SELECT s.*, u.first_name, u.last_name, u.username, u.email, u.preferred_language, u.school_id
       FROM students s
       JOIN users u ON s.user_id = u.id
       WHERE s.user_id = ?`,
      [userId]
    );
    return rows[0] || null;
  }

  async createTeacherProfile(teacherData) {
    const { id, userId, employeeId, qualification } = teacherData;
    await db.query(
      `INSERT INTO teachers (id, user_id, employee_id, qualification)
       VALUES (?, ?, ?, ?)`,
      [id, userId, employeeId || null, qualification || null]
    );
  }

  async findTeacherByUserId(userId) {
    // Sanitizes and omits sensitive phone numbers & personal emails per privacy rules
    const [rows] = await db.query(
      `SELECT t.id, t.user_id, t.employee_id, t.qualification, t.is_available_for_doubts,
              t.doubt_start_time, t.doubt_end_time, t.max_doubts_per_day,
              u.first_name, u.last_name, u.school_id
       FROM teachers t
       JOIN users u ON t.user_id = u.id
       WHERE t.user_id = ?`,
      [userId]
    );
    return rows[0] || null;
  }

  async findClassroomForStudent(userId) {
    const [rows] = await db.query(
      `SELECT tsr.teacher_id, tsr.subject_id, tsr.class_id, u.first_name as teacher_first_name, u.last_name as teacher_last_name, s.name as subject_name
       FROM teacher_student_relationships tsr
       JOIN students st ON st.id = tsr.student_id
       JOIN teachers t ON t.id = tsr.teacher_id
       JOIN users u ON u.id = t.user_id
       LEFT JOIN subjects s ON s.id = tsr.subject_id
       WHERE st.user_id = ?
       LIMIT 1`,
      [userId]
    );
    return rows[0] || null;
  }

  async assignStudentToDefaultClassroom(userId) {
    const student = await this.findStudentByUserId(userId);
    if (!student) return;

    const [classes] = await db.query('SELECT id FROM classes ORDER BY created_at ASC LIMIT 1');
    const [teachers] = await db.query('SELECT id FROM teachers ORDER BY created_at ASC LIMIT 1');
    const [subjects] = await db.query('SELECT id FROM subjects ORDER BY created_at ASC LIMIT 1');
    if (!classes[0] || !teachers[0]) return;

    const enrollId = `e${student.id.slice(1)}`;
    await db.query(
      'INSERT IGNORE INTO class_enrollments (id, class_id, student_id) VALUES (?, ?, ?)',
      [enrollId, classes[0].id, student.id]
    );

    const relId = `r${student.id.slice(1)}`;
    await db.query(
      `INSERT IGNORE INTO teacher_student_relationships (id, teacher_id, student_id, class_id, subject_id)
       VALUES (?, ?, ?, ?, ?)`,
      [relId, teachers[0].id, student.id, classes[0].id, subjects[0]?.id || null]
    );
  }

  async updateTeacherAvailability(userId, availabilityData) {
    const { isAvailableForDoubts, doubtStartTime, doubtEndTime, maxDoubtsPerDay } = availabilityData;
    await db.query(
      `UPDATE teachers
       SET is_available_for_doubts = ?, doubt_start_time = ?, doubt_end_time = ?, max_doubts_per_day = ?
       WHERE user_id = ?`,
      [isAvailableForDoubts, doubtStartTime, doubtEndTime, maxDoubtsPerDay, userId]
    );
  }
}

module.exports = new UserRepository();
