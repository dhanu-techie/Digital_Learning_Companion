const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

router.use(authenticateToken, authorizeRoles('teacher', 'school_admin', 'super_admin'));
router.get('/dashboard', (req, res, next) => teacherController.getDashboard(req, res, next));
router.post('/availability', (req, res, next) => teacherController.updateAvailability(req, res, next));

module.exports = router;
