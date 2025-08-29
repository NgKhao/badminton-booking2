import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Chip,
  IconButton,
  Fab,
  Drawer,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Send,
  SmartToy,
  Person,
  Close,
  Chat,
  WbSunny,
  CloudQueue,
  Umbrella,
  AcUnit,
} from '@mui/icons-material';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  suggestions?: string[];
}

interface WeatherInfo {
  temperature: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'cold';
  description: string;
}

// Mock weather and AI responses
const mockWeatherData: WeatherInfo = {
  temperature: 28,
  condition: 'sunny',
  description: 'Trời nắng, nhiệt độ cao',
};

const getWeatherIcon = (condition: string) => {
  switch (condition) {
    case 'sunny':
      return <WbSunny color="warning" />;
    case 'cloudy':
      return <CloudQueue color="info" />;
    case 'rainy':
      return <Umbrella color="primary" />;
    case 'cold':
      return <AcUnit color="info" />;
    default:
      return <WbSunny />;
  }
};

const generateAIResponse = (userMessage: string, weather: WeatherInfo): Message => {
  const lowerMessage = userMessage.toLowerCase();

  let response = '';
  let suggestions: string[] = [];

  if (lowerMessage.includes('thời tiết') || lowerMessage.includes('sân nào')) {
    if (weather.condition === 'sunny' && weather.temperature > 25) {
      response = `Hôm nay trời nắng ${weather.temperature}°C, tôi khuyên bạn nên chọn sân trong nhà để tránh nắng gắt và có trải nghiệm chơi thoải mái hơn. Sân A1 và A2 đều có điều hòa mát lạnh!`;
      suggestions = ['Xem sân trong nhà', 'Giá sân trong nhà', 'Đặt sân A1'];
    } else if (weather.condition === 'cloudy') {
      response = `Thời tiết hôm nay nhiều mây, rất phù hợp để chơi sân ngoài trời! Bạn có thể tiết kiệm chi phí và tận hưởng không khí tự nhiên tại sân B1 hoặc B2.`;
      suggestions = ['Xem sân ngoài trời', 'Giá sân ngoài trời', 'Đặt sân B1'];
    } else {
      response = `Dựa vào thời tiết hiện tại, tôi khuyên bạn nên chọn sân trong nhà để đảm bảo có thể chơi thoải mái nhất!`;
      suggestions = ['Xem tất cả sân', 'So sánh giá'];
    }
  } else if (lowerMessage.includes('giá') || lowerMessage.includes('chi phí')) {
    response = `Hiện tại chúng tôi có 2 loại sân:
    
🏢 Sân trong nhà: 150.000đ/giờ (có điều hòa, ánh sáng chuyên nghiệp)
🌳 Sân ngoài trời: 100.000đ/giờ (không gian thoáng mát, giá tiết kiệm)

Với thời tiết ${weather.temperature}°C hôm nay, tôi khuyên bạn chọn sân trong nhà!`;
    suggestions = ['Đặt sân trong nhà', 'Đặt sân ngoài trời', 'Xem chi tiết'];
  } else if (lowerMessage.includes('đặt') || lowerMessage.includes('booking')) {
    response = `Tôi sẽ hướng dẫn bạn đặt sân! Dựa vào thời tiết hiện tại (${weather.temperature}°C, ${weather.description}), tôi khuyên bạn nên chọn sân trong nhà để có trải nghiệm tốt nhất.`;
    suggestions = ['Đặt sân ngay', 'Xem lịch trống', 'Chọn thời gian'];
  } else if (lowerMessage.includes('thời gian') || lowerMessage.includes('giờ')) {
    response = `Chúng tôi mở cửa từ 6:00 sáng đến 22:00 tối hàng ngày. Các khung giờ phổ biến:
    
🌅 Sáng sớm (6:00-9:00): Không khí mát mẻ, ít đông
🌞 Buổi trua (12:00-14:00): Nên chọn sân trong nhà
🌆 Buổi chiều (17:00-20:00): Khung giờ vàng, rất đông
🌙 Buổi tối (20:00-22:00): Mát mẻ, thích hợp chơi ngoài trời`;
    suggestions = ['Đặt sáng sớm', 'Đặt buổi chiều', 'Đặt buổi tối'];
  } else {
    response = `Xin chào! Tôi là AI Assistant của BadmintonBooking. Tôi có thể giúp bạn:

🏸 Tư vấn chọn sân phù hợp với thời tiết
💰 Thông tin giá cả và khuyến mãi  
📅 Hướng dẫn đặt sân và chọn thời gian
🌤️ Dự báo thời tiết để lên kế hoạch chơi

Hôm nay thời tiết ${weather.description}, bạn muốn tôi tư vấn gì?`;
    suggestions = ['Tư vấn chọn sân', 'Xem bảng giá', 'Đặt sân ngay', 'Dự báo thời tiết'];
  }

  return {
    id: Date.now(),
    text: response,
    sender: 'ai',
    timestamp: new Date(),
    suggestions,
  };
};

