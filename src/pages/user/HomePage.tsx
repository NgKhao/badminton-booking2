import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Paper,
  useTheme,
  useMediaQuery,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CardMedia,
  Avatar,
} from '@mui/material';
import {
  SportsBasketball as BadmintonIcon,
  CheckCircle,
  Schedule,
  LocationOn,
  Phone,
  Email,
  AccessTime,
  Group,
  ExpandMore,
  Visibility,
  Security,
  SupportAgent,
  WbSunny,
  AcUnit,
  SmartToy,
  PlayArrow,
  ContactSupport,
  ArrowForward,
  SportsTennis,
  Payment,
  WhatsApp,
  Facebook,
  Instagram,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { ChatFAB } from '../../components/AIChat';

// Court data based on database schema
const courtFeatures = [
  {
    type: 'Trong nhà',
    hourlyRate: 150000,
    description: 'Sân cầu lông tiêu chuẩn với hệ thống điều hòa và ánh sáng chuyên nghiệp',
    features: [
      'Điều hòa mát lạnh',
      'Ánh sáng LED chuyên nghiệp',
      'Sàn gỗ tiêu chuẩn',
      'Âm thanh chất lượng cao',
    ],
    icon: <AcUnit />,
    color: 'primary' as const,
    imageUrl: '/api/placeholder/400/300',
  },
  {
    type: 'Ngoài trời',
    hourlyRate: 100000,
    description: 'Sân ngoài trời thoáng mát với không gian rộng rãi',
    features: [
      'Không gian thoáng đãng',
      'View thiên nhiên đẹp',
      'Giá cả phải chăng',
      'Phù hợp thời tiết mát mẻ',
    ],
    icon: <WbSunny />,
    color: 'secondary' as const,
    imageUrl: '/api/placeholder/400/300',
  },
];

// Features based on actual system capabilities
const systemFeatures = [
  {
    icon: <SmartToy />,
    title: 'AI Chat Thông Minh',
    description: 'Tư vấn sân phù hợp theo thời tiết và nhu cầu 24/7',
  },
  {
    icon: <Schedule />,
    title: 'Đặt Sân Online',
    description: 'Hệ thống đặt sân trực tuyến, tránh trùng lịch tự động',
  },
  {
    icon: <Payment />,
    title: 'Thanh Toán Linh Hoạt',
    description: 'Thanh toán tại quầy hoặc chuyển khoản tiện lợi',
  },
  {
    icon: <WbSunny />,
    title: 'Dự Báo Thời Tiết',
    description: 'Gợi ý sân phù hợp dựa trên thời tiết hiện tại',
  },
  {
    icon: <Security />,
    title: 'Bảo Mật Cao',
    description: 'Thông tin khách hàng được bảo vệ tuyệt đối',
  },
  {
    icon: <SupportAgent />,
    title: 'Hỗ Trợ 24/7',
    description: 'Đội ngũ hỗ trợ khách hàng chuyên nghiệp',
  },
];

// FAQ based on actual system
const faqs = [
  {
    question: 'Làm thế nào để đặt sân cầu lông?',
    answer:
      'Bạn có thể đăng ký tài khoản và sử dụng hệ thống đặt sân online. AI Chat sẽ hỗ trợ bạn chọn sân phù hợp với thời tiết và nhu cầu.',
  },
  {
    question: 'Có bao nhiều loại sân và giá như thế nào?',
    answer:
      'Chúng tôi có 2 loại sân: Sân trong nhà (150.000đ/giờ) với điều hòa và ánh sáng chuyên nghiệp, Sân ngoài trời (100.000đ/giờ) thoáng mát và giá cả phải chăng.',
  },
  {
    question: 'AI Chat hoạt động như thế nào?',
    answer:
      'AI Chat sẽ phân tích thời tiết hiện tại và gợi ý loại sân phù hợp nhất. Ví dụ: trời nắng gắt sẽ khuyên sân trong nhà, trời mát sẽ gợi ý sân ngoài trời.',
  },
  {
    question: 'Có thể hủy đặt sân không?',
    answer:
      'Bạn có thể hủy đặt sân khi trạng thái còn "Chờ xác nhận". Sau khi admin xác nhận, bạn cần liên hệ trực tiếp để hủy.',
  },
  {
    question: 'Thanh toán như thế nào?',
    answer:
      'Hiện tại hỗ trợ thanh toán tại quầy khi đến chơi. Admin sẽ tạo giao dịch thanh toán bằng tiền mặt hoặc chuyển khoản.',
  },
];

export const HomePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [openContact, setOpenContact] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleContactSubmit = () => {
    // In real app, this would send to backend
    console.log('Contact form submitted:', contactForm);
    setOpenContact(false);
    setContactForm({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          py: { xs: 6, md: 10 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Box className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <Box>
              <Typography
                variant={isMobile ? 'h3' : 'h2'}
                component="h1"
                gutterBottom
                className="font-bold"
              >
                Đặt Sân Cầu Lông
                <br />
                <Box component="span" sx={{ color: 'secondary.main' }}>
                  Thông Minh & Nhanh Chóng
                </Box>
              </Typography>

              <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                Hệ thống đặt sân với AI tư vấn theo thời tiết, tránh trùng lịch tự động. Trải nghiệm
                đặt sân hiện đại nhất Việt Nam!
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  component={Link}
                  to="/auth"
                  startIcon={<PlayArrow />}
                >
                  Đặt Sân Ngay
                </Button>

                <Button
                  variant="contained"
                  size="large"
                  component={Link}
                  to="/courts"
                  startIcon={<SportsTennis />}
                >
                  Xem Tất Cả Sân
                </Button>
              </Box>

              {/* Stats */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 3,
                  mt: 4,
                }}
              >
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    2+
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Loại Sân
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    24/7
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Hỗ Trợ AI
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    100%
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Tự Động
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ position: 'relative', textAlign: 'center' }}>
              <img
                src="/api/placeholder/500/400"
                alt="Sân cầu lông hiện đại"
                style={{
                  width: '100%',
                  borderRadius: 8,
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                }}
              />

              {/* Floating Cards */}
              <Paper
                sx={{
                  position: 'absolute',
                  top: 2,
                  right: -2,
                  p: 2,
                  bgcolor: 'background.paper',
                  color: 'text.primary',
                  borderRadius: 1,
                  boxShadow: 3,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SmartToy color="primary" />
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    AI Tư Vấn Thông Minh
                  </Typography>
                </Box>
              </Paper>

              <Paper
                sx={{
                  position: 'absolute',
                  bottom: 2,
                  left: -2,
                  p: 2,
                  bgcolor: 'background.paper',
                  color: 'text.primary',
                  borderRadius: 1,
                  boxShadow: 3,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WbSunny color="secondary" />
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    Dự Báo Thời Tiết
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Box>
        </Container>

        {/* Background Pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '50%',
            height: '100%',
            opacity: 0.1,
            bgcolor: 'common.white',
          }}
        />
      </Box>

      {/* Court Types Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
            Loại Sân Phù Hợp Mọi Nhu Cầu
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 4,
          }}
        >
          {courtFeatures.map((court, index) => (
            <Card
              key={index}
              elevation={3}
              sx={{
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 6,
                },
              }}
            >
              <CardMedia
                component="img"
                height="240"
                image={court.imageUrl}
                alt={`Sân ${court.type}`}
              />
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    {court.icon}
                    <Typography variant="h5" fontWeight="bold">
                      Sân {court.type}
                    </Typography>
                  </Box>
                  <Chip
                    label={`${court.hourlyRate.toLocaleString('vi-VN')}đ/giờ`}
                    color={court.color}
                    variant="filled"
                  />
                </Box>

                <Typography variant="body1" color="text.secondary" mb={3}>
                  {court.description}
                </Typography>

                <List dense>
                  {court.features.map((feature, i) => (
                    <ListItem key={i} disableGutters>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <CheckCircle color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={feature} />
                    </ListItem>
                  ))}
                </List>

                <Button
                  fullWidth
                  variant="contained"
                  color={court.color}
                  size="large"
                  component={Link}
                  to="/auth"
                  sx={{ mt: 2 }}
                  endIcon={<ArrowForward />}
                >
                  Đặt {court.type} Ngay
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>

      {/* Features Section */}
      <Box sx={{ bgcolor: 'background.default', py: 8 }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={6}>
            <Typography variant="h3" component="h2" gutterBottom fontWeight="bold">
              Tính Năng Vượt Trội
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Hệ thống đặt sân thông minh với công nghệ AI tiên tiến
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
              gap: 4,
            }}
          >
            {systemFeatures.map((feature, index) => (
              <Card
                key={index}
                elevation={0}
                sx={{
                  textAlign: 'center',
                  p: 3,
                  height: '100%',
                  bgcolor: 'white',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3,
                  },
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    width: 64,
                    height: 64,
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  {feature.icon}
                </Avatar>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      {/* How It Works */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box textAlign="center" mb={6}>
          <Typography variant="h3" component="h2" gutterBottom fontWeight="bold">
            Cách Thức Hoạt Động
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Đặt sân cầu lông chỉ với 4 bước đơn giản
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
            gap: 4,
          }}
        >
          {[
            {
              step: '01',
              title: 'Đăng Ký/Đăng Nhập',
              description: 'Tạo tài khoản hoặc đăng nhập vào hệ thống',
              icon: <Group />,
            },
            {
              step: '02',
              title: 'Chat Với AI',
              description: 'AI sẽ tư vấn sân phù hợp dựa trên thời tiết',
              icon: <SmartToy />,
            },
            {
              step: '03',
              title: 'Chọn Sân & Thời Gian',
              description: 'Chọn loại sân và thời gian theo sở thích',
              icon: <Schedule />,
            },
            {
              step: '04',
              title: 'Xác Nhận & Thanh Toán',
              description: 'Xác nhận đặt sân và thanh toán khi đến chơi',
              icon: <Payment />,
            },
          ].map((step, index) => (
            <Box key={index} textAlign="center">
              <Box
                sx={{
                  position: 'relative',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 80,
                  height: 80,
                  bgcolor: 'primary.main',
                  color: 'white',
                  borderRadius: '50%',
                  mb: 2,
                }}
              >
                {step.icon}
                <Typography
                  variant="caption"
                  sx={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    bgcolor: 'secondary.main',
                    color: 'white',
                    borderRadius: '50%',
                    width: 24,
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                  }}
                >
                  {step.step}
                </Typography>
              </Box>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                {step.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {step.description}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>

      {/* FAQ Section */}
      <Box sx={{ bgcolor: 'background.default', py: 8 }}>
        <Container maxWidth="md">
          <Box textAlign="center" mb={6}>
            <Typography variant="h3" component="h2" gutterBottom fontWeight="bold">
              Câu Hỏi Thường Gặp
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Những thông tin quan trọng bạn cần biết
            </Typography>
          </Box>

          {faqs.map((faq, index) => (
            <Accordion key={index} elevation={0} sx={{ mb: 1, bgcolor: 'background.paper' }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6" fontWeight="medium">
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" color="text.secondary">
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.primary.main} 100%)`,
          color: 'white',
          py: 8,
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h3" gutterBottom fontWeight="bold">
            Sẵn Sàng Trải Nghiệm?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Đăng ký ngay hôm nay và nhận tư vấn miễn phí từ AI
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              component={Link}
              to="/auth"
              sx={{
                bgcolor: 'background.paper',
                color: 'primary.main',
                '&:hover': { bgcolor: 'grey.50' },
                px: 4,
                py: 1.5,
              }}
              startIcon={<SportsTennis />}
            >
              Đặt Sân Ngay
            </Button>

            <Button
              variant="outlined"
              size="large"
              component={Link}
              to="/courts"
              sx={{
                borderColor: 'white',
                color: 'white',
                '&:hover': {
                  borderColor: 'primary.light',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                },
                px: 4,
                py: 1.5,
              }}
              startIcon={<Visibility />}
            >
              Xem Sân
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={() => setOpenContact(true)}
              sx={{
                borderColor: 'white',
                color: 'white',
                '&:hover': {
                  borderColor: 'secondary.main',
                  color: 'secondary.main',
                },
                px: 4,
                py: 1.5,
              }}
              startIcon={<ContactSupport />}
            >
              Liên Hệ Tư Vấn
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 6 }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
              gap: 4,
            }}
          >
            <Box>
              <Box display="flex" alignItems="center" mb={2}>
                <BadmintonIcon sx={{ mr: 1, fontSize: 32, color: 'primary.main' }} />
                <Typography variant="h5" fontWeight="bold">
                  BadmintonHub
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
                Hệ thống đặt sân cầu lông thông minh với AI tư vấn theo thời tiết. Trải nghiệm hiện
                đại nhất Việt Nam.
              </Typography>
              <Box display="flex" gap={1}>
                <Button size="small" startIcon={<Facebook />} sx={{ color: 'white' }}>
                  Facebook
                </Button>
                <Button size="small" startIcon={<Instagram />} sx={{ color: 'white' }}>
                  Instagram
                </Button>
                <Button size="small" startIcon={<WhatsApp />} sx={{ color: 'white' }}>
                  WhatsApp
                </Button>
              </Box>
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Liên Hệ
              </Typography>
              <List dense>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Phone sx={{ color: 'primary.main' }} />
                  </ListItemIcon>
                  <ListItemText primary="0123-456-789" />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Email sx={{ color: 'primary.main' }} />
                  </ListItemIcon>
                  <ListItemText primary="info@badmintonhub.com" />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <LocationOn sx={{ color: 'primary.main' }} />
                  </ListItemIcon>
                  <ListItemText primary="123 Đường ABC, Quận XYZ, TP.HCM" />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <AccessTime sx={{ color: 'primary.main' }} />
                  </ListItemIcon>
                  <ListItemText primary="6:00 - 22:00 (Hàng ngày)" />
                </ListItem>
              </List>
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Dịch Vụ
              </Typography>
              <List dense>
                <ListItem disableGutters>
                  <ListItemText primary="Đặt sân cầu lông online" />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText primary="Tư vấn AI theo thời tiết" />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText primary="Sân trong nhà & ngoài trời" />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText primary="Hỗ trợ khách hàng 24/7" />
                </ListItem>
              </List>
            </Box>
          </Box>

          <Divider sx={{ my: 4, borderColor: 'grey.700' }} />

          <Box textAlign="center">
            <Typography variant="body2" sx={{ opacity: 0.6 }}>
              © 2025 BadmintonHub. Tất cả quyền được bảo lưu.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Contact Dialog */}
      <Dialog open={openContact} onClose={() => setOpenContact(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Liên Hệ Tư Vấn</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: 2,
              mt: 1,
            }}
          >
            <TextField
              fullWidth
              label="Họ và tên"
              value={contactForm.name}
              onChange={(e) => setContactForm((prev) => ({ ...prev, name: e.target.value }))}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={contactForm.email}
              onChange={(e) => setContactForm((prev) => ({ ...prev, email: e.target.value }))}
            />
            <TextField
              fullWidth
              label="Số điện thoại"
              value={contactForm.phone}
              onChange={(e) => setContactForm((prev) => ({ ...prev, phone: e.target.value }))}
            />
            <TextField
              fullWidth
              label="Tin nhắn"
              multiline
              rows={4}
              value={contactForm.message}
              onChange={(e) => setContactForm((prev) => ({ ...prev, message: e.target.value }))}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenContact(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleContactSubmit}>
            Gửi Liên Hệ
          </Button>
        </DialogActions>
      </Dialog>

      {/* AI Chat FAB - Available for everyone including guests */}
      <ChatFAB />
    </Box>
  );
};

export default HomePage;
