const pool = require('../config/db');

class DuAnTong {
  static async getAll() {
    const [rows] = await pool.query('SELECT * FROM duan_tong');
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.query('SELECT * FROM duan_tong WHERE DuAnTongID = ?', [id]);
    return rows[0];
  }

  static async create(newProject) {
    const [result] = await pool.query('INSERT INTO duan_tong SET ?', [newProject]);
    return result.insertId;
  }

  static async update(id, updatedProject) {
    const [result] = await pool.query('UPDATE duan_tong SET ? WHERE DuAnTongID = ?', [updatedProject, id]);
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM duan_tong WHERE DuAnTongID = ?', [id]);
    return result.affectedRows;
  }

  static async calculateTotalLength(duAnTongId) {
    const [result] = await pool.query(
      'SELECT SUM(ChieuDai) AS totalLength FROM duan_thanhphan WHERE DuAnTongID = ?',
      [duAnTongId]
    );
    return result[0].totalLength || 0;
  }

  static async updateCoordinates(duAnTongId) {
    // Lấy tọa độ đầu từ dự án thành phần đầu tiên
    const [firstProject] = await pool.query(
      'SELECT ToaDo_DauX, ToaDo_DauY FROM duan_thanhphan WHERE DuAnTongID = ? ORDER BY DuAnThanhPhanID ASC LIMIT 1',
      [duAnTongId]
    );
    
    // Lấy tọa độ cuối từ dự án thành phần cuối cùng
    const [lastProject] = await pool.query(
      'SELECT ToaDo_CuoiX, ToaDo_CuoiY FROM duan_thanhphan WHERE DuAnTongID = ? ORDER BY DuAnThanhPhanID DESC LIMIT 1',
      [duAnTongId]
    );

    if (firstProject.length > 0 && lastProject.length > 0) {
      await pool.query(
        'UPDATE duan_tong SET ToaDo_DauX = ?, ToaDo_DauY = ?, ToaDo_CuoiX = ?, ToaDo_CuoiY = ? WHERE DuAnTongID = ?',
        [
          firstProject[0].ToaDo_DauX,
          firstProject[0].ToaDo_DauY,
          lastProject[0].ToaDo_CuoiX,
          lastProject[0].ToaDo_CuoiY,
          duAnTongId
        ]
      );
    }
  }
}

module.exports = DuAnTong;