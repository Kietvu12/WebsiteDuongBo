require('dotenv').config(); // <-- Bắt buộc

const { Sequelize } = require('sequelize');

// Cấu hình kết nối database trực tiếp
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  logging: false, 
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: false, 
    freezeTableName: true 
  },
  timezone: '+07:00' 
});

// Kiểm tra kết nối
sequelize.authenticate()
  .then(() => {
    console.log('Kết nối database thành công.');
  })
  .catch(err => {
    console.error('Không thể kết nối database:', err);
  });
  console.log('DB_USER:', process.env.DB_USER);
module.exports = sequelize;
