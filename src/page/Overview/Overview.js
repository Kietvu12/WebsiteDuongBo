import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Area,
  Line,
  LabelList,
} from "recharts";
import {
  FiFolder,
  FiUsers,
  FiAlertTriangle,
  FiCheckCircle,
  FiMap,
  FiRefreshCw,
} from "react-icons/fi";
import {
  MOCK_STATS,
  MOCK_PLAN_VS_ACTUAL,
  MOCK_STATUS_DONUT,
  MOCK_TOP_DELAYED,
  MOCK_S_CURVE,
  MOCK_FUND_DONUT,
  MOCK_MONTHLY_DISBURSE,
  MOCK_BY_PROVINCE,
  MOCK_BY_BOARD,
  MOCK_UPDATED_AT,
} from "./overviewMockData";
import "./Overview.css";

const ICON_MAP = {
  folder: FiFolder,
  users: FiUsers,
  alert: FiAlertTriangle,
  check: FiCheckCircle,
  map: FiMap,
};

const STATUS_PILLS = [
  { key: "active", label: "Đang TC" },
  { key: "done", label: "HT" },
  { key: "delayed", label: "Chậm TĐ" },
  { key: "planned", label: "Chờ KC" },
];

const CHART_FONT = { fontSize: 11, fill: "#666666", fontFamily: "Inter, sans-serif" };

