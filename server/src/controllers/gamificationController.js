const gamificationRepository = require('../repositories/gamificationRepository');
const userRepository = require('../repositories/userRepository');

class GamificationController {
  async getStreak(req, res, next) {
    try {
      const student = await userRepository.findStudentByUserId(req.user.id);
      const studentId = student ? student.id : req.user.id;

      const streak = await gamificationRepository.getStudentStreak(studentId);
      res.json({
        success: true,
        message: 'Learning streak fetched',
        data: streak,
        error: null,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  async getAchievements(req, res, next) {
    try {
      const student = await userRepository.findStudentByUserId(req.user.id);
      const studentId = student ? student.id : req.user.id;

      const achievements = await gamificationRepository.getAchievements(studentId);
      res.json({
        success: true,
        message: 'Student achievements fetched',
        data: achievements,
        error: null,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new GamificationController();
