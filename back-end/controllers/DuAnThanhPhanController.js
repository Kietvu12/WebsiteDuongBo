const DuAnThanhPhan = require('../models/DuAnThanhPhan');

exports.getDuAnThanhPhanById = async (req, res) => {
  try {
    const duAnThanhPhan = await DuAnThanhPhan.getById(req.params.id);
    if (!duAnThanhPhan) {
      return res.status(404).json({ error: 'Dự án thành phần không tồn tại' });
    }
    res.json(duAnThanhPhan);
  } catch (error) {
    console.error('Lỗi khi lấy thông tin dự án thành phần:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

exports.createDuAnThanhPhan = async (req, res) => {
  try {
    const newProjectId = await DuAnThanhPhan.create(req.body);
    res.status(201).json({ id: newProjectId, message: 'Dự án thành phần đã được tạo thành công' });
  } catch (error) {
    console.error('Lỗi khi tạo dự án thành phần:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

exports.updateDuAnThanhPhan = async (req, res) => {
  try {
    const affectedRows = await DuAnThanhPhan.update(req.params.id, req.body);
    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Dự án thành phần không tồn tại' });
    }
    res.json({ message: 'Dự án thành phần đã được cập nhật thành công' });
  } catch (error) {
    console.error('Lỗi khi cập nhật dự án thành phần:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

exports.deleteDuAnThanhPhan = async (req, res) => {
  try {
    const affectedRows = await DuAnThanhPhan.delete(req.params.id);
    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Dự án thành phần không tồn tại' });
    }
    res.json({ message: 'Dự án thành phần đã được xóa thành công' });
  } catch (error) {
    console.error('Lỗi khi xóa dự án thành phần:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
  exports.getGoiThauByDuAnThanhPhan = async (req, res) => {
    try {
      const duAnThanhPhanId = req.params.id;
      
      // Kiểm tra dự án thành phần có tồn tại không
      const duAnThanhPhan = await DuAnThanhPhan.getById(duAnThanhPhanId);
      if (!duAnThanhPhan) {
        return res.status(404).json({ error: 'Dự án thành phần không tồn tại' });
      }
      
      // Lấy danh sách gói thầu
      const goiThauList = await GoiThau.getByDuAnThanhPhanId(duAnThanhPhanId);
      
      res.json({
        duAnThanhPhan,
        goiThauList,
        tongSoGoiThau: goiThauList.length,
        tongChieuDai: duAnThanhPhan.ChieuDai
      });
    } catch (error) {
      console.error('Lỗi khi lấy danh sách gói thầu:', error);
      res.status(500).json({ error: 'Lỗi server' });
    }
  };
  
  exports.calculateDuAnThanhPhan = async (req, res) => {
    try {
      const duAnThanhPhanId = req.params.id;
      
      // Kiểm tra dự án thành phần có tồn tại không
      const duAnThanhPhan = await DuAnThanhPhan.getById(duAnThanhPhanId);
      if (!duAnThanhPhan) {
        return res.status(404).json({ error: 'Dự án thành phần không tồn tại' });
      }
      
      // Thực hiện tính toán
      await DuAnThanhPhan.calculateAndUpdate(duAnThanhPhanId);
      
      // Lấy thông tin mới nhất sau khi tính toán
      const updatedInfo = await DuAnThanhPhan.getById(duAnThanhPhanId);
      
      res.json({
        message: 'Đã cập nhật thông tin dự án thành phần',
        duAnThanhPhan: updatedInfo
      });
    } catch (error) {
      console.error('Lỗi khi tính toán dự án thành phần:', error);
      res.status(500).json({ error: 'Lỗi server' });
    }
  };
  
  exports.getDuAnThanhPhanDetail = async (req, res) => {
    try {
      const duAnThanhPhanId = req.params.id;
      
      // Lấy thông tin cơ bản
      const duAnThanhPhan = await DuAnThanhPhan.getById(duAnThanhPhanId);
      if (!duAnThanhPhan) {
        return res.status(404).json({ error: 'Dự án thành phần không tồn tại' });
      }
      
      // Lấy danh sách gói thầu
      const goiThauList = await GoiThau.getByDuAnThanhPhanId(duAnThanhPhanId);
      
      // Lấy thông tin dự án tổng
      const duAnTong = duAnThanhPhan.DuAnTongID ? 
        await DuAnTong.getById(duAnThanhPhan.DuAnTongID) : null;
      
      res.json({
        ...duAnThanhPhan,
        duAnTongInfo: duAnTong,
        goiThauList,
        tongSoGoiThau: goiThauList.length,
        // Các thông tin thống kê khác có thể thêm vào tùy nhu cầu
        tienDoThucHien: await this.calculateProgress(goiThauList)
      });
    } catch (error) {
      console.error('Lỗi khi lấy thông tin chi tiết:', error);
      res.status(500).json({ error: 'Lỗi server' });
    }
  };
  
  // Hàm hỗ trợ tính toán tiến độ
  async function calculateProgress(goiThauList) {
    // Logic tính toán tiến độ tổng hợp
    // Có thể thêm các phép tính phức tạp hơn tùy nhu cầu
    const totalLength = goiThauList.reduce((sum, gt) => sum + (gt.ChieuDai || 0), 0);
    const completedLength = goiThauList.reduce((sum, gt) => {
      return sum + (gt.TrangThai === 'Hoàn thành' ? (gt.ChieuDai || 0) : 0);
    }, 0);
    
    return {
      totalLength,
      completedLength,
      progressPercentage: totalLength > 0 ? 
        Math.round((completedLength / totalLength) * 100) : 0
    };
  }
};