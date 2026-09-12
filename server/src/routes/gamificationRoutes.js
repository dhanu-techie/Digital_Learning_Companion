const express = require('express');
const router = express.Router();
const gamificationController = require('../controllers/gamificationController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.use(authenticateToken);
router.get('/streak', (req, res, next) => gamificationController.getStreak(req, res, next));
router.get('/achievements', (req, res, next) => gamificationController.getAchievements(req, res, next));

module.exports = router;
