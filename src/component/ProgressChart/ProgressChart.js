import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { FaChartPie } from 'react-icons/fa';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const ProgressChart = ({ data, variant = 'default' }) => {
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

  const shellClass =
    variant === 'orange'
      ? 'bg-white rounded-lg overflow-hidden border border-orange-300 shadow-sm flex flex-col h-full min-h-[168px]'
      : variant === 'blue'
        ? 'bg-white rounded-lg overflow-hidden border border-[#0f3460]/25 shadow-sm flex flex-col h-full min-h-[168px]'
        : 'bg-white rounded-lg p-4 sm:p-3 xs:p-2';

  const headerClass =
    variant === 'blue'
      ? 'flex items-center p-3 bg-[#0f3460] text-white flex-shrink-0'
      : variant === 'orange'
        ? 'flex items-center p-3 bg-[#e67e22] text-white flex-shrink-0'
        : 'flex items-center mb-3';

  const iconClass = variant === 'default' ? 'text-gray-500 mr-2' : 'text-white mr-2';
  const titleClass =
    variant === 'default'
      ? 'text-lg sm:text-base xs:text-sm font-bold text-gray-800'
      : 'text-sm font-bold text-white uppercase tracking-wide';

  const bodyClass =
    variant === 'default'
      ? 'flex flex-col ml-10 md:flex-row items-center justify-center gap-4 md:gap-6 w-full'
      : 'flex flex-col ml-2 md:flex-row items-center justify-center gap-2 md:gap-3 w-full p-2 md:p-3 flex-1 min-h-0';

  return (
    <div className={shellClass}>
      <div className={headerClass}>
        <FaChartPie className={iconClass} size={variant === 'default' ? 18 : 14} />
        <h3 className={titleClass}>TIẾN ĐỘ CÁC HẠNG MỤC</h3>
      </div>

      <div className={bodyClass}>
        <div
          className={
            variant === 'default'
              ? 'w-40 h-40 mr-4 md:mr-8 md:w-36 md:h-36 sm:w-32 sm:h-32 xs:w-28 xs:h-28 flex items-center justify-center shrink-0'
              : 'mr-3 flex h-32 w-32 shrink-0 items-center justify-center sm:h-28 sm:w-28 md:h-36 md:w-36'
          }
        >
          <Doughnut data={dataChart} options={options} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 w-full max-w-xs">
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
    <div className="w-3 h-3 mr-2 flex-shrink-0 rounded-full" style={{ backgroundColor: color }}></div>
    <div className="flex items-baseline">
      <span className="text-sm xs:text-xs font-medium text-gray-600 mr-1">{label}:</span>
      <span className="text-base xs:text-sm font-bold text-gray-800">{value}</span>
    </div>
  </div>
);

export default ProgressChart;