function StatCard({ stat }) {
  const Icon = ICON_MAP[stat.iconKey] || FiFolder;
  return (
    <div className="overview-stat-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="overview-stat-label">{stat.label}</div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="overview-stat-value">{stat.value}</span>
            <span className="overview-stat-unit">{stat.unit}</span>
          </div>
          <div
            className={`overview-stat-trend ${
              stat.trendUp ? "overview-stat-trend--up" : "overview-stat-trend--down"
            }`}
          >
            {stat.trend}
          </div>
        </div>
        <div className="overview-stat-icon" style={{ background: stat.iconBg }}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, children, className = "" }) {
  return (
    <div className={`overview-card ${className}`}>
      <div className="mb-3">
        <div className="overview-section-title">{title}</div>
        {subtitle && <p className="overview-section-sub">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function DeviationLabel(props) {
  const { x, y, width, value } = props;
  if (value == null) return null;
  return (
    <text
      x={x + width / 2}
      y={y - 6}
      fill="#ff4d4f"
      textAnchor="middle"
      fontSize={11}
      fontWeight={700}
      fontFamily="Inter, sans-serif"
    >
      {value}%
    </text>
  );
}

function StatusCell({ count, pct, type }) {
  const cls =
    type === "blue" ? "overview-td-blue" : type === "green" ? "overview-td-green" : "overview-td-red";
  return (
    <td className={cls}>
      {count}{" "}
      <span className="overview-td-muted">({pct}%)</span>
    </td>
  );
}

const Overview = () => {
  const [activePill, setActivePill] = useState("active");

  return (
    <div className="overview-page p-4 md:p-5">
      {/* Filter bar */}
      <div className="overview-filter-bar mb-4 flex flex-wrap items-end gap-x-4 gap-y-3 p-4">
        <div>
          <div className="overview-filter-label">Năm</div>
          <select className="overview-filter-select" defaultValue="2025">
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
        </div>
        <div>
          <div className="overview-filter-label">Quý</div>
          <select className="overview-filter-select" defaultValue="all">
            <option value="all">Tất cả</option>
            <option value="1">Q1</option>
            <option value="2">Q2</option>
            <option value="3">Q3</option>
            <option value="4">Q4</option>
          </select>
        </div>
        <div>
          <div className="overview-filter-label">Tỉnh/TP</div>
          <select className="overview-filter-select min-w-[130px]" defaultValue="all">
            <option value="all">Tất cả (63)</option>
          </select>
        </div>
        <div>
          <div className="overview-filter-label">Ban QLDA</div>
          <select className="overview-filter-select min-w-[120px]" defaultValue="all">
            <option value="all">Tất cả</option>
            <option value="2">Ban QLDA 2</option>
            <option value="6">Ban QLDA 6</option>
            <option value="tl">Ban QLDA Thăng Long</option>
          </select>
        </div>
        <div>
          <div className="overview-filter-label">Nguồn vốn</div>
          <select className="overview-filter-select min-w-[120px]" defaultValue="all">
            <option value="all">Tất cả</option>
            <option value="tw">NS Trung ương</option>
            <option value="dp">NS Địa phương</option>
            <option value="oda">ODA</option>
            <option value="ppp">PPP</option>
          </select>
        </div>
        <div className="flex-1 min-w-[180px]">
          <div className="overview-filter-label">Trạng thái</div>
          <div className="flex flex-wrap gap-1.5">
            {STATUS_PILLS.map((pill) => (
              <button
                key={pill.key}
                type="button"
                className={`overview-pill ${activePill === pill.key ? "overview-pill--active" : "overview-pill--idle"}`}
                onClick={() => setActivePill(pill.key)}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>
        <button type="button" className="overview-reset-btn">
          <FiRefreshCw size={13} />
          Reset lọc
        </button>
        <div className="overview-updated ml-auto hidden lg:block">
          Cập nhật: {MOCK_UPDATED_AT}
        </div>
      </div>

      {/* KPI row */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {MOCK_STATS.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

      {/* Row 2: Bar | Donut | Top delayed */}
      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
        <ChartCard
          title="1. Tiến độ KH vs TT"
          subtitle="Top 6 chênh lệch lớn nhất"
          className="xl:col-span-5"
        >
          <ResponsiveContainer width="100%" height={268}>
            <BarChart data={MOCK_PLAN_VS_ACTUAL} margin={{ top: 24, right: 8, left: -20, bottom: 4 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="name" tick={CHART_FONT} axisLine={false} tickLine={false} />
              <YAxis tick={CHART_FONT} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
              <Tooltip
                contentStyle={{ fontSize: 12, fontFamily: "Inter, sans-serif", borderRadius: 6 }}
                formatter={(v, name) => [
                  `${v}%`,
                  name === "keHoach" ? "Kế hoạch" : "Thực tế",
                ]}
                labelFormatter={(_, items) => items?.[0]?.payload?.fullName || ""}
              />
              <Legend
                wrapperStyle={{ fontSize: 11, fontFamily: "Inter, sans-serif" }}
                formatter={(v) => (v === "keHoach" ? "Kế hoạch" : "Thực tế")}
              />
              <Bar dataKey="keHoach" name="keHoach" fill="#1890ff" radius={[3, 3, 0, 0]} barSize={16} />
              <Bar dataKey="thucTe" name="thucTe" fill="#faad14" radius={[3, 3, 0, 0]} barSize={16}>
                <LabelList dataKey="lech" content={<DeviationLabel />} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="2. Phân bổ trạng thái dự án" className="xl:col-span-3">
          <div className="flex items-center gap-2">
            <div className="relative h-[220px] flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={MOCK_STATUS_DONUT}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={78}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {MOCK_STATUS_DONUT.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="overview-donut-center-label">Tổng</span>
                <span className="overview-donut-center-num">60</span>
                <span className="overview-donut-center-label">Dự án</span>
              </div>
            </div>
            <div className="hidden min-w-[110px] flex-col sm:flex">
              {MOCK_STATUS_DONUT.map((s) => (
                <div key={s.name} className="overview-legend-item">
                  <span className="overview-legend-dot" style={{ background: s.color }} />
                  <span>{s.name}</span>
                  <span className="overview-legend-pct">{s.pct}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        <ChartCard title="3. Top dự án chậm tiến độ nhất" className="xl:col-span-4">
          <div className="space-y-3.5 pt-1">
            {MOCK_TOP_DELAYED.map((item, idx) => (
              <div key={idx}>
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="overview-delay-name">{item.name}</span>
                  <span className="overview-delay-pct">-{item.pct}%</span>
                </div>
                <div className="overview-delay-bar">
                  <div
                    className="overview-delay-bar-fill"
                    style={{ width: `${Math.min(100, item.pct * 2.2)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Row 3: S-curve | Fund | Monthly */}
      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <ChartCard title="4. Tiến độ tích lũy (S-Curve)" className="lg:col-span-5">
          <div className="relative">
            <div className="overview-scurve-callout">
              <div>
                <strong>T8:</strong> KH 62% · TT 48%
              </div>
              <div className="text-[#888]">Chênh lệch: -14%</div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={MOCK_S_CURVE} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="thang" tick={CHART_FONT} axisLine={false} tickLine={false} />
                <YAxis tick={CHART_FONT} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
                <Tooltip contentStyle={{ fontSize: 12, fontFamily: "Inter, sans-serif" }} formatter={(v) => [`${v}%`, ""]} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="keHoach" fill="#e6f4ff" stroke="none" fillOpacity={0.6} legendType="none" />
                <Line type="monotone" dataKey="keHoach" stroke="#1890ff" strokeWidth={2} strokeDasharray="6 4" name="Kế hoạch" dot={false} />
                <Line type="monotone" dataKey="thucTe" stroke="#fa8c16" strokeWidth={2.5} name="Thực tế" dot={{ r: 3, fill: "#fa8c16" }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="5. Giải ngân theo nguồn vốn" className="lg:col-span-3">
          <div className="relative mx-auto h-[200px] max-w-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={MOCK_FUND_DONUT}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {MOCK_FUND_DONUT.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="overview-fund-center">45.7K</span>
              <span className="overview-fund-center-sub">Tỷ đồng</span>
            </div>
          </div>
          <div className="mt-2 space-y-1.5">
            {MOCK_FUND_DONUT.map((s) => (
              <div key={s.name} className="overview-legend-item mb-0">
                <span className="overview-legend-dot" style={{ background: s.color }} />
                <span>{s.name}</span>
                <span className="overview-legend-pct">{s.amount}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="6. Giải ngân theo tháng (Tỷ đồng)" className="lg:col-span-4">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={MOCK_MONTHLY_DISBURSE} margin={{ top: 8, right: 8, left: -20, bottom: 0 }} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="thang" tick={CHART_FONT} axisLine={false} tickLine={false} />
              <YAxis tick={CHART_FONT} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, fontFamily: "Inter, sans-serif" }} />
              <Legend wrapperStyle={{ fontSize: 11 }} formatter={(v) => (v === "keHoach" ? "Kế hoạch" : "Thực tế")} />
              <Bar dataKey="keHoach" name="keHoach" fill="#1890ff" radius={[2, 2, 0, 0]} barSize={10} />
              <Bar dataKey="thucTe" name="thucTe" fill="#91caff" radius={[2, 2, 0, 0]} barSize={10} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard title="7. Tiến độ dự án theo địa phương">
          <div className="overflow-x-auto">
            <table className="overview-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tỉnh/Thành phố</th>
                  <th>Tổng DA</th>
                  <th>Đang TC</th>
                  <th>Hoàn thành</th>
                  <th>Chậm TĐ</th>
                  <th>Tổng chiều dài (km)</th>
                  <th>Giải ngân (tỷ đồng)</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_BY_PROVINCE.map((row, i) => (
                  <tr key={row.name}>
                    <td className="col-num">{i + 1}</td>
                    <td className="col-name">{row.name}</td>
                    <td>{row.total}</td>
                    <StatusCell count={row.active} pct={row.activePct} type="blue" />
                    <StatusCell count={row.done} pct={row.donePct} type="green" />
                    <StatusCell count={row.delayed} pct={row.delayedPct} type="red" />
                    <td>{row.km.toLocaleString("vi-VN")}</td>
                    <td>{row.disburse.toLocaleString("vi-VN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>

        <ChartCard title="8. Tiến độ dự án theo Ban QLDA">
          <div className="overflow-x-auto">
            <table className="overview-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Ban QLDA</th>
                  <th>Tổng DA</th>
                  <th>Đang TC</th>
                  <th>Hoàn thành</th>
                  <th>Chậm TĐ</th>
                  <th>Tổng chiều dài (km)</th>
                  <th>Giải ngân (tỷ đồng)</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_BY_BOARD.map((row, i) => (
                  <tr key={row.name}>
                    <td className="col-num">{i + 1}</td>
                    <td className="col-name">{row.name}</td>
                    <td>{row.total}</td>
                    <StatusCell count={row.active} pct={row.activePct} type="blue" />
                    <StatusCell count={row.done} pct={row.donePct} type="green" />
                    <StatusCell count={row.delayed} pct={row.delayedPct} type="red" />
                    <td>{row.km.toLocaleString("vi-VN")}</td>
                    <td>{row.disburse.toLocaleString("vi-VN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

export default Overview;
