const { db } = require('../database')
const { getUserIdFromToken } = require('../helper/jwt-payload.helper')

// User can see top-selling products
const getTopSellingProducts = async (req, res) => {
  try {
    const id_user = getUserIdFromToken(req, res)
    const category = req.query.category || null // filter by category or null
    const limit = req.query.limit || 10
    const page = req.query.page || 1
    const offset = (page - 1) * limit
    let sql, params
    if (category) {
      sql = `SELECT t.id_user, p.name, SUM(td.quantity) as total_quantity FROM transactions t JOIN transaction_items td ON t.id_transaction = td.id_transaction JOIN products p ON td.id_product = p.id_product WHERE t.id_user = ? AND p.id_category = ? GROUP BY p.name ORDER BY t.id_user, total_quantity DESC LIMIT ? OFFSET ?;`
      params = [id_user, category, limit, offset]
    } else {
      sql = `SELECT t.id_user, p.name, SUM(td.quantity) as total_quantity FROM transactions t JOIN transaction_items td ON t.id_transaction = td.id_transaction JOIN products p ON td.id_product = p.id_product WHERE t.id_user = ? GROUP BY p.name ORDER BY t.id_user, total_quantity DESC LIMIT ? OFFSET ?;`
      params = [id_user, limit, offset]
    }
    const [rows] = await db.query(sql, params)
    const countSql = `SELECT COUNT(DISTINCT p.name) as count FROM transactions t JOIN transaction_items td ON t.id_transaction = td.id_transaction JOIN products p ON td.id_product = p.id_product WHERE t.id_user = ? ${category ? 'AND p.id_category = ?' : ''};`
    const countParams = category ? [id_user, category] : [id_user]
    const [countRows] = await db.query(countSql, countParams)
    const total = countRows[0].count
    const totalPages = Math.ceil(total / limit)
    return res.status(200).json({
      message: 'Success',
      data: rows,
      pages:{
        current: page,
        total: totalPages,
      },
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      message: 'Internal Server Error',
    })
  }
}

// user can see gross income by date
const getGrossIncomeByDate = async (req, res) => {
  try {
    const id_user = getUserIdFromToken(req, res)
    const { start_date, end_date } = req.query
    const page = req.query.page || 1
    const limit = req.query.limit || 10

    let sql = `SELECT t.transaction_date, SUM(ti.quantity * p.price) AS gross_income FROM transactions t JOIN transaction_items ti ON t.id_transaction = ti.id_transaction JOIN products p ON ti.id_product = p.id_product WHERE t.id_user = ?`
    let params = [id_user]

    // Add filter by transaction date range if start_date and/or end_date provided
    if (start_date) {
      sql += ' AND t.transaction_date >= ?'
      params.push(start_date)
    }
    if (end_date) {
      sql += ' AND t.transaction_date <= ?'
      params.push(end_date)
    }

    // Add pagination
    const offset = (page - 1) * limit
    sql += ' GROUP BY t.transaction_date ORDER BY t.transaction_date DESC LIMIT ? OFFSET ?'
    params.push(parseInt(limit), offset)

    const [rows] = await db.query(sql, params)

    // Get total count for pagination
    const [countRows] = await db.query(`SELECT COUNT(DISTINCT t.transaction_date) as total_count FROM transactions t JOIN transaction_items ti ON t.id_transaction = ti.id_transaction JOIN products p ON ti.id_product = p.id_product WHERE t.id_user = ?`, [id_user])
    const total = countRows[0].total_count

    return res.status(200).json({
      message: 'Success',
      data: rows,
      pagination: {
        page: parseInt(page),
        total: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      message: 'Internal Server Error',
    })
  }
}

// default get at least 7 last day,
// can see by date range
const getTotalTransaction = async (req, res) => {
  try {
    const id_user = getUserIdFromToken(req, res)
    const { start_date, end_date } = req.query
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10

    let dateFilter = ''
    let params = [id_user]

    if (start_date && end_date) {
      dateFilter = 'AND transaction_date BETWEEN ? AND ?'
      params.push(start_date, end_date)
    } else {
      // default to showing transactions from the last 7 days
      const lastWeek = new Date()
      lastWeek.setDate(lastWeek.getDate() - 7)
      dateFilter = 'AND transaction_date >= ?'
      params.push(lastWeek)
    }

    const countSql = `SELECT COUNT(DISTINCT t.id_transaction) as total_transactions FROM transactions t WHERE t.id_user = ? ${dateFilter}`
    const [countRows] = await db.query(countSql, params)
    const total_transactions = countRows[0].total_transactions

    const sql = `SELECT t.transaction_date, SUM(ti.quantity * p.price) AS gross_income FROM transactions t JOIN transaction_items ti ON t.id_transaction = ti.id_transaction JOIN products p ON ti.id_product = p.id_product WHERE t.id_user = ? ${dateFilter} GROUP BY t.transaction_date ORDER BY t.transaction_date DESC LIMIT ?, ?`
    const offset = (page - 1) * limit
    params.push(offset, limit)
    console.log(sql, params)

    const [rows] = await db.query(sql, params)

    const total_pages = Math.ceil(total_transactions / limit)

    return res.status(200).json({
      message: 'Success',
      data: rows,
      pages:{
        current: page,
        total: total_pages,
      }
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      message: 'Internal Server Error',
    })
  }
}


module.exports = {
  getTopSellingProducts,
  getGrossIncomeByDate,
  getTotalTransaction,
}