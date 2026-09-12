const reportService = require('../services/reportService');

class ReportController {
  async getStudentReport(req, res, next) {
    try {
      const { studentId } = req.params;
      const report = await reportService.getStudentReport(studentId);
      res.json({
        success: true,
        message: 'Student report generated',
        data: report,
        error: null,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  async getClassReport(req, res, next) {
    try {
      const { classId } = req.params;
      const report = await reportService.getClassReport(classId);
      res.json({
        success: true,
        message: 'Class report generated',
        data: report,
        error: null,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ReportController();
