const db = require('../models');

// Lấy tất cả dự án với thông tin liên quan
exports.getAllDuAn = async (req, res) => {
    try {
      const duAnList = await db.DuAn.findAll({
        include: [
          { model: db.DuAnTrangThai, as: 'trang_thai' },
          { model: db.NhaThau, as: 'nha_thau' },
          { model: db.TinhThanh, as: 'tinh_thanh' },
          { model: db.DuAn, as: 'parent' },
          { 
            model: db.DuAn, 
            as: 'children',
            include: [
              { model: db.DuAnTrangThai, as: 'trang_thai' }
            ]
          },
          { model: db.GoiThau, as: 'goi_thau' }
        ],
        order: [
          ['ngay_tao', 'DESC']
        ]
      });
      
      res.status(200).json({
        success: true,
        data: duAnList
      });
    } catch (error) {
      console.error('Lỗi khi lấy danh sách dự án:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy danh sách dự án'
      });
    }
  };

// Lấy thông tin chi tiết 1 dự án theo ID
exports.getDuAnById = async (req, res) => {
  try {
    const duAn = await db.DuAn.findByPk(req.params.id, {
      include: [
        { model: db.DuAnTrangThai, as: 'trang_thai' },
        { model: db.NhaThau, as: 'nha_thau' },
        { model: db.TinhThanh, as: 'tinh_thanh' },
        { model: db.DuAn, as: 'parent' },
        { 
          model: db.DuAn, 
          as: 'children',
          include: [
            { model: db.DuAnTrangThai, as: 'trang_thai' }
          ]
        },
        { 
          model: db.GoiThau, 
          as: 'goi_thau',
          include: [
            { model: db.NhaThau, as: 'nha_thau' }
          ]
        },
        { 
          model: db.DuAnThongTin,
          as: 'thong_tin',
          include: [
            { model: db.ThongTinDong, as: 'bien_dong_thuoc_tinh' }
          ]
        }
      ]
    });

    if (!duAn) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dự án với ID này'
      });
    }

    res.status(200).json({
      success: true,
      data: duAn
    });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin dự án:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy thông tin dự án'
    });
  }
};

// Lấy các dự án con của 1 dự án
exports.getChildrenDuAn = async (req, res) => {
  try {
    const children = await db.DuAn.findAll({
      where: { ParentID: req.params.id },
      include: [
        { model: db.DuAnTrangThai, as: 'trang_thai' },
        { model: db.NhaThau, as: 'nha_thau' }
      ]
    });

    res.status(200).json({
      success: true,
      data: children
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách dự án con:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy danh sách dự án con'
    });
  }
};