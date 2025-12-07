import React, { useState, useRef, useEffect } from 'react';
import { sendMessage } from '../services/gemini';
import { useLanguage } from '../context/LanguageContext';
import { HiChat, HiX, HiPaperAirplane } from 'react-icons/hi';
import './AIChat.css';

const ChatIcon = () => React.createElement(HiChat as React.ComponentType);
const CloseIcon = () => React.createElement(HiX as React.ComponentType);
const SendIcon = () => React.createElement(HiPaperAirplane as React.ComponentType);

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await sendMessage(newMessages);
      setMessages([...newMessages, { role: 'assistant', content: response }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        className="ai-chat-button"
        onClick={() => setIsOpen(true)}
        title={t("AI Gid", "AI Гид", "AI Guide")}
      >
        <ChatIcon />
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="ai-chat-overlay" onClick={() => setIsOpen(false)}>
          <div className="ai-chat-modal" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="ai-chat-header">
              <div className="ai-chat-header-info">
                <div className="ai-chat-avatar">AI</div>
                <div>
                  <h3>{t("AI Gid", "AI Гид", "AI Guide")}</h3>
                  <span className="ai-chat-status">
                    {t("Qoraqalpog'iston bo'yicha", "По Каракалпакстану", "For Karakalpakstan")}
                  </span>
                </div>
              </div>
              <button className="ai-chat-close" onClick={() => setIsOpen(false)}>
                <CloseIcon />
              </button>
            </div>

            {/* Messages */}
            <div className="ai-chat-messages">
              {messages.length === 0 && (
                <div className="ai-chat-welcome">
                  <div className="ai-chat-welcome-icon">AI</div>
                  <h4>{t("Salom!", "Привет!", "Hello!")}</h4>
                  <p>
                    {t(
                      "Men Qoraqalpog'iston haqida savollaringizga javob beraman. Tarixiy joylar, madaniyat, sayohat haqida so'rang!",
                      "Я отвечу на ваши вопросы о Каракалпакстане. Спрашивайте об исторических местах, культуре, путешествиях!",
                      "I'll answer your questions about Karakalpakstan. Ask about historical sites, culture, travel!"
                    )}
                  </p>
                  <div className="ai-chat-suggestions">
                    <button onClick={() => setInput(t(
                      "Mizdaxan haqida gapirib bering",
                      "Расскажите о Миздахане",
                      "Tell me about Mizdakhan"
                    ))}>
                      {t("Mizdaxan", "Миздахан", "Mizdakhan")}
                    </button>
                    <button onClick={() => setInput(t(
                      "Orol dengizi haqida",
                      "Об Аральском море",
                      "About Aral Sea"
                    ))}>
                      {t("Orol dengizi", "Аральское море", "Aral Sea")}
                    </button>
                    <button onClick={() => setInput(t(
                      "Nukusda nima ko'rish kerak?",
                      "Что посмотреть в Нукусе?",
                      "What to see in Nukus?"
                    ))}>
                      {t("Nukus", "Нукус", "Nukus")}
                    </button>
                  </div>
                </div>
              )}

              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`ai-chat-message ${msg.role === 'user' ? 'user' : 'assistant'}`}
                >
                  {msg.role === 'assistant' && <div className="ai-chat-message-avatar">AI</div>}
                  <div className="ai-chat-message-content">
                    {msg.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="ai-chat-message assistant">
                  <div className="ai-chat-message-avatar">AI</div>
                  <div className="ai-chat-message-content ai-chat-typing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}

              {error && (
                <div className="ai-chat-error">
                  {error}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="ai-chat-input-container">
              <input
                ref={inputRef}
                type="text"
                className="ai-chat-input"
                placeholder={t(
                  "Savol yozing...",
                  "Напишите вопрос...",
                  "Type a question..."
                )}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
              <button
                className="ai-chat-send"
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
              >
                <SendIcon />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
