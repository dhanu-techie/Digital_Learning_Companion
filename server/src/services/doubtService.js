const { v4: uuidv4 } = require('uuid');
const doubtRepository = require('../repositories/doubtRepository');
const userRepository = require('../repositories/userRepository');

class DoubtService {
  async createDoubt(doubtData, userId) {
    const student = await userRepository.findStudentByUserId(userId);
    const studentId = student ? student.id : userId;

    const doubtId = doubtData.id || uuidv4();
    const doubt = await doubtRepository.createDoubt({
      id: doubtId,
      studentId,
      teacherId: doubtData.teacherId,
      subjectId: doubtData.subjectId,
      topicId: doubtData.topicId,
      title: doubtData.title
    });

    if (doubtData.messageText || doubtData.voiceNoteUrl || doubtData.attachmentUrl) {
      await doubtRepository.addMessage({
        id: uuidv4(),
        doubtId,
        senderId: userId,
        senderRole: 'student',
        messageText: doubtData.messageText,
        voiceNoteUrl: doubtData.voiceNoteUrl,
        attachmentUrl: doubtData.attachmentUrl
      });
    }

    return doubtRepository.findDoubtById(doubtId);
  }

  async replyToDoubt(doubtId, senderId, senderRole, messageText, voiceNoteUrl, attachmentUrl) {
    const doubt = await doubtRepository.findDoubtById(doubtId);
    if (!doubt) {
      const err = new Error('Doubt thread not found');
      err.statusCode = 404;
      throw err;
    }

    const msgId = uuidv4();
    await doubtRepository.addMessage({
      id: msgId,
      doubtId,
      senderId,
      senderRole,
      messageText,
      voiceNoteUrl,
      attachmentUrl
    });

    return doubtRepository.findDoubtById(doubtId);
  }

  async getStudentDoubts(userId) {
    const student = await userRepository.findStudentByUserId(userId);
    const studentId = student ? student.id : userId;
    return doubtRepository.findDoubtsByStudent(studentId);
  }

  async getTeacherDoubts(userId) {
    const teacher = await userRepository.findTeacherByUserId(userId);
    const teacherId = teacher ? teacher.id : userId;
    return doubtRepository.findDoubtsByTeacher(teacherId);
  }
}

module.exports = new DoubtService();
