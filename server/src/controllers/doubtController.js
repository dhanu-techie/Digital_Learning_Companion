const doubtService = require('../services/doubtService');
const doubtRepository = require('../repositories/doubtRepository');

class DoubtController {
  async createDoubt(req, res, next) {
    try {
      const doubt = await doubtService.createDoubt(req.body, req.user.id);
      res.status(201).json({
        success: true,
        message: 'Doubt thread created successfully',
        data: doubt,
        error: null,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  async getDoubts(req, res, next) {
    try {
      let doubts = [];
      if (req.user.role === 'student') {
        doubts = await doubtService.getStudentDoubts(req.user.id);
      } else if (req.user.role === 'teacher') {
        doubts = await doubtService.getTeacherDoubts(req.user.id);
      }

      res.json({
        success: true,
        message: 'Doubts retrieved successfully',
        data: doubts,
        error: null,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  async getDoubtById(req, res, next) {
    try {
      const thread = await doubtRepository.findDoubtById(req.params.id);
      if (!thread) {
        return res.status(404).json({
          success: false,
          message: 'Doubt thread not found',
          data: null,
          error: 'NOT_FOUND'
        });
      }
      res.json({
        success: true,
        message: 'Doubt retrieved',
        data: thread,
        error: null,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  async replyDoubt(req, res, next) {
    try {
      const { messageText, voiceNoteUrl, attachmentUrl } = req.body;
      const doubt = await doubtService.replyToDoubt(
        req.params.id,
        req.user.id,
        req.user.role,
        messageText,
        voiceNoteUrl,
        attachmentUrl
      );

      res.json({
        success: true,
        message: 'Reply added to doubt thread',
        data: doubt,
        error: null,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new DoubtController();
