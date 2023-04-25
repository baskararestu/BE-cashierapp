const { db } = require('../database')
const { getUserIdFromToken } = require('../helper/jwt-payload.helper')
const Joi = require('joi')

const addCategory = async (req, res) => {
  try {
    const user_id = getUserIdFromToken(req, res)
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

    const sql = `INSERT INTO categories (name, id_user) VALUES (?, ?)`
    const [result] = await db.execute(sql, [name, user_id])

    if (result.affectedRows > 0) {
      return res.status(201).json({
        message: 'Category created',
        data: {
          id: result.insertId,
          name,
        },
      })
    }

    return res.status(400).json({
      message: 'Failed to create category',
      data: {},
    })

  } catch (error) {
    return res.status(500).json({
      message: 'Internal server error',
      data: {},
    })
  }
}

const updateCategory = async (req, res) => {
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
}

module.exports = {
  addCategory,
  updateCategory,
}