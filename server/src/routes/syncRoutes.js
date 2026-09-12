const express = require('express');
const router = express.Router();
const syncController = require('../controllers/syncController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.use(authenticateToken);
router.post('/push', (req, res, next) => syncController.pushSync(req, res, next));
router.get('/pull', (req, res, next) => syncController.pullSync(req, res, next));

module.exports = router;
