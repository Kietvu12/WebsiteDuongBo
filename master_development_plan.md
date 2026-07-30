# MASTER DEVELOPMENT PLAN – NÂNG CẤP WEBSITE ĐƯỜNG BỘ
**Dành cho: Đội ngũ Phát triển (Dev Team / AI Dev)**
**Phiên bản:** 2.0 | **Ngày lập:** 23/06/2026

Tài liệu này là đặc tả chi tiết toàn bộ các hạng mục cần thiết kế mới, sửa đổi database, phát triển API và xây dựng UI/UX cho hệ thống "Quản lý dữ liệu Đường bộ".

---

## PHẦN 1: TÁI CẤU TRÚC LUỒNG NGHIỆP VỤ TỔNG THỂ (NEW WORKFLOW)

Hệ thống sẽ chuyển từ việc chỉ "hiển thị tiến độ" sang luồng **Quản lý quy trình (Workflow)** thực tế của Bộ Xây Dựng. Gồm 4 tác nhân (Roles): `Admin`, `Cán bộ BXD`, `Nhà thầu`, `Bộ trưởng`.

### Luồng vận hành chuẩn (Standard Operating Procedure)
1. **Khởi tạo (Cán bộ):** Đăng nhập → Tạo "Dự án / Hợp đồng mới" → Upload tài liệu kỹ thuật/chữ ký → Tạo Dự án thành phần → Tạo Gói thầu → Tạo Hạng mục.
2. **Giao việc (Cán bộ):** Cán bộ assign (phân công) Nhà thầu chính vào từng Hạng mục. (Tài khoản Nhà thầu được tạo trước bởi Admin).
3. **Lập Kế hoạch (Nhà thầu):** Nhà thầu đăng nhập → Xem hạng mục được giao → Nộp "Kế hoạch thi công theo giai đoạn" lên hệ thống.
4. **Phê duyệt (Cán bộ):** Cán bộ nhận thông báo → Mở xem kế hoạch → Bấm Duyệt (✅) hoặc Từ chối (❌) kèm lý do. Kế hoạch được duyệt sẽ khóa lại làm mốc (baseline).
5. **Thi công & Báo cáo (Nhà thầu):** Định kỳ, Nhà thầu vào cập nhật Khối lượng hiện tại + Upload ảnh hiện trường + Gửi cảnh báo vướng mắc nếu có.
6. **Xác nhận (Cán bộ):** Cán bộ đối chiếu Báo cáo của nhà thầu → Ấn Xác nhận. Dữ liệu khối lượng chính thức cập nhật vào hệ thống.
7. **Giám sát (Bộ trưởng):** Bất cứ lúc nào, lãnh đạo Bộ cũng có thể mở Màn hình Tổng quan (Executive Dashboard) để xem số liệu realtime (Tiến độ thực / Kế hoạch, Cảnh báo chậm tiến độ, Thống kê địa phương).

---

## PHẦN 2: THAY ĐỔI CẤU TRÚC DATABASE (MySQL)

Cần chạy script SQL để tạo thêm bảng và migration.

### 2.1 Cập nhật bảng hiện tại
* **`users` (Thay thế file MongoDB cũ):** 
  * Columns: `UserID`, `TenDangNhap`, `MatKhau` (Bcrypt), `HoTen`, `VaiTro` (ENUM: `admin`, `can_bo`, `nha_thau`, `bo_truong`), `NhaThauID` (Nullable), `BanQLID` (Nullable).
* **`duan` (Dự án Tổng):** 
  * Thêm Columns: `BanQLID` (Liên kết Ban QLDA), `MaHopDong`, `GiaTriHopDong`, `NguonVonChiTiet`.

