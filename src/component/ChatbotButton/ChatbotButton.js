import React, { useState, useRef, useEffect } from 'react';
import { FaComment, FaTimes, FaDatabase } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import "./ChatbotButton.css";
import { useNavigate } from 'react-router-dom';


const ChatbotButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 'initial-bot-message', type: 'bot', text: 'Xin chào! Tôi có thể giúp gì cho bạn?' },
  ]);
  const [mcpBlocks, setMcpBlocks] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isMcpModalOpen, setIsMcpModalOpen] = useState(false);
  const messagesEndRef = useRef(null);

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
      const response = await fetch('http://localhost:3100/api/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userInput }),
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
    if (mcpBlocks.length === 0) return;
  
    const firstDataArray = mcpBlocks[0]?.data;
    if (Array.isArray(firstDataArray) && firstDataArray.length > 0) {
      const firstProject = firstDataArray[0];
      const projectId = firstProject?.DuAnID;
      console.log(projectId)
      if (typeof projectId === 'number') {
        // Chuyển về trang /home và truyền DuAnID (cách 1: qua state)
        console.log(1)
        navigate('/home', { state: { selectedDuAnId: projectId } });
      } else {
        console.warn('❌ Không tìm thấy DuAnID hợp lệ trong MCP');
      }
    } else {
      console.warn('❌ MCP Data không hợp lệ hoặc rỗng');
    }
  };
  
  // Đóng modal
  const handleCloseModal = () => {
    setIsMcpModalOpen(false);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <>
      {/* Nút mở/đóng chatbot */}
      <div
        className={`chatbot-button ${isOpen ? 'active' : ''}`}
        onClick={toggleChatbot}
        aria-label={isOpen ? 'Đóng chatbot' : 'Mở chatbot'}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleChatbot()}
      >
        {isOpen ? <FaTimes /> : <FaComment />}
      </div>

      {/* Panel chatbot */}
      {isOpen && (
        <div className="chatbot-panel">
          <div className="chatbot-header">
            <h3>Trợ lý ảo</h3>
            <button
              onClick={toggleChatbot}
              style={{
                position: 'absolute',
                right: '10px',
                top: '10px',
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '1.2em',
                cursor: 'pointer',
              }}
              aria-label="Đóng chatbot"
            >
              <FaTimes />
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={msg.type === 'bot' ? 'bot-message' : 'user-message'}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => (
                      <p style={{ whiteSpace: 'pre-wrap', marginBottom: '0px' }}>
                        {children}
                      </p>
                    ),
                    strong: ({ children }) => (
                      <strong style={{ fontWeight: 600 }}>{children}</strong>
                    ),
                    li: ({ children }) => (
                      <li style={{ marginLeft: '1.5rem', listStyleType: 'disc' }}>
                        {children}
                      </li>
                    ),
                  }}
                >
                  {normalizeMarkdown(msg.text)}
                </ReactMarkdown>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input">
            <input
              type="text"
              placeholder="Nhập câu hỏi của bạn..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />

            <button
              className="show-data-button"
              onClick={handleShowData}
              disabled={mcpBlocks.length === 0}
              title={mcpBlocks.length > 0 ? 'Hiển thị dữ liệu MCP' : 'Chưa có dữ liệu MCP'}
            >
              <FaDatabase />
            </button>
            <button onClick={handleSend}>Gửi</button>
          </div>
        </div>
      )}
      {mcpBlocks.length > 0 ? console.log(mcpBlocks) : ""}
      {/* Modal overlay hiển thị MCP Data */}
      {isMcpModalOpen && (
        <div className="mcp-modal-overlay" onClick={handleCloseModal}>
          <div
            className="mcp-modal-content"
            onClick={(e) => e.stopPropagation() /* Ngăn không cho click ngoài đóng */}
          >
            <div className="mcp-modal-header">
              <button onClick={handleCloseModal} aria-label="Đóng">
                <FaTimes />
              </button>
              <span>Thông tin MCP Data</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotButton;
