const express = require('express')
const router = express.Router()
const { productController } = require('../controller')

router.post('/add-product', productController.addProductsCurrentUser)

module.exports = router
