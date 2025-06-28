import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend, 
  zoomPlugin
);

const ProductionChart = ({duAnThanhPhanId}) => {
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processedData, setProcessedData] = useState(null);
  const [selectedHangMuc, setSelectedHangMuc] = useState(null);
  const [lineData, setLineData] = useState({ labels: [], datasets: [] });
  const [barData, setBarData] = useState({ labels: [], datasets: [] });
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/hangMuc/${duAnThanhPhanId}/detail`);
        setProjectData(response.data);
        processApiData(response.data);
      } catch (err) {
        setError(err.message || 'Lỗi khi tải dữ liệu dự án');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [duAnThanhPhanId]);

  useEffect(() => {
    if (processedData) {
      initBarChart();
      if (processedData.hangMucList.length > 0) {
        setSelectedHangMuc(processedData.hangMucList[0].hangMucId);
      }
    }
  }, [processedData]);
  console.log("Hạng muc:", processedData);
  
  useEffect(() => {
    if (selectedHangMuc && processedData) {
      updateLineChart();
    }
  }, [selectedHangMuc, processedData]);

  const processApiData = (apiData) => {
    if (!apiData.success) {
      setError(apiData.message || 'API trả về lỗi');
      return;
    }

    let result = {
      projectInfo: {},
      hangMucList: [],
      statistics: {
        totalPlanned: 0,
        totalActual: 0,
        completionPercentage: "0.00"
      }
    };

    const isParentProject = apiData.data.duAnTong && apiData.data.duAnTong.danhSachDuAnCon;

    if (isParentProject) {
      const parentProject = apiData.data.duAnTong;    
      result.projectInfo = {
        id: parentProject.duAnId,
        name: parentProject.tenDuAn,
        startDate: parentProject.ngayBatDau,
        endDate: parentProject.ngayKetThuc,
        isParent: true
      };

      if (parentProject.danhSachGoiThauTrucTiep) {
        parentProject.danhSachGoiThauTrucTiep.forEach(goiThau => {
          goiThau.danhSachHangMuc.forEach(hangMuc => {
            result.hangMucList.push(createHangMucItem(hangMuc, goiThau));
          });
        });
      }

      if (parentProject.danhSachDuAnCon) {
        parentProject.danhSachDuAnCon.forEach(duAnCon => {
          if (duAnCon.danhSachGoiThau) {
            duAnCon.danhSachGoiThau.forEach(goiThau => {
              goiThau.danhSachHangMuc.forEach(hangMuc => {
                result.hangMucList.push(createHangMucItem(hangMuc, goiThau, duAnCon));
              });
            });
          }
        });
      }

      result.statistics = {
        totalPlanned: parentProject.tongKhoiLuongKeHoach,
        totalActual: parentProject.tongKhoiLuongThucHien,
        completionPercentage: parentProject.phanTramHoanThanh
      };
    } else if (apiData.data.duAnThanhPhan) {
      const childProject = apiData.data.duAnThanhPhan;
      const parentProject = apiData.data.duAnTong;
      
      result.projectInfo = {
        id: childProject.duAnId,
        name: childProject.tenDuAn,
        startDate: childProject.ngayBatDau,
        endDate: childProject.ngayKetThuc,
        isParent: false,
        parentInfo: parentProject ? {
          id: parentProject.duAnId,
          name: parentProject.tenDuAn
        } : null
      };

      if (childProject.danhSachGoiThau) {
        childProject.danhSachGoiThau.forEach(goiThau => {
          goiThau.danhSachHangMuc.forEach(hangMuc => {
            result.hangMucList.push(createHangMucItem(hangMuc, goiThau));
          });
        });
      }

      result.statistics = {
        totalPlanned: childProject.tongKhoiLuongKeHoach,
        totalActual: childProject.tongKhoiLuongThucHien,
        completionPercentage: childProject.phanTramHoanThanh
      };
    }

    setProcessedData(result);
  };

  const createHangMucItem = (hangMuc, goiThau, duAnCon = null) => {
    const baseItem = {
      hangMucId: hangMuc.hangMucId,
      tenHangMuc: hangMuc.tenHangMuc,
      loaiHangMuc: hangMuc.loaiHangMuc,
      goiThauId: goiThau.goiThauId,
      tenGoiThau: goiThau.tenGoiThau,
      nhaThau: goiThau.nhaThau,
      tongKhoiLuongKeHoach: hangMuc.tongKhoiLuongKeHoach,
      tongKhoiLuongThucHien: hangMuc.tongKhoiLuongThucHien,
      phanTramHoanThanh: hangMuc.phanTramHoanThanh,
      danhSachKeHoach: hangMuc.danhSachKeHoach.map(kh => ({
        keHoachId: kh.keHoachId,
        tenCongTac: kh.tenCongTac,
        khoiLuongKeHoach: kh.khoiLuongKeHoach,
        donViTinh: kh.donViTinh,
        ngayBatDau: kh.ngayBatDau,
        ngayKetThuc: kh.ngayKetThuc,
        ghiChu: kh.ghiChu,
        tenNhaThau: kh.tenNhaThau,
        tongKhoiLuongThucHien: kh.tongKhoiLuongThucHien,
        phanTramHoanThanh: kh.phanTramHoanThanh,
        tienDoThucHien: kh.tienDoThucHien.map(td => ({
          ...td,
          ngayCapNhat: td.NgayCapNhat,
          khoiLuongThucHien: td.KhoiLuongThucHien,
          nguoiCapNhat: td.NguoiCapNhat,
          ghiChu: td.GhiChu
        }))
      }))
    };

    if (duAnCon) {
      return {
        ...baseItem,
        duAnConId: duAnCon.duAnId,
        tenDuAnCon: duAnCon.tenDuAn
      };
    }

    return baseItem;
  };

  const initBarChart = () => {
    const labels = processedData.hangMucList.map(hm => hm.tenHangMuc);
    const plannedData = processedData.hangMucList.map(hm => hm.tongKhoiLuongKeHoach);
    const actualData = processedData.hangMucList.map(hm => hm.tongKhoiLuongThucHien);

    setBarData({
      labels: labels,
      datasets: [
        {
          label: 'Kế hoạch',
          data: plannedData,
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        },
        {
          label: 'Thực hiện',
          data: actualData,
          backgroundColor: 'rgba(75, 192, 192, 0.7)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }
      ]
    });
  };

  const updateLineChart = () => {
    // Reset chart nếu không có dữ liệu
    if (!processedData?.hangMucList?.length) {
      setLineData({
        labels: [],
        datasets: []
      });
      return;
    }
  
    const hangMuc = processedData.hangMucList.find(hm => hm.hangMucId === selectedHangMuc);
    
    // Nếu không tìm thấy hạng mục hoặc không có kế hoạch, reset chart
    if (!hangMuc || !hangMuc.danhSachKeHoach?.length) {
      setLineData({
        labels: [],
        datasets: []
      });
      return;
    }
  
    const currentYear = new Date().getFullYear();
    const allMonths = Array.from({ length: 12 }, (_, i) => `${i + 1}/${currentYear}`);
  
    const datasets = hangMuc.danhSachKeHoach.map((kh, index) => {
      // Kiểm tra dữ liệu kế hoạch hợp lệ
      if (!kh.tienDoThucHien || !Array.isArray(kh.tienDoThucHien)) {
        return {
          label: kh.tenCongTac || `Kế hoạch ${index + 1}`,
          data: Array(12).fill(0),
          borderColor: `hsl(${index * 360 / hangMuc.danhSachKeHoach.length}, 70%, 50%)`,
          backgroundColor: `hsl(${index * 360 / hangMuc.danhSachKeHoach.length}, 70%, 50%)`,
          tension: 0.1,
          fill: false,
          pointBackgroundColor: Array(12).fill('rgba(0,0,0,0)')
        };
      }
  
      const monthlyData = {};
      kh.tienDoThucHien.forEach(td => {
        if (!td.ngayCapNhat || !td.khoiLuongThucHien) return;
        
        try {
          const date = new Date(td.ngayCapNhat);
          if (isNaN(date.getTime())) return;
          
          const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
          if (date.getFullYear() === currentYear) {
            monthlyData[monthYear] = (monthlyData[monthYear] || 0) + (td.khoiLuongThucHien || 0);
          }
        } catch (e) {
          console.error('Lỗi xử lý ngày cập nhật:', e);
        }
      });
  
      const data = allMonths.map(monthYear => {
        const totalInMonth = monthlyData[monthYear] || 0;
        const khoiLuongKeHoach = parseFloat(kh.khoiLuongKeHoach) || 0;
        
        if (khoiLuongKeHoach > 0) {
          const percentage = parseFloat((totalInMonth / khoiLuongKeHoach * 100).toFixed(2));
          return Math.min(100, Math.max(0, percentage)); // Giới hạn 0-100%
        }
        return 0;
      });
  
      const color = `hsl(${index * 360 / hangMuc.danhSachKeHoach.length}, 70%, 50%)`;
  
      return {
        label: kh.tenCongTac || `Kế hoạch ${index + 1}`,
        data: data,
        borderColor: color,
        backgroundColor: color,
        tension: 0.1,
        fill: false,
        pointBackgroundColor: allMonths.map(monthYear => {
          return monthlyData[monthYear] ? color : 'rgba(0,0,0,0)';
        })
      };
    });
  
    setLineData({
      labels: allMonths.map(month => `Tháng ${month.split('/')[0]}`),
      datasets: datasets.filter(dataset => dataset !== null)
    });
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          boxWidth: 12,
          font: {
            size: 12,
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: 11,
          },
        },
      },
      y: {
        min: 0,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          },
          font: {
            size: 11,
          },
        },
      },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          boxWidth: 12,
          font: {
            size: 11,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.raw.toLocaleString()}`;
          }
        }
      },
      zoom: {
        limits: {
          x: { 
            min: 'original',  // Không nhỏ hơn kích thước gốc
            max: Infinity,     // Cho phép zoom in vô hạn
            minRange: 0.8     // Giới hạn zoom out tối đa (80% kích thước gốc)
          },
          y: { 
            min: 'original',  
            max: Infinity,
            minRange: 0.8
          }
        },
        zoom: {
          wheel: {
            enabled: true,
            speed: 0.1,    
          },
          pinch: {
            enabled: true
          },
          mode: 'xy',
        },
        pan: {
          enabled: true,
          mode: 'xy',
          threshold: 5 
        }
      }
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: 10,
          },
          maxRotation: 0,
          minRotation: 0,
          callback: function(value) {
            const label = this.getLabelForValue(value);
            return label.length > 15 ? label.substring(0, 12) + '...' : label;
          }
        },
        grid: {
          display: false
        }
      },
      y: {
        ticks: {
          font: {
            size: 10,
          },
          callback: function(value) {
            return value.toLocaleString();
          }
        },
        beginAtZero: true,
      }
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
    onHover: (event, chartElement) => {
      if (chartElement.length > 0) {
        event.native.target.style.cursor = 'pointer';
      } else {
        event.native.target.style.cursor = 'default';
      }
    }
  };

  if (loading) return <div className="loading">Đang tải dữ liệu...</div>;
  if (error) return <div className="error">Lỗi: {error}</div>;
  if (!processedData) return <div>Không có dữ liệu</div>;

  return (
    <div className="p-4 bg-white rounded shadow grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="h-80">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-sm font-semibold">Biểu đồ dữ liệu tiến độ của các kế hoạch</h2>
          <select
            className="text-sm border rounded p-1"
            value={selectedHangMuc || ''}
            onChange={(e) => setSelectedHangMuc(Number(e.target.value))}
          >
            {processedData.hangMucList.map(hm => (
              <option key={hm.hangMucId} value={hm.hangMucId}>
              {hm.tenHangMuc}
              </option>
            ))}
          </select>
        </div>
        <Line data={lineData} options={chartOptions} />
      </div>
      <div className="h-80">
        <h2 className="text-sm font-semibold mb-2">Biểu đồ kế hoạch và thực hiện: </h2>
        <Bar data={barData} options={barOptions} />
      </div>
    </div>
  );
};

export default ProductionChart;