import React, { useState, useRef, useEffect } from 'react';
import { FaComment, FaTimes, FaDatabase } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import "./ChatbotButton.css";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import aiLogo from '../../assets/img/ai.png'


const ChatbotButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 'initial-bot-message', type: 'bot', text: 'Xin chào! Tôi có thể giúp gì cho bạn?' },
  ]);
  const [mcpBlocks, setMcpBlocks] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isMcpModalOpen, setIsMcpModalOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const [selectedDuAnId, setSelectedDuAnId] = useState(null);

  const toggleChatbot = () => {
    // Khi đóng chatbot, nếu modal đang mở, cũng đóng modal
    if (isMcpModalOpen) {
      setIsMcpModalOpen(false);
    }
    setIsOpen(prev => !prev);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Chuẩn hoá Markdown cho ReactMarkdown
  const normalizeMarkdown = (text) => {
    if (typeof text !== 'string') return '';
    return text;
  };

  const handleSend = async () => {
    if (!userInput.trim()) return;

    // Xóa sạch mcpBlocks cũ khi gửi prompt mới
    setMcpBlocks([]);
    // Nếu modal đang mở, đóng nó (dù chat vẫn ở trạng thái mở)
    if (isMcpModalOpen) setIsMcpModalOpen(false);

    const userMessage = { id: Date.now() + '-user', type: 'user', text: userInput };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');

    const botId = Date.now() + '-bot';
    const botPlaceholder = { id: botId, type: 'bot', text: '' };
    setMessages(prev => [...prev, botPlaceholder]);
    scrollToBottom();

    let finalResponseReceived = false;

    try {
      const response = await fetch('http://210.245.52.119/api_ai_dadb/api/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userInput , conversation_id: "Kiet"}),
      });
      if (!response.ok || !response.body) {
        throw new Error('Lỗi kết nối tới server hoặc không có body');
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

          let parsed;
          try { parsed = JSON.parse(line); }
          catch { continue; }

          if (finalResponseReceived) continue;

          switch (parsed.type) {
            case 'text_delta':
              if (typeof parsed.content === 'string') {
                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === botId
                      ? { ...msg, text: msg.text + parsed.content }
                      : msg
                  )
                );
              }
              break;
            case 'final_agent_response':
              if (parsed.content && typeof parsed.content.natural_language === 'string') {
                // Cập nhật phản hồi từ bot
                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === botId
                      ? { ...msg, text: parsed.content.natural_language }
                      : msg
                  )
                );
                finalResponseReceived = true;
              }

              const arrMcp = parsed?.content?.mcp_data ?? parsed?.mcp_data ?? [];

              if (Array.isArray(arrMcp) && arrMcp.length > 0) {
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

                if (newBlocks.length > 0) {
                  setMcpBlocks(prev => [...prev, ...newBlocks]);
                }
              } else {
                console.log('❌ Không có mcp_data hoặc không phải array:', arrMcp);
              }

              break;

            case 'error':
              const errMsg = parsed.message || 'Có lỗi từ server';
              setMessages(prev => [
                ...prev.filter(msg => msg.id !== botId),
                { id: Date.now() + '-error', type: 'bot', text: 'Lỗi: ' + errMsg },
              ]);
              finalResponseReceived = true;
              break;

            default:
              break;
          }
        }

        buffer = lines[lines.length - 1];
        scrollToBottom();
      }

      // Xử lý buffer còn lại (nếu có)
      if (buffer.trim()) {
        try {
          const parsed = JSON.parse(buffer.trim());
          if (
            parsed.type === 'final_agent_response' &&
            parsed.content &&
            typeof parsed.content.natural_language === 'string'
          ) {
            setMessages(prev =>
              prev.map(msg =>
                msg.id === botId
                  ? { ...msg, text: parsed.content.natural_language }
                  : msg
              )
            );
            const arrMcp = parsed?.content?.mcp_data ?? parsed?.mcp_data ?? [];

            if (Array.isArray(arrMcp) && arrMcp.length > 0) {
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

              if (newBlocks.length > 0) {
                setMcpBlocks(prev => [...prev, ...newBlocks]);
              }
            } else {
              console.log('❌ Không có mcp_data hoặc không phải array:', arrMcp);
            }

            finalResponseReceived = true;
          }
        } catch {
          // Bỏ qua lỗi parse cuối
        }
        scrollToBottom();
      }
    } catch (error) {
      console.error('Lỗi khi gửi tin nhắn:', error);
      setMessages(prev => [
        ...prev.filter(msg => msg.id !== botId),
        {
          id: Date.now() + '-error',
          type: 'bot',
          text: 'Đã xảy ra lỗi khi gọi API: ' + error.message,
        },
      ]);
      scrollToBottom();
    }
  };

  const navigate = useNavigate();

  const handleShowData = () => {
    console.log("Button clicked, mcpBlocks:", mcpBlocks);
    
    if (mcpBlocks.length === 0) {
      alert("Chưa có dữ liệu để hiển thị");
      return;
    }

    try {
      // Tạo object để phân loại dự án
      const projects = {
        main: [], // Các dự án chính (ParentID == null)
        sub: {}   // Các dự án phụ, theo dạng { parentId: [childIds] }
      };
      
      // Duyệt qua tất cả các block trong mcpBlocks
      mcpBlocks.forEach((block, blockIndex) => {
        console.log(`Đang xử lý block ${blockIndex}:`, block);
        
        if (block && block.data) {
          const data = block.data;
          
          // Trường hợp 1: data là mảng các đối tượng
          if (Array.isArray(data)) {
            data.forEach(item => {
              if (item.DuAnID) {
                // Kiểm tra xem là dự án chính hay phụ
                if (item.ParentID == null || item.ParentID === undefined) {
                  // Dự án chính
                  projects.main.push(item.DuAnID);
                } else {
                  // Dự án phụ
                  if (!projects.sub[item.ParentID]) {
                    projects.sub[item.ParentID] = [];
                  }
                  projects.sub[item.ParentID].push(item.DuAnID);
                }
              }
            });
          } 
          // Trường hợp 2: data là đối tượng có chứa DuAnID
          else if (data.DuAnID) {
            if (data.ParentID == null || data.ParentID === undefined) {
              // Dự án chính
              projects.main.push(data.DuAnID);
            } else {
              // Dự án phụ
              if (!projects.sub[data.ParentID]) {
                projects.sub[data.ParentID] = [];
              }
              projects.sub[data.ParentID].push(data.DuAnID);
            }
          }
        }
      });
      
      
      // Xử lý điều hướng dựa trên phân loại
      
      // Trường hợp 1: Chỉ có dự án chính
      if (projects.main.length > 0 && Object.keys(projects.sub).length === 0) {
        const queryString = projects.main.join(',');
        navigate(`/home?DuAnIDs=${queryString}`);
      }
      // Trường hợp 2: Chỉ có dự án phụ thuộc vào 1 dự án cha
      else if (projects.main.length === 0 && Object.keys(projects.sub).length === 1) {
        const parentId = Object.keys(projects.sub)[0];
        const childIds = projects.sub[parentId].join(',');
        navigate(`/side-project/${parentId}?DuAnConIDs=${childIds}`);
      }
      // Trường hợp 3: Có cả dự án chính và phụ hoặc nhiều dự án phụ khác nhau
      else if (projects.main.length > 0 || Object.keys(projects.sub).length > 0) {
        // Ưu tiên dự án chính
        if (projects.main.length > 0) {
          const queryString = projects.main.join(',');
          navigate(`/home?DuAnIDs=${queryString}`);
        } 
        // Nếu không có dự án chính, lấy dự án phụ đầu tiên
        else {
          const parentId = Object.keys(projects.sub)[0];
          const childIds = projects.sub[parentId].join(',');
          navigate(`/side-project/${parentId}?DuAnConIDs=${childIds}`);
        }
      } else {
        alert("Không tìm thấy ID dự án nào trong dữ liệu");
      }
    } catch (error) {
      console.error("Lỗi xử lý dữ liệu:", error);
      alert("Đã xảy ra lỗi khi xử lý dữ liệu");
    }
  };
  
  // Đóng modal
  const handleCloseModal = () => {
    setIsMcpModalOpen(false);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const id = sessionStorage.getItem('selectedDuAnId');
    if (id) setSelectedDuAnId(Number(id));
  }, []);

  return (
<>
  <div
    className={`fixed bottom-5 right-5 w-14 h-14 rounded-full flex items-center justify-center cursor-pointer shadow-md z-50 transition-all duration-300 ${
      isOpen ? 'bg-red-500' : 'bg-blue-600'
    }`}
    onClick={toggleChatbot}
    aria-label={isOpen ? 'Đóng chatbot' : 'Mở chatbot'}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleChatbot()}
  >
    {isOpen ? (
      <FaTimes className="text-white text-xl" />
    ) : (
      <img src={aiLogo} alt="AI Logo" className="w-10 h-10 object-contain" />
    )}
  </div>

  {/* Chatbot panel */}
  {isOpen && (
    <div className="fixed bottom-20 right-5 w-80 h-[70vh] bg-white rounded-lg shadow-xl flex flex-col z-50 overflow-hidden md:w-96 sm:right-2 sm:bottom-16 sm:w-[calc(100%-16px)]">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 text-center relative">
        <h3 className="text-lg font-medium">Trợ lý ảo</h3>
        <button
          onClick={toggleChatbot}
          className="absolute right-2 top-2 bg-transparent border-none text-white text-xl p-1 cursor-pointer"
          aria-label="Đóng chatbot"
        >
          <FaTimes />
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-3 p-3 rounded-2xl max-w-[80%] break-words ${
              msg.type === 'bot'
                ? 'bg-gray-200 mr-auto rounded-bl-none'
                : 'bg-blue-600 text-white ml-auto rounded-br-none'
            }`}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => (
                  <p className="whitespace-pre-wrap mb-0">{children}</p>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold">{children}</strong>
                ),
                li: ({ children }) => (
                  <li className="ml-6 list-disc">{children}</li>
                ),
              }}
            >
              {normalizeMarkdown(msg.text)}
            </ReactMarkdown>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-3 bg-white border-t border-gray-200">
  <div className="flex gap-2 items-stretch">
    <input
      type="text"
      placeholder="Nhập câu hỏi của bạn..."
      value={userInput}
      onChange={(e) => setUserInput(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
      className="flex-1 min-w-0 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <button
      className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
      onClick={handleShowData}
      title={mcpBlocks.length > 0 ? 'Hiển thị dữ liệu MCP' : 'Chưa có dữ liệu MCP'}
      aria-label="Hiển thị dữ liệu"
    >
      <FaDatabase />
    </button>
    <button
      onClick={handleSend}
      className="flex-shrink-0 px-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors whitespace-nowrap"
    >
      Gửi
    </button>
  </div>
</div>

    </div>
  )}

  {/* MCP Modal */}
  {isMcpModalOpen && (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleCloseModal}
    >
      <div
        className="bg-white rounded-lg w-full max-w-md max-h-[80vh] overflow-auto mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <button
            onClick={handleCloseModal}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Đóng"
          >
            <FaTimes />
          </button>
          <span className="font-semibold">Thông tin MCP Data</span>
        </div>
        {/* Modal content would go here */}
      </div>
    </div>
  )}
</>
  );
};

export default ChatbotButton;