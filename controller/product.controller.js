const { db } = require('../database')
const jwt = require('jsonwebtoken')
const { getUserIdFromToken } = require('../helper/jwt-payload.helper')

module.exports = {
  addProductsCurrentUser: async (req, res) => {
    try {
      const { name, price, image, description, id_category, stock } = req.body
      const authToken = req.headers.authorization?.split(' ')[1] // extract the token from the headers
      if (!authToken) {
        return res.status(401).json({ message: 'Unauthorized' })
      }
      console.log(authToken)
      const userToken = jwt.verify(authToken, 'rahasia') // verify the token using your secret key

      // if the token is valid, the decodedToken object will contain the user's ID
      const userId = userToken.id
      console.log(userId)

      // use the category name to get its id from the categories table
      const selectCategoryQuery = `SELECT id_category FROM categories WHERE name = ${db.escape(
        category
      )}`
      const [categoryResult] = await db.query(selectCategoryQuery)
      const categoryId = categoryResult[0].id_category

      //use the user ID to add the products
      const query = `INSERT INTO products (id_product, name, price,image,description,id_category,stock,id_user) VALUES (null, ${db.escape(
        name
      )}, ${db.escape(price)},${db.escape(req.file.path)},${db.escape(
        description
      )},${db.escape(categoryId)},${db.escape(stock)},${db.escape(userId)})`
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
      const userToken = jwt.verify(authToken, 'rahasia') // verify the token using your secret key
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

  updateProduct: async (req, res) => {
    try {
      const user_id = getUserIdFromToken(req, res)
      const { id } = req.params

      // id required
      if (!id) {
        return res.status(400).json({
          message: 'id required',
          data: {},
        })
      }

      // validate input
      const schema = Joi.object({
        name: Joi.string().min(3).max(30).required(),
      })

      const { error } = schema.validate(req.body)

      if (error) {
        return res.status(400).json({
          message: error.details[0].message.replace(/\"/g, ''),
          data: {},
        })
      }

      const { name } = req.body

      const sql = `UPDATE categories SET name = ? WHERE id_category = ? AND id_user = ?`
      const [result] = await db.execute(sql, [name, id, user_id])

      if (result.affectedRows > 0) {
        return res.status(200).json({
          message: 'Category updated',
          data: {
            id,
            name,
          },
        })
      }

      return res.status(400).json({
        message: 'Failed to update category',
        data: {},
      })
    } catch (error) {
      return res.status(500).json({
        message: 'Internal server error',
        data: {},
      })
    }
  },
}
