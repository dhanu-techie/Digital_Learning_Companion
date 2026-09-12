const { v4: uuidv4 } = require('uuid');
const assessmentRepository = require('../repositories/assessmentRepository');
const analyticsRepository = require('../repositories/analyticsRepository');
const recommendationService = require('./recommendationService');

class AssessmentService {
  async evaluateAttempt(submissionData, userId, isOffline = false) {
    const { attemptId, assessmentId, answers, startedAt, completedAt } = submissionData;
    const assessment = await assessmentRepository.findAssessmentById(assessmentId);

    if (!assessment) {
      const err = new Error('Assessment not found');
      err.statusCode = 404;
      throw err;
    }

    // Get student profile
    const student = await require('../repositories/userRepository').findStudentByUserId(userId);
    const studentId = student ? student.id : userId;

    let scoreObtained = 0;
    const totalMarks = assessment.total_marks || 100;
    const answerRecords = [];
    const questionMap = new Map(assessment.questions.map(q => [q.id, q]));

    for (let ans of answers) {
      const question = questionMap.get(ans.questionId);
      if (!question) continue;

      let isCorrect = false;
      const given = ans.givenAnswer;
      const correct = question.correct_answer_json;

      // Evaluate answer by type
      if (question.question_type === 'mcq' || question.question_type === 'true_false') {
        isCorrect = JSON.stringify(given) === JSON.stringify(correct);
      } else if (question.question_type === 'multi_select') {
        if (Array.isArray(given) && Array.isArray(correct)) {
          isCorrect = given.length === correct.length && given.every(val => correct.includes(val));
        }
      } else if (question.question_type === 'fill_blank' || question.question_type === 'short_answer') {
        const givenStr = String(given || '').trim().toLowerCase();
        const correctStr = String(correct || '').trim().toLowerCase();
        isCorrect = givenStr === correctStr;
      }

      const marksAwarded = isCorrect ? (question.marks || 1) : 0;
      scoreObtained += marksAwarded;

      answerRecords.push({
        id: uuidv4(),
        attemptId: attemptId || uuidv4(),
        questionId: question.id,
        givenAnswerJson: given,
        isCorrect,
        marksAwarded,
        timeTakenSeconds: ans.timeTakenSeconds || 0
      });

      // Update topic mastery
      if (question.topic_id) {
        await analyticsRepository.updateTopicMastery(studentId, question.topic_id, isCorrect);
      }
    }

    const percentage = parseFloat(((scoreObtained / totalMarks) * 100).toFixed(2));
    const isPassed = percentage >= (assessment.passing_marks || 40);

    const finalAttemptId = attemptId || uuidv4();
    await assessmentRepository.recordAttempt({
      id: finalAttemptId,
      assessmentId,
      studentId,
      startedAt: startedAt ? new Date(startedAt) : new Date(),
      completedAt: completedAt ? new Date(completedAt) : new Date(),
      scoreObtained,
      totalMarks,
      percentage,
      isPassed,
      isCompletedOffline: isOffline
    });

    await assessmentRepository.recordAnswers(answerRecords);

    // Trigger recommendations if necessary
    if (assessment.questions[0] && assessment.questions[0].topic_id) {
      await recommendationService.evaluateAndRecommend(studentId, assessment.questions[0].topic_id, percentage, 2);
    }

    return {
      attemptId: finalAttemptId,
      assessmentId,
      scoreObtained,
      totalMarks,
      percentage,
      isPassed,
      isCompletedOffline: isOffline
    };
  }
}

module.exports = new AssessmentService();