### 2.2 Tạo 4 bảng mới
* **`ban_quan_ly`:** Quản lý danh mục Ban QLDA (`BanQLID`, `TenBanQL`, `ThongTinLienHe`).
* **`tai_lieu_hop_dong`:** Quản lý file đính kèm (`TaiLieuID`, `DuAnID`, `TenFile`, `URL`, `NguoiUpload`).
* **`ke_hoach_thi_cong`:** Kế hoạch nhà thầu trình duyệt (`KeHoachID`, `HangMucID`, `NhaThauID`, `GiaiDoan`, `KhoiLuong`, `TuNgay`, `DenNgay`, `TrangThaiDuyet`).
* **`bao_cao_dinh_ky`:** Số liệu update của nhà thầu (`BaoCaoID`, `KeHoachID`, `KhoiLuongBaoCao`, `TienDo_PhanTram`, `LinkAnh`, `VuongMac`, `TrangThaiXacNhan`).

---

## PHẦN 3: ĐẶC TẢ GIAO DIỆN & CHỨC NĂNG (FRONTEND UIs)

| Area | Component/Page | Chức năng chi tiết (Dành cho Dev code) |
|---|---|---|
| **Auth** | [Login.js](file:///d:/40.Web%20qu%E1%BA%A3n%20l%C3%BD%20d%E1%BB%AF%20li%E1%BB%87u%20%C4%91%C6%B0%E1%BB%9Dng%20b%E1%BB%99/Code/WebsiteDuongBo/src/page/Login/Login.js) | Sửa lại logic Form Login. Bỏ auto-redirect. Gọi API `POST /api/login`. Lưu JWT vào localStorage. Route Guard kiểm tra role. |
| **Lãnh đạo** | `Overview.js` (NEW) | **Trang Dashboard cấp Bộ trưởng (Landing page cho role bo_truong).**<br/>- Filter bar (Năm, Tỉnh, Ban QL).<br/>- 5 Thẻ StatCard (Tổng DA, Ban, Đang TH, Chậm TĐ, HT).<br/>- Hiển thị ChartJS Doughnut (Trạng thái) & Grouped Bar (Tiến độ thực/KH). |
| **Lãnh đạo** | `LocalStats.js` (NEW) | **Bảng Thống kê Địa phương.**<br/>- Table DataGrid: hiển thị mỗi tỉnh một dòng (Tổng DA, % TH, km).<br/>- Inline Progress bar trong table.<br/>- Button Xuất Excel. |
| **Lãnh đạo** | `BanQuanLyStats.js` (NEW) | **Bảng BQL Dự án.**<br/>- Danh sách các Ban QLDA và hiệu suất (còn bao nhiêu DA chậm tiến độ). |
| **Cán bộ** | `CreateProject.js` (NEW) | **Wizard Form (Tạo mới Dự án Tổng).**<br/>- Step 1: Info chung (Tên, Mã, Ngày, Nguồn vốn).<br/>- Step 2: Chọn Ban QLDA.<br/>- Step 3: Drag & Drop upload hồ sơ/tài liệu (File PDF). |
| **Cán bộ** | `AssignContractor.js` (NEW) | **Màn hình Phân công.**<br/>- Popup Dropdown chọn `NhaThauID` gán cho một `HangMucID`. Gửi Email/Notification. |
| **Cán bộ** | `ApprovePlan.js` (NEW) | **Bàn làm việc duyệt Kế hoạch.**<br/>- Danh sách Kế hoạch nhà thầu mới gửi (Status pending).<br/>- Button Duyệt (Xanh) hoặc Từ chối (Đỏ + Textbox ghi lý do). |
| **Nhà thầu** | `ContractorDashboard.js` (NEW)| **Trang chủ cho Nhà thầu.**<br/>- Chỉ hiển thị các Dự án/Hạng mục thuộc `NhaThauID` của user đang login. |
| **Nhà thầu** | `SubmitPlan.js` (NEW) | **Nộp kế hoạch thi công.**<br/>- Form thêm lưới (Grid) các giai đoạn: Tên giai đoạn, Khối lượng khoán, Ngày bắt đầu, kết thúc. Nút "Gửi kiểm duyệt". |
| **Nhà thầu** | `ProgressReport.js` (NEW) | **Upload Báo cáo tiến độ.**<br/>- Input nhập khối lượng đạt được hôm nay.<br/>- Multi-image uploader (minh chứng).<br/>- Textarea báo cáo Vướng mắc. |
| **Global** | [Sidebar.js](file:///d:/40.Web%20qu%E1%BA%A3n%20l%C3%BD%20d%E1%BB%AF%20li%E1%BB%87u%20%C4%91%C6%B0%E1%BB%9Dng%20b%E1%BB%99/Code/WebsiteDuongBo/src/component/SideBar/Sidebar.js) | Tái cấu trúc menu theo Role (Dùng Ternary Operator `user.role === 'admin' ? ...`). |

---

## PHẦN 4: THIẾT KẾ DANH SÁCH API (BACKEND)

Đội Backend cần tạo mới / Sửa các Endpoint sau trên `Express Server (Port 5000)`:

### Group 1: Auth & User
* `POST /api/auth/login` - Verify password, return `{ token, user: {id, role} }`
* `GET /api/auth/me` - (JWT Middleware needed) Get current user profile

### Group 2: Executive Dashboard (Dùng câu lệnh SQL tối ưu)
* `GET /api/dashboard/kpi` - Return 5 chỉ số tổng (count)
* `GET /api/dashboard/chart-progress` - SQL JOIN tính % Kế hoạch vs % Thực hiện Top 10 dự án.
* `GET /api/dashboard/local-summary` - Querry string split Tỉnh thành, gom nhóm các số liệu.
* `GET /api/dashboard/banql-summary` - Thống kê DA theo từng Ban QLDA.

### Group 3: Core Workflow Project
* `POST /api/projects` - Thêm mới DA Tổng
* `POST /api/projects/upload-doc` - Dùng `multer` lib upload file vào root folder `/uploads/`
* `POST /api/hangmuc/:id/assign` - Update `NhaThauID` cho Hạng mục.

### Group 4: Contractor Workflow
* `POST /api/kehoach` - Nhà thầu lưu kế hoạch (Trạng thái `ChoDuyet`)
* `PUT /api/kehoach/:id/approve` - Cán bộ duyệt kế hoạch (Chuyển status)
* `POST /api/baocao` - Khởi tạo báo cáo định kỳ
* `PUT /api/baocao/:id/verify` - Cán bộ BXD xác nhận Khối lượng (Lúc này trigger trigger cập nhật + update vào bảng `tiendothuchien` cũ).

---

## PHẦN 5: THỨ TỰ THỰC THI (SPRINT PLAN CHO TEAM)

Yêu cầu thực hiện theo luồng tuần tự (Waterfall + Agile mofidied) để không vỡ cấu trúc cũ:

**Sprint 1 (Khung xương & Lãnh đạo):**
1. Setup JWT Middleware + API Login + Migration SQL `Users`, `BanQuanLy`.
2. Wrap [App.js](file:///d:/40.Web%20qu%E1%BA%A3n%20l%C3%BD%20d%E1%BB%AF%20li%E1%BB%87u%20%C4%91%C6%B0%E1%BB%9Dng%20b%E1%BB%99/Code/WebsiteDuongBo/src/App.js) với rounter logic phân quyền.
3. Code 4 APIs cho nhóm `Executive Dashboard`.
4. Build toàn bộ thư mục UI `src/page/Overview/` (Thẻ số, 8 Biểu đồ ChartJS, Data table).

**Sprint 2 (Luồng Cán Bộ Kiến tạo):**
1. Dựng trang List Ban QLDA & Create Form.
2. Dựng form Tạo Dự án mới + Add Multer nhận File upload.
3. UI Modal phân công hạng mục cho Nhà thầu.

**Sprint 3 (Luồng Nhà thầu & Giám sát):**
1. Migration SQL các bảng Kế hoạch & Báo cáo.
2. Dựng UI `ContractorDashboard` (Chỉ hiện việc của mình).
3. Form Nộp Kế hoạch thi công.
4. UI Màn hình Cán bộ duyệt kế hoạch.
5. Form Update tiến độ thi công (Báo cáo thực tế).

---
*(Hết tài liệu)*
Đội Dev/AI lưu ý: bám sát thiết kế DB để map fields cho chuẩn xác, tận dụng React Context/Redux nếu có để quản trị state User Role hiệu quả.
