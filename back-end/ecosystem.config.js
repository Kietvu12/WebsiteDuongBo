module.exports = {
    apps: [{
      name: "my-backend",
      script: "./server.js",
      instances: "max", // Sử dụng tất cả CPU cores
      exec_mode: "cluster", // Chế độ cluster
      autorestart: true, // Tự động khởi động lại khi crash
      watch: false, // Không theo dõi thay đổi file
      max_memory_restart: "1G", // Tự động khởi động lại nếu sử dụng quá 1GB memory
      env: {
        NODE_ENV: "production",
        PORT: 5000,
        DB_HOST: "localhost",
        DB_USER: "root",
        DB_PASSWORD: "123456",
        DB_NAME: "dulieuduongbo"
      }
    }]
  };