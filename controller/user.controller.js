const { db } = require('../database')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const login = async (req, res) => {
  try {
    const { email, password } = req.body
    const isEmailExist = await db.execute(
      `SELECT * FROM users WHERE email=${db.escape(email)}`
    )
    if (isEmailExist.length == 0) {
      return res.status(200).send({ message: 'Email or Password is Invalid' })
    }

    const isValid = await bcrypt.compare(password, isEmailExist[0].password)

    if (!isValid) {
      return res.status(200).send({ message: 'Email or Password is incorrect' })
    }

    let payload = {
      id: isEmailExist[0].id_user,
    }

    const token = jwt.sign(payload, 'group08', { expiresIn: '1h' })

    return res.status(200).send({
      message: 'Login Success',
      token,
      data: {
        id: isEmailExist[0].id_user,
        email: isEmailExist[0].email,
        username: isEmailExist[0].username,
        phone: isEmailExist[0].phone,
        name: isEmailExist[0].store_name,
      },
    })
  } catch (error) {
    // console.log('LOG.e', error.message)
    res.status(error.status || 500).send(error.message)
  }
}

module.exports = { login }
