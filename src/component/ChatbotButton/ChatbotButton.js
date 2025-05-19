import React, { useState, useRef } from 'react';
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
        body: JSON.stringify({ question: userInput }),
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

        // Cập nhật tin nhắn bot đang stream
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { type: 'bot', text: accumulatedText };
          return updated;
        });

        scrollToBottom();
      }
    } catch (error) {
      setMessages(prev => [
        ...prev,
        { type: 'bot', text: 'Đã xảy ra lỗi khi gọi API.' },
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
