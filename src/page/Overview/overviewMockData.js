/** Mock data khớp UI mẫu Tổng quan */

export const MOCK_STATS = [
  {
    label: "Tổng dự án",
    value: "60",
    unit: "Dự án",
    trend: "▲ 2 (+3.45% so với kỳ trước)",
    trendUp: true,
    iconBg: "#1890ff",
    iconKey: "folder",
  },
  {
    label: "Ban QLDA",
    value: "12",
    unit: "Ban",
    trend: "▲ 1 (+9.09% so với kỳ trước)",
    trendUp: true,
    iconBg: "#52c41a",
    iconKey: "users",
  },
  {
    label: "Dự án chậm tiến độ",
    value: "13",
    unit: "Dự án",
    trend: "▲ 3 (+30.00% so với kỳ trước)",
    trendUp: false,
    iconBg: "#ff4d4f",
    iconKey: "alert",
  },
  {
    label: "Dự án hoàn thành",
    value: "16",
    unit: "Dự án",
    trend: "▲ 4 (+33.33% so với kỳ trước)",
    trendUp: true,
    iconBg: "#faad14",
    iconKey: "check",
  },
  {
    label: "Tổng chiều dài",
    value: "2,541.7",
    unit: "km",
    trend: "▲ 128.4 km (+5.32% so với kỳ trước)",
    trendUp: true,
    iconBg: "#722ed1",
    iconKey: "map",
  },
];

export const MOCK_PLAN_VS_ACTUAL = [
  { name: "DA-001", fullName: "Dự án cao tốc Bắc Giang – Lạng Sơn", keHoach: 72, thucTe: 37, lech: -35 },
  { name: "DA-002", fullName: "Dự án nâng cấp QL1 đoạn Nghệ An", keHoach: 65, thucTe: 49, lech: -16 },
  { name: "DA-003", fullName: "Dự án cầu vượt sông Hồng", keHoach: 58, thucTe: 44, lech: -14 },
  { name: "DA-004", fullName: "Dự án đường ven biển Quảng Ninh", keHoach: 80, thucTe: 68, lech: -12 },
  { name: "DA-005", fullName: "Dự án cao tốc Cam Lộ – La Sơn", keHoach: 55, thucTe: 45, lech: -10 },
  { name: "DA-006", fullName: "Dự án mở rộng QL18", keHoach: 48, thucTe: 40, lech: -8 },
];

export const MOCK_STATUS_DONUT = [
  { name: "Đang thi công", value: 28, color: "#1890ff", pct: "46.7%" },
  { name: "Hoàn thành", value: 16, color: "#52c41a", pct: "26.7%" },
  { name: "Chậm tiến độ", value: 13, color: "#ff4d4f", pct: "21.7%" },
  { name: "Chờ khởi công", value: 3, color: "#91caff", pct: "5.0%" },
];

export const MOCK_TOP_DELAYED = [
  { name: "Dự án cao tốc Bắc Giang – Lạng Sơn", pct: 35 },
  { name: "Dự án nâng cấp QL1 đoạn Nghệ An", pct: 16 },
  { name: "Dự án cầu vượt sông Hồng", pct: 14 },
  { name: "Dự án đường ven biển Quảng Ninh", pct: 12 },
  { name: "Dự án cao tốc Cam Lộ – La Sơn", pct: 10 },
];

export const MOCK_S_CURVE = [
  { thang: "T1", keHoach: 8, thucTe: 5 },
  { thang: "T2", keHoach: 15, thucTe: 10 },
  { thang: "T3", keHoach: 22, thucTe: 16 },
  { thang: "T4", keHoach: 30, thucTe: 22 },
  { thang: "T5", keHoach: 38, thucTe: 28 },
  { thang: "T6", keHoach: 46, thucTe: 35 },
  { thang: "T7", keHoach: 54, thucTe: 42 },
  { thang: "T8", keHoach: 62, thucTe: 48 },
  { thang: "T9", keHoach: 70, thucTe: 55 },
  { thang: "T10", keHoach: 78, thucTe: 62 },
  { thang: "T11", keHoach: 88, thucTe: 70 },
  { thang: "T12", keHoach: 100, thucTe: 78 },
];

