const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.use(authenticateToken);
router.get('/', (req, res, next) => notificationController.getNotifications(req, res, next));
router.post('/:id/read', (req, res, next) => notificationController.markRead(req, res, next));

module.exports = router;
