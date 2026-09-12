const parentService = require('../services/parentService');

class ParentController {
  async getChildren(req, res, next) {
    try {
      const children = await parentService.getChildren(req.user.id);
      res.json({
        success: true,
        message: 'Linked children fetched successfully',
        data: children,
        error: null,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  async getChildProgress(req, res, next) {
    try {
      const { studentId } = req.params;
      const progress = await parentService.getChildProgress(studentId);
      res.json({
        success: true,
        message: 'Child progress overview fetched successfully',
        data: progress,
        error: null,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ParentController();
