const express = require('express')
const router = express.Router()
const { productController } = require('../controller')

router.post('/add-product', productController.addProductsCurrentUser)
router.get('/', productController.getProduct)

module.exports = router
