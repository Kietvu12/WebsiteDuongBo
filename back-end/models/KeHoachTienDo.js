module.exports = (sequelize, DataTypes) => {
    const KeHoachTienDo = sequelize.define('KeHoachTienDo', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      id_ke_hoach: {
        type: DataTypes.INTEGER,
        comment: 'id của kế hoạch liên kế với bảng ke_hoach'
      },
      khoi_luong_thuc_hien: {
        type: DataTypes.STRING(255),
        comment: 'Khối lượng thực hiện'
      },
      don_vi_tinh: {
        type: DataTypes.STRING(50),
        comment: 'Đơn vị tính'
      },
      ngay_cap_nhat_tien_do: {
        type: DataTypes.DATEONLY,
        comment: 'Ngày cập nhật tiến độ'
      },
      mo_ta: {
        type: DataTypes.TEXT,
        comment: 'Mô tả vướng mắc'
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
      tableName: 'ke_hoach_tien_do',
      timestamps: false
    });
  
    KeHoachTienDo.associate = function(models) {
      KeHoachTienDo.belongsTo(models.KeHoach, { foreignKey: 'id_ke_hoach', as: 'ke_hoach' });
    };
  
    return KeHoachTienDo;
  };