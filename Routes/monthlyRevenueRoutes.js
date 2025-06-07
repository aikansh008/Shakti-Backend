const express = require('express');
const router = express.Router();
const { createMonthlyRevenue } = require('../Controllers/monthlyrevenueController');
const requireAuth = require('../Middlewares/authMiddleware');

router.post('/monthly-revenue',requireAuth, createMonthlyRevenue);

module.exports = router;
