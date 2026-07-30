import React, { useEffect, useState } from 'react';
import './DashBoard.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useProject } from '../../contexts/ProjectContext';

/* ── Mock data from dadb.sql as fallback ── */
const MOCK_PROJECTS = [
  { DuAnID: 192, TenDuAn: 'Dự án XDCT đường bộ cao tốc Bắc - Nam phía Đông giai đoạn 2021 - 2025', TinhThanh: 'Cao tốc Bắc - Nam phía Đông', TrangThai: 'Đang thi công', TongChieuDai: 721.2, NgayKhoiCong: '2021-01-01', KeHoachHoanThanh: '2025-12-31', PhanTramHoanThanh: 95.03, PhanTramChamTienDo: 4.97, PhanTramKeHoach: 100, soGoiThau: 2, GiaTriHD: '12,345.60', nhaThauChinh: 'DEOCA GROUP', nhaThauLogo: 'DEOCA' },
  { DuAnID: 194, TenDuAn: 'Dự án đường bộ cao tốc Bắc - Nam phía Đông giai đoạn 2017 - 2020', TinhThanh: 'Cao tốc Bắc - Nam phía Đông', TrangThai: 'Đang thi công', TongChieuDai: 654, NgayKhoiCong: '2017-03-15', KeHoachHoanThanh: '2020-06-30', PhanTramHoanThanh: 0, PhanTramChamTienDo: 0, PhanTramKeHoach: 100, soGoiThau: 1, GiaTriHD: '8,765.80', nhaThauChinh: 'VEC', nhaThauLogo: 'VEC' },
  { DuAnID: 195, TenDuAn: 'Dự án đường Hồ Chí Minh', TinhThanh: 'Tuyến đường Hồ Chí Minh', TrangThai: 'Đang chuẩn bị', TongChieuDai: 1234, NgayKhoiCong: '2022-01-01', KeHoachHoanThanh: '2026-12-31', PhanTramHoanThanh: 0, PhanTramChamTienDo: 0, PhanTramKeHoach: 100, soGoiThau: 0, GiaTriHD: '15,230.00', nhaThauChinh: 'PMU', nhaThauLogo: 'PMU' },
  { DuAnID: 198, TenDuAn: 'Dự án đầu tư xây dựng cầu Ninh Cường vượt sông Ninh Cơ trên quốc lộ 37B', TinhThanh: 'Nam Định', TrangThai: 'Đang chuẩn bị', TongChieuDai: 1.65, NgayKhoiCong: '2023-01-01', KeHoachHoanThanh: '2025-12-31', PhanTramHoanThanh: 0, PhanTramChamTienDo: 0, PhanTramKeHoach: 100, soGoiThau: 0, GiaTriHD: '680.00', nhaThauChinh: 'CIENCO4', nhaThauLogo: 'CIENCO4' },
  { DuAnID: 199, TenDuAn: 'Dự án tuyến tránh TP Cao Bằng, tỉnh Cao Bằng', TinhThanh: 'Cao Bằng', TrangThai: 'Hoàn thành', TongChieuDai: 126, NgayKhoiCong: '2019-06-10', KeHoachHoanThanh: '2021-12-20', PhanTramHoanThanh: 100, PhanTramChamTienDo: 0, PhanTramKeHoach: 100, soGoiThau: 0, GiaTriHD: '2,350.00', nhaThauChinh: 'TRUNGNAM GROUP', nhaThauLogo: 'TRUNGNAM' },
  { DuAnID: 200, TenDuAn: 'Dự án QL.6 tuyến tránh TP Hòa Bình, tỉnh Hòa Bình', TinhThanh: 'Hoà Bình', TrangThai: 'Hoàn thành', TongChieuDai: 172, NgayKhoiCong: '2024-01-12', KeHoachHoanThanh: '2025-06-18', PhanTramHoanThanh: 100, PhanTramChamTienDo: 0, PhanTramKeHoach: 100, soGoiThau: 0, GiaTriHD: '1,450.00', nhaThauChinh: 'TASCO', nhaThauLogo: 'TASCO' },
  { DuAnID: 201, TenDuAn: 'Dự án kết nối giao thông các tỉnh miền núi phía Bắc', TinhThanh: 'Hà Giang', TrangThai: 'Đang thi công', TongChieuDai: 162, NgayKhoiCong: '2025-01-09', KeHoachHoanThanh: '2026-06-20', PhanTramHoanThanh: 0, PhanTramChamTienDo: 0, PhanTramKeHoach: 100, soGoiThau: 1, GiaTriHD: '3,200.00', nhaThauChinh: 'CP 479', nhaThauLogo: 'CP479' },
  { DuAnID: 202, TenDuAn: 'Dự án đầu tư xây dựng cầu Phong Châu mới - Quốc lộ 32C, tỉnh Phú Thọ', TinhThanh: 'Phú Thọ', TrangThai: 'Đang thi công', TongChieuDai: 162, NgayKhoiCong: '2024-03-15', KeHoachHoanThanh: '2025-12-24', PhanTramHoanThanh: 0, PhanTramChamTienDo: 0, PhanTramKeHoach: 100, soGoiThau: 0, GiaTriHD: '2,800.00', nhaThauChinh: 'VINACONEX', nhaThauLogo: 'VNX' },
  { DuAnID: 203, TenDuAn: 'Dự án QL.4B đoạn Km18 - Km80, tỉnh Lạng Sơn', TinhThanh: 'Lạng Sơn', TrangThai: 'Hoàn thành', TongChieuDai: 127, NgayKhoiCong: '2023-01-01', KeHoachHoanThanh: '2025-06-22', PhanTramHoanThanh: 100, PhanTramChamTienDo: 0, PhanTramKeHoach: 100, soGoiThau: 0, GiaTriHD: '1,880.00', nhaThauChinh: 'CIENCO5', nhaThauLogo: 'C5' },
  { DuAnID: 205, TenDuAn: 'Dự án mở rộng đường bộ cao tốc Bắc - Nam phía Đông đoạn Cao Bồ - Mai Sơn', TinhThanh: 'Ninh Bình', TrangThai: 'Đang thi công', TongChieuDai: 142, NgayKhoiCong: '2025-06-02', KeHoachHoanThanh: '2027-11-21', PhanTramHoanThanh: 0, PhanTramChamTienDo: 0, PhanTramKeHoach: 100, soGoiThau: 0, GiaTriHD: '5,120.00', nhaThauChinh: 'SƠN HẢI', nhaThauLogo: 'SH' },
  { DuAnID: 207, TenDuAn: 'Dự án mở rộng đường bộ cao tốc Bắc - Nam phía Đông đoạn Cam Lộ - La Sơn', TinhThanh: 'Quảng Trị', TrangThai: 'Đang thi công', TongChieuDai: 252, NgayKhoiCong: '2025-03-21', KeHoachHoanThanh: '2027-11-09', PhanTramHoanThanh: 0, PhanTramChamTienDo: 0, PhanTramKeHoach: 100, soGoiThau: 0, GiaTriHD: '4,750.00', nhaThauChinh: 'TRƯỜNG SƠN', nhaThauLogo: 'TS' },
  { DuAnID: 209, TenDuAn: 'Dự án đường cao tốc đoạn Hòa Liên - Túy Loan', TinhThanh: 'Đà Nẵng', TrangThai: 'Đang thi công', TongChieuDai: 261, NgayKhoiCong: '2024-07-17', KeHoachHoanThanh: '2025-12-11', PhanTramHoanThanh: 0, PhanTramChamTienDo: 0, PhanTramKeHoach: 100, soGoiThau: 0, GiaTriHD: '3,950.00', nhaThauChinh: 'ĐÔNG DƯƠNG', nhaThauLogo: 'DD' },
  { DuAnID: 210, TenDuAn: 'Dự án QL.7 đoạn Km0-Km36, tỉnh Nghệ An', TinhThanh: 'Nghệ An', TrangThai: 'Đang thi công', TongChieuDai: 125, NgayKhoiCong: '2024-05-09', KeHoachHoanThanh: '2025-12-12', PhanTramHoanThanh: 0, PhanTramChamTienDo: 0, PhanTramKeHoach: 100, soGoiThau: 0, GiaTriHD: '1,560.00', nhaThauChinh: 'CỬU LONG', nhaThauLogo: 'CL' },
  { DuAnID: 214, TenDuAn: 'Dự án QL.14B, TP Đà Nẵng', TinhThanh: 'Đà Nẵng', TrangThai: 'Đang chuẩn bị', TongChieuDai: 162, NgayKhoiCong: '2024-05-15', KeHoachHoanThanh: '2025-06-15', PhanTramHoanThanh: 0, PhanTramChamTienDo: 0, PhanTramKeHoach: 100, soGoiThau: 0, GiaTriHD: '2,100.00', nhaThauChinh: 'VINACONEX', nhaThauLogo: 'VNX' },
  { DuAnID: 218, TenDuAn: 'Dự án tuyến tránh phía Đông TP Buôn Ma Thuột', TinhThanh: 'Đắk Lắk', TrangThai: 'Hoàn thành', TongChieuDai: 122, NgayKhoiCong: '2024-04-09', KeHoachHoanThanh: '2025-06-07', PhanTramHoanThanh: 100, PhanTramChamTienDo: 0, PhanTramKeHoach: 100, soGoiThau: 0, GiaTriHD: '1,780.00', nhaThauChinh: 'ĐẠI HUY', nhaThauLogo: 'DH' },
  { DuAnID: 221, TenDuAn: 'Dự án Tân Vạn - Nhơn Trạch giai đoạn 1', TinhThanh: 'Đồng Nai', TrangThai: 'Đang thi công', TongChieuDai: 152, NgayKhoiCong: '2023-10-06', KeHoachHoanThanh: '2025-09-19', PhanTramHoanThanh: 0, PhanTramChamTienDo: 0, PhanTramKeHoach: 100, soGoiThau: 2, GiaTriHD: '6,280.00', nhaThauChinh: 'CP 484', nhaThauLogo: '484' },
  { DuAnID: 224, TenDuAn: 'Dự án cầu Rạch Miễu 2', TinhThanh: 'Tiền Giang', TrangThai: 'Đang thi công', TongChieuDai: 152, NgayKhoiCong: '2024-02-14', KeHoachHoanThanh: '2025-12-11', PhanTramHoanThanh: 0, PhanTramChamTienDo: 0, PhanTramKeHoach: 100, soGoiThau: 0, GiaTriHD: '4,100.00', nhaThauChinh: 'CIENCO4', nhaThauLogo: 'C4' },
  { DuAnID: 227, TenDuAn: 'Dự án cao tốc Bến Lức - Long Thành', TinhThanh: 'Long An', TrangThai: 'Đang thi công', TongChieuDai: 251, NgayKhoiCong: '2024-02-16', KeHoachHoanThanh: '2025-09-05', PhanTramHoanThanh: 0, PhanTramChamTienDo: 0, PhanTramKeHoach: 100, soGoiThau: 1, GiaTriHD: '9,680.00', nhaThauChinh: 'AN NGUYÊN', nhaThauLogo: 'AN' },
  { DuAnID: 231, TenDuAn: 'Dự án cao tốc Biên Hòa - Vũng Tàu', TinhThanh: 'Bà Rịa - Vũng Tàu', TrangThai: 'Đang thi công', TongChieuDai: 155, NgayKhoiCong: '2024-03-15', KeHoachHoanThanh: '2025-12-20', PhanTramHoanThanh: 0, PhanTramChamTienDo: 0, PhanTramKeHoach: 100, soGoiThau: 1, GiaTriHD: '7,250.00', nhaThauChinh: 'ĐÔNG DƯƠNG', nhaThauLogo: 'DD' },
];

