import React, { useEffect, useState } from 'react';
import './Detail.css';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

/* ─── MẪU DỮ LIỆU ĐỀ PHÒNG ─── */
const FALLBACK = {
  length: '--', value: 'Chưa cập nhật',
  info: { duAn: '--', thanhPhan: '--', goiThau: '--', chieuDai: '--', tongMuc: '--', chuDauTu: '--' },
  progress: { keHoach: 0, dangLam: 0, chamTienDo: 0, hoanThanh: 0, tongTienDo: 0 },
  contractors: { tenCongTy: 'Chưa cập nhật', danhSach: [], diaChi: '--', maSoThue: '--' },
  tasks: [],
  volumes: [],
  startDate: '--', endDate: '--'
};

const MOCK_PACKAGES = [
  { ...FALLBACK, code: 'GT-1', name: 'Gói thầu XL01', status: 'Đang thi công', statusCol: '#10b981' },
  { ...FALLBACK, code: 'GT-2', name: 'Gói thầu XL02', status: 'Đang chuẩn bị', statusCol: '#3b82f6' },
  { ...FALLBACK, code: 'GT-3', name: 'Gói thầu XL03', status: 'Hoàn thành', statusCol: '#f59e0b' },
  { ...FALLBACK, code: 'GT-4', name: 'Gói thầu XL04', status: 'Tạm dừng', statusCol: '#64748b' }
];

/* ─── PROGRESS GAUGE (Biểu đồ tròn) ─── */
const ProgressGauge = ({ val = 0, color = '#10b981', size = 120, stroke = 8 }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (Math.min(val, 100) / 100) * c;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="transparent" stroke="#f1f5f9" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="transparent" stroke={color} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" />
      </svg>
      <div className="dt-gauge-center">
        <div className="dt-gauge-label">Tổng tiến độ</div>
        <div className="dt-gauge-val" style={{ color }}>{val.toFixed(2)}%</div>
      </div>
    </div>
  );
};

