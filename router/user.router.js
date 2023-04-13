const express = require('express')
const { userController } = require('../controller')
const router = express.Router()

<<<<<<< HEAD
// router.post('/login', userController.login)

module.exports = router
=======
router.post('/', userController.CreateUser);


module.exports = router
>>>>>>> main