interface AIChatProps {
  open: boolean;
  onClose: () => void;
}

export const AIChat: React.FC<AIChatProps> = ({ open, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: `Xin chào! Tôi là AI Assistant của BadmintonBooking. Hôm nay thời tiết ${mockWeatherData.description}, tôi có thể giúp bạn tư vấn sân phù hợp nhất!`,
      sender: 'ai',
      timestamp: new Date(),
      suggestions: ['Tư vấn chọn sân', 'Xem bảng giá', 'Đặt sân ngay'],
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleSendMessage = async (message?: string) => {
    const messageText = message || inputMessage.trim();
    if (!messageText) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse = generateAIResponse(messageText, mockWeatherData);
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const chatContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 2, borderRadius: 0 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <SmartToy />
            </Avatar>
            <Box>
              <Typography variant="h6">AI Assistant</Typography>
              <Box display="flex" alignItems="center" gap={1}>
                {getWeatherIcon(mockWeatherData.condition)}
                <Typography variant="caption" color="text.secondary">
                  {mockWeatherData.temperature}°C - {mockWeatherData.description}
                </Typography>
              </Box>
            </Box>
          </Box>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </Paper>

      {/* Messages */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {messages.map((message) => (
          <Box key={message.id} mb={2}>
            <Box
              display="flex"
              justifyContent={message.sender === 'user' ? 'flex-end' : 'flex-start'}
              mb={1}
            >
              <Box
                sx={{
                  maxWidth: '80%',
                  display: 'flex',
                  flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                  alignItems: 'flex-start',
                  gap: 1,
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: message.sender === 'user' ? 'secondary.main' : 'primary.main',
                  }}
                >
                  {message.sender === 'user' ? <Person /> : <SmartToy />}
                </Avatar>
                <Paper
                  elevation={1}
                  sx={{
                    p: 1.5,
                    bgcolor: message.sender === 'user' ? 'primary.main' : 'grey.100',
                    color: message.sender === 'user' ? 'white' : 'text.primary',
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                    {message.text}
                  </Typography>
                </Paper>
              </Box>
            </Box>

            {/* Suggestions */}
            {message.suggestions && message.suggestions.length > 0 && (
              <Box display="flex" flexWrap="wrap" gap={1} ml={message.sender === 'ai' ? 5 : 0}>
                {message.suggestions.map((suggestion, index) => (
                  <Chip
                    key={index}
                    label={suggestion}
                    variant="outlined"
                    size="small"
                    clickable
                    onClick={() => handleSuggestionClick(suggestion)}
                    sx={{ fontSize: '0.75rem' }}
                  />
                ))}
              </Box>
            )}
          </Box>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              <SmartToy />
            </Avatar>
            <Paper elevation={1} sx={{ p: 1.5, bgcolor: 'grey.100' }}>
              <Typography variant="body2" color="text.secondary">
                AI đang suy nghĩ...
              </Typography>
            </Paper>
          </Box>
        )}
      </Box>

      {/* Input */}
      <Paper elevation={2} sx={{ p: 2, borderRadius: 0 }}>
        <Box display="flex" gap={1} alignItems="flex-end">
          <TextField
            fullWidth
            multiline
            maxRows={3}
            placeholder="Nhập tin nhắn..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            variant="outlined"
            size="small"
          />
          <Button
            variant="contained"
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || isTyping}
            sx={{ minWidth: 'auto', p: 1 }}
          >
            <Send />
          </Button>
        </Box>
      </Paper>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        anchor="bottom"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: { height: '80vh', borderTopLeftRadius: 16, borderTopRightRadius: 16 },
        }}
      >
        {chatContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: 400 },
      }}
    >
      {chatContent}
    </Drawer>
  );
};

// Chat FAB Component
export const ChatFAB: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Fab
        color="primary"
        onClick={() => setOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
        }}
      >
        <Chat />
      </Fab>
      <AIChat open={open} onClose={() => setOpen(false)} />
    </>
  );
};
