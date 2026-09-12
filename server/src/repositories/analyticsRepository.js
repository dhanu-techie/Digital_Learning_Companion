const { v4: uuidv4 } = require('uuid');
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
      const id = uuidv4();
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

  async getTopicMasteryForTopic(studentId, topicId) {
    const [rows] = await db.query(
      `SELECT * FROM topic_mastery WHERE student_id = ? AND topic_id = ?`,
      [studentId, topicId]
    );
    return rows[0] || null;
  }

  async getActiveRecommendations(studentId) {
    const [rows] = await db.query(
      `SELECT r.*, t.title as topic_title, co.id as course_id, co.title as course_title
       FROM recommendations r
       LEFT JOIN topics t ON r.topic_id = t.id
       LEFT JOIN chapters ch ON t.chapter_id = ch.id
       LEFT JOIN courses co ON ch.course_id = co.id
       WHERE r.student_id = ? AND r.is_dismissed = FALSE
       ORDER BY FIELD(r.priority, 'urgent', 'high', 'medium', 'low'), r.created_at DESC`,
      [studentId]
    );
    return rows;
  }

  async findOpenRecommendation(studentId, topicId, recommendationType) {
    const [rows] = await db.query(
      `SELECT id FROM recommendations
       WHERE student_id = ? AND topic_id = ? AND recommendation_type = ? AND is_dismissed = FALSE
       LIMIT 1`,
      [studentId, topicId, recommendationType]
    );
    return rows[0] || null;
  }

  async getStudentsNeedingTeacherIntervention(schoolId) {
    const [rows] = await db.query(
      `SELECT tm.student_id, u.first_name, u.last_name, t.title as topic_title,
              tm.mastery_percentage, tm.total_attempts, tm.status
       FROM topic_mastery tm
       JOIN students s ON tm.student_id = s.id
       JOIN users u ON s.user_id = u.id
       JOIN topics t ON tm.topic_id = t.id
       WHERE u.school_id = ? AND tm.mastery_percentage < 50.0 AND tm.total_attempts >= 1
       ORDER BY tm.mastery_percentage ASC`,
      [schoolId]
    );
    return rows;
  }

  async upsertPreferences(studentId, prefs) {
    const { preferredMode, preferredLessonDurationMinutes, languageCode } = prefs;
    const [existing] = await db.query(
      'SELECT id FROM learning_preferences WHERE student_id = ?',
      [studentId]
    );
    if (existing[0]) {
      await db.query(
        `UPDATE learning_preferences
         SET preferred_mode = ?, preferred_lesson_duration_minutes = ?, language_code = ?
         WHERE student_id = ?`,
        [preferredMode || 'visual', preferredLessonDurationMinutes || 15, languageCode || 'en', studentId]
      );
      return;
    }
    await db.query(
      `INSERT INTO learning_preferences (id, student_id, preferred_mode, preferred_lesson_duration_minutes, language_code)
       VALUES (?, ?, ?, ?, ?)`,
      [uuidv4(), studentId, preferredMode || 'visual', preferredLessonDurationMinutes || 15, languageCode || 'en']
    );
  }

  async getPreferences(studentId) {
    const [rows] = await db.query(
      'SELECT * FROM learning_preferences WHERE student_id = ?',
      [studentId]
    );
    return rows[0] || null;
  }

  async saveLessonProgress(studentId, lessonId) {
    await db.query(
      `INSERT INTO student_progress (id, student_id, lesson_id, is_completed, progress_percentage, completed_at)
       VALUES (?, ?, ?, TRUE, 100, NOW())
       ON DUPLICATE KEY UPDATE is_completed = TRUE, progress_percentage = 100, completed_at = NOW()`,
      [uuidv4(), studentId, lessonId]
    );
  }
}

module.exports = new AnalyticsRepository();
