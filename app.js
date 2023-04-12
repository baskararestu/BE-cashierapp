const express = require('express')
const { userRouter } = require('./router')
require('dotenv').config()
const env = process.env


const app = express()

app.use('/user', userRouter)

app.listen(env.APP_PORT, () => {
  console.log(`Server is running on port ${env.APP_PORT}`)
})