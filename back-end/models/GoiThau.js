const pool = require('../config/db');
const DuAnThanhPhan = require('./DuAnThanhPhan');

class GoiThau {
  static async getByDuAnThanhPhanId(duAnThanhPhanId) {
    const [rows] = await pool.query(
      'SELECT * FROM goithau WHERE DuAnThanhPhan_ID = ?', 
      [duAnThanhPhanId]
    );
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.query('SELECT * FROM goithau WHERE GoiThau_ID = ?', [id]);
    return rows[0];
  }

  static async create(newGoiThau) {
    const [result] = await pool.query('INSERT INTO goithau SET ?', [newGoiThau]);
    
    // Cập nhật lại tổng chiều dài và tọa độ của dự án thành phần
    await DuAnThanhPhan.calculateAndUpdate(newGoiThau.DuAnThanhPhan_ID);
    
    return result.insertId;
  }

  static async update(id, updatedGoiThau) {
    const [result] = await pool.query('UPDATE goithau SET ? WHERE GoiThau_ID = ?', [updatedGoiThau, id]);
    
    // Cập nhật lại tổng chiều dài và tọa độ của dự án thành phần
    const goiThau = await this.getById(id);
    if (goiThau) {
      await DuAnThanhPhan.calculateAndUpdate(goiThau.DuAnThanhPhan_ID);
    }
    
    return result.affectedRows;
  }

  static async delete(id) {
    const goiThau = await this.getById(id);
    const [result] = await pool.query('DELETE FROM goithau WHERE GoiThau_ID = ?', [id]);
    
    // Cập nhật lại tổng chiều dài và tọa độ của dự án thành phần
    if (goiThau) {
      await DuAnThanhPhan.calculateAndUpdate(goiThau.DuAnThanhPhan_ID);
    }
    
    return result.affectedRows;
  }

  static async calculateTotalLength(duAnThanhPhanId) {
    const [result] = await pool.query(
      'SELECT SUM(ChieuDai) AS totalLength FROM goithau WHERE DuAnThanhPhan_ID = ?',
      [duAnThanhPhanId]
    );
    return result[0].totalLength || 0;
  }
}

module.exports = GoiThau;