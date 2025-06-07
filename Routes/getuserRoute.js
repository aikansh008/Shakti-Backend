const express= require('express');
const router= express.Router();
const verifyToken= require('../Middlewares/authMiddleware');
const { getFullUser } = require('../Controllers/getFullUserController');

router.get('/user',verifyToken,getFullUser);

module.exports= router;