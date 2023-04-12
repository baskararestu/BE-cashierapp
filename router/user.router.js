const express = require('express')
const {userController} = require('../controller')
const router = express.Router()


router.get('/', userController.HelloWorld);


module.exports = router