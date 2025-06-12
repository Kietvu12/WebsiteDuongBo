module.exports = (sequelize, DataTypes) => {
    const KeHoachVuongMac = sequelize.define('KeHoachVuongMac', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      ten_vuong_mac: {
        type: DataTypes.STRING(255),
        comment: 'Tên của vướng mắc trong kế hoạch'
      },
      id_ke_hoach: {
        type: DataTypes.INTEGER,
        comment: 'id của kế hoạch liên kế với bảng ke_hoach'
      },
      mo_ta: {
        type: DataTypes.STRING(255),
        comment: 'Mô tả chi tiết về vướng mắc'
      },
      muc_do: {
        type: DataTypes.STRING(50),
        comment: 'Mức độ của vướng mắc'
      },
      ngay_phat_sinh: {
        type: DataTypes.DATEONLY,
        comment: 'Ngày phát sinh'
      },
      ngay_ket_thuc: {
        type: DataTypes.DATEONLY,
        comment: 'Ngày kết thúc'
      },
      bien_phap: {
        type: DataTypes.TEXT,
        comment: 'Biện pháp xử lý'
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
      tableName: 'ke_hoach_vuong_mac',
      timestamps: false
    });
  
    KeHoachVuongMac.associate = function(models) {
      KeHoachVuongMac.belongsTo(models.KeHoach, { foreignKey: 'id_ke_hoach', as: 'ke_hoach' });
    };
  
    return KeHoachVuongMac;
  };