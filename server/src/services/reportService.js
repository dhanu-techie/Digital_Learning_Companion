const db = require('../config/db');

class ReportService {
  async getStudentReport(studentId) {
    const [attempts] = await db.query(
      `SELECT aa.*, a.title as test_title, s.name as subject_name
       FROM assessment_attempts aa
       JOIN assessments a ON aa.assessment_id = a.id
       JOIN subjects s ON a.subject_id = s.id
       WHERE aa.student_id = ?`,
      [studentId]
    );

    const [mastery] = await db.query(
      `SELECT tm.*, t.title as topic_title
       FROM topic_mastery tm
       JOIN topics t ON tm.topic_id = t.id
       WHERE tm.student_id = ?`,
      [studentId]
    );

    return {
      generatedAt: new Date().toISOString(),
      studentId,
      summary: {
        totalTestsTaken: attempts.length,
        averagePercentage: attempts.length > 0 ? (attempts.reduce((acc, curr) => acc + Number(curr.percentage), 0) / attempts.length).toFixed(2) : 0
      },
      assessmentAttempts: attempts,
      topicMastery: mastery
    };
  }

  async getClassReport(classId) {
    const [students] = await db.query(
      `SELECT s.id as student_id, u.first_name, u.last_name, s.roll_number
       FROM class_enrollments ce
       JOIN students s ON ce.student_id = s.id
       JOIN users u ON s.user_id = u.id
       WHERE ce.class_id = ?`,
      [classId]
    );

    return {
      generatedAt: new Date().toISOString(),
      classId,
      totalEnrolledStudents: students.length,
      students
    };
  }
}

module.exports = new ReportService();
