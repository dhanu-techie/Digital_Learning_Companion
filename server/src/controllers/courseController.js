const courseRepository = require('../repositories/courseRepository');

class CourseController {
  async getCourses(req, res, next) {
    try {
      const { grade, subjectId } = req.query;
      const courses = await courseRepository.findAllCourses({ grade, subjectId });
      res.json({
        success: true,
        message: 'Courses fetched successfully',
        data: courses,
        error: null,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  async getCourseById(req, res, next) {
    try {
      const course = await courseRepository.findCourseByIdWithHierarchy(req.params.id);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found',
          data: null,
          error: 'NOT_FOUND'
        });
      }

      res.json({
        success: true,
        message: 'Course hierarchy fetched successfully',
        data: course,
        error: null,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  async getDownloadPackage(req, res, next) {
    try {
      const downloadPackage = await courseRepository.getDownloadPackage(req.params.id);
      if (!downloadPackage) {
        return res.status(404).json({
          success: false,
          message: 'Course package not found',
          data: null,
          error: 'NOT_FOUND'
        });
      }

      res.json({
        success: true,
        message: 'Download package generated for offline storage',
        data: downloadPackage,
        error: null,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CourseController();
