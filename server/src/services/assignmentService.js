const { v4: uuidv4 } = require('uuid');
const assignmentRepository = require('../repositories/assignmentRepository');
const userRepository = require('../repositories/userRepository');
const db = require('../config/db');

class AssignmentService {
  async createAssignment(data, teacherUserId) {
    const teacher = await userRepository.findTeacherByUserId(teacherUserId);
    const teacherId = teacher ? teacher.id : teacherUserId;

    let classId = data.classId;
    if (!classId) {
      const [classes] = await db.query('SELECT id FROM classes LIMIT 1');
      classId = classes[0]?.id;
    }

    return assignmentRepository.createAssignment({
      id: uuidv4(),
      classId,
      teacherId,
      subjectId: data.subjectId,
      title: data.title,
      description: data.description,
      dueDate: data.dueDate,
      maxMarks: data.maxMarks,
      attachmentUrl: data.attachmentUrl
    });
  }

  async getTeacherAssignments(userId) {
    const teacher = await userRepository.findTeacherByUserId(userId);
    const teacherId = teacher ? teacher.id : userId;
    return assignmentRepository.findAssignmentsByTeacher(teacherId);
  }

  async getTeacherSubmissions(userId) {
    const teacher = await userRepository.findTeacherByUserId(userId);
    const teacherId = teacher ? teacher.id : userId;
    return assignmentRepository.findSubmissionsByTeacher(teacherId);
  }

  async getStudentAssignments(userId) {
    const student = await userRepository.findStudentByUserId(userId);
    const studentId = student ? student.id : userId;
    return assignmentRepository.findAssignmentsByStudent(studentId);
  }

  async submitAssignment(data, userId, isOffline = false) {
    const student = await userRepository.findStudentByUserId(userId);
    const studentId = student ? student.id : userId;

    await assignmentRepository.submitAssignment({
      id: data.id || uuidv4(),
      assignmentId: data.assignmentId,
      studentId,
      submissionText: data.submissionText,
      fileAttachmentUrl: data.fileAttachmentUrl,
      submittedAt: data.submittedAt || Date.now(),
      isSubmittedOffline: isOffline
    });

    return { status: 'submitted', assignmentId: data.assignmentId };
  }

  async evaluateSubmission(submissionId, marksAwarded, feedback) {
    await assignmentRepository.evaluateSubmission(submissionId, marksAwarded, feedback);
    return { status: 'evaluated', submissionId };
  }
}

module.exports = new AssignmentService();
