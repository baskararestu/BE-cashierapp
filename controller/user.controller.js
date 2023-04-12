const { db } = require('../database')
const HelloWorld = async (req, res) => {

  try {
    const rows = await db.execute('INSERT INTO users (name, email) VALUES (?, ?)', ['John Doe', 'john@gmail.com'])
    console.log('LOG.d', rows)
  } catch (error) {
    console.log('LOG.e', error.message)
  }

  res.json({
    message: 'Hello World',
    data: {
      name: 'John Doe',
      age: 25,
    },
  })
}

module.exports = { HelloWorld }