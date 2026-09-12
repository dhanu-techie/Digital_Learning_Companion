const userRepository = require('../repositories/userRepository');
const analyticsRepository = require('../repositories/analyticsRepository');
const recommendationService = require('../services/recommendationService');
const assessmentRepository = require('../repositories/assessmentRepository');
const gamificationRepository = require('../repositories/gamificationRepository');

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
      const attempts = await assessmentRepository.findAttemptsByStudentId(studentId);
      const preferences = await analyticsRepository.getPreferences(studentId);
      const streak = await gamificationRepository.getStudentStreak(studentId);

      res.json({
        success: true,
        message: 'Student progress retrieved',
        data: {
          topicMastery,
          assessmentAttempts: attempts,
          preferences,
          streak
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

  async getClassroom(req, res, next) {
    try {
      const classroom = await userRepository.findClassroomForStudent(req.user.id);
      res.json({
        success: true,
        message: 'Classroom retrieved',
        data: classroom,
        error: null,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  async completeLesson(req, res, next) {
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

      await analyticsRepository.saveLessonProgress(student.id, req.params.lessonId);
      await gamificationRepository.incrementStreak(student.id);
      const streak = await gamificationRepository.getStudentStreak(student.id);

      res.json({
        success: true,
        message: 'Lesson marked complete',
        data: { lessonId: req.params.lessonId, streak },
        error: null,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  async savePreferences(req, res, next) {
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

      await analyticsRepository.upsertPreferences(student.id, req.body);
      const preferences = await analyticsRepository.getPreferences(student.id);
      res.json({
        success: true,
        message: 'Learning mode saved',
        data: preferences,
        error: null,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new StudentController();
