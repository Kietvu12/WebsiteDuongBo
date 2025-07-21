const { Sequelize } = require('sequelize');
const sequelize = require('../config/db');

const models = {
  taikhoan: require('./taikhoan.model'),
  nhathau: require('./nhathau.model'),
  phanquyen: require('./phanquyen.model')
};

// Register associations
Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(models);
  }
});

models.sequelize = sequelize;
models.Sequelize = Sequelize;

module.exports = models;