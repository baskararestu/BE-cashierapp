const { db } = require('../database')
const Joi = require('joi')
const bcrypt = require('bcrypt')

const CreateUser = async (req, res) => {

  // verify with JOI
  const schema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().min(7).max(15).required(),
    store_name: Joi.string().min(3).max(30).required(),
    password: Joi.string().min(6).max(30).required(),
  })

  const { error } = schema.validate(req.body)

  if (error) {
    return res.status(400).json({
      message: error.details[0].message.replace(/\"/g, ''),
      data: {},
    })
  }

  const { username, email, phone, store_name, password } = req.body

  // check if email already exists
  const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email])

  if (rows.length > 0) {
    return res.status(400).json({
      message: 'Email already exists',
      data: {},
    })
  }

  // encrypt password
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)

  // create user
  const [result] = await db.execute('INSERT INTO users (username, email, phone, store_name, password) VALUES (?, ?, ?, ?, ?)',
    [username, email, phone, store_name, hashedPassword])

  if (result.affectedRows > 0) {
    return res.status(201).json({
      message: 'User created',
      data: {
        id: result.insertId,
        username,
        email,
        phone,
        store_name
      },
    })
  }
}

module.exports = { CreateUser }