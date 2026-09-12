const userRepository = require('../repositories/userRepository');
const analyticsRepository = require('../repositories/analyticsRepository');
const recommendationService = require('../services/recommendationService');

class StudentController {
  async getProfile(req, res, next) {
    try {
      const student = await userRepository.findStudentByUserId(req.user.id);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student profile not found',
          data: null,
          error: 'NOT_FOUND'
        });
      }

      res.json({
        success: true,
        message: 'Student profile retrieved',
        data: student,
        error: null,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  async getProgress(req, res, next) {
    try {
      const student = await userRepository.findStudentByUserId(req.user.id);
      const studentId = student ? student.id : req.user.id;

      const topicMastery = await analyticsRepository.getTopicMastery(studentId);
      const attempts = await require('../repositories/assessmentRepository').findAttemptsByStudentId(studentId);

      res.json({
        success: true,
        message: 'Student progress retrieved',
        data: {
          topicMastery,
          assessmentAttempts: attempts
        },
        error: null,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  async getRecommendations(req, res, next) {
    try {
      const student = await userRepository.findStudentByUserId(req.user.id);
      const studentId = student ? student.id : req.user.id;

      const recommendations = await recommendationService.getStudentRecommendations(studentId);
      res.json({
        success: true,
        message: 'Recommendations retrieved',
        data: recommendations,
        error: null,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new StudentController();
