const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

router.use(authenticateToken, authorizeRoles('teacher', 'school_admin', 'super_admin'));
router.get('/student/:studentId', (req, res, next) => reportController.getStudentReport(req, res, next));
router.get('/class/:classId', (req, res, next) => reportController.getClassReport(req, res, next));

module.exports = router;
