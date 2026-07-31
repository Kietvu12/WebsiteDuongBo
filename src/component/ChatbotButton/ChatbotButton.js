import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { FaTimes, FaPaperPlane, FaDatabase, FaExpand, FaCompress } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../../contexts/ProjectContext';
import './ChatbotButton.css';

const HEADER_BG = '#0B2144';
const ACCENT_ORANGE = '#F58201';
const USER_BUBBLE = '#0B2144';

const CHAT_API_URL =
  process.env.REACT_APP_CHAT_API_URL ||
  (process.env.REACT_APP_API_BASE_URL
    ? process.env.REACT_APP_API_BASE_URL.replace('/api_dadb', '/api_ai_dadb_v2/api/stream')
    : 'http://210.245.52.119/api_ai_dadb_v2/api/stream');

const COLUMN_LABELS = {
  DuAnID: 'ID dự án',
  TenDuAn: 'Tên dự án',
  MaDuAn: 'Mã dự án',
  ParentID: 'ID dự án cha',
  TrangThai: 'Trạng thái',
  TienDo: 'Tiến độ',
  GiaTri: 'Giá trị',
  ChuDauTu: 'Chủ đầu tư',
  DiaDiem: 'Địa điểm',
  LoaiDuAn: 'Loại dự án',
};

const PREFERRED_COLUMNS = [
  'DuAnID',
  'TenDuAn',
  'MaDuAn',
  'ParentID',
  'TrangThai',
  'TienDo',
  'GiaTri',
  'ChuDauTu',
  'DiaDiem',
  'LoaiDuAn',
];

const DiamondIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <polygon points="12,2 22,12 12,22 2,12" />
  </svg>
);

