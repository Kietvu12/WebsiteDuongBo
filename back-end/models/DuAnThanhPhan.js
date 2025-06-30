const pool = require('../config/db');

class DuAnThanhPhan {
  static async getByDuAnTongId(duAnTongId) {
    const [rows] = await pool.query('SELECT * FROM duan_thanhphan WHERE DuAnTongID = ?', [duAnTongId]);
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.query('SELECT * FROM duan_thanhphan WHERE DuAnThanhPhanID = ?', [id]);
    return rows[0];
  }

  static async create(newProject) {
    const [result] = await pool.query('INSERT INTO duan_thanhphan SET ?', [newProject]);
    
    // Cập nhật lại tổng chiều dài và tọa độ của dự án tổng
    await DuAnTong.calculateAndUpdate(project.DuAnTongID);
    
    return result.insertId;
  }

  static async update(id, updatedProject) {
    const [result] = await pool.query('UPDATE duan_thanhphan SET ? WHERE DuAnThanhPhanID = ?', [updatedProject, id]);
    
    // Cập nhật lại tổng chiều dài và tọa độ của dự án tổng
    const project = await this.getById(id);
    if (project) {
      await DuAnTong.calculateAndUpdate(project.DuAnTongID);
    }
    
    return result.affectedRows;
  }

  static async delete(id) {
    const project = await this.getById(id);
    const [result] = await pool.query('DELETE FROM duan_thanhphan WHERE DuAnThanhPhanID = ?', [id]);
    
    // Cập nhật lại tổng chiều dài và tọa độ của dự án tổng
    if (project) {
      await DuAnTong.calculateAndUpdate(project.DuAnTongID);
    }
    
    return result.affectedRows;
  }

  static async calculateAndUpdate(duAnTongId) {
    // Tính tổng chiều dài
    const totalLength = await DuAnTong.calculateTotalLength(duAnTongId);
    await pool.query('UPDATE duan_tong SET TongChieuDai = ? WHERE DuAnTongID = ?', [totalLength, duAnTongId]);
    
    // Cập nhật tọa độ
    await DuAnTong.updateCoordinates(duAnTongId);
  }
  static async calculateAndUpdate(duAnThanhPhanId) {
    // 1. Tính tổng chiều dài từ các gói thầu
    const totalLength = await GoiThau.calculateTotalLength(duAnThanhPhanId);
    await pool.query(
      'UPDATE duan_thanhphan SET ChieuDai = ? WHERE DuAnThanhPhanID = ?', 
      [totalLength, duAnThanhPhanId]
    );

    // 2. Cập nhật tọa độ từ gói thầu đầu và cuối
    await this.updateCoordinates(duAnThanhPhanId);

    // 3. Cập nhật lại thông tin dự án tổng
    const project = await this.getById(duAnThanhPhanId);
    if (project && project.DuAnTongID) {
      await DuAnTong.calculateAndUpdate(project.DuAnTongID);
    }
  }

  static async updateCoordinates(duAnThanhPhanId) {
    // Lấy tọa độ đầu từ gói thầu đầu tiên
    const [firstPackage] = await pool.query(
      `SELECT ToaDo_BatDau_X, ToaDo_BatDau_Y 
       FROM goithau 
       WHERE DuAnThanhPhan_ID = ? 
       ORDER BY GoiThau_ID ASC LIMIT 1`,
      [duAnThanhPhanId]
    );
    
    // Lấy tọa độ cuối từ gói thầu cuối cùng
    const [lastPackage] = await pool.query(
      `SELECT ToaDo_KetThuc_X, ToaDo_KetThuc_Y 
       FROM goithau 
       WHERE DuAnThanhPhan_ID = ? 
       ORDER BY GoiThau_ID DESC LIMIT 1`,
      [duAnThanhPhanId]
    );

    if (firstPackage.length > 0 && lastPackage.length > 0) {
      await pool.query(
        `UPDATE duan_thanhphan 
         SET ToaDo_DauX = ?, ToaDo_DauY = ?, 
             ToaDo_CuoiX = ?, ToaDo_CuoiY = ? 
         WHERE DuAnThanhPhanID = ?`,
        [
          firstPackage[0].ToaDo_BatDau_X,
          firstPackage[0].ToaDo_BatDau_Y,
          lastPackage[0].ToaDo_KetThuc_X,
          lastPackage[0].ToaDo_KetThuc_Y,
          duAnThanhPhanId
        ]
      );
    }
  }
}

module.exports = DuAnThanhPhan;