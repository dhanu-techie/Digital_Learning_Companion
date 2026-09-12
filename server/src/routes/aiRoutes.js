const express = require('express');
const router = express.Router();
const aiAssistantController = require('../controllers/aiAssistantController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.use(authenticateToken);
router.post('/explain', (req, res, next) => aiAssistantController.explainConcept(req, res, next));

module.exports = router;
