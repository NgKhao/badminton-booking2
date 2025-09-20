# Hệ thống quản lý sân cầu lông với AI

Một hệ thống quản lý chuỗi sân cầu lông hiện đại được tích hợp AI để tối ưu hóa việc đặt sân và cải thiện trải nghiệm khách hàng.

## 🚀 Tính năng chính

### 📋 Quản lý cơ bản

- **Quản lý lịch hẹn**: Sắp xếp và quản lý lịch đặt sân hiệu quả, tránh chồng chéo
- **Quản lý sân**: Thêm, sửa, xóa thông tin sân, quản lý trạng thái và giá cả
- **Quản lý khách hàng**: Duy trì hồ sơ khách hàng chính xác và cập nhật
- **Thu chi**: Theo dõi doanh thu, thanh toán và báo cáo tài chính

### 🤖 Tính năng AI

- **Đề xuất sân phù hợp**: AI phân tích lịch sử và sở thích để đề xuất sân tốt nhất
- **Tối ưu giá cả**: Điều chỉnh giá theo nhu cầu và thời gian
- **Dự đoán lưu lượng**: Phân tích xu hướng đặt sân để tối ưu vận hành

### 🌟 Tính năng thông minh

- **Thông báo tự động**: Gửi nhắc nhở qua email, SMS, push notification
- **Tích hợp thời tiết**: Thông tin thời tiết ảnh hưởng đến việc đặt sân
- **Báo cáo & phân tích**: Dashboard với biểu đồ và thống kê chi tiết

## 🏗️ Kiến trúc hệ thống

### Frontend (React TypeScript)

```
src/
├── components/          # UI Components
│   └── layout/         # Layout components
├── pages/              # Page components
│   ├── auth/          # Authentication pages
│   ├── courts/        # Court management
│   ├── bookings/      # Booking management
│   └── customers/     # Customer management
├── hooks/             # Custom React hooks
├── services/          # API services
├── store/             # Zustand state management
├── types/             # TypeScript definitions
├── utils/             # Utility functions
└── routes/            # Route configurations
```

### Tech Stack

- **Framework**: Vite + React 19 + TypeScript
- **UI Library**: Ant Design 5
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Routing**: React Router 7
- **HTTP Client**: Axios
- **Date Handling**: Day.js

### Backend (Spring Boot)

- RESTful APIs
- JWT Authentication
- MySQL Database
- AI/ML Integration
- Payment Gateway

## 🛠️ Cài đặt và chạy project

### Yêu cầu hệ thống

- Node.js >= 18.0.0
- npm >= 9.0.0

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Cấu hình environment

File `.env` đã được tạo sẵn:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8080/api

# App Configuration
VITE_APP_NAME=Badminton Booking System
VITE_APP_VERSION=1.0.0
```

### 3. Chạy development server

```bash
npm run dev
```

Ứng dụng sẽ chạy tại: **http://localhost:5173**

### 4. Build cho production

```bash
npm run build
```

### 5. Preview production build

```bash
npm run preview
```

## 📱 Hướng dẫn sử dụng

### Đăng nhập hệ thống

1. Truy cập http://localhost:5173/login
2. Hệ thống hỗ trợ 3 role: Admin, Staff, Customer

### Quản lý sân

- **Admin/Staff**: Có thể thêm, sửa, xóa sân
- **Customer**: Chỉ xem thông tin sân

### Đặt lịch

- **Tất cả user**: Có thể đặt lịch sân
- **AI sẽ đề xuất**: Sân phù hợp nhất dựa trên lịch sử và sở thích

## 🔧 Scripts có sẵn

```bash
npm run dev              # Chạy development server
npm run build           # Build cho production
npm run preview         # Preview production build
npm start              # Start production server
npm run lint           # Kiểm tra linting
```

## 📁 Cấu trúc dự án

```
BadmintonBooking/
├── public/                 # Static assets
├── src/                   # Source code
│   ├── components/        # Reusable components
│   ├── pages/            # Page components
│   ├── hooks/            # Custom hooks
│   ├── services/         # API services
│   ├── store/            # State management
│   ├── types/            # TypeScript types
│   └── routes/           # Routing configuration
├── .env                  # Environment variables
├── package.json          # Dependencies & scripts
├── vite.config.ts        # Vite configuration
└── README.md            # Documentation
```

## 🌐 API Endpoints

### Authentication

- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/logout` - Đăng xuất

### Courts

- `GET /api/courts` - Danh sách sân
- `POST /api/courts` - Tạo sân mới
- `PUT /api/courts/:id` - Cập nhật sân

### Bookings

- `GET /api/bookings` - Danh sách booking
- `POST /api/bookings` - Tạo booking mới
- `PUT /api/bookings/:id` - Cập nhật booking

### AI Features

- `POST /api/ai/recommendations/courts` - Đề xuất sân
- `GET /api/ai/recommendations/time/:courtId` - Đề xuất thời gian tối ưu

## 🎯 Roadmap

### Phase 1: Core Features (Hoàn thành)

- [x] Authentication & Authorization
- [x] Basic CRUD operations
- [x] Responsive UI with Ant Design
- [x] State management with Zustand
- [x] API integration setup

### Phase 2: Advanced Features (Đang phát triển)

- [ ] Real-time notifications
- [ ] Payment integration
- [ ] AI recommendation engine
- [ ] Weather integration
- [ ] Advanced analytics

## 👥 Team & Roles

- **Project Manager**: Quản lý dự án và phối hợp team
- **Frontend Developer**: React TypeScript (Repository này)
- **Backend Developer**: Spring Boot API
- **AI/ML Engineer**: Recommendation system

## 📞 Hỗ trợ

Nếu gặp vấn đề trong quá trình setup:

1. Kiểm tra phiên bản Node.js và npm
2. Xóa `node_modules` và chạy lại `npm install`
3. Kiểm tra file `.env` có đúng cấu hình
4. Đảm bảo backend API đang chạy

---

**Chúc bạn code vui vẻ! 🚀**

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x';
import reactDom from 'eslint-plugin-react-dom';

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
