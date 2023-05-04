const express = require('express')
const router = express.Router()
const { transactionController } = require('../controller')

router.get('/top-selling-products', transactionController.getTopSellingProducts)
router.get('/gross-income-by-date', transactionController.getGrossIncomeByDate)
router.get('/total', transactionController.getTotalTransaction)
router.post('/add-transaction', transactionController.addNewTransaction)

module.exports = router
