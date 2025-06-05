const Sequelize = require('sequelize');
const config = require('../config/config.json')['development'];
const sequelize = new Sequelize(config.database, config.username, config.password, config);

const db = {};

// --- Khởi tạo các model ---
// 1. Models KHÔNG phụ thuộc ai
db.PhanQuyen = require('./PhanQuyen')(sequelize, Sequelize.DataTypes);
db.LoaiHinh = require('./LoaiHinh')(sequelize);
db.GiaTriThuocTinh = require('./GiaTriThuocTinh')(sequelize, Sequelize.DataTypes);  
db.ThuocTinhLoaiHinh = require('./ThuocTinhLoaiHinh')(sequelize);
db.DoiTuongLoaiHinh = require('./DoiTuongLoaiHinh')(sequelize);
db.DuAn = require('./Du_An')(sequelize, Sequelize.DataTypes);
db.GoiThau = require('./goi_thau')(sequelize, Sequelize.DataTypes);
db.HangMuc = require('./HangMuc')(sequelize, Sequelize.DataTypes);
// 2. Models phụ thuộc PhanQuyen
db.TaiKhoan = require('./taiKhoan')(sequelize, Sequelize.DataTypes);

// 3. Các model phụ thuộc giữa nhau – phải import trước khi gọi associate
db.GoiThau_NhaThau = require('./goithau_nhathau')(sequelize, Sequelize.DataTypes);
db.KhoiLuong_ThiCong = require('./khoiluong_thicong')(sequelize, Sequelize.DataTypes);
db.QuanLy_KeHoach = require('./QuanLy_KeHoach')(sequelize, Sequelize.DataTypes);
db.TienDo_ThucHien = require('./tiendo_thuchien')(sequelize, Sequelize.DataTypes);
db.VuongMac = require('./vuongmac')(sequelize, Sequelize.DataTypes);

// 4. Cuối cùng là NhaThau – vì nó phụ thuộc 2 model trên
db.NhaThau = require('./nhathau')(sequelize, Sequelize.DataTypes);

// --- Gắn sequelize instance & constructor ---
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// --- Gọi associate cho từng model nếu có ---
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
