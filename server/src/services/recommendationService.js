const { v4: uuidv4 } = require('uuid');
const analyticsRepository = require('../repositories/analyticsRepository');
const assessmentRepository = require('../repositories/assessmentRepository');

class RecommendationService {
  /**
   * Evaluates student performance and generates targeted remedial recommendations
   */
  async evaluateAndRecommend(studentId, topicId, scorePercentage, attemptsCount) {
    const score = Number(scorePercentage);
    let generated = false;

    if (score < 50.0 && attemptsCount >= 1) {
      const openLesson = await analyticsRepository.findOpenRecommendation(studentId, topicId, 'remedial_lesson');
      if (!openLesson) {
        await analyticsRepository.createRecommendation({
          id: uuidv4(),
          studentId,
          topicId,
          recommendationType: 'remedial_lesson',
          reason: `Student mastery is at ${score.toFixed(1)}% after ${attemptsCount} practice attempts.`,
          priority: 'high'
        });
        generated = true;
      }

      const openPractice = await analyticsRepository.findOpenRecommendation(studentId, topicId, 'practice_set');
      if (!openPractice) {
        await analyticsRepository.createRecommendation({
          id: uuidv4(),
          studentId,
          topicId,
          recommendationType: 'practice_set',
          reason: `Take the practice assessment again. Current mastery is ${score.toFixed(1)}%.`,
          priority: 'high'
        });
        generated = true;
      }

      return {
        generated,
        recommendation: 'Watch the remedial lesson and solve the practice assessment.'
      };
    }

    if (score >= 80.0) {
      const open = await analyticsRepository.findOpenRecommendation(studentId, topicId, 'next_topic');
      if (open) return { generated: false };
      await analyticsRepository.createRecommendation({
        id: uuidv4(),
        studentId,
        topicId,
        recommendationType: 'next_topic',
        reason: `High topic mastery achieved (${score.toFixed(1)}%). Ready for advanced concepts.`,
        priority: 'low'
      });
      return {
        generated: true,
        recommendation: 'Proceed to next topic in curriculum.'
      };
    }

    return { generated: false };
  }

  async seedStarterAssessments(studentId) {
    const assessments = await assessmentRepository.findAllAssessments();
    for (const assessment of assessments) {
      const detail = await assessmentRepository.findAssessmentById(assessment.id);
      const topicId = (detail?.questions || []).find((question) => question.topic_id)?.topic_id;
      if (!topicId) continue;
      const open = await analyticsRepository.findOpenRecommendation(studentId, topicId, 'practice_set');
      if (open) continue;
      await analyticsRepository.createRecommendation({
        id: uuidv4(),
        studentId,
        topicId,
        recommendationType: 'practice_set',
        reason: `Take "${assessment.title}" so we can measure this topic and unlock your next lesson.`,
        priority: 'high'
      });
    }
  }

  async getStudentRecommendations(studentId) {
    let recommendations = await analyticsRepository.getActiveRecommendations(studentId);
    if (recommendations.length === 0) {
      await this.seedStarterAssessments(studentId);
      recommendations = await analyticsRepository.getActiveRecommendations(studentId);
    }
    return recommendations;
  }
}

module.exports = new RecommendationService();
