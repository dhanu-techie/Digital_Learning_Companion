const db = require('../config/db');

class SchoolAdminRepository {
  async createSchool(schoolData) {
    const { id, organizationId, name, code, district, state, address } = schoolData;
    await db.query(
      `INSERT INTO schools (id, organization_id, name, code, district, state, address)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, organizationId, name, code, district || null, state || null, address || null]
    );
    return this.findSchoolById(id);
  }

  async findSchoolById(id) {
    const [rows] = await db.query('SELECT * FROM schools WHERE id = ?', [id]);
    return rows[0] || null;
  }

  async findAllSchools() {
    const [rows] = await db.query('SELECT * FROM schools ORDER BY name ASC');
    return rows;
  }

  async createClass(classData) {
    const { id, schoolId, name, grade, section, academicYear } = classData;
    await db.query(
      `INSERT INTO classes (id, school_id, name, grade, section, academic_year)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, schoolId, name, grade, section || null, academicYear]
    );
    return this.findClassById(id);
  }

  async findClassById(id) {
    const [rows] = await db.query('SELECT * FROM classes WHERE id = ?', [id]);
    return rows[0] || null;
  }

  async enrollStudent(id, classId, studentId) {
    await db.query(
      `INSERT INTO class_enrollments (id, class_id, student_id)
       VALUES (?, ?, ?)`,
      [id, classId, studentId]
    );
  }

  async assignTeacher(id, teacherId, studentId, classId, subjectId) {
    await db.query(
      `INSERT INTO teacher_student_relationships (id, teacher_id, student_id, class_id, subject_id)
       VALUES (?, ?, ?, ?, ?)`,
      [id, teacherId, studentId, classId, subjectId || null]
    );
  }
}

module.exports = new SchoolAdminRepository();
