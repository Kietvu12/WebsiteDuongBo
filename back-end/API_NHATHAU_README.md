# API Quản lý Nhà thầu

## Tổng quan
API này cung cấp các chức năng quản lý nhà thầu trong hệ thống quản lý dự án đường bộ, bao gồm:
- Lấy thông tin chi tiết nhà thầu với thống kê đầy đủ và chi tiết gói thầu, hạng mục, kế hoạch
- Lấy danh sách nhà thầu với phân trang, tìm kiếm và tùy chọn lấy chi tiết đầy đủ
- Cập nhật thông tin nhà thầu
- Xóa nhà thầu và dữ liệu liên quan

## Cách sử dụng API danh sách nhà thầu

### Lấy danh sách cơ bản (nhanh):
```
GET /api/nhathau?page=1&limit=10
```

### Lấy danh sách với tìm kiếm:
```
GET /api/nhathau?search=ABC&loai=Xây dựng&page=1&limit=10
```

### Lấy danh sách với chi tiết đầy đủ:
```
GET /api/nhathau?includeDetails=true&page=1&limit=5
```

**Lưu ý:** Khi `includeDetails=true`, API sẽ trả về thông tin chi tiết đầy đủ cho mỗi nhà thầu, nhưng sẽ chậm hơn do phải truy vấn nhiều bảng. Nên sử dụng với `limit` nhỏ (5-10) để tối ưu hiệu suất.

## Base URL
```
http://localhost:5000/api/nhathau
```

## Các API Endpoints

### 1. Lấy danh sách nhà thầu với thống kê và chi tiết đầy đủ
**GET** `/api/nhathau`

**Query Parameters:**
- `page` (optional): Số trang (mặc định: 1)
- `limit` (optional): Số lượng item trên trang (mặc định: 10)
- `search` (optional): Từ khóa tìm kiếm (tên nhà thầu, mã số thuế, người đại diện)
- `loai` (optional): Lọc theo loại nhà thầu
- `tinh` (optional): Lọc theo tỉnh thành
- `includeDetails` (optional): Lấy chi tiết đầy đủ (true/false, mặc định: false)

**Response (includeDetails=false - mặc định):**
```json
{
  "success": true,
  "data": {
    "danhSachNhaThau": [
      {
        "NhaThauID": 1,
        "TenNhaThau": "Công ty TNHH Xây dựng ABC",
        "Loai": "Xây dựng",
        "MaSoThue": "0123456789",
        "DiaChiTruSo": "123 Đường ABC, Quận 1, TP.HCM",
        "SoDienThoai": "0901234567",
        "Email": "info@abc-construction.com",
        "NguoiDaiDien": "Nguyễn Văn A",
        "ChucVuNguoiDaiDien": "Giám đốc",
        "TongGoiThau": 5,
        "GoiThauChinh": 3,
        "GoiThauPhu": 2,
        "GoiThauLienDanh": 0,
        "TongHangMuc": 12,
        "TongKeHoach": 25,
        "GoiThauHoanThanh": 2,
        "GoiThauDangLam": 2,
        "GoiThauChamTienDo": 1,
        "GoiThauChuaBatDau": 0,
        "HangMucHoanThanh": 8,
        "HangMucDangLam": 3,
        "HangMucChuaBatDau": 1,
        "KeHoachHoanThanh": 15,
        "KeHoachDangLam": 8,
        "KeHoachChamTienDo": 2
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
}
```

