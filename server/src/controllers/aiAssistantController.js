const aiAssistantService = require('../services/aiAssistantService');

class AIAssistantController {
  async explainConcept(req, res, next) {
    try {
      const { conceptTitle, prompt, language, context } = req.body;
      const result = await aiAssistantService.explainConcept({
        conceptTitle,
        prompt,
        language: language || req.user.preferred_language || 'ta',
        context
      });

      if (!result.success) {
        return res.status(403).json({
          success: false,
          message: result.message,
          data: null,
          error: 'AI_SAFETY_RESTRICTION'
        });
      }

      res.json({
        success: true,
        message: 'Educational explanation generated',
        data: result,
        error: null,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AIAssistantController();
