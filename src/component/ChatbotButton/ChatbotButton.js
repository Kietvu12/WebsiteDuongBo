import React, { useState, useRef, useEffect } from 'react';
import { FaComment, FaTimes } from 'react-icons/fa';
import './ChatbotButton.css';

const ChatbotButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Xin chào! Tôi có thể giúp gì cho bạn?' },
  ]);
  const [userInput, setUserInput] = useState('');
  const messagesEndRef = useRef(null);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Hàm xử lý dữ liệu từ API
  const processApiResponse = (data) => {
    try {
      // Xử lý dữ liệu event stream
      const lines = data.split('\n');
      let finalText = '';
      
      for (const line of lines) {
        if (line.startsWith('data: {"v":')) {
          const jsonStr = line.replace('data: ', '');
          const jsonData = JSON.parse(jsonStr);
          
          if (jsonStr.includes('natural_language')) {
            // Lấy phần text từ natural_language
            const match = jsonStr.match(/'natural_language', '(.*?)'/);
            if (match && match[1]) {
              finalText = match[1].replace(/\\n/g, '\n');
            }
          } else if (jsonStr.includes('mcp_data')) {
            // Xử lý dữ liệu structured nếu cần
            // Có thể thêm logic xử lý ở đây
          }
        }
      }
      
      return finalText || data; // Trả về text đã xử lý hoặc nguyên bản nếu không xử lý được
    } catch (error) {
      console.error('Error processing API response:', error);
      return data; // Trả về nguyên bản nếu có lỗi
    }
  };

  const handleSend = async () => {
    if (!userInput.trim()) return;

    // Thêm tin nhắn người dùng vào khung chat
    const userMessage = { type: 'user', text: userInput };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');

    // Tạm thời thêm tin nhắn bot rỗng để cập nhật theo stream
    let botMessage = { type: 'bot', text: '' };
    setMessages(prev => [...prev, botMessage]);
    scrollToBottom();

    try {
      const response = await fetch('https://a8a5-42-118-62-49.ngrok-free.app/api/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userInput }),
      });

      if (!response.ok || !response.body) throw new Error('Lỗi kết nối tới server');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedText = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;
        
        // Xử lý dữ liệu nhận được
        const processedText = processApiResponse(accumulatedText);
        
        // Cập nhật tin nhắn bot đang stream
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { type: 'bot', text: processedText };
          return updated;
        });

        scrollToBottom();
      }
    } catch (error) {
      console.error('API Error:', error);
      setMessages(prev => [
        ...prev.slice(0, -1), // Xóa tin nhắn bot đang stream
        { type: 'bot', text: 'Đã xảy ra lỗi khi xử lý yêu cầu. Vui lòng thử lại sau.' },
      ]);
    }
  };

  return (
    <>
      <div className={`chatbot-button ${isOpen ? 'active' : ''}`} onClick={toggleChatbot}>
        {isOpen ? <FaTimes /> : <FaComment />}
      </div>

      {isOpen && (
        <div className="chatbot-panel">
          <div className="chatbot-header">
            <h3>Trợ lý ảo</h3>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={msg.type === 'bot' ? 'bot-message' : 'user-message'}
              >
                <p>{msg.text}</p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="chatbot-input">
            <input
              type="text"
              placeholder="Nhập câu hỏi của bạn..."
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend}>Gửi</button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotButton;