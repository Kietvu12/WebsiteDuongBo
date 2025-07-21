// services/hangMucService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const getHangMucByDuAn = async (duAnId, trangThai) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${duAnId}/hang-muc`, {
      params: { trangThai }
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu hạng mục:', error);
    throw error;
  }
};