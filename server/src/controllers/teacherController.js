const userRepository = require('../repositories/userRepository');
const analyticsRepository = require('../repositories/analyticsRepository');

class TeacherController {
  async getDashboard(req, res, next) {
    try {
      const teacher = await userRepository.findTeacherByUserId(req.user.id);
      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: 'Teacher profile not found',
          data: null,
          error: 'NOT_FOUND'
        });
      }

      const studentsNeedingHelp = await analyticsRepository.getStudentsNeedingTeacherIntervention(teacher.id);

      res.json({
        success: true,
        message: 'Teacher dashboard metrics retrieved',
        data: {
          teacherProfile: teacher,
          actionableInsights: {
            studentsNeedingHelpCount: studentsNeedingHelp.length,
            studentsNeedingHelp
          }
        },
        error: null,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  async updateAvailability(req, res, next) {
    try {
      const { isAvailableForDoubts, doubtStartTime, doubtEndTime, maxDoubtsPerDay } = req.body;
      await userRepository.updateTeacherAvailability(req.user.id, {
        isAvailableForDoubts,
        doubtStartTime,
        doubtEndTime,
        maxDoubtsPerDay
      });

      res.json({
        success: true,
        message: 'Teacher doubt availability settings updated',
        data: null,
        error: null,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new TeacherController();
