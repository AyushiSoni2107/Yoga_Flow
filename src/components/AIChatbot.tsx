import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, MessageSquare } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your Yoga Flow assistant. I can help you with class recommendations, booking inquiries, and answer questions about yoga practices. How can I help you today?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('beginner') || lowerMessage.includes('start')) {
      return "For beginners, I recommend starting with our Beginner Yoga class. It's perfect for learning basic poses and breathing techniques. Classes are available Monday and Wednesday at 9:00 AM. Would you like to know more about the class structure?";
    }

    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('plan')) {
      return "We offer several pricing plans: Basic Plan at $20/month for beginner classes, Standard Plan at $40/month for all classes plus meditation, Premium Plan at $60/month with unlimited access and personal coaching, and an Annual Plan at $500/year. All plans include a 7-day free trial!";
    }

    if (lowerMessage.includes('schedule') || lowerMessage.includes('time') || lowerMessage.includes('when')) {
      return "Our classes run throughout the week: Monday-Friday 6:00 AM - 9:00 PM, Saturday 8:00 AM - 6:00 PM, and Sunday 9:00 AM - 5:00 PM. We offer morning, afternoon, and evening sessions to fit your schedule.";
    }

    if (lowerMessage.includes('meditation')) {
      return "Our Meditation & Mindfulness classes are available Tuesday and Thursday at 7:00 AM. These 45-minute sessions help cultivate inner peace and mental clarity through guided meditation practices. Perfect for all levels!";
    }

    if (lowerMessage.includes('power yoga') || lowerMessage.includes('advanced')) {
      return "Power Yoga is an intermediate-level class focusing on building strength and stamina. It's available Monday and Wednesday at 6:00 PM (75 minutes). For advanced practitioners, we also offer Advanced Flow classes Tuesday and Thursday at 7:00 PM.";
    }

    if (lowerMessage.includes('book') || lowerMessage.includes('reserve')) {
      return "To book a class, simply sign up or log in to your account, then visit the Classes page to view available sessions. You can also call us at +1 (555) 123-4567 for assistance with bookings.";
    }

    if (lowerMessage.includes('benefit') || lowerMessage.includes('why yoga')) {
      return "Yoga offers numerous benefits including improved flexibility, strength building, stress reduction, better posture, enhanced mental clarity, and overall wellness. Regular practice can help with anxiety, improve sleep quality, and boost energy levels.";
    }

    if (lowerMessage.includes('mudra')) {
      return "Mudras are sacred hand gestures used in yoga and meditation. They help channel energy flow and enhance your practice. Try our AI Mudra Recognition feature to get real-time guidance on proper hand positions and their benefits!";
    }

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! How can I assist you with your yoga journey today? I can help with class recommendations, schedule information, pricing, or answer any yoga-related questions.";
    }

    if (lowerMessage.includes('thank')) {
      return "You're welcome! If you have any other questions about our classes, pricing, or yoga practices, feel free to ask. Namaste!";
    }

    return "I'd be happy to help! I can provide information about our classes, pricing plans, schedules, booking process, and answer general yoga questions. What would you like to know?";
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(inputValue),
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-violet-600 text-white rounded-full shadow-2xl hover:bg-violet-700 transition-all transform hover:scale-110 z-50 flex items-center justify-center"
        >
          <MessageCircle className="w-7 h-7" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-xl shadow-2xl z-50 flex flex-col">
          <div className="bg-violet-600 text-white p-4 rounded-t-xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <h3 className="font-semibold">Yoga Flow Assistant</h3>
                <p className="text-xs text-violet-100">Online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-violet-700 p-2 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-violet-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-4 py-2 rounded-lg">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-600 focus:border-transparent"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="bg-violet-600 text-white p-2 rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
