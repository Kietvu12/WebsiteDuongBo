const { Sequelize } = require('sequelize');

// Khởi tạo đối tượng Sequelize để kết nối tới database
const sequelize = new Sequelize('dadb', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
});

// Hàm test kết nối
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Kết nối database thành công!');
  } catch (error) {
    console.error('Kết nối database thất bại:', error);
  }
}

module.exports = { sequelize, testConnection };
