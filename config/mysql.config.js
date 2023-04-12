require('dotenv').config()
const env = process.env

module.exports = {
    HOST: env.MYSQL_HOST || "localhost",
    USER: env.MYSQL_USER || "root",
    PASS: env.MYSQL_PASSWORD || "",
    DB: env.MYSQL_DB_NAME || "cash-app",
    dialect: "mysql",
    PORT: env.MYSQL_PORT || 3306,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
}