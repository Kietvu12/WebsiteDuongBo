import React, { useEffect, useRef } from 'react';
import './Overview.css';
import Chart from 'chart.js/auto';

const Overview = () => {
    const containerRef = useRef(null);
    const c1Ref = useRef(null);
    const c2Ref = useRef(null);
    const c4Ref = useRef(null);
    const c5Ref = useRef(null);
    const c6Ref = useRef(null);
    const chartInstances = useRef({});

    useEffect(() => {
        const getChartSizes = () => {
            const w = containerRef.current?.clientWidth || window.innerWidth;
            if (w < 480) return { chart: 7, tick: 7, sm: 7, md: 8, lg: 9, tiny: 7 };
            if (w < 700) return { chart: 7, tick: 7, sm: 7, md: 8, lg: 9, tiny: 7 };
            if (w < 900) return { chart: 8, tick: 8, sm: 8, md: 9, lg: 10, tiny: 7 };
            if (w < 1100) return { chart: 9, tick: 8, sm: 8, md: 9, lg: 10, tiny: 8 };
            if (w < 1300) return { chart: 9, tick: 9, sm: 9, md: 9, lg: 11, tiny: 8 };
            return { chart: 10, tick: 9, sm: 9, md: 10, lg: 11, tiny: 8 };
        };

        const initCharts = () => {
        const sizes = getChartSizes();
        // Constants
        const P='#2563eb',A='#f59e0b',D='#ef4444',S='#10b981',W='#f59e0b',PR='#8b5cf6';
        Chart.defaults.font.family="'Inter',system-ui,sans-serif";
        Chart.defaults.font.size=sizes.chart;
        Chart.defaults.color='#64748b';
        Chart.defaults.plugins.legend.display=false;

        // Cleanup previous instances
        Object.values(chartInstances.current).forEach(c => c && c.destroy());
        chartInstances.current = {};

        /* ===== 1. GROUPED BAR ===== */
        if(c1Ref.current) {
            const c1P=[82,70,60,55,48,40],c1A=[45,55,52,40,35,28];
            const labels=['Bắc - Nam','V. Đai 4','BMT - VT','KH - BMT','CĐ - CT','HN - CL'];
            chartInstances.current.c1 = new Chart(c1Ref.current,{
                type:'bar',
                data:{
                    labels: labels,
                    datasets:[
                        {label:'KH',data:c1P,backgroundColor:P,borderRadius:2,barPercentage:.6,categoryPercentage:.6},
                        {label:'TT',data:c1A,backgroundColor:A,borderRadius:3,barPercentage:.6,categoryPercentage:.6}
                    ]
                },
                options:{
                    responsive:true,maintainAspectRatio:false,layout:{padding:{top:16,bottom:16}},
                    scales:{
                        x:{ticks:{font:{size:sizes.tick},color:'#64748b',padding:14},grid:{display:false}},
                        y:{beginAtZero:true,max:100,ticks:{stepSize:25,callback:function(v){return v+'%'}},grid:{color:'#f1f5f9'}}
                    }
                },
                plugins:[{id:'lbl',afterDatasetsDraw:function(chart){
                    var ctx=chart.ctx;
                    chart.data.datasets.forEach(function(ds,di){
                        var meta=chart.getDatasetMeta(di);
                        meta.data.forEach(function(bar,i){
                            ctx.save();ctx.font=`600 ${sizes.sm}px Inter,sans-serif`;ctx.textAlign='center';
                            ctx.fillStyle=di===0?P:A;
                            ctx.fillText(ds.data[i]+'%',bar.x,bar.y-4);ctx.restore();
                        });
                    });
                    var m0=chart.getDatasetMeta(0),m1=chart.getDatasetMeta(1);
                    m1.data.forEach(function(bar,i){
                        var diff=c1A[i]-c1P[i];
                        ctx.save();ctx.font=`700 ${sizes.sm}px Inter,sans-serif`;ctx.fillStyle=D;ctx.textAlign='center';
                        ctx.fillText(diff+'%',(m0.data[i].x+bar.x)/2,chart.chartArea.bottom+12);ctx.restore();
                    });
                }}]
            });
        }

        /* ===== 2. DOUGHNUT ===== */
        if(c2Ref.current) {
            chartInstances.current.c2 = new Chart(c2Ref.current,{type:'doughnut',
                data:{labels:['Đang thi công','Hoàn thành','Chậm tiến độ','Chờ khởi công'],
                datasets:[{data:[43,27,22,8],backgroundColor:[P,S,D,'#94a3b8'],borderWidth:2,borderColor:'#fff',hoverOffset:4}]},
                options:{responsive:true,maintainAspectRatio:false,cutout:'65%',layout:{padding:10}},
                plugins:[{id:'dlbl',afterDatasetsDraw:function(chart){
                    var ctx=chart.ctx,ds=chart.data.datasets[0];
                    chart.getDatasetMeta(0).data.forEach(function(arc,i){
                        var pct=ds.data[i];
                        var pos=arc.tooltipPosition();
                        ctx.save();ctx.font=`bold ${sizes.lg}px Inter,sans-serif`;ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';
                        ctx.fillText(pct+'%',pos.x,pos.y);ctx.restore();
                    });
                }}]
            });
        }

        /* ===== 4. S-CURVE ===== */
        if(c4Ref.current) {
            var sPlan=[5,10,22,42,50,59,72,92,null,null,null,null],sAct=[4,8,18,28,33,38,44,49,null,null,null,null];
            var months=['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];
            chartInstances.current.c4 = new Chart(c4Ref.current,{type:'line',
                data:{labels:months,datasets:[
                    {label:'KH',data:sPlan,borderColor:P,borderDash:[4,3],borderWidth:2,pointRadius:3,pointBackgroundColor:P,fill:false,tension:.3},
                    {label:'TT',data:sAct,borderColor:A,borderWidth:2,pointRadius:3,pointBackgroundColor:A,fill:{target:'origin',above:'rgba(245,158,11,0.1)'},tension:.3,spanGaps:false}
                ]},
                options:{responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},layout:{padding:{bottom:4}},
                    scales:{y:{beginAtZero:true,max:100,ticks:{stepSize:25,callback:function(v){return v+'%'}},grid:{color:'#f1f5f9'}},x:{grid:{color:'#f1f5f9'}}}},
                plugins:[{id:'sLbl',afterDatasetsDraw:function(chart){
                    var ctx=chart.ctx;
                    chart.getDatasetMeta(0).data.forEach(function(pt,i){
                        if(sPlan[i]!==null && pt){ctx.save();ctx.font=`500 ${sizes.sm}px Inter`;ctx.fillStyle=P;ctx.textAlign='center';ctx.fillText(sPlan[i]+'%',pt.x,pt.y-8);ctx.restore();}
                    });
                    chart.getDatasetMeta(1).data.forEach(function(pt,i){
                        if(sAct[i]!==null && pt){ctx.save();ctx.font=`500 ${sizes.sm}px Inter`;ctx.fillStyle=A;ctx.textAlign='center';ctx.fillText(sAct[i]+'%',pt.x,pt.y+12);ctx.restore();}
                    });
                    try {
                        var x=chart.scales.x.getPixelForValue(7);
                        ctx.save();ctx.beginPath();ctx.setLineDash([4,3]);ctx.strokeStyle=D;ctx.lineWidth=1;ctx.moveTo(x,chart.chartArea.top);ctx.lineTo(x,chart.chartArea.bottom);ctx.stroke();
                        
                        // Bubble box
                        ctx.fillStyle='#fff';ctx.strokeStyle=D;ctx.lineWidth=1;
                        var bx=x+6,by=chart.chartArea.top+20;
                        ctx.fillRect(bx,by,58,40);ctx.strokeRect(bx,by,58,40);
                        
                        ctx.font=`600 ${sizes.sm}px Inter`;ctx.textAlign='left';
                        ctx.fillStyle=D;ctx.fillText('TẠI T7',bx+6,by+10);
                        ctx.fillText('KH: 62.4%',bx+6,by+20);
                        ctx.fillStyle=A;ctx.fillText('TT: 48.7%',bx+6,by+30);
                        ctx.fillStyle=D;ctx.fillText('CL: -13.7%',bx+6,by+40);ctx.restore();
                    } catch(e){}
                }}]
            });
        }

        /* ===== 5. PIE NGUỒN VỐN ===== */
        if(c5Ref.current) {
            chartInstances.current.c5 = new Chart(c5Ref.current,{type:'doughnut',
                data:{labels:['NS Trung ương','NS Địa phương','ODA','PPP'],
                datasets:[{data:[40.5, 28.9, 21.6, 9.0],backgroundColor:[P,S,A,PR],borderWidth:2,borderColor:'#fff',hoverOffset:4}]},
                options:{responsive:true,maintainAspectRatio:false,cutout:'65%',layout:{padding:10}},
                plugins:[{id:'pLbl',afterDatasetsDraw:function(chart){
                    var ctx=chart.ctx;
                    chart.getDatasetMeta(0).data.forEach(function(arc,i){
                        var pct=chart.data.datasets[0].data[i];
                        if (pct > 5) {
                            var pos=arc.tooltipPosition();
                            ctx.save();ctx.font=`bold ${sizes.lg}px Inter`;ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';
                            ctx.fillText(pct+'%',pos.x,pos.y);ctx.restore();
                        }
                    });
                }}]
            });
        }

        /* ===== 6. BAR GIẢI NGÂN ===== */
        if(c6Ref.current) {
            var gnP=[3200,3500,4500,6500,7200,6800,6200,8500,9500,10500,11000];
            var gnA=[2800,3000,4200,5100,5500,null,null,null,null,null,null];
            var months=['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];
            chartInstances.current.c6 = new Chart(c6Ref.current,{type:'bar',
                data:{labels:months,datasets:[
                    {label:'KH',data:gnP,backgroundColor:P,borderRadius:2,barPercentage:.55},
                    {label:'TT',data:gnA,backgroundColor:S,borderRadius:2,barPercentage:.55}
                ]},
                options:{responsive:true,maintainAspectRatio:false,
                    scales:{
                        y:{beginAtZero:true,ticks:{stepSize:3000,callback:function(v){return(v/1000).toFixed(0)+'K'}},grid:{color:'#f1f5f9'}},
                        x:{grid:{display:false}}
                    }
                },
                plugins:[{id:'gnLbl',afterDatasetsDraw:function(chart){
                    var ctx=chart.ctx;
                    chart.getDatasetMeta(0).data.forEach(function(bar,i){
                        if(gnP[i]!==null && bar){ctx.save();ctx.font=`500 ${sizes.tiny}px Inter`;ctx.fillStyle=P;ctx.textAlign='center';ctx.fillText((gnP[i]/1000).toFixed(1)+'K',bar.x,bar.y-4);ctx.restore();}
                    });
                    chart.getDatasetMeta(1).data.forEach(function(bar,i){
                        if(gnA[i]!==null && bar){ctx.save();ctx.font=`600 ${sizes.tiny}px Inter`;ctx.fillStyle=S;ctx.textAlign='center';ctx.fillText((gnA[i]/1000).toFixed(1)+'K',bar.x,bar.y-4);ctx.restore();}
                    });
                }}]
            });
        }

        };

        initCharts();

        let resizeTimer;
        const scheduleInit = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(initCharts, 250);
        };
        window.addEventListener('resize', scheduleInit);
        const ro = typeof ResizeObserver !== 'undefined'
            ? new ResizeObserver(scheduleInit)
            : null;
        if (ro && containerRef.current) ro.observe(containerRef.current);

        return () => {
            window.removeEventListener('resize', scheduleInit);
            ro?.disconnect();
            clearTimeout(resizeTimer);
             Object.values(chartInstances.current).forEach(c => c && c.destroy());
        };
    }, []);

    // Static horizontal bar data
    const hData=[{n:'Cao tốc Bắc - Nam phía Đông',w:80,d:'-35%'},{n:'Vành đai 4 Hà Nội',w:60,d:'-16%'},{n:'CT Biên Hòa - Vũng Tàu',w:40,d:'-8%'},{n:'CT Khánh Hòa - Buôn Ma Thuột',w:50,d:'-15%'},{n:'CT Châu Đốc - Cần Thơ - Sóc Trăng',w:45,d:'-13%'}];
    const renderHBars = () => {
        return hData.map((d, i) => (
            <div key={i} className="hbr-row">
                <div className="hbr-name">{d.n}</div>
                <div className="hbr-track">
                    <div className="hbr-fill" style={{width: `${d.w}%`}}></div>
                </div>
                <div className="hbr-val">{d.d}</div>
            </div>
        ));
    };

    // Table data
    const ld=[['Bắc Giang',7,6,'85.7',1,'14.3',0,'0',320.5,'2,345'],['Lạng Sơn',5,3,'60.0',1,'20.0',1,'20.0',210.3,'1,234'],['Cao Bằng',4,2,'50.0',1,'25.0',1,'25.0',185.7,'987'],['Hà Nội',8,5,'62.5',2,'25.0',1,'12.5',456.8,'3,567'],['Hải Phòng',6,4,'66.7',1,'16.7',1,'16.7',298.4,'2,123']];
    const bd=[['Ban QLDA 2',11,7,'63.6',3,'27.3',1,'9.1',512.4,'4,567'],['Ban QLDA 6',9,6,'66.7',2,'22.2',1,'11.1',398.7,'3,245'],['Ban QLDA Thăng Long',8,5,'62.5',2,'25.0',1,'12.5',385.6,'3,012'],['Ban QLDA 85',7,4,'57.1',2,'28.6',1,'14.3',301.2,'2,345'],['Ban QLDA Mỹ Thuận',6,4,'66.7',1,'16.7',1,'16.7',245.9,'1,987']];

    const renderTableRows = (dataRow) => {
        return dataRow.map((d, i) => {
            let sl=d[6]>0? <span className="badge b-d">● {d[6]} ({d[7]}%)</span> : <span className="badge b-s">● 0 (0%)</span>;
            return (
                <tr key={i}>
                    <td className="c t-idx">{i+1}</td>
                    <td className="t-name">{d[0]}</td>
                    <td className="c t-bold">{d[1]}</td>
                    <td className="c"><span className="badge b-p">● {d[2]} ({d[3]}%)</span></td>
                    <td className="c"><span className="badge b-s">● {d[4]} ({d[5]}%)</span></td>
                    <td className="c">{sl}</td>
                    <td className="c t-val">{d[8]}</td>
                    <td className="c t-val">{d[9]}</td>
                </tr>
            )
        });
    };

    return (
        <div className="dashboard-container" ref={containerRef}>
            <header className="hd">
                <div className="hd-t">TỔNG QUAN HỆ THỐNG</div>
                <div className="hd-r">
                    <div className="hd-n"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg><div className="hd-nb"></div></div>
                    <div className="hd-u">
                        <div style={{textAlign:'right'}}>
                            <div className="hd-un">Nguyễn Văn A</div>
                            <div className="hd-ur">Bộ trưởng</div>
                        </div>
                        <div className="hd-av">NA</div>
                    </div>
                </div>
            </header>
            
            <div className="ct">
                {/* FILTER ROW */}
                <div className="fb">
                    <div className="fb-left">
                        <div className="fg"><div className="fl">NĂM</div><select className="fs"><option>2025</option></select></div>
                        <div className="fg"><div className="fl">QUÝ</div><select className="fs"><option>Tất cả</option></select></div>
                        <div className="fg"><div className="fl">THÁNG</div><select className="fs"><option>Tất cả</option></select></div>
                        <div className="fg"><div className="fl">TỈNH/TP</div><select className="fs" style={{minWidth:'90px'}}><option>Tất cả (63)</option></select></div>
                        <div className="fg"><div className="fl">BAN QLDA</div><select className="fs"><option>Tất cả</option></select></div>
                        <div className="fg"><div className="fl">NGUỒN VỐN</div><select className="fs"><option>Tất cả</option></select></div>
                        <div className="fg">
                            <div className="fl">TRẠNG THÁI</div>
                            <div className="fcs">
                                <div className="fc a">Đang TC</div>
                                <div className="fc">HT</div>
                                <div className="fc">Chậm TĐ</div>
                                <div className="fc">Chờ KC</div>
                            </div>
                        </div>
                        <div className="fg"><div className="fl">&nbsp;</div><button className="br">Reset lọc</button></div>
                    </div>
                    <div className="fb-right">Cập nhật: 20/05/2025 10:30</div>
                </div>

                {/* KPI ROW */}
                <div className="kr">
                    <div className="kc"><div className="ki k-b"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg></div>
                        <div className="kinfo"><div className="kl">TỔNG DỰ ÁN</div><div className="kv">60 <span className="u">Dự án</span></div><div className="kch"><span className="tg up">▲ 2</span> +3.45% so với kỳ trước</div></div></div>
                    <div className="kc"><div className="ki k-g"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="8" y1="6" x2="8" y2="6"/><line x1="16" y1="6" x2="16" y2="6"/><line x1="12" y1="6" x2="12" y2="6"/><line x1="12" y1="10" x2="12" y2="10"/><line x1="12" y1="14" x2="12" y2="14"/><line x1="16" y1="10" x2="16" y2="10"/><line x1="16" y1="14" x2="16" y2="14"/><line x1="8" y1="10" x2="8" y2="10"/><line x1="8" y1="14" x2="8" y2="14"/><path d="M4 22h16"/></svg></div>
                        <div className="kinfo"><div className="kl">BAN QLDA</div><div className="kv">12 <span className="u">Ban</span></div><div className="kch"><span className="tg up">▲ 1</span> +9.09% so với kỳ trước</div></div></div>
                    <div className="kc"><div className="ki k-r"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>
                        <div className="kinfo"><div className="kl">DA CHẬM TIẾN ĐỘ</div><div className="kv">13 <span className="u">Dự án</span></div><div className="kch"><span className="tg r-up">▲ 3</span> +30.00% so với kỳ trước</div></div></div>
                    <div className="kc"><div className="ki k-y"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
                        <div className="kinfo"><div className="kl">DA HOÀN THÀNH</div><div className="kv">16 <span className="u">Dự án</span></div><div className="kch"><span className="tg up">▲ 4</span> +33.33% so với kỳ trước</div></div></div>
                    <div className="kc"><div className="ki k-p"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9 12h6"/><path d="M12 9v6"/></svg></div>
                        <div className="kinfo"><div className="kl">TỔNG CHIỀU DÀI</div><div className="kv">2,541.7 <span className="u">km</span></div><div className="kch"><span className="tg up">▲ 128.4 km</span> +5.32% so với kỳ trước</div></div></div>
                </div>

                {/* ROW 1: Charts 1, 2, 3 */}
                <div className="g3">
                    <div className="cd">
                        <div className="ch"><div className="ctt"><span className="n">1.</span>TIẾN ĐỘ KH VS TT (TOP 6 DA CHÊNH LỆCH NHẤT)</div></div>
                        <div className="lg"><div className="li"><div className="ld b-bl"></div>Kế hoạch (%)</div><div className="li"><div className="ld b-or"></div>Thực tế (%)</div><div className="li"><div className="ld b-re"></div>Chênh lệch (%)</div></div>
                        <div className="cw"><canvas ref={c1Ref}></canvas></div>
                    </div>
                    <div className="cd">
                        <div className="ch"><div className="ctt"><span className="n">2.</span>PHÂN BỔ TRẠNG THÁI DỰ ÁN</div></div>
                        <div className="cw c-split">
                            <div className="pie-w">
                                <canvas ref={c2Ref}></canvas>
                                <div className="dc"><div className="sub">TỔNG</div><div className="big">60</div><div className="sub">DỰ ÁN</div></div>
                            </div>
                            <div className="leg-r">
                                <div className="lg-i"><div className="ld b-bl"></div><div className="lg-t"><b>Đang thi công</b><br/><span>26 dự án</span></div></div>
                                <div className="lg-i"><div className="ld b-gr"></div><div className="lg-t"><b>Hoàn thành</b><br/><span>16 dự án</span></div></div>
                                <div className="lg-i"><div className="ld b-re"></div><div className="lg-t"><b>Chậm tiến độ</b><br/><span>13 dự án</span></div></div>
                                <div className="lg-i"><div className="ld b-gy"></div><div className="lg-t"><b>Chờ khởi công</b><br/><span>5 dự án</span></div></div>
                            </div>
                        </div>
                    </div>
                    <div className="cd">
                        <div className="ch"><div className="ctt"><span className="n">3.</span>TOP DỰ ÁN CHẬM TIẾN ĐỘ NHẤT</div></div>
                        <div className="th-r"><div className="tc-n">Dự án</div><div className="tc-v">Chênh lệch</div></div>
                        <div className="hbl">{renderHBars()}</div>
                    </div>
                </div>

                {/* ROW 2: Charts 4, 5, 6 */}
                <div className="g3e">
                    <div className="cd">
                        <div className="ch"><div className="ctt"><span className="n">4.</span>TIẾN ĐỘ TÍCH LŨY (S-CURVE)</div></div>
                        <div className="lg"><div className="li"><div className="lda c-bl"></div>Kế hoạch</div><div className="li"><div className="ll b-or"></div>Thực tế</div></div>
                        <div className="cw"><canvas ref={c4Ref}></canvas></div>
                    </div>
                    <div className="cd">
                        <div className="ch"><div className="ctt"><span className="n">5.</span>GIẢI NGÂN THEO NGUỒN VỐN</div></div>
                        <div className="cw c-split">
                            <div className="pie-w">
                                <canvas ref={c5Ref}></canvas>
                                <div className="dc dc-fund"><div className="sub">TỔNG GIẢI NGÂN</div><div className="big">45.7K</div><div className="sub">TỶ ĐỒNG</div></div>
                            </div>
                            <div className="leg-r">
                                <div className="lg-i"><div className="ld b-bl"></div><div className="lg-t"><b>NS Trung ương</b> &nbsp; 40.5%<br/><span>18.5K tỷ</span></div></div>
                                <div className="lg-i"><div className="ld b-gr"></div><div className="lg-t"><b>NS Địa phương</b> &nbsp; 28.9%<br/><span>13.2K tỷ</span></div></div>
                                <div className="lg-i"><div className="ld b-or"></div><div className="lg-t"><b>ODA</b> &nbsp; 21.6%<br/><span>9.9K tỷ</span></div></div>
                                <div className="lg-i"><div className="ld b-pu"></div><div className="lg-t"><b>PPP</b> &nbsp; 9%<br/><span>4.1K tỷ</span></div></div>
                            </div>
                        </div>
                    </div>
                    <div className="cd">
                        <div className="ch"><div className="ctt"><span className="n">6.</span>GIẢI NGÂN THEO THÁNG (TỶ ĐỒNG)</div></div>
                        <div className="lg"><div className="li"><div className="ll b-bl"></div>Kế hoạch</div><div className="li"><div className="ll b-gr"></div>Thực tế</div></div>
                        <div className="cw"><canvas ref={c6Ref}></canvas></div>
                    </div>
                </div>

                {/* ROW 3: Tables 7, 8 */}
                <div className="g2">
                    <div className="tc">
                        <div className="tch"><div className="tct"><span className="n">7.</span>TIẾN ĐỘ DỰ ÁN THEO ĐỊA PHƯƠNG</div></div>
                        <table className="custom-tb"><thead><tr><th>#</th><th>TỈNH/THÀNH PHỐ</th><th className="c">TỔNG DA</th><th className="c">ĐANG TC</th><th className="c">HOÀN THÀNH</th><th className="c">CHẬM TĐ</th><th className="c">TỔNG CHIỀU DÀI<br/>(KM)</th><th className="c">GIẢI NGÂN<br/>(TỶ ĐỒNG)</th></tr></thead><tbody>{renderTableRows(ld)}</tbody></table>
                    </div>
                    <div className="tc">
                        <div className="tch"><div className="tct"><span className="n">8.</span>TIẾN ĐỘ DỰ ÁN THEO BAN QLDA</div></div>
                        <table className="custom-tb"><thead><tr><th>#</th><th>BAN QLDA</th><th className="c">TỔNG DA</th><th className="c">ĐANG TC</th><th className="c">HOÀN THÀNH</th><th className="c">CHẬM TĐ</th><th className="c">TỔNG CHIỀU DÀI<br/>(KM)</th><th className="c">GIẢI NGÂN<br/>(TỶ ĐỒNG)</th></tr></thead><tbody>{renderTableRows(bd)}</tbody></table>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Overview;