const { Sequelize } = require('sequelize');
const sequelize = require('../config/db');

const models = {
  taikhoan: require('./taikhoan.model'),
  nhathau: require('./nhathau.model'),
  phanquyen: require('./phanquyen.model'),
  duan: require('./duan.model'),
  goithau: require('./goithau.model'),
  goithau_nhathau: require('./goithau_nhathau.model'),
  hangmuc: require('./hangmuc.model'),
  quanlykehoach: require('./quanlykehoach.model'),
  tiendothuchien: require('./tiendothuchien.model')
};

// Định nghĩa các mối quan hệ
const defineAssociations = () => {
  // Dự án - Gói thầu (1-nhiều)
  models.duan.hasMany(models.goithau, { 
    foreignKey: 'DuAn_ID', 
    as: 'GoiThaus' 
  });
  models.goithau.belongsTo(models.duan, { 
    foreignKey: 'DuAn_ID', 
    as: 'DuAn' 
  });

  // Dự án - Dự án (self-referencing cho dự án thành phần)
  models.duan.hasMany(models.duan, { 
    foreignKey: 'ParentID', 
    as: 'DuAnThanhPhan' 
  });
  models.duan.belongsTo(models.duan, { 
    foreignKey: 'ParentID', 
    as: 'DuAnCha' 
  });

  // Gói thầu - Nhà thầu (nhiều-nhiều qua bảng trung gian)
  models.goithau.belongsToMany(models.nhathau, {
    through: models.goithau_nhathau,
    foreignKey: 'GoiThau_ID',
    otherKey: 'NhaThauID',
    as: 'NhaThaus'
  });
  models.nhathau.belongsToMany(models.goithau, {
    through: models.goithau_nhathau,
    foreignKey: 'NhaThauID',
    otherKey: 'GoiThau_ID',
    as: 'GoiThaus'
  });

  // Gói thầu - Hạng mục (1-nhiều)
  models.goithau.hasMany(models.hangmuc, { 
    foreignKey: 'GoiThauID', 
    as: 'HangMucs' 
  });
  models.hangmuc.belongsTo(models.goithau, { 
    foreignKey: 'GoiThauID', 
    as: 'GoiThau' 
  });

  // Hạng mục - Kế hoạch (1-nhiều)
  models.hangmuc.hasMany(models.quanlykehoach, { 
    foreignKey: 'HangMucID', 
    as: 'KeHoachs' 
  });
  models.quanlykehoach.belongsTo(models.hangmuc, { 
    foreignKey: 'HangMucID', 
    as: 'HangMuc' 
  });

  // Nhà thầu - Kế hoạch (1-nhiều)
  models.nhathau.hasMany(models.quanlykehoach, { 
    foreignKey: 'NhaThauID', 
    as: 'KeHoachs' 
  });
  models.quanlykehoach.belongsTo(models.nhathau, { 
    foreignKey: 'NhaThauID', 
    as: 'NhaThau' 
  });

  // Kế hoạch - Tiến độ thực hiện (1-nhiều)
  models.quanlykehoach.hasMany(models.tiendothuchien, { 
    foreignKey: 'KeHoachID', 
    as: 'TienDos' 
  });
  models.tiendothuchien.belongsTo(models.quanlykehoach, { 
    foreignKey: 'KeHoachID', 
    as: 'KeHoach' 
  });

  // Nhà thầu - Tài khoản (1-nhiều) - Đã được định nghĩa trong các model riêng lẻ
};

// Khởi tạo các mối quan hệ
defineAssociations();

// Register associations
Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(models);
  }
});

models.sequelize = sequelize;
models.Sequelize = Sequelize;

module.exports = models;