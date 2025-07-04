import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { FaChartPie } from 'react-icons/fa';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const ProgressChart = ({ data }) => {
  const dataChart = {
    labels: ['Kế hoạch', 'Đang làm', 'Chậm tiến độ', 'Hoàn thành'],
    datasets: [
      {
        data: [data.keHoach, data.dangLam, data.chamTienDo, data.hoanThanh],
        backgroundColor: ['#2E86C1', '#F5B041', '#E74C3C', '#27AE60'],
        borderWidth: 0
      }
    ]
  };

  const options = {
    cutout: '70%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.parsed}%`
        }
      }
    },
    responsive: true,
    maintainAspectRatio: false
  };

  return (
    <div className="bg-white rounded-lg p-4 sm:p-3 xs:p-2">
      {/* Header với icon */}
      <div className="flex items-center mb-3">
        <FaChartPie className="text-gray-500 mr-2" size={18} />
        <h3 className="text-lg sm:text-base xs:text-sm font-bold text-gray-800">TIẾN ĐỘ CÁC HẠNG MỤC</h3>
      </div>
      
      {/* Container chính - thay đổi flex-col khi màn hình nhỏ */}
      <div className="flex flex-col ml-10 md:flex-row items-center justify-center gap-4 md:gap-6 w-full">
        {/* Biểu đồ - luôn căn giữa */}
        <div className="w-40 h-40 md:w-36 md:h-36 sm:w-32 sm:h-32 xs:w-28 xs:h-28 flex items-center justify-center">
          <Doughnut data={dataChart} options={options} />
        </div>

        {/* Chú thích - chuyển thành grid 2 cột khi màn hình nhỏ */}
        <div className="grid grid-cols-2 ml-6 5xl:ml-12 md:flex md:flex-col gap-2 w-full max-w-xs sm:max-w-full">
          <LegendItem color="#2E86C1" label="Kế hoạch" value={`${data.keHoach}%`} />
          <LegendItem color="#F5B041" label="Đang làm" value={`${data.dangLam}%`} />
          <LegendItem color="#E74C3C" label="Chậm tiến độ" value={`${data.chamTienDo}%`} />
          <LegendItem color="#27AE60" label="Hoàn thành" value={`${data.hoanThanh}%`} />
        </div>
      </div>
    </div>
  );
};

const LegendItem = ({ color, label, value }) => (
  <div className="flex items-center">
    <div
      className="w-3 h-3 mr-2 flex-shrink-0 rounded-full"
      style={{ backgroundColor: color }}
    ></div>
    <div className="flex items-baseline">
      <span className="text-sm xs:text-xs font-medium text-gray-600 mr-1">{label}:</span>
      <span className="text-base xs:text-sm font-bold text-gray-800">{value}</span>
    </div>
  </div>
);

export default ProgressChart;