const { v4: uuidv4 } = require('uuid');
const schoolAdminRepository = require('../repositories/schoolAdminRepository');

class AdminService {
  async createSchool(data) {
    return schoolAdminRepository.createSchool({
      id: uuidv4(),
      organizationId: data.organizationId,
      name: data.name,
      code: data.code,
      district: data.district,
      state: data.state,
      address: data.address
    });
  }

  async getAllSchools() {
    return schoolAdminRepository.findAllSchools();
  }

  async createClass(data) {
    return schoolAdminRepository.createClass({
      id: uuidv4(),
      schoolId: data.schoolId,
      name: data.name,
      grade: data.grade,
      section: data.section,
      academicYear: data.academicYear
    });
  }

  async enrollStudent(classId, studentId) {
    return schoolAdminRepository.enrollStudent(uuidv4(), classId, studentId);
  }

  async assignTeacher(teacherId, studentId, classId, subjectId) {
    return schoolAdminRepository.assignTeacher(uuidv4(), teacherId, studentId, classId, subjectId);
  }
}

module.exports = new AdminService();
