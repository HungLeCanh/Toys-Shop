import { useEffect, useRef, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { FaFacebookMessenger } from 'react-icons/fa';
import { SiZalo } from 'react-icons/si';

interface ContactButtonProps {
  messengerLink: string;
  zaloLink: string;
  messages?: string[]; // Mảng tin nhắn mời chào
  messageInterval?: number; // Thời gian giữa các lần hiển thị tin nhắn (ms)
  messageDuration?: number; // Thời gian hiển thị mỗi tin nhắn (ms)
}

const ContactButton: React.FC<ContactButtonProps> = ({
  messengerLink,
  zaloLink,
  messages = ["Cửa hàng 24/7", "Liên hệ qua zalo", "Cần hỗ trợ?"],
  messageInterval = 5000, // 5 giây
  messageDuration = 3000, // 5 giây
}) => {
  const [open, setOpen] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Hiệu ứng hiển thị tin nhắn theo chu kỳ
  useEffect(() => {
    if (messages.length === 0) return;

    // Hiển thị tin nhắn theo chu kỳ
    const messageTimer = setInterval(() => {
      setShowMessage(true);
      
      // Ẩn tin nhắn sau một khoảng thời gian
      const hideTimer = setTimeout(() => {
        setShowMessage(false);
        
        // Đổi sang tin nhắn tiếp theo
        setTimeout(() => {
          setCurrentMessage((prev) => (prev + 1) % messages.length);
        }, 500); // Đợi 0.5 giây sau khi ẩn để đổi tin nhắn
        
      }, messageDuration);
      
      return () => clearTimeout(hideTimer);
    }, messageInterval);
    
    return () => clearInterval(messageTimer);
  }, [messages, messageInterval, messageDuration]);

  return (
    <div
      ref={wrapperRef}
      className="fixed bottom-6 left-4 md:bottom-10 md:left-10 z-50 flex flex-col items-center gap-2"
    >
      {/* Tin nhắn mời chào - luôn nằm bên phải của nút */}
      {showMessage && !open && (
        <div className="absolute z-20 bottom-0 left-16 md:left-20 w-40 md:w-48">
          <div className="bg-white text-sm md:text-base p-4 rounded-lg shadow-xl relative border-2 border-blue-500">
            {messages[currentMessage]}
            {/* Mũi tên trỏ sang trái */}
            <div className="absolute z-10 top-1/2 -left-2 w-4 h-4 bg-white transform -translate-y-1/2 rotate-45 border-l-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      )}

      {/* Các nút con */}
      <div
        className={`flex flex-col items-center gap-2 transition-opacity transform ${
          open ? 'opacity-100 translate-y-0' : 'opacity-0 pointer-events-none -translate-y-4'
        } duration-300`}
      >
        <button
          onClick={() => window.open(messengerLink, '_blank')}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all"
          aria-label="Nhắn qua Messenger"
        >
          <FaFacebookMessenger size={20} />
        </button>
        <button
          onClick={() => window.open(zaloLink, '_blank')}
          className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-all"
          aria-label="Nhắn qua Zalo"
        >
          <SiZalo size={20} />
        </button>
      </div>
      
      {/* Nút chính */}
      <button
        onClick={() => {
          setOpen((prev) => !prev);
          setShowMessage(false); // Ẩn tin nhắn khi mở menu
        }}
        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 ease-in-out cursor-pointer"
        aria-label="Liên hệ"
        title="Liên hệ cửa hàng"
      >
        <MessageCircle size={24} />
      </button>
    </div>
  );
};

export default ContactButton;