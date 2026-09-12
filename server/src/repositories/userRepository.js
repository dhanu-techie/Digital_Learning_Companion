const db = require('../config/db');

class UserRepository {
  async findByUsername(username) {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0] || null;
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
