const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const syncRoutes = require('./syncRoutes');
const studentRoutes = require('./studentRoutes');
const courseRoutes = require('./courseRoutes');
const assessmentRoutes = require('./assessmentRoutes');
const teacherRoutes = require('./teacherRoutes');
const doubtRoutes = require('./doubtRoutes');
const adminRoutes = require('./adminRoutes');
const assignmentRoutes = require('./assignmentRoutes');
const parentRoutes = require('./parentRoutes');
const gamificationRoutes = require('./gamificationRoutes');
const notificationRoutes = require('./notificationRoutes');
const aiRoutes = require('./aiRoutes');
const reportRoutes = require('./reportRoutes');
const healthController = require('../controllers/healthController');

// Health Check Routes
router.get('/health', (req, res) => healthController.getHealth(req, res));
router.get('/health/database', (req, res) => healthController.getDbHealth(req, res));

// API v1 Modules (Full Feature Coverage)
router.use('/auth', authRoutes);
router.use('/sync', syncRoutes);
router.use('/students', studentRoutes);
router.use('/courses', courseRoutes);
router.use('/assessments', assessmentRoutes);
router.use('/teacher', teacherRoutes);
router.use('/doubts', doubtRoutes);
router.use('/admin', adminRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/parent', parentRoutes);
router.use('/gamification', gamificationRoutes);
router.use('/notifications', notificationRoutes);
router.use('/ai', aiRoutes);
router.use('/reports', reportRoutes);

module.exports = router;
