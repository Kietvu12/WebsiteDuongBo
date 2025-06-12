module.exports = (sequelize, DataTypes) => {
    const HangMucPhanLoai = sequelize.define('HangMucPhanLoai', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      ten_loai_hang_muc: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      mo_ta: {
        type: DataTypes.TEXT
      },
      nguoi_tao: {
        type: DataTypes.INTEGER
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
      tableName: 'hang_muc_phan_loai',
      timestamps: false
    });
  
    return HangMucPhanLoai;
  };