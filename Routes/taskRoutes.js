const express = require('express');
const router = express.Router();
const taskController = require('../Controllers/taskController');
const auth= require('../Middlewares/authMiddleware');

router.post('/create', auth,taskController.createTask);
router.get('/filter',auth, taskController.getTasksByCalendarDate);

module.exports = router;
