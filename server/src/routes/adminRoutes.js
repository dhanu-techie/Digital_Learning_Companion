const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

router.use(authenticateToken, authorizeRoles('school_admin', 'super_admin'));
router.post('/schools', (req, res, next) => adminController.createSchool(req, res, next));
router.get('/schools', (req, res, next) => adminController.getSchools(req, res, next));
router.post('/classes', (req, res, next) => adminController.createClass(req, res, next));
router.post('/enroll-student', (req, res, next) => adminController.enrollStudent(req, res, next));
router.post('/assign-teacher', (req, res, next) => adminController.assignTeacher(req, res, next));

module.exports = router;
