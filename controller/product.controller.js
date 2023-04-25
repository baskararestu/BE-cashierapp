const { db } = require('../database')
const jwt = require('jsonwebtoken')

module.exports = {
  addProductsCurrentUser: async (req, res) => {
    try {
      const { name, price, image, description, id_category, stock } = req.body
      const authToken = req.headers.authorization?.split(' ')[1] // extract the token from the headers
      if (!authToken) {
        return res.status(401).json({ message: 'Unauthorized' })
      }
      console.log(authToken)
      const userToken = jwt.verify(authToken, 'group08') // verify the token using your secret key

      // if the token is valid, the decodedToken object will contain the user's ID
      const userId = userToken.id
      console.log(userId)

      //use the user ID to add the products
      const query = `INSERT INTO products (id_product, name, price,image,description,id_category,stock,id_user) VALUES (null, ${db.escape(
        name
      )}, ${db.escape(price)},${db.escape(image)},${db.escape(
        description
      )},${db.escape(id_category)},${db.escape(stock)},${db.escape(userId)})`
      const [result] = await db.query(query)
      console.log(result)

      res.status(200).json({ message: 'Product added successfully' })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  },
  getProduct: async (req, res) => {
    try {
      const authToken = req.headers.authorization?.split(' ')[1] // extract the token from the headers
      if (!authToken) {
        return res.status(401).json({ message: 'Unauthorized' })
      }
      console.log(authToken)
      const userToken = jwt.verify(authToken, 'group08') // verify the token using your secret key
      // if the token is valid, the decodedToken object will contain the user's ID
      const userId = userToken.id

      const page = parseInt(req.query.page) || 1
      const limit = parseInt(req.query.limit) || 10
      const offset = (page - 1) * limit

      const countSql = `SELECT COUNT(*) as total FROM products WHERE id_user = ?`
      const [countRows] = await db.query(countSql, [userId])
      const totalRecords = countRows[0].total
      const totalPages = Math.ceil(totalRecords / limit)

      const sql = `SELECT p.*, c.name as category_name FROM products p JOIN categories c ON p.id_category = c.id_category WHERE p.id_user = ? LIMIT ? OFFSET ?`
      const [rows] = await db.query(sql, [userId, limit, offset])

      res.status(200).json({
        message: 'Get product success',
        data: rows,
        pages: {
          current: page,
          total: totalPages,
        },
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  },
}
