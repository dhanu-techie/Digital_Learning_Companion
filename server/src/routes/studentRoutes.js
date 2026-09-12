const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

router.use(authenticateToken);
router.get('/me', authorizeRoles('student'), (req, res, next) => studentController.getProfile(req, res, next));
router.get('/me/progress', authorizeRoles('student'), (req, res, next) => studentController.getProgress(req, res, next));
router.get('/me/recommendations', authorizeRoles('student'), (req, res, next) => studentController.getRecommendations(req, res, next));

module.exports = router;
