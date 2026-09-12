const db = require('../config/db');

class GamificationRepository {
  async getStudentStreak(studentId) {
    const [rows] = await db.query(
      `SELECT learning_streak_count, last_active_at FROM students WHERE id = ?`,
      [studentId]
    );
    return rows[0] || { learning_streak_count: 0 };
  }

  async incrementStreak(studentId) {
    await db.query(
      `UPDATE students 
       SET learning_streak_count = learning_streak_count + 1, last_active_at = NOW() 
       WHERE id = ?`,
      [studentId]
    );
  }

  async getAchievements(studentId) {
    const [rows] = await db.query(
      `SELECT a.*, sa.earned_at
       FROM achievements a
       JOIN student_achievements sa ON a.id = sa.achievement_id
       WHERE sa.student_id = ?`,
      [studentId]
    );
    return rows;
  }
}

module.exports = new GamificationRepository();