/* ─── MAIN COMPONENT ─── */
const Detail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location || {};

  const [packageList, setPackageList] = useState([]);
  const [selIdx, setSelIdx] = useState(0);
  const [search, setSearch] = useState('');
  const [loadingList, setLoadingList] = useState(true);
  
  const [pkgData, setPkgData] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const projectName = state?.projectName || 'Đang cập nhật...';
  const subProjectName = state?.subProjectName || 'Danh mục con';
  const subProjectId = state?.subProjectId;

  // 1. TẢI DANH SÁCH GÓI THẦU CỦA DỰ ÁN THÀNH PHẦN
  useEffect(() => {
    let unmounted = false;
    const fetchList = async () => {
      if (!subProjectId) {
        if (!unmounted) { setPackageList(MOCK_PACKAGES); setLoadingList(false); }
        return;
      }
      try {
        setLoadingList(true);
        const res = await axios.get(`http://localhost:5000/duAn/goiThau/${subProjectId}`);
        if (unmounted) return;
        if (res.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          const pkgs = res.data.data.map((item, idx) => ({
            _originalId: item.GoiThau_ID,
            code: item.MaGoiThau || `GT-${idx + 1}`,
            name: item.TenGoiThau,
            status: 'Đang triển khai', // API danh sách gói không có trạng thái cụ thể
            statusCol: '#3b82f6'
          }));
          setPackageList(pkgs);
        } else {
          setPackageList(MOCK_PACKAGES);
        }
      } catch (e) {
        console.error('Lỗi khi lấy ds gói thầu:', e);
        if (!unmounted) setPackageList(MOCK_PACKAGES);
      } finally {
        if (!unmounted) setLoadingList(false);
      }
    };
    fetchList();
    return () => { unmounted = true };
  }, [subProjectId]);

  // 2. TẢI CHI TIẾT GÓI THẦU KHI CHỌN VÀO PACKAGE Ở SIDEBAR
  useEffect(() => {
    let unmounted = false;
    const fetchDetail = async () => {
      const selectedPkg = packageList[selIdx];
      if (!selectedPkg) {
        if (!unmounted) setPkgData(null);
        return;
      }

      const pkgId = selectedPkg._originalId;
      if (!pkgId) {
        // Fallback for mocked packages
        if (!unmounted) setPkgData(selectedPkg); 
        return;
      }

      try {
        setLoadingDetail(true);
        const res = await axios.get(`http://localhost:5000/goiThau/chiTiet/${pkgId}`);
        if (unmounted) return;
        
        const apiData = res.data?.data || {};
        
        // Map thông tin
        const tc = apiData.thongTinChung || {};
        const pr = apiData.tienDo?.phanTram || {};
        
        let stCol = '#10b981';
        if (tc.trangThai === 'Rủi ro cao') stCol = '#ef4444';
        else if (tc.trangThai === 'Đang chuẩn bị') stCol = '#3b82f6';
        else if (tc.trangThai === 'Hoàn thành') stCol = '#f59e0b';
        else if (tc.trangThai === 'Tạm dừng' || tc.trangThai === 'Chậm tiến độ') stCol = '#64748b';

        // Xử lý Nhà Thầu từ dữ liệu trả về khác nhau
        let rawNhaThau = tc.danhSachNhaThau || [];
        let mappedDanhSach = [];
        if (Array.isArray(rawNhaThau)) {
           mappedDanhSach = rawNhaThau.map(n => typeof n === 'object' ? (n.TenNhaThau || '') : n);
        }
        
        // Khối lượng thi công (Volumes)
        let volumes = [];
        if (tc.khoiLuongThiCong) {
           volumes.push({ iconType: 'road', label: 'Khối lượng thi công', val: tc.khoiLuongThiCong, unit: 'đv', pct: 0 });
        }

        const mappedPkg = {
          code: selectedPkg.code,
          name: tc.goiThau || selectedPkg.name || 'Gói thầu',
          status: tc.trangThai || 'Đang triển khai',
          statusCol: stCol,
          length: tc.tongChieuDaiTuyen ? `${tc.tongChieuDaiTuyen} km` : 'Chưa cập nhật',
          value: tc.tongMucDauTu || 'Chưa cập nhật',
          info: { 
            duAn: tc.duAn || projectName, 
            thanhPhan: tc.duAnThanhPhan || subProjectName, 
            goiThau: tc.goiThau || selectedPkg.name, 
            chieuDai: tc.tongChieuDaiTuyen ? `${tc.tongChieuDaiTuyen} km` : 'Chưa cập nhật', 
            tongMuc: tc.tongMucDauTu || 'Chưa cập nhật', 
            chuDauTu: tc.chuDauTu || 'Đang chờ' 
          },
          progress: { 
            keHoach: pr.keHoach || 0, 
            dangLam: pr.dangLam || 0, 
            chamTienDo: pr.chamTienDo || 0, 
            hoanThanh: pr.hoanThanh || 0, 
            tongTienDo: pr.tongTienDo || 0 
          },
          contractors: { 
            tenCongTy: tc.tenCongTy || 'Chưa cập nhật', 
            danhSach: mappedDanhSach.filter(Boolean), 
            diaChi: tc.diaChi || 'Chưa cập nhật', 
            maSoThue: tc.maSoThue || '' 
          },
          tasks: Array.isArray(apiData.tienDo?.chiTiet) 
             ? apiData.tienDo.chiTiet.map(t => ({
                 name: t.tenHangMuc || t.TenHangMuc || 'Hạng mục',
                 deadline: t.thoiGianBatDau ? new Date(t.thoiGianBatDau).toLocaleDateString('vi-VN') : '--',
                 pct: parseFloat(t.khoiLuongHT) || 0,
                 late: t.trangThai === 'Chậm tiến độ' || (t.tienDoCham && parseFloat(t.tienDoCham) > 0),
                 done: t.trangThai === 'Hoàn thành' || parseFloat(t.khoiLuongHT) >= 100
               })) 
             : [],
          volumes: volumes,
          startDate: tc.thoiGianThucHien ? tc.thoiGianThucHien.split(' - ')[0] : 'N/A', 
          endDate: tc.thoiGianThucHien && tc.thoiGianThucHien.includes('-') ? tc.thoiGianThucHien.split(' - ')[1] : 'N/A',
        };

        if (!unmounted) setPkgData(mappedPkg);
      } catch (e) {
        console.error('Lỗi khi lấy chi tiết gói thầu:', e);
        // THUỘC TÍNH BẢO VỆ: Nếu API lỗi, lấy mẫu rỗng để không sập trang
        if (!unmounted) setPkgData({ ...FALLBACK, code: selectedPkg.code, name: selectedPkg.name });
      } finally {
        if (!unmounted) setLoadingDetail(false);
      }
    };
    fetchDetail();
    return () => { unmounted = true; };
  }, [selIdx, packageList, projectName, subProjectName]);

  const filtered = packageList.filter(p =>
    (p.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (p.code || '').toLowerCase().includes(search.toLowerCase())
  );

  const pkg = pkgData; // Gói thầu đang kích hoạt

  return (
    <div className="dt-container">
      {/* ── Header ── */}
      <div className="dt-topbar">
        <div className="dt-topbar-left">
          <button className="dt-back" onClick={() => navigate(-1)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <h1 className="dt-main-title">{projectName}</h1>
            <div className="dt-breadcrumb">{subProjectName} &gt; Danh sách gói thầu</div>
          </div>
        </div>
        <div className="dt-topbar-right">
          <button className="dt-btn-primary"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg> Tạo gói thầu mới</button>
          <div className="dt-noti"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg><span className="dt-noti-dot"></span></div>
        </div>
      </div>

      <div className="dt-body">
        {/* ── LEFT SIDEBAR ── */}
        <div className="dt-sidebar">
          <div className="dt-sidebar-head">
            <span>DANH SÁCH GÓI THẦU</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
          </div>
          <div className="dt-sidebar-search">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input type="text" placeholder="Tìm kiếm gói thầu..." value={search} onChange={e => setSearch(e.target.value)} />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
          </div>
          
          <div className="dt-sidebar-list">
            {loadingList && <div style={{padding: 20, textAlign: 'center', color: '#94a3b8'}}>Đang tải...</div>}
            
            {!loadingList && filtered.length > 0 && filtered.map((p, i) => {
              const realIdx = packageList.indexOf(p);
              const isActive = realIdx === selIdx;
              return (
                <div key={i} className={`dt-pkg-card ${isActive ? 'active' : ''}`} onClick={() => setSelIdx(realIdx)}>
                  <div className="dt-pkg-head">
                    <span className="dt-pkg-code"># {p.code}</span>
                    {p.status && <span className="dt-pkg-status" style={{ color: p.statusCol, borderColor: p.statusCol }}>{p.status}</span>}
                    <span className="dt-pkg-dots">⋮</span>
                  </div>
                  <div className="dt-pkg-name">{p.name || '--'}</div>
                  <div className="dt-pkg-meta">{p.length ? p.length + ' · ' : ''} {p.value ? `Giá trị: ${p.value}` : ''}</div>
                </div>
              );
            })}
            {!loadingList && filtered.length === 0 && (
              <div style={{padding: 20, textAlign: 'center', color: '#94a3b8', fontSize: '13px'}}>Không có gói thầu nào</div>
            )}
          </div>
          
          <div className="dt-sidebar-footer">Hiển thị {filtered.length > 0 ? 1 : 0} - {filtered.length} trong tổng số {packageList.length} gói thầu</div>
        </div>

        {/* ── RIGHT CONTENT (CHI TIẾT) ── */}
        <div className="dt-main">
          {!pkg ? (
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0'}}>
              {loadingDetail ? 'Đang tải dữ liệu chi tiết...' : 'Chọn một gói thầu ở danh sách bên trái để xem chi tiết.'}
            </div>
          ) : (
            <div style={{opacity: loadingDetail ? 0.6 : 1, pointerEvents: loadingDetail ? 'none' : 'auto', transition: '0.2s'}}>
              {/* Top Banner */}
              <div className="dt-banner">
                <div className="dt-banner-left">
                  <div className="dt-banner-code"># {pkg.code || 'GT'}</div>
                  <span className="dt-banner-status" style={{ background: pkg.statusCol || '#10b981' }}>{pkg.status || 'Đang triển khai'}</span>
                  <div className="dt-banner-name">{pkg.name || 'Gói thầu...'}</div>
                </div>
                <div className="dt-banner-stats">
                  <div className="dt-bstat">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5"><path d="M5 18H3a2 2 0 01-2-2V8a2 2 0 012-2h3.19M15 6h2a2 2 0 012 2v8a2 2 0 01-2 2h-2" /><polyline points="15 6 12 3 9 6" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                    <div><div className="dt-bstat-label">Tổng chiều dài</div><div className="dt-bstat-val">{pkg.length || '--'}</div></div>
                  </div>
                  <div className="dt-bstat">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                    <div><div className="dt-bstat-label">Tổng mức đầu tư</div><div className="dt-bstat-val">{pkg.value || '--'}</div></div>
                  </div>
                  <div className="dt-bstat">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="1.5"><path d="M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    <div><div className="dt-bstat-label">Chủ đầu tư</div><div className="dt-bstat-val">{pkg.info?.chuDauTu || '--'}</div></div>
                  </div>
                </div>
              </div>

              {/* Main Grid */}
              <div className="dt-grid">
                {/* Row 1 */}
                <div className="dt-card dt-info-card">
                  <div className="dt-card-title">
                    <span className="dt-card-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                    </span> THÔNG TIN CHUNG
                  </div>
                  <table className="dt-info-table">
                    <tbody>
                      <tr><td className="dt-info-k">Dự án</td><td className="dt-info-v">{pkg.info?.duAn || '--'}</td></tr>
                      <tr><td className="dt-info-k">Dự án thành phần</td><td className="dt-info-v">{pkg.info?.thanhPhan || '--'}</td></tr>
                      <tr><td className="dt-info-k">Gói thầu</td><td className="dt-info-v">{pkg.info?.goiThau || '--'}</td></tr>
                      <tr><td className="dt-info-k">Tổng chiều dài tuyến</td><td className="dt-info-v">{pkg.info?.chieuDai || '--'}</td></tr>
                      <tr><td className="dt-info-k">Tổng mức đầu tư</td><td className="dt-info-v">{pkg.info?.tongMuc || '--'}</td></tr>
                      <tr><td className="dt-info-k">Chủ đầu tư</td><td className="dt-info-v">{pkg.info?.chuDauTu || '--'}</td></tr>
                    </tbody>
                  </table>
                </div>

                <div className="dt-card dt-progress-card">
                  <div className="dt-card-title">
                    <span className="dt-card-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                    </span> TIẾN ĐỘ CÁC HẠNG MỤC
                  </div>
                  <div className="dt-progress-body">
                    <ProgressGauge val={pkg.progress?.tongTienDo || 0} color={(pkg.progress?.tongTienDo || 0) >= 90 ? '#10b981' : ((pkg.progress?.tongTienDo || 0) > 0 ? '#f59e0b' : '#3b82f6')} />
                    <div className="dt-progress-legend">
                      <div className="dt-leg-item"><span className="dt-leg-dot" style={{ background: '#3b82f6' }}></span> Kế hoạch: <b>{pkg.progress?.keHoach || 0}%</b></div>
                      <div className="dt-leg-item"><span className="dt-leg-dot" style={{ background: '#f59e0b' }}></span> Đang làm: <b>{pkg.progress?.dangLam || 0}%</b></div>
                      <div className="dt-leg-item"><span className="dt-leg-dot" style={{ background: '#ef4444' }}></span> Chậm tiến độ: <b>{pkg.progress?.chamTienDo || 0}%</b></div>
                      <div className="dt-leg-item"><span className="dt-leg-dot" style={{ background: '#10b981' }}></span> Hoàn thành: <b>{pkg.progress?.hoanThanh || 0}%</b></div>
                    </div>
                  </div>
                  <div className="dt-kh-bar">
                    <span>Tiến độ theo kế hoạch</span>
                    <div className="dt-kh-track"><div className="dt-kh-fill" style={{ width: `${pkg.progress?.tongTienDo || 0}%` }}></div></div>
                    <b>{pkg.progress?.tongTienDo || 0}%</b>
                  </div>
                </div>

                <div className="dt-card dt-contractor-card">
                  <div className="dt-card-title">
                    <span className="dt-card-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    </span> NHÀ THẦU CHÍNH
                  </div>
                  <div className="dt-ctr-body">
                    <div className="dt-ctr-row"><span className="dt-ctr-k">Tên công ty</span><span className="dt-ctr-v" style={{fontWeight: 700, color: '#334155'}}>{pkg.contractors?.tenCongTy || '--'}</span></div>
                    {pkg.contractors?.danhSach && pkg.contractors.danhSach.length > 0 && (
                      <div className="dt-ctr-row"><span className="dt-ctr-k"></span><span className="dt-ctr-v dt-ctr-list">{pkg.contractors.danhSach.map((n, i) => <span key={i}>- {n}</span>)}</span></div>
                    )}
                    <div className="dt-ctr-row"><span className="dt-ctr-k">Địa chỉ</span><span className="dt-ctr-v">{pkg.contractors?.diaChi || '--'}</span></div>
                    {pkg.contractors?.maSoThue && <div className="dt-ctr-row"><span className="dt-ctr-k">Mã số thuế</span><span className="dt-ctr-v">{pkg.contractors.maSoThue}</span></div>}
                  </div>
                  <div className="dt-ctr-dates">
                    <div className="dt-ctr-date"><div className="dt-ctr-date-label">Ngày bắt đầu</div><div className="dt-ctr-date-val">{pkg.startDate || '--'}</div></div>
                    <div className="dt-ctr-date"><div className="dt-ctr-date-label">Ngày kết thúc</div><div className="dt-ctr-date-val">{pkg.endDate || '--'}</div></div>
                  </div>
                </div>

                {/* Row 2 */}
                <div className="dt-card dt-tasks-card">
                  <div className="dt-card-title-row">
                    <span>
                      <span className="dt-card-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                      </span> TIẾN ĐỘ THI CÔNG HẠNG MỤC
                    </span>
                    <button className="dt-btn-sm">+ Thêm HM</button>
                  </div>
                  <div className="dt-tasks-list">
                    {pkg.tasks && pkg.tasks.length > 0 ? pkg.tasks.map((t, i) => (
                      <div key={i} className="dt-task-row">
                        <div className="dt-task-icon" style={{background: t.done ? '#dcfce7' : t.late ? '#fee2e2' : '#e0e7ff'}}>
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={t.done ? "#10b981" : t.late ? "#ef4444" : "#3b82f6"} strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        </div>
                        <div className="dt-task-info">
                          <div className={`dt-task-name ${t.late ? 'dt-late' : ''}`}>{t.name}</div>
                          <div className="dt-task-meta">Hạn: {t.deadline} {t.late ? '(Quá hạn)' : ''}</div>
                        </div>
                        <div className="dt-task-right">
                          {t.late && <span className="dt-late-badge">Cảnh báo chậm</span>}
                          {t.done && <span className="dt-done-badge">Hoàn thành</span>}
                          {!t.late && !t.done && <span className="dt-progress-badge">Đang thi công</span>}
                          <div className="dt-task-bar-wrap">
                            <div className="dt-task-bar"><div className="dt-task-fill" style={{ width: `${t.pct}%`, background: t.done ? '#10b981' : t.late ? '#ef4444' : '#3b82f6' }}></div></div>
                            <span className="dt-task-pct">{t.pct.toFixed(0)}%</span>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="dt-empty">Không có hạng mục chi tiết nào</div>
                    )}
                  </div>
                </div>

                <div className="dt-right-col">
                  <div className="dt-card dt-vol-card">
                    <div className="dt-card-title">
                      <span className="dt-card-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                      </span> KHỐI LƯỢNG THI CÔNG YÊU CẦU
                    </div>
                    <div className="dt-vol-grid">
                      {pkg.volumes && pkg.volumes.length > 0 ? pkg.volumes.map((v, i) => (
                        <div key={i} className="dt-vol-item">
                          <div className="dt-vol-icon" style={{color: '#64748b', display: 'flex', alignItems: 'center'}}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                          </div>
                          <div className="dt-vol-info">
                            <div className="dt-vol-label">{v.label}</div>
                            <div className="dt-vol-val">{v.val} <span className="dt-vol-unit">{v.unit}</span></div>
                            {v.pct > 0 && <div className="dt-vol-pct">↑ {v.pct}% so với KH</div>}
                          </div>
                        </div>
                      )) : (
                        <div className="dt-empty" style={{gridColumn: '1 / -1'}}>Đang cập nhật khối lượng...</div>
                      )}
                    </div>
                  </div>
                  <div className="dt-card dt-map-card" style={{padding: 0}}>
                    <div className="dt-card-title" style={{padding: '16px 16px 0 16px', borderBottom: 'none'}}>
                      <span className="dt-card-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      </span> BẢN ĐỒ VỊ TRÍ GÓI THẦU
                    </div>
                    <div className="dt-map-placeholder" style={{borderRadius: '0 0 8px 8px', overflow: 'hidden'}}>
                      <iframe src="https://www.openstreetmap.org/export/embed.html?bbox=105.80718994140626%2C20.985923835478%2C105.85697174072267%2C21.034720935532585&amp;layer=mapnik" width="100%" height="240" style={{ border: 0 }} title="Map" loading="lazy"></iframe>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Detail;
