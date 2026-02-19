const express = require('express');
const router = express.Router();
const {policeLogin,registerPolice} = require("../controllers/PoliceAuth")
const { register, login } = require('../controllers/auth');
const {authenticate} = require("../middlewares/authMiddleware")
router.post('/register', register);
router.post('/login', login);
router.post("/PoliceLogin",policeLogin)

router.post("/PoliceRegister",registerPolice);



module.exports = router;
