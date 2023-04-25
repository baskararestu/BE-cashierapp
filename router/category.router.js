const express = require('express')
const router = express.Router()
const {categoryController} = require('../controller')

router.post('/', categoryController.addCategory)
router.patch('/:id', categoryController.updateCategory)

module.exports = router
