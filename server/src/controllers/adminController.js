const adminService = require('../services/adminService');

class AdminController {
  async createSchool(req, res, next) {
    try {
      const school = await adminService.createSchool(req.body);
      res.status(201).json({
        success: true,
        message: 'School created successfully',
        data: school,
        error: null,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  async getSchools(req, res, next) {
    try {
      const schools = await adminService.getAllSchools();
      res.json({
        success: true,
        message: 'Schools fetched successfully',
        data: schools,
        error: null,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  async createClass(req, res, next) {
    try {
      const classObj = await adminService.createClass(req.body);
      res.status(201).json({
        success: true,
        message: 'Class created successfully',
        data: classObj,
        error: null,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  async enrollStudent(req, res, next) {
    try {
      const { classId, studentId } = req.body;
      await adminService.enrollStudent(classId, studentId);
      res.json({
        success: true,
        message: 'Student enrolled in class successfully',
        data: null,
        error: null,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  async assignTeacher(req, res, next) {
    try {
      const { teacherId, studentId, classId, subjectId } = req.body;
      await adminService.assignTeacher(teacherId, studentId, classId, subjectId);
      res.json({
        success: true,
        message: 'Teacher assigned to student successfully',
        data: null,
        error: null,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AdminController();
