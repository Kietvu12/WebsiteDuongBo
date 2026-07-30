import React, { useEffect, useRef, useState } from 'react';
import './WorkItem.css';
import Chart from 'chart.js/auto';

const WorkItem = () => {
    const weeklyChartRef = useRef(null);
    const chartInstance = useRef(null);

    // States for popup
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [progressVal, setProgressVal] = useState('');
    
    // Sample selected WBS node
    const [activeNode, setActiveNode] = useState({
        code: 'KH-74',
        name: 'Đắp nền đường',
        pct: '88.84',
        planned: '2,981,200',
        actual: '2,647,430',
        start: '22/02/2023',
        end: '08/12/2025',
        contractor: 'Công ty TNHH Tập đoàn Sơn Hải',
        package: 'XL01 (Km568+200 – Km686+700)'
    });

    useEffect(() => {
        if (weeklyChartRef.current) {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }

            const ctx = weeklyChartRef.current.getContext('2d');
            chartInstance.current = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
                    datasets: [
                        {
                            label: 'Kế hoạch',
                            data: [120, 150, 180, 190, 210, 250, 260],
                            backgroundColor: 'rgba(37, 99, 235, 0.2)',
                            borderRadius: 2
                        },
                        {
                            label: 'Thực tế',
                            data: [110, 145, 175, 195, 205, 240, 255],
                            backgroundColor: '#059669',
                            borderRadius: 2
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        x: { display: true, grid: { display: false }, ticks: { font: { size: 9 } } },
                        y: { display: true, ticks: { font: { size: 9 } } }
                    }
                }
            });
        }

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, []);

    const openPopup = () => {
        setProgressVal('');
        setIsPopupOpen(true);
    };

    return (
        <div className="wi-wrapper">
            <div className="mn-wi">
                {/* TOPBAR */}
                <div className="topbar">
                    <div className="topbar-left">
                        <div className="back">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="15 18 9 12 15 6"/>
                            </svg>
                        </div>
                        <div className="title">Kế hoạch các hạng mục – Dự án XDCT đường bộ cao tốc Bắc - Nam phía Đông</div>
                    </div>
                    <div className="topbar-right">
                        <input className="search-box" placeholder="Tìm kiếm..." type="text" />
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
                            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                        </svg>
                        <div className="hd-av">NV</div>
                    </div>
                </div>

                {/* FILTER ROW */}
                <div className="filter-row">
                    <select className="proj-select">
                        <option>Dự án XDCT đường bộ cao tốc Bắc - Nam phía Đông giai đoạn 2021 - 2025</option>
                    </select>
                    <span style={{fontSize: 11, color: 'var(--text-muted)'}}>Từ ngày</span>
                    <input className="date-input" type="date" defaultValue="2023-02-22" />
                    <span style={{fontSize: 11, color: 'var(--text-muted)'}}>Đến ngày</span>
                    <input className="date-input" type="date" defaultValue="2025-09-26" />
                    <button className="btn btn-primary">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                        </svg>Lọc
                    </button>
                    <button className="btn btn-outline">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>Xuất báo cáo
                    </button>
                </div>

                {/* 3-COL WORKSPACE */}
                <div className="workspace">
                    
                    {/* LEFT: WBS TREE */}
                    <div className="wbs-panel">
                        <div className="wbs-search">
                            <input type="text" placeholder="Tìm kiếm hạng mục, công việc..." />
                        </div>
                        <div className="wbs-tabs">
                            <div className="wbs-tab act">WBS</div>
                            <div className="wbs-tab">Nhà thầu</div>
                        </div>
                        <div className="wbs-tree">
                            <div className="tree-goi">
                                <div className="tree-goi-head">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="1"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
                                    Gói thầu XL01<span className="sub">(Km568+200 - Km686+700)</span>
                                </div>
                                <div className="tree-hm">
                                    <div className="tree-hm-item"><span style={{cursor:'pointer',color:'var(--text-muted)'}}>▾</span><span className="name">Phần đường</span><span className="pct" style={{color:'var(--success)'}}>98.55%</span></div>
                                    <div className="tree-hm-item" style={{paddingLeft:24}}><span className="code">KH-71</span><span className="name">Đào nền đường</span><span className="pct" style={{color:'var(--success)'}}>98.50%</span><span className="dot" style={{background:'var(--success)'}}></span></div>
                                    <div className="tree-hm-item" style={{paddingLeft:24}}><span className="code">KH-72</span><span className="name">Đào vận chuyển bãi thải</span><span className="pct" style={{color:'var(--warning)'}}>93.89%</span><span className="dot" style={{background:'var(--warning)'}}></span></div>
                                    <div className="tree-hm-item act" style={{paddingLeft:24}}><span className="code">KH-74</span><span className="name">Đắp nền đường</span><span className="pct" style={{color:'var(--success)'}}>88.84%</span><span className="dot" style={{background:'var(--success)'}}></span></div>
                                    <div className="tree-hm-item" style={{paddingLeft:24}}><span className="code">KH-75</span><span className="name">Nền đường K90</span><span className="pct" style={{color:'var(--warning)'}}>93.44%</span><span className="dot" style={{background:'var(--warning)'}}></span></div>
                                    <div className="tree-hm-item"><span style={{cursor:'pointer',color:'var(--text-muted)'}}>▸</span><span className="name">Cấp phối đá dăm</span><span className="pct" style={{color:'var(--warning)'}}>84.81%</span></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CENTER: DETAIL */}
                    <div className="detail-panel">
                        <div className="detail-header">
                            <div className="dh-top">
                                <div className="dh-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                </div>
                                <div className="dh-info">
                                    <div className="dh-title">
                                        {activeNode.name} <span className="tag">{activeNode.code}</span>
                                        <button onClick={openPopup} className="btn btn-primary" style={{height: 24, fontSize: 11, padding: '0 8px', marginLeft: 'auto'}}>
                                            + Cập nhật tiến độ
                                        </button>
                                    </div>
                                    <div className="dh-meta">
                                        Hạng mục: PHẦN ĐƯỜNG<br/>Gói thầu: {activeNode.package}<br/>Nhà thầu: {activeNode.contractor}
                                    </div>
                                </div>
                                <div className="dh-pct">
                                    <div className="badge-s">◉ Đúng tiến độ</div>
                                    <div className="val">{activeNode.pct}%</div>
                                    <div className="lbl">Tiến độ hoàn thành</div>
                                </div>
                            </div>
                            <div className="info-row">
                                <div className="info-card"><div className="val">{activeNode.start}</div><div className="lbl">Ngày bắt đầu</div></div>
                                <div className="info-card"><div className="val">{activeNode.end}</div><div className="lbl">Ngày kết thúc</div></div>
                                <div className="info-card"><div className="val">654</div><div className="lbl">Ngày còn lại</div></div>
                                <div className="info-card"><div className="val">{activeNode.actual} m³</div><div className="lbl">Khối lượng thực hiện</div></div>
                                <div className="info-card"><div className="val">{activeNode.planned} m³</div><div className="lbl">Khối lượng kế hoạch</div></div>
                            </div>
                        </div>

                        {/* KPI STRIP */}
                        <div className="kpi-strip">
                            <div className="kpi-item"><div className="val" style={{color:'var(--primary)'}}>96.40%</div><div className="bar"><div className="bar-fill" style={{width: '96.4%', background:'var(--primary)'}}></div></div><div className="lbl">Tiến độ kế hoạch</div></div>
                            <div className="kpi-item"><div className="val" style={{color:'var(--success)'}}>{activeNode.pct}%</div><div className="bar"><div className="bar-fill" style={{width: activeNode.pct + '%', background:'var(--success)'}}></div></div><div className="lbl">Tiến độ thực tế</div></div>
                            <div className="kpi-item"><div className="val" style={{color:'var(--danger)'}}>-7.56%</div><div className="bar"><div className="bar-fill" style={{width: '7.56%', background:'var(--danger)'}}></div></div><div className="lbl">Chênh lệch</div></div>
                            <div className="kpi-item"><div className="val">{activeNode.actual} m³</div><div className="sub">/ {activeNode.planned} m³</div><div className="lbl">Khối lượng thực hiện</div></div>
                            <div className="kpi-item"><div className="val">0</div><div className="lbl">Vướng mắc</div></div>
                        </div>

                        {/* TABS */}
                        <div className="tabs-bar">
                            <div className="tab act">Tiến độ</div>
                            <div className="tab">Khối lượng</div>
                            <div className="tab">Nhật ký thi công</div>
                            <div className="tab">Ảnh hiện trường</div>
                            <div className="tab">Tài liệu</div>
                        </div>

                        <div className="sub-tabs">
                            <div className="stab act">Gantt chart</div>
                            <div className="stab">Danh sách</div>
                            <div style={{flex: 1}}></div>
                            <div className="stab">Tháng</div>
                            <div className="stab" style={{background:'var(--primary)', color:'#fff', borderColor:'var(--primary)'}}>Tuần</div>
                            <div className="stab">Ngày</div>
                        </div>

                        {/* GANTT CHART */}
                        <div className="gantt-area">
                            <div className="gantt-header">
                                <div className="gantt-label-col">Công việc</div>
                                <div className="gantt-pct-col">Tiến độ</div>
                                <div className="gantt-timeline">
                                    <div className="gantt-months">
                                        <div className="gantt-month" style={{width:'25%'}}>Tháng 6, 2025</div>
                                        <div className="gantt-month" style={{width:'25%'}}>Tháng 7, 2025</div>
                                        <div className="gantt-month" style={{width:'25%'}}>Tháng 8, 2025</div>
                                        <div className="gantt-month" style={{width:'25%'}}>Tháng 9, 2025</div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Gantt Rows mockup */}
                            <div className="gantt-row">
                                <div className="gantt-row-label">Đắp nền đường</div>
                                <div className="gantt-row-pct" style={{color: 'var(--success)'}}>88.8%</div>
                                <div className="gantt-row-bars">
                                    <div className="gantt-bar plan" style={{left: '5%', width: '60%'}}></div>
                                    <div className="gantt-bar actual" style={{left: '5%', width: '50%'}}></div>
                                </div>
                            </div>
                            <div className="gantt-row">
                                <div className="gantt-row-label">Nền đường K90</div>
                                <div className="gantt-row-pct" style={{color: 'var(--warning)'}}>93.4%</div>
                                <div className="gantt-row-bars">
                                    <div className="gantt-bar plan" style={{left: '10%', width: '70%'}}></div>
                                    <div className="gantt-bar actual" style={{left: '10%', width: '68%'}}></div>
                                    <div className="gantt-today" style={{left: '40%'}}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT PANEL */}
                    <div className="right-panel">
                        <div className="rp-section">
                            <div className="rp-title">Nhà thầu chính</div>
                            <div className="nt-card">
                                <div className="nt-logo">SƠN<br/>HẢI</div>
                                <div className="nt-info">
                                    <div className="company">CÔNG TY TNHH TẬP ĐOÀN</div>
                                    <div className="name">SƠN HẢI</div>
                                    <div className="nt-stars">★★★★★</div>
                                </div>
                            </div>
                            <div className="nt-kpis">
                                <div className="nt-kpi green"><div className="v">92.1%</div><div className="l">Tiến độ TB</div></div>
                                <div className="nt-kpi blue"><div className="v">A</div><div className="l">Chất lượng</div></div>
                                <div className="nt-kpi"><div className="v">Tốt</div><div className="l">ATLĐ</div></div>
                                <div className="nt-kpi red"><div className="v">0</div><div className="l">Vi phạm</div></div>
                            </div>
                        </div>

                        <div className="rp-section">
                            <div className="rp-title">Tiến độ theo tuần</div>
                            <div className="rp-chart"><canvas ref={weeklyChartRef}></canvas></div>
                        </div>

                        <div className="rp-section" style={{flex: 1, overflowY: 'auto'}}>
                            <div className="rp-title">Nhật ký thi công</div>
                            <div className="log-item">
                                <div className="log-thumb">📷</div>
                                <div className="log-content">
                                    <div className="log-date">08/07/2025 <span className="tag">Thi công</span></div>
                                    <div className="log-desc">Đắp lớp 3 từ K58+400</div>
                                    <div className="log-vol">+12,430 m³</div>
                                </div>
                            </div>
                            <div className="log-item">
                                <div className="log-thumb">📷</div>
                                <div className="log-content">
                                    <div className="log-date">08/07/2025 <span className="tag" style={{background:'var(--success-bg)', color:'var(--success)'}}>Nghiệm thu</span></div>
                                    <div className="log-desc">Nghiệm thu lớp K95</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* POPUP MODAL Cập nhật tiến độ */}
                {isPopupOpen && (
                    <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(15,23,42,0.6)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center'}}>
                        <div style={{background:'#fff', width:480, borderRadius:8, overflow:'hidden', boxShadow:'0 10px 25px rgba(0,0,0,0.1)'}}>
                            <div style={{padding:'16px 20px', borderBottom:'1px solid #e2e8f0', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                <div style={{fontWeight:700, fontSize:15}}>Báo cáo cập nhật tiến độ</div>
                                <button onClick={()=>setIsPopupOpen(false)} style={{background:'none',border:'none',cursor:'pointer',fontSize:18,color:'#64748b'}}>×</button>
                            </div>
                            <div style={{padding:20}}>
                                <div style={{marginBottom:16, background:'#f8fafc', padding:12, borderRadius:6}}>
                                    <div><b style={{color:'#1e293b'}}>Hạng mục:</b> {activeNode.name}</div>
                                    <div style={{marginTop:4}}><b style={{color:'#1e293b'}}>Mã:</b> {activeNode.code} &nbsp;|&nbsp; <b>Gói thầu:</b> {activeNode.package}</div>
                                    <div style={{marginTop:4}}><b style={{color:'#1e293b'}}>Tiến độ hiện tại:</b> {activeNode.pct}%</div>
                                </div>
                                
                                <div style={{marginBottom:16}}>
                                    <label style={{display:'block', fontSize:12, fontWeight:600, marginBottom:6}}>Phần trăm (%) hoặc Khối lượng thực hiện mới:</label>
                                    <div style={{display:'flex', gap:8, alignItems:'center'}}>
                                        <input type="number" placeholder="VD: 5" value={progressVal} onChange={e=>setProgressVal(e.target.value)} style={{flex:1, height:36, padding:'0 12px', border:'1px solid #cbd5e1', borderRadius:4}} />
                                        <span style={{fontWeight:600, color:'#64748b'}}>%</span>
                                    </div>
                                </div>

                                <div style={{marginBottom:16}}>
                                    <label style={{display:'block', fontSize:12, fontWeight:600, marginBottom:6}}>Đính kèm tài liệu, biên bản hiện trường:</label>
                                    <div style={{border:'2px dashed #cbd5e1', borderRadius:6, padding:20, textAlign:'center', background:'#f8fafc', cursor:'pointer'}}>
                                        <div style={{color:'#2563eb', fontWeight:600, fontSize:13}}>+ Chọn file tải lên</div>
                                        <div style={{fontSize:11, color:'#94a3b8', marginTop:4}}>(Hỗ trợ PDF, DOCX, JPG)</div>
                                    </div>
                                </div>
                            </div>
                            <div style={{padding:'16px 20px', borderTop:'1px solid #e2e8f0', background:'#f8fafc', display:'flex', justifyContent:'flex-end', gap:10}}>
                                <button onClick={()=>setIsPopupOpen(false)} style={{background:'#fff',border:'1px solid #cbd5e1',padding:'6px 16px',borderRadius:4,fontWeight:600,cursor:'pointer'}}>Hủy</button>
                                <button onClick={()=>setIsPopupOpen(false)} style={{background:'#2563eb',border:'none',color:'#fff',padding:'6px 16px',borderRadius:4,fontWeight:600,cursor:'pointer'}}>Xác nhận Lưu</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkItem;
