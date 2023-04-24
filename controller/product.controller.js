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

      // now you can use the user ID to add the products
      const query = `INSERT INTO products (id_product, name, price,image,description,id_category,stock,id_user) VALUES (null, ${db.escape(
        name
      )}, ${db.escape(price)},${db.escape(image)},${db.escape(
        description
      )},${db.escape(id_category)},${db.escape(stock)},${db.escape(userId)})`
      const result = await db.query(query)
      console.log(result)

      res.status(200).json({ message: 'Product added successfully' })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  },
}
