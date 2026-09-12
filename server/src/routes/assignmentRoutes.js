const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

router.use(authenticateToken);
router.post('/', authorizeRoles('teacher', 'school_admin'), (req, res, next) => assignmentController.createAssignment(req, res, next));
router.get('/', authorizeRoles('student'), (req, res, next) => assignmentController.getStudentAssignments(req, res, next));
router.post('/:id/submit', authorizeRoles('student'), (req, res, next) => assignmentController.submitAssignment(req, res, next));
router.post('/evaluate', authorizeRoles('teacher'), (req, res, next) => assignmentController.evaluateSubmission(req, res, next));

module.exports = router;
