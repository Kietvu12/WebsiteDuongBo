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
    labels: ['Kế hoạch', 'Đang làm', 'Tạm dừng', 'Hoàn thành'],
    datasets: [
      {
        data: [data.keHoach, data.dangLam, data.tamDung, data.hoanThanh],
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
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
      {/* Header với icon */}
      <div className="flex items-center mb-3">
        <FaChartPie className="text-gray-500 mr-2" size={18} />
        <h3 className="text-lg font-bold text-gray-800">TIẾN ĐỘ CÁC HẠNG MỤC</h3>
      </div>

      {/* Đường phân cách */}
      <hr className="border-gray-200 mb-4" />

      <div className="flex flex-col md:flex-row items-center justify-between">
        {/* Biểu đồ thu nhỏ */}
        <div className="w-32 h-32 md:w-40 md:h-40">
          <Doughnut data={dataChart} options={options} />
        </div>

        {/* Chú thích phân bố lại */}
        <div className="mt-4 md:mt-0 md:ml-6 grid grid-cols-1 md:grid-cols-2 gap-2">
          <LegendItem color="#2E86C1" label="Kế hoạch" value={`${data.keHoach}%`} />
          <LegendItem color="#F5B041" label="Đang làm" value={`${data.dangLam}%`} />
          <LegendItem color="#E74C3C" label="Tạm dừng" value={`${data.tamDung}%`} />
          <LegendItem color="#27AE60" label="Hoàn thành" value={`${data.hoanThanh}%`} />
        </div>
      </div>
    </div>
  );
};

const LegendItem = ({ color, label, value }) => (
  <div className="flex items-center">
    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: color }}></div>
    <span className="text-sm text-gray-600 mr-2">{label}:</span>
    <span className="text-sm font-bold text-gray-800">{value}</span>
  </div>
);

export default ProgressChart;