**Response (includeDetails=true):**
```json
{
  "success": true,
  "data": {
    "danhSachNhaThau": [
      {
        "nhaThau": {
          "NhaThauID": 1,
          "TenNhaThau": "Công ty TNHH Xây dựng ABC",
          "Loai": "Xây dựng",
          "MaSoThue": "0123456789",
          "DiaChiTruSo": "123 Đường ABC, Quận 1, TP.HCM",
          "SoDienThoai": "0901234567",
          "Email": "info@abc-construction.com",
          "NguoiDaiDien": "Nguyễn Văn A",
          "ChucVuNguoiDaiDien": "Giám đốc",
          "TongGoiThau": 5,
          "GoiThauChinh": 3,
          "GoiThauPhu": 2,
          "GoiThauLienDanh": 0,
          "TongHangMuc": 12,
          "TongKeHoach": 25,
          "GoiThauHoanThanh": 2,
          "GoiThauDangLam": 2,
          "GoiThauChamTienDo": 1,
          "GoiThauChuaBatDau": 0,
          "HangMucHoanThanh": 8,
          "HangMucDangLam": 3,
          "HangMucChuaBatDau": 1,
          "KeHoachHoanThanh": 15,
          "KeHoachDangLam": 8,
          "KeHoachChamTienDo": 2
        },
        "chiTiet": {
          "goiThau": [
            {
              "GoiThau_ID": 1,
              "TenGoiThau": "Gói thầu xây dựng đường ABC",
              "GiaTriHĐ": "5000000000",
              "Km_BatDau": "0+000",
              "Km_KetThuc": "5+000",
              "ToaDo_BatDau_X": 106.6297,
              "ToaDo_BatDau_Y": 10.8231,
              "ToaDo_KetThuc_X": 106.6347,
              "ToaDo_KetThuc_Y": 10.8281,
              "NgayKhoiCong": "2024-01-15",
              "NgayHoanThanh": "2024-12-31",
              "TrangThai": "Đang thực hiện",
              "PhanTramHoanThanh": 75.5,
              "PhanTramDangLam": 20.0,
              "PhanTramChamTienDo": 5.0,
              "PhanTramKeHoach": 80.0,
              "ThoiGianCapNhatGanNhat": "2024-06-15T10:30:00.000Z",
              "PathData": "[[106.6297,10.8231],[106.6347,10.8281]]",
              "DuAnID": 1,
              "TenDuAn": "Dự án đường ABC",
              "TinhThanh": "TP.HCM",
              "ChuDauTu": "Sở GTVT TP.HCM",
              "NgayKhoiCongDuAn": "2024-01-01",
              "TrangThaiDuAn": "Đang thực hiện",
              "NguonVon": "Ngân sách nhà nước",
              "TongChieuDai": 5.0,
              "KeHoachHoanThanh": "2024-12-31",
              "VaiTro": "Nhà thầu chính",
              "TrangThaiTienDo": "Đang thực hiện"
            }
          ],
          "hangMuc": [
            {
              "HangMucID": 1,
              "TenHangMuc": "San lấp mặt bằng",
              "LoaiHangMuc": "Chuẩn bị",
              "TieuDeChiTiet": "San lấp mặt bằng cho toàn bộ tuyến đường",
              "MayMocThietBi": "Máy ủi, máy xúc, xe tải",
              "NhanLucThiCong": "Đội thi công 10 người",
              "ThoiGianHoanThanh": "2024-03-31",
              "GhiChu": "Hoàn thành đúng tiến độ",
              "GoiThau_ID": 1,
              "TenGoiThau": "Gói thầu xây dựng đường ABC",
              "GiaTriHĐ": "5000000000",
              "NgayKhoiCong": "2024-01-15",
              "NgayHoanThanh": "2024-12-31",
              "TrangThaiGoiThau": "Đang thực hiện",
              "PhanTramHoanThanhGoiThau": 75.5,
              "DuAnID": 1,
              "TenDuAn": "Dự án đường ABC",
              "TinhThanh": "TP.HCM",
              "ChuDauTu": "Sở GTVT TP.HCM",
              "TrangThaiHangMuc": "Hoàn thành"
            }
          ],
          "keHoach": [
            {
              "KeHoachID": 1,
              "TenCongTac": "San lấp mặt bằng",
              "KhoiLuongKeHoach": 1000.0,
              "DonViTinh": "m³",
              "NgayBatDau": "2024-01-15",
              "NgayKetThuc": "2024-03-31",
              "GhiChu": "Kế hoạch san lấp",
              "HangMucID": 1,
              "TenHangMuc": "San lấp mặt bằng",
              "LoaiHangMuc": "Chuẩn bị",
              "ThoiGianHoanThanh": "2024-03-31",
              "GoiThau_ID": 1,
              "TenGoiThau": "Gói thầu xây dựng đường ABC",
              "GiaTriHĐ": "5000000000",
              "NgayKhoiCong": "2024-01-15",
              "NgayHoanThanh": "2024-12-31",
              "TrangThaiGoiThau": "Đang thực hiện",
              "PhanTramHoanThanhGoiThau": 75.5,
              "DuAnID": 1,
              "TenDuAn": "Dự án đường ABC",
              "TinhThanh": "TP.HCM",
              "ChuDauTu": "Sở GTVT TP.HCM",
              "KhoiLuongThucHien": 800.0,
              "SoLanCapNhatTienDo": 5,
              "NgayCapNhatGanNhat": "2024-06-15",
              "TrangThaiKeHoach": "Đang thực hiện",
              "PhanTramHoanThanh": 80.0
            }
          ]
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
}
```

