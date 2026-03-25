import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, X, Send, Bot, User, Volume2, Pause } from 'lucide-react';
import './ChatBot.css';

const getBotResponse = (message) => {
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes('security') || lowerMsg.includes('app')) {
    return "Our security data indicates that the app uses end-to-end encryption and complies with strict privacy standards. Your data is not shared with third parties without your explicit consent.";
  }
  if (lowerMsg.includes('hushh') || lowerMsg.includes('coin') || lowerMsg.includes('coins')) {
    return "Hushh coins are earned by securely sharing your personal data on your terms. You can redeem them in the Data Value section of your dashboard!";
  }
  if (lowerMsg.includes('privacy') || lowerMsg.includes('data') || lowerMsg.includes('trust')) {
    return "Your privacy is our top priority. The Hushh platform gives you complete control over who accesses your personal data via the Trust Dashboard and Kill Switch.";
  }
  if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
    return "Hello! I am the Hushh AI Chat Bot. How can I assist you with your privacy, app data security, or Hushh coins today?";
  }
  if (lowerMsg.includes('kill switch') || lowerMsg.includes('revoke')) {
    return "The Kill Switch allows you to instantly revoke access to your data from any connected app. You can find it on your Trust Dashboard.";
  }
  
  return "That's a great question! I am constantly learning about the Hushh platform. I can perfectly help you with app security data, privacy controls, and earning Hushh coins.";
};

const ChatBot = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentCaption, setCurrentCaption] = useState('');
  const tourActiveRef = useRef(false);

  useEffect(() => {
      const loadVoices = () => window.speechSynthesis.getVoices();
      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
          window.speechSynthesis.onvoiceschanged = loadVoices;
      }
  }, []);

  const getFemaleVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      return voices.find(voice => 
          voice.name.includes('Female') || 
          voice.name.includes('Samantha') || 
          voice.name.includes('Victoria') || 
          voice.name.includes('Zira') || 
          voice.name.includes('Google US English')
      ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
  };

  const speak = (text) => new Promise((resolve, reject) => {
      setCurrentCaption('');
      const speech = new SpeechSynthesisUtterance(text);
      speech.lang = 'en-US';
      speech.rate = 0.82; // Slower, more relaxed reading speed
      speech.pitch = 1.2; // Higher pitch for female voice
      
      const femaleVoice = getFemaleVoice();
      if (femaleVoice) {
          speech.voice = femaleVoice;
      }

      // Progressive word-by-word syncing
      speech.onboundary = (event) => {
          if (event.name === 'word') {
              let nextSpace = text.indexOf(' ', event.charIndex);
              if (nextSpace === -1) nextSpace = text.length;
              setCurrentCaption(text.substring(0, nextSpace));
          }
      };

      speech.onend = () => {
          if (!tourActiveRef.current) return reject('cancelled');
          setCurrentCaption(text); // Ensure complete sentence displays at the end
          setTimeout(resolve, 1000); // 1-second pause before navigating
      };
      speech.onerror = () => {
          if (!tourActiveRef.current) return reject('cancelled');
          setTimeout(resolve, 800); // Prevent hanging on speech failure
      };
      window.speechSynthesis.speak(speech);
  });

  const stopTour = () => {
      tourActiveRef.current = false;
      setIsTourActive(false);
      window.speechSynthesis.cancel();
      setCurrentCaption('');
  };

  const startTour = async () => {
      if (isTourActive) return;
      window.speechSynthesis.cancel();
      setIsOpen(false);
      setIsTourActive(true);
      tourActiveRef.current = true;
      
      try {
          navigate('/dashboard');
          await speak("Welcome to the Hush DataGuard platform. This is your main dashboard. Here you can see your total trust score, securely connect new apps, and use the Kill Switch to instantly revoke all third party data access.");
          if (!tourActiveRef.current) throw new Error('cancelled');
          
          navigate('/value-explorer');
          await speak("Next is the Value Explorer. Here, you can transparently see the exact financial worth of your digital footprint, and selectively share data points to earn Hush Coins.");
          if (!tourActiveRef.current) throw new Error('cancelled');
          
          navigate('/safe-share');
          await speak("Now we are at the Safe Share hub. This section shows all your active Data Passports. Every connection is end to end encrypted, and you have the power to instantly revoke permissions at any time.");
          if (!tourActiveRef.current) throw new Error('cancelled');
          
          navigate('/profile');
          await speak("Finally, your Profile section. You can view your account insights, verify your connected data, and securely log out.");
      } catch (err) {
          console.log("Tour stopped:", err);
      } finally {
          tourActiveRef.current = false;
          setCurrentCaption('');
          setIsTourActive(false);
          setIsOpen(true);
          setMessages(prev => [...prev, { sender: 'bot', text: 'Hope you enjoyed the automated voice tour! Let me know if you have any questions.' }]);
      }
  };

  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi there! I am Hushh AI Chat Bot. Ask me about app security, your data privacy, or how to earn Hushh coins!' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');
    
    setTimeout(() => {
      const botReply = getBotResponse(userMsg);
      setMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
    }, 800);
  };

  return (
    <div className="chatbot-container">
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-title">
              <Bot size={20} />
              <span>Hushh AI Chat Bot</span>
            </div>
            <div className="chatbot-header-actions">
              {!isTourActive ? (
                  <button 
                    className="chatbot-tour-btn" 
                    onClick={startTour} 
                    title="Start Website Voice Tour"
                  >
                    <Volume2 size={16} /> <span>Voice Tour</span>
                  </button>
              ) : (
                  <button 
                    className="chatbot-tour-btn stop-btn" 
                    onClick={stopTour} 
                    title="Pause/Stop Voice Tour"
                  >
                    <Pause size={16} /> <span>Pause Tour</span>
                  </button>
              )}
              <button className="chatbot-close" onClick={() => setIsOpen(false)}>
                <X size={20} />
              </button>
            </div>
          </div>
          
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`chatbot-message ${msg.sender}`}>
                <div className="message-icon">
                  {msg.sender === 'bot' ? <Bot size={16} /> : <User size={16} />}
                </div>
                <div className="message-text">{msg.text}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="chatbot-input-area">
            <input 
              type="text" 
              placeholder="Ask me anything..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button className="chatbot-send" onClick={handleSend} disabled={!input.trim()}>
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
      
      {!isOpen && (
        <button className="chatbot-fab" onClick={() => setIsOpen(true)}>
          <MessageCircle size={28} />
        </button>
      )}

      {currentCaption && (
        <div className="tour-caption-overlay">
            <p>{currentCaption}</p>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
