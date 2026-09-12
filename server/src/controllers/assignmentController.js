const assignmentService = require('../services/assignmentService');

class AssignmentController {
  async createAssignment(req, res, next) {
    try {
      const assignment = await assignmentService.createAssignment(req.body, req.user.id);
      res.status(201).json({
        success: true,
        message: 'Assignment created successfully',
        data: assignment,
        error: null,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  async getStudentAssignments(req, res, next) {
    try {
      const assignments = await assignmentService.getStudentAssignments(req.user.id);
      res.json({
        success: true,
        message: 'Student assignments fetched successfully',
        data: assignments,
        error: null,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  async submitAssignment(req, res, next) {
    try {
      const result = await assignmentService.submitAssignment(req.body, req.user.id, false);
      res.json({
        success: true,
        message: 'Assignment submitted successfully',
        data: result,
        error: null,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  async evaluateSubmission(req, res, next) {
    try {
      const { submissionId, marksAwarded, teacherFeedback } = req.body;
      const result = await assignmentService.evaluateSubmission(submissionId, marksAwarded, teacherFeedback);
      res.json({
        success: true,
        message: 'Submission evaluated successfully',
        data: result,
        error: null,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AssignmentController();
