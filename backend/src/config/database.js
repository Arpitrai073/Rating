require('dotenv').config();
const { Sequelize } = require('sequelize');

const publicUrl =
  process.env.MYSQL_PUBLIC_URL ||
  process.env.MYSQL_URL ||
  process.env.DATABASE_URL;

let sequelize;

if (publicUrl && !publicUrl.includes('${{')) {
  sequelize = new Sequelize(publicUrl, {
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    },
    define: {
      underscored: true,
      timestamps: true,
    },
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'store_rating_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      dialect: 'mysql',
      logging: false,
      define: {
        underscored: true,
        timestamps: true,
      },
    }
  );
}

module.exports = sequelize;
