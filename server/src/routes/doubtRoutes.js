const express = require('express');
const router = express.Router();
const doubtController = require('../controllers/doubtController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.use(authenticateToken);
router.post('/', (req, res, next) => doubtController.createDoubt(req, res, next));
router.get('/', (req, res, next) => doubtController.getDoubts(req, res, next));
router.post('/:id/reply', (req, res, next) => doubtController.replyDoubt(req, res, next));

module.exports = router;
