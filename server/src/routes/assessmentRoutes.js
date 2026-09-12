const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.use(authenticateToken);
router.get('/', (req, res, next) => assessmentController.getAssessments(req, res, next));
router.get('/:id', (req, res, next) => assessmentController.getAssessmentById(req, res, next));
router.post('/:id/submit', (req, res, next) => assessmentController.submitAttempt(req, res, next));

module.exports = router;