### 2. Lấy thông tin chi tiết nhà thầu với thống kê đầy đủ
**GET** `/api/nhathau/:nhaThauId`

**Mô tả:** API này trả về thông tin chi tiết của nhà thầu bao gồm:
- Thông tin cơ bản của nhà thầu
- Thống kê chi tiết theo vai trò và trạng thái tiến độ
- Chi tiết đầy đủ của tất cả gói thầu tham gia
- Chi tiết đầy đủ của tất cả hạng mục thi công
- Chi tiết đầy đủ của tất cả kế hoạch và tiến độ thực hiện

**Response:**
```json
{
  "success": true,
  "data": {
    "thongTinNhaThau": {
      "NhaThauID": 1,
      "TenNhaThau": "Công ty TNHH Xây dựng ABC",
      "Loai": "Xây dựng",
      "MaSoThue": "0123456789",
      "DiaChiTruSo": "123 Đường ABC, Quận 1, TP.HCM",
      "SoDienThoai": "0901234567",
      "Email": "info@abc-construction.com",
      "NguoiDaiDien": "Nguyễn Văn A",
      "ChucVuNguoiDaiDien": "Giám đốc",
      "GiayPhepKinhDoanh": "GP123456789",
      "NgayCap": "2020-01-15",
      "NoiCap": "Sở Kế hoạch và Đầu tư TP.HCM",
      "GhiChu": "Nhà thầu uy tín, có nhiều kinh nghiệm"
    },
    "thongKe": {
      "goiThau": {
        "tongSo": 5,
        "theoVaiTro": {
          "chinh": 3,
          "phu": 2,
          "lienDanh": 0
        },
        "theoTrangThai": {
          "hoanThanh": 2,
          "dangLam": 2,
          "chamTienDo": 1,
          "chuaBatDau": 0
        }
      },
      "hangMuc": {
        "tongSo": 12,
        "theoTrangThai": {
          "hoanThanh": 8,
          "dangLam": 3,
          "chuaBatDau": 1
        }
      },
      "keHoach": {
        "tongSo": 25,
        "theoTrangThai": {
          "hoanThanh": 15,
          "dangLam": 8,
          "chamTienDo": 2,
          "chuaBatDau": 0
        }
      }
    },
    "chiTiet": {
      "goiThau": [
        {
          "GoiThau_ID": 1,
          "TenGoiThau": "Gói thầu xây dựng đường ABC",
          "GiaTriHĐ": "5000000000",
          "Km_BatDau": "0+000",
          "Km_KetThuc": "5+000",
          "ToaDo_BatDau_X": 106.6297,
          "ToaDo_BatDau_Y": 10.8231,
          "ToaDo_KetThuc_X": 106.6347,
          "ToaDo_KetThuc_Y": 10.8281,
          "NgayKhoiCong": "2024-01-15",
          "NgayHoanThanh": "2024-12-31",
          "TrangThai": "Đang thực hiện",
          "PhanTramHoanThanh": 75.5,
          "PhanTramDangLam": 20.0,
          "PhanTramChamTienDo": 5.0,
          "PhanTramKeHoach": 80.0,
          "ThoiGianCapNhatGanNhat": "2024-06-15T10:30:00.000Z",
          "PathData": "[[106.6297,10.8231],[106.6347,10.8281]]",
          "DuAnID": 1,
          "TenDuAn": "Dự án đường ABC",
          "TinhThanh": "TP.HCM",
          "ChuDauTu": "Sở GTVT TP.HCM",
          "NgayKhoiCongDuAn": "2024-01-01",
          "TrangThaiDuAn": "Đang thực hiện",
          "NguonVon": "Ngân sách nhà nước",
          "TongChieuDai": 5.0,
          "KeHoachHoanThanh": "2024-12-31",
          "VaiTro": "Nhà thầu chính",
          "TrangThaiTienDo": "Đang thực hiện"
        }
      ],
      "hangMuc": [
        {
          "HangMucID": 1,
          "TenHangMuc": "San lấp mặt bằng",
          "LoaiHangMuc": "Chuẩn bị",
          "TieuDeChiTiet": "San lấp mặt bằng cho toàn bộ tuyến đường",
          "MayMocThietBi": "Máy ủi, máy xúc, xe tải",
          "NhanLucThiCong": "Đội thi công 10 người",
          "ThoiGianHoanThanh": "2024-03-31",
          "GhiChu": "Hoàn thành đúng tiến độ",
          "GoiThau_ID": 1,
          "TenGoiThau": "Gói thầu xây dựng đường ABC",
          "GiaTriHĐ": "5000000000",
          "NgayKhoiCong": "2024-01-15",
          "NgayHoanThanh": "2024-12-31",
          "TrangThaiGoiThau": "Đang thực hiện",
          "PhanTramHoanThanhGoiThau": 75.5,
          "DuAnID": 1,
          "TenDuAn": "Dự án đường ABC",
          "TinhThanh": "TP.HCM",
          "ChuDauTu": "Sở GTVT TP.HCM",
          "TrangThaiHangMuc": "Hoàn thành"
        }
      ],
      "keHoach": [
        {
          "KeHoachID": 1,
          "TenCongTac": "San lấp mặt bằng",
          "KhoiLuongKeHoach": 1000.0,
          "DonViTinh": "m³",
          "NgayBatDau": "2024-01-15",
          "NgayKetThuc": "2024-03-31",
          "GhiChu": "Kế hoạch san lấp",
          "HangMucID": 1,
          "TenHangMuc": "San lấp mặt bằng",
          "LoaiHangMuc": "Chuẩn bị",
          "ThoiGianHoanThanh": "2024-03-31",
          "GoiThau_ID": 1,
          "TenGoiThau": "Gói thầu xây dựng đường ABC",
          "GiaTriHĐ": "5000000000",
          "NgayKhoiCong": "2024-01-15",
          "NgayHoanThanh": "2024-12-31",
          "TrangThaiGoiThau": "Đang thực hiện",
          "PhanTramHoanThanhGoiThau": 75.5,
          "DuAnID": 1,
          "TenDuAn": "Dự án đường ABC",
          "TinhThanh": "TP.HCM",
          "ChuDauTu": "Sở GTVT TP.HCM",
          "KhoiLuongThucHien": 800.0,
          "SoLanCapNhatTienDo": 5,
          "NgayCapNhatGanNhat": "2024-06-15",
          "TrangThaiKeHoach": "Đang thực hiện",
          "PhanTramHoanThanh": 80.0
        }
      ]
    }
  }
}
```

