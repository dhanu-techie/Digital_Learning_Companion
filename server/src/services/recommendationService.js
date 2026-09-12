const { v4: uuidv4 } = require('uuid');
const analyticsRepository = require('../repositories/analyticsRepository');

class RecommendationService {
  /**
   * Evaluates student performance and generates targeted remedial recommendations
   */
  async evaluateAndRecommend(studentId, topicId, scorePercentage, attemptsCount) {
    if (scorePercentage < 50.0 && attemptsCount >= 2) {
      const recId = uuidv4();
      await analyticsRepository.createRecommendation({
        id: recId,
        studentId,
        topicId,
        recommendationType: 'remedial_lesson',
        reason: `Student mastery is at ${scorePercentage.toFixed(1)}% after ${attemptsCount} practice attempts.`,
        priority: 'high'
      });
      return {
        generated: true,
        recommendation: 'Watch 10-minute visual concept video and solve 5 easy practice questions.'
      };
    } else if (scorePercentage >= 80.0) {
      const recId = uuidv4();
      await analyticsRepository.createRecommendation({
        id: recId,
        studentId,
        topicId,
        recommendationType: 'next_topic',
        reason: `High topic mastery achieved (${scorePercentage.toFixed(1)}%). Ready for advanced concepts.`,
        priority: 'low'
      });
      return {
        generated: true,
        recommendation: 'Proceed to next topic in curriculum.'
      };
    }

    return { generated: false };
  }

  async getStudentRecommendations(studentId) {
    return analyticsRepository.getActiveRecommendations(studentId);
  }
}

module.exports = new RecommendationService();
