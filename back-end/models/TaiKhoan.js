module.exports = (sequelize, DataTypes) => {
    const TaiKhoan = sequelize.define('TaiKhoan', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      ten_dang_nhap: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      mat_khau: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      ho_ten: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      so_dien_thoai: {
        type: DataTypes.STRING(20),
        allowNull: false
      },
      chuc_vu: {
        type: DataTypes.STRING(100)
      },
      don_vi_cong_tac: {
        type: DataTypes.STRING(100)
      },
      id_phan_quyen: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      trang_thai: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      ngay_tao: {
        type: DataTypes.DATE,
        allowNull: false
      },
      ngay_cap_nhat: {
        type: DataTypes.DATE,
        allowNull: false
      }
    }, {
      tableName: 'tai_khoan',
      timestamps: false
    });
  
    TaiKhoan.associate = function(models) {
      TaiKhoan.belongsTo(models.PhanQuyen, { foreignKey: 'id_phan_quyen', as: 'phan_quyen' });
    };
  
    return TaiKhoan;
  };