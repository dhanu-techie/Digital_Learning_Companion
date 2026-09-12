const db = require('../config/db');

class AnalyticsRepository {
  async getTopicMastery(studentId) {
    const [rows] = await db.query(
      `SELECT tm.*, t.title as topic_title, c.title as chapter_title, s.name as subject_name
       FROM topic_mastery tm
       JOIN topics t ON tm.topic_id = t.id
       JOIN chapters c ON t.chapter_id = c.id
       JOIN courses co ON c.course_id = co.id
       JOIN subjects s ON co.subject_id = s.id
       WHERE tm.student_id = ?`,
      [studentId]
    );
    return rows;
  }

  async updateTopicMastery(studentId, topicId, isCorrect) {
    const [existing] = await db.query(
      `SELECT * FROM topic_mastery WHERE student_id = ? AND topic_id = ?`,
      [studentId, topicId]
    );

    if (existing.length === 0) {
      const id = require('uuid').v4();
      const attempts = 1;
      const successful = isCorrect ? 1 : 0;
      const pct = isCorrect ? 100.0 : 0.0;
      const status = pct < 50.0 ? 'needs_remediation' : (pct >= 80.0 ? 'mastered' : 'developing');

      await db.query(
        `INSERT INTO topic_mastery (id, student_id, topic_id, mastery_percentage, total_attempts, successful_attempts, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, studentId, topicId, pct, attempts, successful, status]
      );
    } else {
      const row = existing[0];
      const attempts = row.total_attempts + 1;
      const successful = row.successful_attempts + (isCorrect ? 1 : 0);
      const pct = ((successful / attempts) * 100).toFixed(2);
      const status = pct < 50.0 ? 'needs_remediation' : (pct >= 80.0 ? 'mastered' : 'developing');

      await db.query(
        `UPDATE topic_mastery
         SET mastery_percentage = ?, total_attempts = ?, successful_attempts = ?, status = ?, last_evaluated_at = NOW()
         WHERE id = ?`,
        [pct, attempts, successful, status, row.id]
      );
    }
  }

  async createRecommendation(recData) {
    const { id, studentId, topicId, lessonId, recommendationType, reason, priority } = recData;
    await db.query(
      `INSERT INTO recommendations (id, student_id, topic_id, lesson_id, recommendation_type, reason, priority)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, studentId, topicId || null, lessonId || null, recommendationType, reason, priority || 'medium']
    );
  }

  async getActiveRecommendations(studentId) {
    const [rows] = await db.query(
      `SELECT r.*, t.title as topic_title
       FROM recommendations r
       LEFT JOIN topics t ON r.topic_id = t.id
       WHERE r.student_id = ? AND r.is_dismissed = FALSE
       ORDER BY r.created_at DESC`,
      [studentId]
    );
    return rows;
  }

  async getStudentsNeedingTeacherIntervention(teacherId) {
    // Flags students with mastery < 50% across subjects taught by teacher
    const [rows] = await db.query(
      `SELECT tm.student_id, u.first_name, u.last_name, t.title as topic_title, tm.mastery_percentage, tm.total_attempts
       FROM topic_mastery tm
       JOIN students s ON tm.student_id = s.id
       JOIN users u ON s.user_id = u.id
       JOIN topics t ON tm.topic_id = t.id
       JOIN teacher_student_relationships tsr ON tsr.student_id = s.id
       WHERE tsr.teacher_id = ? AND tm.mastery_percentage < 50.0 AND tm.total_attempts >= 2
       GROUP BY tm.student_id, tm.topic_id`,
      [teacherId]
    );
    return rows;
  }
}

module.exports = new AnalyticsRepository();