/* SVG Donut Gauge */
const Gauge = ({ val, color, size = 56 }) => {
  const r = (size - 7) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (Math.min(val, 100) / 100) * c;
  return (
    <div className="dp-gauge" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="transparent" stroke="#f1f5f9" strokeWidth="6" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="transparent" stroke={color} strokeWidth="6"
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" />
      </svg>
      <span className="dp-gauge-txt">{val.toFixed(val % 1 === 0 ? 0 : 2)}%</span>
    </div>
  );
};

const getGaugeColor = (v) => v >= 100 ? '#10b981' : v > 50 ? '#f59e0b' : v > 0 ? '#3b82f6' : '#cbd5e1';
const fmtDate = (d) => { if (!d) return ''; const dt = new Date(d); return dt.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }); };

const DashBoard = () => {
  const { setSelectedProjectId } = useProject();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tab, setTab] = useState('all');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:5000/duAnTongList');
        const data = res.data.data;
        if (data && data.length > 0) {
          setProjects(data);
          setFiltered(data);
        } else {
          setProjects(MOCK_PROJECTS);
          setFiltered(MOCK_PROJECTS);
        }
      } catch {
        // Fallback to mock data from SQL
        setProjects(MOCK_PROJECTS);
        setFiltered(MOCK_PROJECTS);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    let r = [...projects];
    if (search) { const t = search.toLowerCase(); r = r.filter(p => (p.TenDuAn || '').toLowerCase().includes(t) || String(p.DuAnID).includes(t)); }
    if (statusFilter !== 'all') r = r.filter(p => p.TrangThai === statusFilter);
    if (tab !== 'all') r = r.filter(p => p.TrangThai === tab);
    setFiltered(r);
  }, [search, statusFilter, tab, projects]);

  const goDetail = (id) => { setSelectedProjectId(id); navigate(`/side-project/${id}`); };

  const total = projects.length;
  const cnt = (s) => projects.filter(p => p.TrangThai === s).length;
  const chuanBi = cnt('Đang chuẩn bị');
  const thiCong = cnt('Đang thi công');
  const hoanThanh = cnt('Hoàn thành');
  const tamDung = cnt('Tạm dừng');
  const pct = (n) => total ? (n / total * 100).toFixed(2) : '0';

  const statusColor = (s) => s === 'Đang thi công' ? '#10b981' : s === 'Hoàn thành' ? '#f59e0b' : s === 'Đang chuẩn bị' ? '#3b82f6' : '#a855f7';

  return (
    <div className="dp">
      {/* Header */}
      <div className="dp-hd">
        <h1>Danh sách dự án đường bộ</h1>
        <div className="dp-hd-r">
          <div className="dp-bell"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg></div>
          <div className="dp-av">K</div>
        </div>
      </div>

      <div className="dp-body">
        {/* Filter Bar */}
        <div className="dp-filters">
          <div className="dp-search"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input placeholder="Tìm dự án, mã dự án..." value={search} onChange={e => setSearch(e.target.value)}/></div>
          <div className="dp-flt-box"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg><span>01/01/2020 - 31/12/2025</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg></div>
          <select className="dp-sel"><option>Tất cả tỉnh</option></select>
          <select className="dp-sel" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option value="all">Tất cả trạng thái</option><option value="Đang chuẩn bị">Đang chuẩn bị</option><option value="Đang thi công">Đang thi công</option><option value="Hoàn thành">Hoàn thành</option><option value="Tạm dừng">Tạm dừng</option></select>
          <select className="dp-sel"><option>Tất cả nhà thầu</option></select>
          <select className="dp-sel"><option>Mọi tiến độ</option></select>
          <div style={{flex:1}}></div>
          <button className="dp-btn-out"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/></svg> Bộ lọc nâng cao</button>
          <button className="dp-btn-add"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Thêm dự án</button>
        </div>

        {/* KPI */}
        <div className="dp-kpis">
          <div className="dp-kpi k-red"><div className="dp-kpi-ic" style={{background:'#fef2f2',color:'#ef4444'}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div><div><div className="dp-kpi-lb">Tổng số dự án</div><div className="dp-kpi-vl" style={{color:'#ef4444'}}>{total}</div><div className="dp-kpi-pc">100%</div></div></div>
          <div className="dp-kpi k-blue"><div className="dp-kpi-ic" style={{background:'#eff6ff',color:'#3b82f6'}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div><div><div className="dp-kpi-lb">Đang chuẩn bị</div><div className="dp-kpi-vl" style={{color:'#2563eb'}}>{chuanBi}</div><div className="dp-kpi-pc">{pct(chuanBi)}%</div></div></div>
          <div className="dp-kpi k-green"><div className="dp-kpi-ic" style={{background:'#ecfdf5',color:'#10b981'}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/></svg></div><div><div className="dp-kpi-lb">Đang thi công</div><div className="dp-kpi-vl" style={{color:'#10b981'}}>{thiCong}</div><div className="dp-kpi-pc">{pct(thiCong)}%</div></div></div>
          <div className="dp-kpi k-yellow"><div className="dp-kpi-ic" style={{background:'#fffbeb',color:'#f59e0b'}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div><div><div className="dp-kpi-lb">Hoàn thành</div><div className="dp-kpi-vl" style={{color:'#f59e0b'}}>{hoanThanh}</div><div className="dp-kpi-pc">{pct(hoanThanh)}%</div></div></div>
          <div className="dp-kpi k-purple"><div className="dp-kpi-ic" style={{background:'#faf5ff',color:'#a855f7'}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><rect x="9" y="9" width="2" height="6"/><rect x="13" y="9" width="2" height="6"/></svg></div><div><div className="dp-kpi-lb">Tạm dừng</div><div className="dp-kpi-vl" style={{color:'#a855f7'}}>{tamDung}</div><div className="dp-kpi-pc">{pct(tamDung)}%</div></div></div>
        </div>

        {/* Tabs */}
        <div className="dp-tabs">
          <div className="dp-tabs-l">
            {[['all',`Tất cả (${total})`],['Đang chuẩn bị',`Đang chuẩn bị (${chuanBi})`],['Đang thi công',`Đang thi công (${thiCong})`],['Hoàn thành',`Hoàn thành (${hoanThanh})`],['Tạm dừng',`Tạm dừng (${tamDung})`]].map(([k,v])=>(
              <div key={k} className={`dp-tab ${tab===k?'on':''}`} onClick={()=>setTab(k)}>{v}</div>
            ))}
          </div>
          <div className="dp-tabs-r">
            <button className="dp-tbtn"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> Xuất Excel</button>
            <button className="dp-tbtn"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09c0-.66-.39-1.25-1-1.51a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06c.44-.44.6-1.1.33-1.82a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09c.66 0 1.25-.39 1.51-1s.11-1.37-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06c.44.44 1.1.6 1.82.33h.08a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09c0 .66.39 1.25 1 1.51.72.3 1.37.11 1.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06c-.44.44-.6 1.1-.33 1.82v.08c.26.6.85 1 1.51 1H21a2 2 0 010 4h-.09c-.66 0-1.25.39-1.51 1z"/></svg> Cấu hình cột</button>
            <div className="dp-views"><button className="on"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg></button><button><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></button></div>
          </div>
        </div>

        {/* TABLE */}
        <div className="dp-tw">
          {loading ? <div className="dp-ld">Đang tải dữ liệu...</div> : (
          <table className="dp-tbl">
            <thead><tr>
              <th style={{width:36}}><input type="checkbox"/></th>
              <th style={{width:80}}>Mã dự án ↕</th>
              <th>Tên dự án ↕</th>
              <th className="tc" style={{width:80}}>Dài tuyến ↕</th>
              <th className="tc" style={{width:120}}>Trạng thái ↕</th>
              <th className="tc" style={{width:260}}>Tiến độ tổng thể ↕</th>
              <th className="tc" style={{width:120}}>Nhà thầu chính ↕</th>
              <th className="tc" style={{width:90}}>Giá trị HĐ<br/><span className="dp-thsub">(Tỷ đồng)</span></th>
              <th className="tc" style={{width:180}}>Thời gian<div className="dp-thsub2"><span>Khởi công</span><span>Dự kiến HT</span></div></th>
              <th className="tc" style={{width:50}}>Thao tác</th>
            </tr></thead>
            <tbody>
              {filtered.map(p => {
                const ht = parseFloat(p.PhanTramHoanThanh || p.phanTramHoanThanh || 0);
                const ctd = parseFloat(p.PhanTramChamTienDo || p.phanTramChamTienDo || 0);
                const kh = parseFloat(p.PhanTramKeHoach || p.phanTramKeHoach || 0);
                const tong = Math.min(ht + ctd, 100);
                const sc = statusColor(p.TrangThai);
                const pkgs = p.soGoiThau || 0;
                const ctr = p.nhaThauChinh || (p.danhSachNhaThau && p.danhSachNhaThau.length > 0 ? p.danhSachNhaThau[0].TenNhaThau : '');
                const logo = p.nhaThauLogo || (ctr ? ctr.substring(0, 6).toUpperCase() : '');
                const giaTriHD = p.GiaTriHD || p.giaTriHD || '—';

                const pid = p.DuAnID || p.id || p.DuAn_ID;
                return (
                <tr key={pid}>
                  <td><input type="checkbox"/></td>
                  <td className="tc">
                    <div className="dp-id">{pid}</div>
                    <div className="dp-link" onClick={()=>goDetail(pid)}>Xem chi tiết</div>
                  </td>
                  <td>
                    <div className="dp-name" onClick={()=>goDetail(pid)}>{p.TenDuAn}</div>
                    <div className="dp-loc"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg> {p.TinhThanh||'—'}</div>
                  </td>
                  <td className="tc dp-bold">{p.TongChieuDai ? `${p.TongChieuDai} km` : '—'}</td>
                  <td className="tc">
                    <div className="dp-st" style={{color:sc}}><div className="stdot" style={{background:sc}}></div> {p.TrangThai}</div>
                    <div className="dp-pkgs">{pkgs} gói thầu</div>
                  </td>
                  <td>
                    <div className="dp-prog">
                      <Gauge val={tong} color={getGaugeColor(tong)} />
                      <div className="dp-pstats">
                        <div>Đang làm: <b style={{color:'#2563eb'}}>{ht.toFixed(2)}%</b></div>
                        <div>Hoàn thành: <b style={{color:'#10b981'}}>{kh.toFixed(2)}%</b></div>
                        <div>Chậm tiến độ: <b style={{color:'#f59e0b'}}>{ctd.toFixed(2)}%</b></div>
                      </div>
                    </div>
                  </td>
                  <td className="tc">
                    <div className="dp-ctr">
                      <div className="dp-ctr-logo">{logo}</div>
                    </div>
                  </td>
                  <td className="tc dp-bold">{giaTriHD}</td>
                  <td className="tc">
                    <div className="dp-dates">
                      <span>{fmtDate(p.NgayKhoiCong)}</span>
                      <span>{fmtDate(p.KeHoachHoanThanh)}</span>
                    </div>
                  </td>
                  <td className="tc"><button className="dp-dots" onClick={()=>goDetail(pid)}>⋮</button></td>
                </tr>);
              })}
              {filtered.length === 0 && !loading && <tr><td colSpan="10" className="dp-empty">Không có dữ liệu</td></tr>}
            </tbody>
          </table>)}
        </div>

        {/* Footer */}
        <div className="dp-ft">
          <span>Hiển thị 1 - {filtered.length} trong tổng số {total} dự án</span>
          <div className="dp-pg">
            <span className="dp-pgt">Trước</span>
            {[1,2,3,4,5].map(n=><button key={n} className={`dp-pgb${n===1?' on':''}`}>{n}</button>)}
            <span className="dp-pgt">...</span>
            <button className="dp-pgb">8</button>
            <span className="dp-pgt">Sau</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashBoard;