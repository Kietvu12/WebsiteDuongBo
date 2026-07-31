import React, { useState } from 'react';
import { FaTimes, FaPaperPlane } from 'react-icons/fa';

const HEADER_BG = '#0B2144';
const ACCENT_ORANGE = '#F58201';
const USER_BUBBLE = '#0B2144';

const DiamondIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <polygon points="12,2 22,12 12,22 2,12" />
  </svg>
);

const REPORT_TITLE =
  'B\u00c1O C\u00c1O D\u1ef0 \u00c1N \u0110\u01b0\u1eddng B\u1ed9 CAO T\u1ed0C B\u1eafc - NAM PH\u00cdA \u0110\u00d4NG GIAI \u0110O\u1ea0N 2017 - 2020';

const ChatbotButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [userInput, setUserInput] = useState('');

  const toggleChatbot = () => {
    setIsOpen((prev) => !prev);
    if (isOpen) setIsMinimized(false);
  };

  return (
    <>
      <button
        type="button"
        className={`fixed bottom-5 right-5 z-[10050] flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-colors ${
          isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-[#0B2144] hover:bg-[#152a4a]'
        }`}
        onClick={toggleChatbot}
        aria-label={isOpen ? 'Đóng chatbot' : 'Mở chatbot'}
      >
        {isOpen ? <FaTimes className="text-xl text-white" /> : <DiamondIcon className="h-7 w-7 text-white" />}
      </button>

      {isOpen && (
        <div
          className="fixed bottom-[5.25rem] right-5 z-[10050] flex w-[min(440px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-lg bg-white shadow-2xl ring-1 ring-black/10 sm:right-5"
          style={{ height: isMinimized ? 'auto' : 'min(800px, 88vh)' }}
        >
          <div
            className="flex shrink-0 items-center justify-between gap-2 px-3 py-3 text-white"
            style={{ backgroundColor: HEADER_BG }}
          >
            <div className="flex min-w-0 items-center gap-2">
              <DiamondIcon className="h-4 w-4 shrink-0 text-white" />
              <h2 className="truncate text-sm font-bold sm:text-base">Project Assistant Chatbot</h2>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-md text-white hover:bg-white/10"
                onClick={() => setIsMinimized((m) => !m)}
                aria-label={isMinimized ? 'Mở rộng' : 'Thu nhỏ'}
                title={isMinimized ? 'Mở rộng' : 'Thu nhỏ'}
              >
                <span className="block h-0.5 w-4 rounded-full bg-white" />
              </button>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-md text-white hover:bg-white/10"
                onClick={toggleChatbot}
                aria-label="Đóng"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <div className="min-h-0 flex-1 overflow-y-auto bg-[#f4f6f9] px-3 py-4">
                <div className="mb-6 flex flex-col items-end">
                  <div
                    className="mb-1 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white"
                    style={{ backgroundColor: HEADER_BG }}
                  >
                    R
                  </div>
                  <div
                    className="max-w-[92%] rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed text-white shadow-sm"
                    style={{ backgroundColor: USER_BUBBLE }}
                  >
                    Request: Generate a detailed progress report for the Vung Ang - Dong Phu sub-project and all
                    ongoing tender packages.
                  </div>
                </div>

                <div className="mb-6 flex gap-2">
                  <div
                    className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white shadow-sm"
                    style={{ backgroundColor: ACCENT_ORANGE }}
                  >
                    <DiamondIcon className="h-4 w-4 text-white" />
                  </div>
                  <div className="max-w-[calc(100%-3rem)] rounded-2xl rounded-tl-sm border border-gray-200 bg-[#e8edf3] px-4 py-3 text-sm leading-relaxed text-gray-800 shadow-sm">
                    <p className="mb-2 italic text-gray-500">searching project database...</p>
                    <p>
                      Analysis for GT-1: 95% Land Acquisition completed. Construction 80% on track under CP 479,
                      which is exceeding performance benchmarks. Verifying final contractor local subcontractor data for
                      GT-2 with main contractor Son Hai Group. Five minor land acquisition disputes identified near
                      Km610. Based on these factors, the overall sub-project progress is 1%. Data for GT-2 is still
                      pending initialization.
                    </p>
                  </div>
                </div>

                <div className="mb-2 flex gap-2">
                  <div
                    className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white shadow-sm"
                    style={{ backgroundColor: ACCENT_ORANGE }}
                  >
                    <DiamondIcon className="h-4 w-4 text-white" />
                  </div>
                  <div className="max-w-[calc(100%-3rem)] rounded-2xl rounded-tl-sm border border-gray-200 bg-[#e8edf3] px-4 py-3 text-sm leading-relaxed text-gray-800 shadow-sm">
                    <p className="mb-4">
                      A comprehensive detailed progress report (PDF) has been successfully generated and is now
                      available for download. I have included a preview of the first page below.
                    </p>
                    <div className="rounded-lg border border-sky-200/80 bg-white p-3 shadow-sm">
                      <p className="mb-3 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                        Detailed report preview (page 1)
                      </p>
                      <div className="mb-4 text-center">
                        <p className="mb-4 text-xs font-bold leading-snug sm:text-sm" style={{ color: HEADER_BG }}>
                          {REPORT_TITLE}
                        </p>
                        <div className="text-left text-xs text-gray-800 sm:text-sm">
                          <p className="mb-2 font-bold">1. Thông tin chung dự án</p>
                          <ul className="list-disc space-y-1 pl-5 text-gray-700">
                            <li>Tên dự án: Đường bộ cao tốc Bắc - Nam phía Đông</li>
                            <li>Tổng chiều dài tuyến: 729 km</li>
                            <li>Tổng mức đầu tư: 128.000 tỷ VNĐ</li>
                            <li>Chủ đầu tư: Bộ GTVT</li>
                            <li>Thời gian khởi công - hoàn thành: 2017 - 2020</li>
                          </ul>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
                        style={{ backgroundColor: ACCENT_ORANGE }}
                      >
                        <span aria-hidden>↓</span> Download Report (PDF)
                      </button>
                      <p className="mt-2 text-center text-[11px] text-gray-500">
                        File size: 1.2 MB. Format: PDF. Expires: 24h
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="shrink-0 border-t border-gray-200 bg-white p-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask about any project or package..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#0B2144] focus:outline-none focus:ring-2 focus:ring-[#0B2144]/20"
                  />
                  <button
                    type="button"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white shadow-sm transition hover:opacity-90"
                    style={{ backgroundColor: HEADER_BG }}
                    aria-label="Gửi"
                    onClick={() => setUserInput('')}
                  >
                    <FaPaperPlane className="text-sm" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ChatbotButton;
