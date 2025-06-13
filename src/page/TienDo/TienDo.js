import React, { useState, useRef, useEffect } from 'react';
import userIcon from '../../assets/img/user-icon.png';
import { FaPaperclip, FaDownload,FaList, FaBook, FaWrench, FaDollarSign, FaAlignLeft, FaTasks, FaExclamationCircle, FaEdit, FaHandLizard } from "react-icons/fa";
import FileIcon from '../../component/FileIcon/FileIcon';

const initialFiles = [
  {
    name: "tmp_Screenshot_20221221-211857_Shopee6861633387341983841.jpg",
    uploader: "Kĩ Thuật",
    date: "27/02/2023 11:05",
  },
  {
    name: "tmp_Screenshot_20230219-085638_Facebook8781308264499010376.jpg",
    uploader: "Kĩ Thuật",
    date: "27/02/2023 11:05",
  },
];

export default function TienDo() {
  const tabs = ['Tổng quan', 'Dự trù', 'Thống kê', 'Thu chi', 'Nhật ký thi công'];
  const tabsIcons = [
    <FaBook className="w-4 h-4 md:w-5 md:h-5" />,
    <FaHandLizard className="w-4 h-4 md:w-5 md:h-5" />,
    <FaWrench className="w-4 h-4 md:w-5 md:h-5" />,
    <FaDollarSign className="w-4 h-4 md:w-5 md:h-5" />,
    <FaEdit className="w-4 h-4 md:w-5 md:h-5" />
  ];
  const [activeTab, setActiveTab] = useState(0);
  const [open, setOpen] = useState(true);

  const fileInputRef = useRef(null);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    setFiles(initialFiles);
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const uploadedFiles = Array.from(e.target.files).map((file) => ({
      name: file.name,
      uploader: "Bạn",
      date: new Date().toLocaleString("vi-VN"),
    }));
    setFiles((prev) => [...prev, ...uploadedFiles]);
  };

  return (
    <div className="min-h-screen bg-gray-200 p-6 pt-3">
      {/* Header */}
      <div className="bg-white rounded shadow p-4 md:p-6 mb-4 md:mb-6 mt-12 md:mt-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4">
          <div className="flex flex-col gap-2 md:gap-3">
            <h2 className="font-semibold text-lg md:text-xl text-gray-700 mb-1 md:mb-2 flex items-center gap-2">
              <FaExclamationCircle className="w-4 h-4 md:w-5 md:h-5"/> 
              <span className="text-sm md:text-base lg:text-xl">Đào xúc đất bằng máy đào 1,25m3, đất cấp I</span>
            </h2>
            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-600">
              <span>Mã số: <b className="text-teal-500">AB.24131</b></span>
              <span>Dự án: <b className="whitespace-nowrap">Công Trình Phụ KCN Hòa Phúc</b></span>
              <span>Công việc cha: <b>SAN NỀN</b></span>
              <span>Chế độ: <b className="text-teal-500">Nội bộ</b></span>
            </div>
          </div>
        </div>
        {/* Timeline */}
        <div className="mt-3 flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm">
          <span className="px-2 py-1 bg-green-100 rounded whitespace-nowrap">1 ngày</span>
          <span className="px-2 py-1 bg-blue-100 text-blue-500 rounded whitespace-nowrap">27/02/2023</span>
          <span className="px-2 py-1 bg-red-100 text-red-500 rounded whitespace-nowrap">03/03/2023</span>
          <span className="px-2 py-1 bg-green-500 text-white rounded whitespace-nowrap">Hoàn thành</span>
          <span className="px-2 py-1 bg-green-500 text-white rounded whitespace-nowrap">100%</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 md:gap-6 items-start">
        {/* Sidebar */}
        <aside className="w-full lg:w-1/4 bg-white rounded shadow p-3 md:p-4 space-y-4 md:space-y-6">
          <div>
            <h3 className="font-semibold text-sm md:text-base text-gray-700 mb-2">Danh sách người thực hiện</h3>
            <div className="flex items-center gap-2">
              <img
                src={userIcon}
                alt="Avatar"
                className="w-6 h-6 md:w-8 md:h-8 rounded-full object-cover"
              />
              <span className="text-xs md:text-sm">Kĩ Thuật (KĨ THUẬT)</span>
            </div>
          </div> 
          <div className="mb-3 md:mb-4">
            <h3 className="font-semibold text-sm md:text-base text-gray-700 mb-2">Thông tin người giao việc</h3>
            <div className="flex mb-1 text-xs md:text-sm">
              <span className="w-24 md:w-32 text-gray-600">Người giao:</span>
              <span>Trần Văn Bằng</span>
            </div>
            <div className="flex mb-1 text-xs md:text-sm">
              <span className="w-24 md:w-32 text-gray-600">Ngày giao:</span>
              <span>27/02/2023</span>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <section className="w-full lg:w-3/4 bg-white rounded shadow">
          {/* Tabs - Responsive with horizontal scroll on small screens */}
          <div className="overflow-x-auto">
            <nav className="flex border-b mb-4 w-max min-w-full">
              {tabs.map((tab, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTab(idx)}
                  className={`flex items-center gap-1 py-2 px-3 md:px-4 -mb-px border-b-4 font-medium transition-all duration-200 text-sm md:text-base ${
                    activeTab === idx
                      ? 'border-teal-500 text-teal-500'
                      : 'border-transparent text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {tabsIcons[idx]}
                  <span>{tab}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div className="space-y-4 md:space-y-6 p-3 md:p-6">
            {/* Description */}
            <div>
              <label className="font-semibold text-sm md:text-base text-gray-700 mb-2 flex items-center gap-2 pb-2">
                <FaAlignLeft className="w-4 h-4 md:w-5 md:h-5" />
                Mô tả
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 resize-none text-xs md:text-sm"
                rows={1}
                placeholder="Thêm mô tả chi tiết hơn ..."
              />
            </div>

            {/* Sub-tasks */}
            <div className="flex items-start justify-between">
              <h4 className="font-semibold text-sm md:text-base text-gray-700 mb-2 flex items-center gap-2">
                <FaTasks className="w-4 h-4 md:w-5 md:h-5"/> 
                <span>Công việc con - phụ thuộc</span>
              </h4>
              <button className="bg-blue-300 p-1 md:p-2 rounded">
                <FaList className="w-3 h-3 md:w-4 md:h-4" />
              </button>
            </div>

            {/* Attachments */}
            <div>
              <div className="flex items-start justify-between pt-2">
                <h4 className="font-semibold text-sm md:text-base text-gray-700 mb-2 flex items-center gap-2">
                  <FaPaperclip className="w-4 h-4 md:w-5 md:h-5"/> 
                  <span>Tập tin đính kèm</span>
                  <span className="text-gray-500 text-xs md:text-sm">({files.length} tệp đính kèm)</span>
                </h4>
                <div className="flex items-center gap-1 md:gap-2">
                  <button className="bg-blue-300 p-1 md:p-2 rounded">
                    <FaDownload className="w-3 h-3 md:w-4 md:h-4" />
                  </button>
                  <button className="bg-blue-300 p-1 md:p-2 rounded">
                    <FaList className="w-3 h-3 md:w-4 md:h-4" />
                  </button>
                </div>
              </div>

              {/* File list */}
              <div className="mt-2 space-y-2">
                {files.map((file, index) => {
                  const extension = file.name.split('.').pop().toLowerCase();
                  
                  return (
                    <button
                      key={index}
                      className="flex items-center py-1 md:py-2 px-2 md:px-3 bg-gray-50 hover:bg-gray-100 rounded w-full"
                    >
                      <div className="w-8 h-8 md:w-10 md:h-10 mr-2 md:mr-4 flex items-center justify-center">
                        <FileIcon extension={extension} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs md:text-sm text-gray-800 text-left truncate">{file.name}</div>
                        <div className="text-xs text-gray-500 text-left truncate">
                          {file.uploader} - {file.date}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </section>
      </div>
    </div>
  );
}