### 3. Cập nhật thông tin nhà thầu
**PUT** `/api/nhathau/:nhaThauId`

**Request Body:**
```json
{
  "TenNhaThau": "Công ty TNHH Xây dựng ABC (Cập nhật)",
  "Loai": "Xây dựng",
  "MaSoThue": "0123456789",
  "DiaChiTruSo": "456 Đường XYZ, Quận 2, TP.HCM",
  "SoDienThoai": "0901234568",
  "Email": "info@abc-construction-updated.com",
  "NguoiDaiDien": "Nguyễn Văn B",
  "ChucVuNguoiDaiDien": "Tổng Giám đốc",
  "GhiChu": "Nhà thầu uy tín, có nhiều kinh nghiệm (Đã cập nhật)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cập nhật thông tin nhà thầu thành công",
  "data": {
    "NhaThauID": 1,
    "TenNhaThau": "Công ty TNHH Xây dựng ABC (Cập nhật)",
    "Loai": "Xây dựng",
    "MaSoThue": "0123456789",
    "DiaChiTruSo": "456 Đường XYZ, Quận 2, TP.HCM",
    "SoDienThoai": "0901234568",
    "Email": "info@abc-construction-updated.com",
    "NguoiDaiDien": "Nguyễn Văn B",
    "ChucVuNguoiDaiDien": "Tổng Giám đốc",
    "GhiChu": "Nhà thầu uy tín, có nhiều kinh nghiệm (Đã cập nhật)"
  }
}
```

