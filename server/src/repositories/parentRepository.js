const db = require('../config/db');

class ParentRepository {
  async findChildrenByParentUser(userId) {
    const [rows] = await db.query(
      `SELECT s.id as student_id, u.first_name, u.last_name, s.grade, s.board, s.learning_streak_count, psr.relationship_type
       FROM parents p
       JOIN parent_student_relationships psr ON p.id = psr.parent_id
       JOIN students s ON psr.student_id = s.id
       JOIN users u ON s.user_id = u.id
       WHERE p.user_id = ?`,
      [userId]
    );
    return rows;
  }

  async getChildProgressOverview(studentId) {
    const [attempts] = await db.query(
      `SELECT aa.*, a.title as assessment_title
       FROM assessment_attempts aa
       JOIN assessments a ON aa.assessment_id = a.id
       WHERE aa.student_id = ?
       ORDER BY aa.started_at DESC LIMIT 5`,
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
      recentTestAttempts: attempts,
      topicMastery: mastery
    };
  }
}

module.exports = new ParentRepository();
