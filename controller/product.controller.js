const { db } = require('../database')
const jwt = require('jsonwebtoken')
const { getUserIdFromToken } = require('../helper/jwt-payload.helper')

module.exports = {
  addProductsCurrentUser: async (req, res) => {
    try {
      const { name, price, image, description, category, stock } = req.body
      const userId = getUserIdFromToken(req, res)
      const { file } = req
      const filepath = file ? '/' + file.filename : null
      console.log(userId)
      console.log(req.body)

      //use the user ID to add the products
      const query = `INSERT INTO products (id_product, name, price,image,description,id_category,stock,id_user) VALUES (null, ${db.escape(
              name,
      )}, ${db.escape(parseInt(price))},${db.escape(filepath)},${db.escape(
              description,
      )},${db.escape(parseInt(category))},${db.escape(
              parseInt(stock),
      )},${db.escape(userId)})`

      console.log(query)
      const [result] = await db.query(query)
      console.log(result)

      res
        .status(200)
        .json({ message: 'Product added successfully', isSuccess: true })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  },
  getProduct: async (req, res) => {
    try {
      const userId = getUserIdFromToken(req, res)

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

  editProducts: async (req, res) => {
    try {
      const { name, price, description, category, stock } = req.body
      const id_product = req.params.id
      const { file } = req
      const filepath = file ? '/' + file.filename : null
      const userId = getUserIdFromToken(req, res)

      console.log(file)

      // // use the category name to get its id from the categories table
      // const selectCategoryQuery = `SELECT id_category FROM categories WHERE id_category = ${db.escape(
      //         category,
      // )}`
      // const [categoryResult] = await db.query(selectCategoryQuery)
      const categoryId = category;

      //use the user ID to edit the products
      let query
      if (file) {
        // do delete old image
        query = `UPDATE products SET name = ${db.escape(
                name,
        )}, price = ${db.escape(price)}, image = ${db.escape(
                filepath,
        )}, description = ${db.escape(description)}, id_category = ${db.escape(
                categoryId,
        )}, stock = ${db.escape(stock)} WHERE id_product = ${db.escape(
                id_product,
        )} AND id_user = ${db.escape(userId)}`
      } else {
        query = `UPDATE products SET name = ${db.escape(
                name,
        )}, price = ${db.escape(price)}, description = ${db.escape(description)}, id_category = ${db.escape(
                categoryId,
        )}, stock = ${db.escape(stock)} WHERE id_product = ${db.escape(
                id_product,
        )} AND id_user = ${db.escape(userId)}`
      }
      const [result] = await db.query(query)
      console.log(result)

      res.status(200).json({ message: 'Product edited successfully' })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  },
  getProductById: async (req, res) => {
    try {
      const id_product = req.params.id
      const userId = getUserIdFromToken(req, res)
      console.log(userId)
      const query = `SELECT * FROM products WHERE id_product = ${db.escape(
              id_product,
      )} AND id_user = ${db.escape(userId)}`
      const [result] = await db.query(query)
      if (result.length === 0) {
        return res.status(404).json({ message: 'Product not found' })
      }
      res.status(200).json(result[0])
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  },

  deleteProductById: async (req, res) => {
    try {
      const userId = getUserIdFromToken(req, res)
      const id_product = req.params.id
      const query = `DELETE FROM products WHERE id_product=${db.escape(
              id_product,
      )} AND id_user=${db.escape(userId)}`
      const [result] = await db.query(query)
      // console.log(result) <<<< kenapa result pas dicek kosong?
      if (result && result.affectedRows !== 0) {
        return res
          .status(404)
          .json({ message: 'Product has been deleted', isSuccess: true })
      }
      res.status(200).json(result[0])
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  },
}