### 4. Xóa nhà thầu
**DELETE** `/api/nhathau/:nhaThauId`

**Response:**
```json
{
  "success": true,
  "message": "Xóa nhà thầu và tất cả dữ liệu liên quan thành công"
}
```

## Cấu trúc thống kê và trạng thái tiến độ

### Thống kê chi tiết:
API trả về thống kê được phân loại theo:
- **Gói thầu**: Theo vai trò (chính/phụ/liên danh) và trạng thái tiến độ
- **Hạng mục**: Theo trạng thái tiến độ
- **Kế hoạch**: Theo trạng thái tiến độ

### Trạng thái tiến độ:

#### Gói thầu:
- **Hoàn thành**: `NgayHoanThanh` không null và `PhanTramHoanThanh >= 100`
- **Chậm tiến độ**: `NgayHoanThanh` không null và `PhanTramHoanThanh < 100`
- **Đang thực hiện**: `NgayHoanThanh` null và `PhanTramHoanThanh > 0`
- **Chưa bắt đầu**: Các trường hợp còn lại

#### Hạng mục:
- **Hoàn thành**: `ThoiGianHoanThanh <= CURDATE()`
- **Đang thực hiện**: `ThoiGianHoanThanh > CURDATE()`
- **Chưa bắt đầu**: Các trường hợp còn lại

#### Kế hoạch:
- **Chậm tiến độ**: `NgayKetThuc < CURDATE()` và `KhoiLuongThucHien < KhoiLuongKeHoach`
- **Đang thực hiện**: `NgayKetThuc >= CURDATE()` và `KhoiLuongThucHien > 0`
- **Hoàn thành**: `NgayKetThuc < CURDATE()` và `KhoiLuongThucHien >= KhoiLuongKeHoach`
- **Chưa bắt đầu**: Các trường hợp còn lại

### Chi tiết dữ liệu trả về:
- **Gói thầu**: Bao gồm thông tin đầy đủ về dự án, tọa độ, giá trị, tiến độ
- **Hạng mục**: Bao gồm thông tin chi tiết về thiết bị, nhân lực, tiến độ
- **Kế hoạch**: Bao gồm thông tin về khối lượng, tiến độ thực hiện, số lần cập nhật

## Xử lý lỗi

### Lỗi 404 - Không tìm thấy
```json
{
  "success": false,
  "message": "Không tìm thấy nhà thầu"
}
```

### Lỗi 500 - Lỗi server
```json
{
  "success": false,
  "message": "Lỗi server khi lấy thông tin nhà thầu",
  "error": "Chi tiết lỗi"
}
```

## Lưu ý quan trọng

1. **Xóa nhà thầu**: Khi xóa nhà thầu, hệ thống sẽ tự động xóa tất cả dữ liệu liên quan theo thứ tự:
   - Tiến độ thực hiện
   - Kế hoạch
   - Quan hệ gói thầu - nhà thầu
   - Cập nhật NhaThauID = NULL trong gói thầu (nếu là nhà thầu chính)
   - Tài khoản liên quan
   - Nhà thầu

2. **Transaction**: Tất cả các thao tác xóa được thực hiện trong transaction để đảm bảo tính toàn vẹn dữ liệu.

3. **Phân trang**: API danh sách hỗ trợ phân trang với tham số `page` và `limit`.

4. **Tìm kiếm**: Hỗ trợ tìm kiếm theo tên nhà thầu, mã số thuế, người đại diện.

5. **Lọc**: Có thể lọc theo loại nhà thầu và tỉnh thành. 