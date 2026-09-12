const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

router.use(authenticateToken);
router.get('/me', authorizeRoles('student'), (req, res, next) => studentController.getProfile(req, res, next));
router.get('/me/progress', authorizeRoles('student'), (req, res, next) => studentController.getProgress(req, res, next));
router.get('/me/recommendations', authorizeRoles('student'), (req, res, next) => studentController.getRecommendations(req, res, next));
router.get('/me/classroom', authorizeRoles('student'), (req, res, next) => studentController.getClassroom(req, res, next));
router.post('/me/lessons/:lessonId/complete', authorizeRoles('student'), (req, res, next) => studentController.completeLesson(req, res, next));
router.post('/me/preferences', authorizeRoles('student'), (req, res, next) => studentController.savePreferences(req, res, next));

module.exports = router;
