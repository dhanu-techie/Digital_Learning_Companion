const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.use(authenticateToken);
router.get('/', (req, res, next) => courseController.getCourses(req, res, next));
router.get('/:id', (req, res, next) => courseController.getCourseById(req, res, next));
router.get('/:id/download-package', (req, res, next) => courseController.getDownloadPackage(req, res, next));

module.exports = router;
