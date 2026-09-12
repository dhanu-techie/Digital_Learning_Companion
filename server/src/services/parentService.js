const parentRepository = require('../repositories/parentRepository');

class ParentService {
  async getChildren(parentUserId) {
    return parentRepository.findChildrenByParentUser(parentUserId);
  }

  async getChildProgress(studentId) {
    return parentRepository.getChildProgressOverview(studentId);
  }
}

module.exports = new ParentService();
