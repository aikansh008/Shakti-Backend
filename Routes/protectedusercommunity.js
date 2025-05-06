const express = require('express');
const router = express.Router();
const requireAuth = require('../Middlewares/authMiddleware');

router.get('/test', requireAuth, (req, res) => {
  res.json({ message: `Welcome! You are authenticated. Your ID is ${req.userId}` });
});

module.exports = router;