const markdownComponents = {
  p: ({ children }) => <p className="mb-2 whitespace-pre-wrap last:mb-0">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  li: ({ children }) => <li className="ml-4 list-disc">{children}</li>,
  a: ({ href, children }) => (
    <a href={href} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
  table: ({ children }) => (
    <div className="chat-md-table-wrap">
      <table className="chat-md-table">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead>{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr>{children}</tr>,
  th: ({ children }) => <th>{children}</th>,
  td: ({ children }) => <td>{children}</td>,
  h3: ({ children }) => <h3>{children}</h3>,
  ul: ({ children }) => <ul>{children}</ul>,
  ol: ({ children }) => <ol className="ml-4 list-decimal">{children}</ol>,
};

const parseMcpBlocks = (arrMcp) => {
  if (!Array.isArray(arrMcp) || arrMcp.length === 0) return [];

  const newBlocks = [];
  for (let idx = 0; idx < arrMcp.length; idx++) {
    try {
      const rawOutput = arrMcp[idx]?.output;
      if (!rawOutput) continue;
      const parsedOutput = typeof rawOutput === 'string' ? JSON.parse(rawOutput) : rawOutput;

      if (parsedOutput.type === 'text' && typeof parsedOutput.text === 'string') {
        const parsedData = JSON.parse(parsedOutput.text);
        newBlocks.push({
          id: `final-mcp-${Date.now()}-${idx}`,
          title: `MCP Data ${idx + 1}`,
          data: parsedData,
        });
      }
    } catch (e) {
      console.warn('Lỗi khi parse MCP block:', e);
    }
  }
  return newBlocks;
};

const flattenMcpRows = (blocks) => {
  const rows = [];
  blocks.forEach((block) => {
    if (!block?.data) return;
    if (Array.isArray(block.data)) {
      block.data.forEach((item) => {
        if (item && typeof item === 'object') rows.push(item);
      });
    } else if (typeof block.data === 'object') {
      rows.push(block.data);
    }
  });
  return rows;
};

const getTableColumns = (rows) => {
  if (rows.length === 0) return [];
  const keySet = new Set();
  rows.forEach((row) => Object.keys(row).forEach((k) => keySet.add(k)));
  const keys = [...keySet];
  keys.sort((a, b) => {
    const ai = PREFERRED_COLUMNS.indexOf(a);
    const bi = PREFERRED_COLUMNS.indexOf(b);
    if (ai >= 0 && bi >= 0) return ai - bi;
    if (ai >= 0) return -1;
    if (bi >= 0) return 1;
    return a.localeCompare(b);
  });
  return keys;
};

const formatCellValue = (value) => {
  if (value == null) return '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

const McpDataTable = ({ rows, columns }) => {
  if (rows.length === 0) {
    return <p className="text-sm text-gray-500">Không có dữ liệu để hiển thị.</p>;
  }

  return (
    <div className="mcp-data-table-wrap">
      <table className="mcp-data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col}>{COLUMN_LABELS[col] || col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIdx) => (
            <tr key={row.DuAnID ?? rowIdx}>
              {columns.map((col) => (
                <td key={`${rowIdx}-${col}`}>{formatCellValue(row[col])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ChatbotButton = () => {
  const { user } = useProject();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMcpModalOpen, setIsMcpModalOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 'initial-bot-message', type: 'bot', text: 'Xin chào! Tôi có thể giúp gì cho bạn?' },
  ]);
  const [mcpBlocks, setMcpBlocks] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  const userInitial =
    user?.HoTen?.charAt(0)?.toUpperCase() ||
    user?.TenNguoiDung?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    'U';

  const userDisplayName =
    user?.HoTen || user?.TenNguoiDung || user?.email?.split('@')[0] || 'Người dùng';

  const conversationId = String(user?.NguoiDungID || user?.email || 'dadb-user');

  const mcpRows = useMemo(() => flattenMcpRows(mcpBlocks), [mcpBlocks]);
  const mcpColumns = useMemo(() => getTableColumns(mcpRows), [mcpRows]);

  const toggleChatbot = () => {
    if (isOpen) {
      setIsMinimized(false);
      setIsExpanded(false);
      setIsMcpModalOpen(false);
    }
    setIsOpen((prev) => !prev);
  };

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleStreamEvent = (parsed, botId, finalResponseRef) => {
    if (finalResponseRef.current) return;

    switch (parsed.type) {
      case 'text_delta':
        if (typeof parsed.content === 'string') {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botId ? { ...msg, text: msg.text + parsed.content } : msg
            )
          );
        }
        break;

      case 'final_agent_response': {
        const finalText = parsed.content?.natural_language;
        if (typeof finalText === 'string' && finalText.trim()) {
          setMessages((prev) =>
            prev.map((msg) => (msg.id === botId ? { ...msg, text: finalText } : msg))
          );
        }

        const arrMcp = parsed?.content?.mcp_data ?? parsed?.mcp_data ?? [];
        const newBlocks = parseMcpBlocks(arrMcp);
        if (newBlocks.length > 0) {
          setMcpBlocks((prev) => [...prev, ...newBlocks]);
        }
        finalResponseRef.current = true;
        break;
      }

      case 'error': {
        const errMsg = parsed.message || 'Có lỗi từ server';
        setMessages((prev) => [
          ...prev.filter((msg) => msg.id !== botId),
          { id: Date.now() + '-error', type: 'bot', text: `Lỗi: ${errMsg}` },
        ]);
        finalResponseRef.current = true;
        break;
      }

      default:
        break;
    }
  };

  const handleSend = async () => {
    const trimmed = userInput.trim();
    if (!trimmed || isSending) return;

    setMcpBlocks([]);
    if (isMcpModalOpen) setIsMcpModalOpen(false);

    const userMessage = { id: `${Date.now()}-user`, type: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setUserInput('');

    const botId = `${Date.now()}-bot`;
    setMessages((prev) => [...prev, { id: botId, type: 'bot', text: '' }]);
    scrollToBottom();

    setIsSending(true);
    const finalResponseRef = { current: false };

    try {
      const response = await fetch(CHAT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          conversation_id: conversationId,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Lỗi kết nối tới server AI hoặc không có phản hồi');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          try {
            handleStreamEvent(JSON.parse(line), botId, finalResponseRef);
          } catch {
            /* skip malformed line */
          }
        }

        buffer = lines[lines.length - 1];
        scrollToBottom();
      }

      if (buffer.trim()) {
        try {
          handleStreamEvent(JSON.parse(buffer.trim()), botId, finalResponseRef);
        } catch {
          /* ignore trailing parse error */
        }
        scrollToBottom();
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botId && !msg.text
            ? { ...msg, text: 'Không nhận được phản hồi từ hệ thống.' }
            : msg
        )
      );
    } catch (error) {
      console.error('Lỗi khi gửi tin nhắn:', error);
      setMessages((prev) => [
        ...prev.filter((msg) => msg.id !== botId),
        {
          id: `${Date.now()}-error`,
          type: 'bot',
          text: `Đã xảy ra lỗi khi gọi API: ${error.message}`,
        },
      ]);
    } finally {
      setIsSending(false);
      scrollToBottom();
    }
  };

  const handleShowData = () => {
    if (mcpBlocks.length === 0) {
      alert('Chưa có dữ liệu dự án để hiển thị. Hãy hỏi chatbot về dự án trước.');
      return;
    }

    try {
      const projects = { main: [], sub: {} };

      mcpBlocks.forEach((block) => {
        if (!block?.data) return;
        const { data } = block;

        const collect = (item) => {
          if (!item?.DuAnID) return;
          if (item.ParentID == null || item.ParentID === undefined) {
            projects.main.push(item.DuAnID);
          } else {
            if (!projects.sub[item.ParentID]) projects.sub[item.ParentID] = [];
            projects.sub[item.ParentID].push(item.DuAnID);
          }
        };

        if (Array.isArray(data)) data.forEach(collect);
        else collect(data);
      });

      setIsMcpModalOpen(false);

      if (projects.main.length > 0 && Object.keys(projects.sub).length === 0) {
        navigate(`/home?DuAnIDs=${projects.main.join(',')}`);
      } else if (projects.main.length === 0 && Object.keys(projects.sub).length === 1) {
        const parentId = Object.keys(projects.sub)[0];
        navigate(`/side-project/${parentId}?DuAnConIDs=${projects.sub[parentId].join(',')}`);
      } else if (projects.main.length > 0 || Object.keys(projects.sub).length > 0) {
        if (projects.main.length > 0) {
          navigate(`/home?DuAnIDs=${projects.main.join(',')}`);
        } else {
          const parentId = Object.keys(projects.sub)[0];
          navigate(`/side-project/${parentId}?DuAnConIDs=${projects.sub[parentId].join(',')}`);
        }
      } else {
        alert('Không tìm thấy ID dự án nào trong dữ liệu');
      }
    } catch (error) {
      console.error('Lỗi xử lý dữ liệu:', error);
      alert('Đã xảy ra lỗi khi xử lý dữ liệu');
    }
  };

  const handleOpenMcpModal = () => {
    if (mcpBlocks.length === 0) {
      alert('Chưa có dữ liệu dự án. Hãy hỏi chatbot về dự án trước.');
      return;
    }
    setIsMcpModalOpen(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const panelHeight = isMinimized
    ? 'auto'
    : isExpanded
      ? 'calc(100vh - 1.5rem)'
      : 'min(800px, 88vh)';

  return (
    <>
      {!isExpanded && (
        <button
          type="button"
          className={`fixed bottom-5 right-5 z-[10050] flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-colors ${
            isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-[#0B2144] hover:bg-[#152a4a]'
          }`}
          onClick={toggleChatbot}
          aria-label={isOpen ? 'Đóng chatbot' : 'Mở chatbot'}
        >
          {isOpen ? (
            <FaTimes className="text-xl text-white" />
          ) : (
            <DiamondIcon className="h-7 w-7 text-white" />
          )}
        </button>
      )}

      {isOpen && (
        <div
          className={`fixed z-[10050] flex flex-col overflow-hidden bg-white shadow-2xl ring-1 ring-black/10 transition-all duration-300 ${
            isExpanded
              ? 'inset-3 rounded-xl sm:inset-5'
              : 'bottom-[5.25rem] right-5 w-[min(440px,calc(100vw-1.5rem))] rounded-lg sm:right-5'
          }`}
          style={{ height: panelHeight }}
        >
          <div
            className="flex shrink-0 items-center justify-between gap-2 px-3 py-3 text-white"
            style={{ backgroundColor: HEADER_BG }}
          >
            <div className="flex min-w-0 items-center gap-2">
              <DiamondIcon className="h-4 w-4 shrink-0 text-white" />
              <h2 className="truncate text-sm font-bold sm:text-base">Project Assistant Chatbot</h2>
              {isExpanded && (
                <span className="hidden rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium sm:inline">
                  Toàn màn hình
                </span>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-md text-white hover:bg-white/10"
                onClick={() => {
                  setIsExpanded((v) => !v);
                  if (isMinimized) setIsMinimized(false);
                }}
                title={isExpanded ? 'Thu nhỏ' : 'Phóng to'}
                aria-label={isExpanded ? 'Thu nhỏ' : 'Phóng to'}
              >
                {isExpanded ? <FaCompress /> : <FaExpand />}
              </button>
              {!isExpanded && (
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-md text-white hover:bg-white/10"
                  onClick={() => setIsMinimized((m) => !m)}
                  aria-label={isMinimized ? 'Mở rộng' : 'Thu nhỏ'}
                >
                  <span className="block h-0.5 w-4 rounded-full bg-white" />
                </button>
              )}
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
              <div
                className={`min-h-0 flex-1 overflow-y-auto bg-[#f4f6f9] ${
                  isExpanded ? 'px-6 py-5' : 'px-3 py-4'
                }`}
              >
                {messages.map((msg) =>
                  msg.type === 'user' ? (
                    <div key={msg.id} className="mb-4 flex flex-col items-end">
                      <div
                        className="mb-1 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white"
                        style={{ backgroundColor: HEADER_BG }}
                      >
                        {userInitial}
                      </div>
                      <div
                        className={`rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed text-white shadow-sm ${
                          isExpanded ? 'max-w-[min(720px,85%)]' : 'max-w-[92%]'
                        }`}
                        style={{ backgroundColor: USER_BUBBLE }}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ) : (
                    <div
                      key={msg.id}
                      className={`mb-4 flex gap-2 ${isExpanded ? 'max-w-[min(960px,100%)]' : ''}`}
                    >
                      <div
                        className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white shadow-sm"
                        style={{ backgroundColor: ACCENT_ORANGE }}
                      >
                        <DiamondIcon className="h-4 w-4 text-white" />
                      </div>
                      <div
                        className={`chat-bot-markdown min-w-0 rounded-2xl rounded-tl-sm border border-gray-200 bg-[#e8edf3] px-4 py-3 text-sm leading-relaxed text-gray-800 shadow-sm ${
                          isExpanded ? 'flex-1' : 'max-w-[calc(100%-3rem)]'
                        }`}
                      >
                        {!msg.text && isSending ? (
                          <p className="italic text-gray-500">Đang tìm kiếm dữ liệu dự án...</p>
                        ) : (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                            components={markdownComponents}
                          >
                            {msg.text || ' '}
                          </ReactMarkdown>
                        )}
                      </div>
                    </div>
                  )
                )}
                <div ref={messagesEndRef} />
              </div>

              <div
                className={`shrink-0 border-t border-gray-200 bg-white ${
                  isExpanded ? 'px-6 py-4' : 'p-3'
                }`}
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask about any project or package..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isSending}
                    className={`min-w-0 flex-1 rounded-lg border border-gray-300 text-gray-800 placeholder:text-gray-400 focus:border-[#0B2144] focus:outline-none focus:ring-2 focus:ring-[#0B2144]/20 disabled:bg-gray-50 ${
                      isExpanded ? 'px-4 py-3 text-base' : 'px-3 py-2.5 text-sm'
                    }`}
                  />
                  <button
                    type="button"
                    className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-gray-50 text-gray-600 transition hover:bg-gray-100 disabled:opacity-50"
                    onClick={handleOpenMcpModal}
                    disabled={mcpBlocks.length === 0}
                    title={
                      mcpBlocks.length > 0
                        ? `Xem bảng dữ liệu (${mcpRows.length} dòng)`
                        : 'Chưa có dữ liệu dự án từ chatbot'
                    }
                    aria-label="Xem dữ liệu dạng bảng"
                  >
                    <FaDatabase />
                    {mcpRows.length > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#F58201] px-1 text-[9px] font-bold text-white">
                        {mcpRows.length}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: HEADER_BG }}
                    aria-label="Gửi"
                    onClick={handleSend}
                    disabled={isSending || !userInput.trim()}
                  >
                    <FaPaperPlane className="text-sm" />
                  </button>
                </div>
                <p className="mt-2 truncate text-center text-[10px] text-gray-400">
                  {userDisplayName} · {isSending ? 'Đang xử lý...' : 'Sẵn sàng'}
                  {mcpRows.length > 0 && !isSending && ` · ${mcpRows.length} bản ghi MCP`}
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {isMcpModalOpen && (
        <div
          className="mcp-modal-overlay"
          onClick={() => setIsMcpModalOpen(false)}
          role="presentation"
        >
          <div
            className="mcp-modal-content"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="mcp-modal-title"
          >
            <div className="mcp-modal-header">
              <div>
                <h3 id="mcp-modal-title" className="text-base font-bold">
                  Dữ liệu dự án từ chatbot
                </h3>
                <p className="mt-0.5 text-xs text-white/75">
                  {mcpRows.length} bản ghi · {mcpBlocks.length} nguồn MCP
                </p>
              </div>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/10"
                onClick={() => setIsMcpModalOpen(false)}
                aria-label="Đóng"
              >
                <FaTimes />
              </button>
            </div>

            <div className="mcp-modal-body">
              {mcpBlocks.length > 1 && (
                <p className="mb-3 text-xs text-gray-500">
                  Gộp {mcpBlocks.length} khối dữ liệu MCP thành một bảng.
                </p>
              )}
              <McpDataTable rows={mcpRows} columns={mcpColumns} />
            </div>

            <div className="mcp-modal-footer">
              <button
                type="button"
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setIsMcpModalOpen(false)}
              >
                Đóng
              </button>
              <button
                type="button"
                className="rounded-lg px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                style={{ backgroundColor: HEADER_BG }}
                onClick={handleShowData}
              >
                Mở trên danh sách dự án
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotButton;
