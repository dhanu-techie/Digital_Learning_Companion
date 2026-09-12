class AIAssistantService {
  /**
   * Generates educational explanation for students while adhering to safety rules
   */
  async explainConcept({ conceptTitle, prompt, language = 'ta', context = 'learning' }) {
    // 1. Safety Check: If context is active test examination, refuse direct answer
    if (context === 'examination' || context === 'test_active') {
      return {
        success: false,
        message: 'AI Assistant cannot provide answers during an active examination. Please solve independently.',
        explanation: null
      };
    }

    // 2. Educational explanation generator (Mock AI Response / Gemini Integration ready)
    const explanations = {
      ta: `[தமிழ் விளக்கம்] "${conceptTitle || 'கருத்து'}": இந்த கருத்தை எளிமையாகப் புரிந்துகொள்ள: முதலில் படங்களை அல்லது வரைபடங்களைப் பார்க்கவும். பிறகு 3 எளிய கணக்குகளைத் தனியாகச் செய்து பார்க்கவும்.`,
      te: `[తెలుగు వివరణ] "${conceptTitle || 'విషయం'}": ఈ అంశాన్ని సులభంగా అర్థం చేసుకోవడానికి ఉదాహరణలతో సాధన చేయండి.`,
      hi: `[हिंदी स्पष्टीकरण] "${conceptTitle || 'अवधारणा'}": इस अवधारणा को समझने के लिए उदाहरणों का अभ्यास करें।`,
      en: `[English Explanation] "${conceptTitle || 'Concept'}": Break the formula into 3 simple steps: 1. Identify common denominator, 2. Add numerators, 3. Simplify.`
    };

    return {
      success: true,
      language,
      explanation: explanations[language] || explanations['en'],
      encouragement: 'Keep up the good learning streak!'
    };
  }
}

module.exports = new AIAssistantService();
