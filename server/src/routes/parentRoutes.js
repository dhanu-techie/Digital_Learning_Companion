const express = require('express');
const router = express.Router();
const parentController = require('../controllers/parentController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

router.use(authenticateToken, authorizeRoles('parent', 'super_admin'));
router.get('/children', (req, res, next) => parentController.getChildren(req, res, next));
router.get('/child/:studentId/progress', (req, res, next) => parentController.getChildProgress(req, res, next));

module.exports = router;
