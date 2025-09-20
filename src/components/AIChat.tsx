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
  CircularProgress,
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
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useChatMutation } from '../hooks/useApi';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  suggestions?: string[];
  isError?: boolean;
}

interface WeatherInfo {
  temperature: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'cold';
  description: string;
}

// Mock weather data for display
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

// Function to generate suggestions based on AI response
const generateSuggestions = (aiResponse: string): string[] => {
  const response = aiResponse.toLowerCase();
  const suggestions: string[] = [];

  if (response.includes('sân') && response.includes('indoor')) {
    suggestions.push('Xem sân trong nhà', 'Đặt sân trong nhà');
  }
  if (response.includes('sân') && response.includes('outdoor')) {
    suggestions.push('Xem sân ngoài trời', 'Đặt sân ngoài trời');
  }
  if (response.includes('dịch vụ')) {
    suggestions.push('Xem tất cả dịch vụ', 'Thuê thiết bị');
  }
  if (response.includes('giờ') || response.includes('thời gian')) {
    suggestions.push('Đặt sân ngay', 'Xem lịch trống');
  }

  // Default suggestions if no specific matches
  if (suggestions.length === 0) {
    suggestions.push('Đề xuất sân phù hợp', 'Xem dịch vụ', 'Hỏi về giá cả');
  }

  return suggestions;
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
      suggestions: [
        'Đề xuất sân phù hợp vào lúc 10h',
        'Bên bạn có những dịch vụ nào',
        'Xem bảng giá',
      ],
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Chat mutation hook
  const chatMutation = useChatMutation({
    onSuccess: (response) => {
      const aiMessage: Message = {
        id: Date.now(),
        text: response.detail,
        sender: 'ai',
        timestamp: new Date(),
        suggestions: generateSuggestions(response.detail),
      };
      setMessages((prev) => [...prev, aiMessage]);
    },
    onError: (error) => {
      console.error('Chat API error:', error);
      const errorMessage: Message = {
        id: Date.now(),
        text: 'Xin lỗi, hiện tại tôi không thể trả lời câu hỏi của bạn. Vui lòng thử lại sau.',
        sender: 'ai',
        timestamp: new Date(),
        isError: true,
        suggestions: ['Thử lại', 'Liên hệ hỗ trợ'],
      };
      setMessages((prev) => [...prev, errorMessage]);
    },
  });

  const handleSendMessage = async (message?: string) => {
    const messageText = message || inputMessage.trim();
    if (!messageText || chatMutation.isPending) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');

    // Call chat API
    chatMutation.mutate({ question: messageText });
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
                    bgcolor: message.isError
                      ? 'error.light'
                      : message.sender === 'user'
                        ? 'primary.main'
                        : 'grey.100',
                    color: message.isError
                      ? 'error.contrastText'
                      : message.sender === 'user'
                        ? 'white'
                        : 'text.primary',
                    border: message.isError ? '1px solid' : 'none',
                    borderColor: message.isError ? 'error.main' : 'transparent',
                  }}
                >
                  {message.isError && (
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <ErrorIcon color="error" fontSize="small" />
                      <Typography variant="caption" color="error.main">
                        Lỗi kết nối
                      </Typography>
                    </Box>
                  )}
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
        {chatMutation.isPending && (
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              <SmartToy />
            </Avatar>
            <Paper elevation={1} sx={{ p: 1.5, bgcolor: 'grey.100' }}>
              <Box display="flex" alignItems="center" gap={1}>
                <CircularProgress size={16} />
                <Typography variant="body2" color="text.secondary">
                  AI đang suy nghĩ...
                </Typography>
              </Box>
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
            disabled={!inputMessage.trim() || chatMutation.isPending}
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
