import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

import './ProgressChart.css';

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
    <div className="progress-chart-container">
    <p className="legend-title"><strong>TIẾN ĐỘ CÁC HẠNG MỤC</strong></p>
    <div className="chart-and-legend">
      <div className="chart">
        <Doughnut data={dataChart} options={options} />
      </div>
      <div className="legend">
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
  <div className="legend-item">
    <div className="legend-color" style={{ backgroundColor: color }}></div>
    <span className="legend-label">{label}:</span>
    <strong>{value}</strong>
  </div>
);

export default ProgressChart;