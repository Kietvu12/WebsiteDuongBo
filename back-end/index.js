const express = require('express');
const app = express();
const db = require('./models');

// Middleware
app.use(express.json());

// Kết nối database
db.sequelize.authenticate()
  .then(() => console.log('Kết nối database thành công'))
  .catch(err => console.error('Không thể kết nối database:', err));

// Routes
const duAnRoutes = require('./routes/duAnRoute');
app.use('/api/du-an', duAnRoutes);

// Xử lý lỗi 404
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Không tìm thấy tài nguyên'
  });
});

// Xử lý lỗi server
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Đã xảy ra lỗi server'
  });
});

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy trên port ${PORT}`);
});