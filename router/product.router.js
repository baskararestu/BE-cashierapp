const express = require('express')
const router = express.Router()
const { productController } = require('../controller')
const upload = require('../middleware/multer')

router.post(
  '/add-product',
  upload.single('image'),
  productController.addProductsCurrentUser
)
router.get('/', productController.getProduct)

module.exports = router