export const MOCK_FUND_DONUT = [
  { name: "NS Trung ương", value: 42, amount: "19.2K", color: "#1890ff" },
  { name: "NS Địa phương", value: 28, amount: "12.8K", color: "#13c2c2" },
  { name: "ODA", value: 18, amount: "8.2K", color: "#722ed1" },
  { name: "PPP", value: 12, amount: "5.5K", color: "#faad14" },
];

export const MOCK_MONTHLY_DISBURSE = [
  { thang: "T1", keHoach: 2.8, thucTe: 2.1 },
  { thang: "T2", keHoach: 3.2, thucTe: 2.6 },
  { thang: "T3", keHoach: 3.8, thucTe: 3.1 },
  { thang: "T4", keHoach: 4.2, thucTe: 3.5 },
  { thang: "T5", keHoach: 4.8, thucTe: 4.0 },
  { thang: "T6", keHoach: 5.2, thucTe: 4.4 },
  { thang: "T7", keHoach: 5.8, thucTe: 4.9 },
  { thang: "T8", keHoach: 6.2, thucTe: 5.2 },
  { thang: "T9", keHoach: 6.8, thucTe: 5.6 },
  { thang: "T10", keHoach: 7.2, thucTe: 6.0 },
  { thang: "T11", keHoach: 7.8, thucTe: 6.4 },
  { thang: "T12", keHoach: 8.4, thucTe: 6.8 },
];

export const MOCK_BY_PROVINCE = [
  { name: "Bắc Giang", total: 7, active: 6, activePct: 85.7, done: 1, donePct: 14.3, delayed: 2, delayedPct: 28.6, km: 312.4, disburse: 4200 },
  { name: "Lạng Sơn", total: 5, active: 4, activePct: 80.0, done: 1, donePct: 20.0, delayed: 1, delayedPct: 20.0, km: 248.6, disburse: 3100 },
  { name: "Cao Bằng", total: 4, active: 3, activePct: 75.0, done: 1, donePct: 25.0, delayed: 1, delayedPct: 25.0, km: 186.2, disburse: 2800 },
  { name: "Quảng Ninh", total: 6, active: 4, activePct: 66.7, done: 2, donePct: 33.3, delayed: 2, delayedPct: 33.3, km: 425.8, disburse: 5600 },
  { name: "Nghệ An", total: 5, active: 3, activePct: 60.0, done: 2, donePct: 40.0, delayed: 2, delayedPct: 40.0, km: 378.5, disburse: 4900 },
];

export const MOCK_BY_BOARD = [
  { name: "Ban QLDA 2", total: 8, active: 6, activePct: 75.0, done: 2, donePct: 25.0, delayed: 2, delayedPct: 25.0, km: 456.2, disburse: 6200 },
  { name: "Ban QLDA 6", total: 7, active: 5, activePct: 71.4, done: 2, donePct: 28.6, delayed: 2, delayedPct: 28.6, km: 398.7, disburse: 5400 },
  { name: "Ban QLDA Thăng Long", total: 6, active: 4, activePct: 66.7, done: 2, donePct: 33.3, delayed: 1, delayedPct: 16.7, km: 342.1, disburse: 4800 },
  { name: "Ban QLDA 4", total: 5, active: 3, activePct: 60.0, done: 2, donePct: 40.0, delayed: 2, delayedPct: 40.0, km: 287.5, disburse: 3900 },
  { name: "Ban QLDA 8", total: 4, active: 3, activePct: 75.0, done: 1, donePct: 25.0, delayed: 1, delayedPct: 25.0, km: 215.3, disburse: 3200 },
];

export const MOCK_UPDATED_AT = "20/05/2025 10:30";
