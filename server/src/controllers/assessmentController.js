const assessmentRepository = require('../repositories/assessmentRepository');
const assessmentService = require('../services/assessmentService');

class AssessmentController {
  async getAssessments(req, res, next) {
    try {
      const { subjectId, type } = req.query;
      const assessments = await assessmentRepository.findAllAssessments({ subjectId, type });
      res.json({
        success: true,
        message: 'Assessments retrieved successfully',
        data: assessments,
        error: null,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  async getAssessmentById(req, res, next) {
    try {
      const assessment = await assessmentRepository.findAssessmentById(req.params.id);
      if (!assessment) {
        return res.status(404).json({
          success: false,
          message: 'Assessment not found',
          data: null,
          error: 'NOT_FOUND'
        });
      }

      // Sanitize answers when starting test
      const sanitizedQuestions = assessment.questions.map(q => {
        const { correct_answer_json, ...rest } = q;
        return rest;
      });

      res.json({
        success: true,
        message: 'Assessment details retrieved',
        data: {
          ...assessment,
          questions: sanitizedQuestions
        },
        error: null,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  async submitAttempt(req, res, next) {
    try {
      const result = await assessmentService.evaluateAttempt(req.body, req.user.id, false);
      res.json({
        success: true,
        message: 'Assessment submitted and evaluated successfully',
        data: result,
        error: null,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AssessmentController();
