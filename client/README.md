# PrimeRose Farms - Frontend Application

A dual-interface agricultural farm management application with role-based routing and responsive design.

## 🌟 Features

### 🖥️ **Desktop Interface** (Complex Roles)
- **Target Users:** Admin, Manager, Agronomist, HR, Sales
- **Features:**
  - Comprehensive dashboard with analytics
  - Advanced data visualization
  - Complex forms and data entry
  - Multi-panel layouts
  - Real-time notifications
  - Role-based navigation

### 📱 **Mobile Interface** (Field Roles)
- **Target Users:** Worker, Farmer (Driver)
- **Features:**
  - Simplified, touch-friendly interface
  - Large buttons and easy navigation
  - Essential functions only
  - Offline capabilities (planned)
  - Task management
  - Quick data entry

## 🔧 Technology Stack

- **React 18+** with TypeScript
- **Material-UI (MUI)** for UI components
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Axios** for API communication
- **React Device Detect** for responsive interface selection

## 🏗️ Architecture

### Role-Based Interface Selection
```
User Role → Interface Type
├── Admin, Manager, Agronomist, HR, Sales → Desktop Interface
└── Worker, Farmer → Mobile Interface
```

### Interface Components
```
src/
├── components/
│   ├── common/           # Shared components
│   ├── auth/            # Authentication components
│   ├── desktop/         # Desktop interface
│   │   ├── layout/      # Desktop layout components
│   │   └── pages/       # Desktop pages
│   └── mobile/          # Mobile interface
│       ├── layout/      # Mobile layout components
│       └── pages/       # Mobile pages
├── store/               # Redux store and slices
├── types/               # TypeScript type definitions
└── utils/               # Utility functions
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Backend API running on port 3000

### Installation
```bash
cd client
npm install
```

### Development
```bash
npm start
```
Opens [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables
Create a `.env` file in the client directory:
```env
REACT_APP_API_URL=http://localhost:3000
```

### Build for Production
```bash
npm run build
```

## 🎨 Interface Design Principles

### Desktop Interface
- **Information Dense:** Multiple data points and complex visualizations
- **Productivity Focused:** Keyboard shortcuts, batch operations, advanced filters
- **Professional UI:** Clean, modern design suitable for office environments
- **Multi-Window Support:** Side panels, modal dialogs, tabbed interfaces

### Mobile Interface
- **Touch-First:** Large touch targets (48px+), gesture support
- **Simplified Workflow:** Step-by-step processes, single-task focus
- **Field-Ready:** High contrast, readable in bright light
- **Offline Support:** Local storage for critical functions (planned)

## 📱 Responsive Behavior

The application automatically detects:
1. **User Role** from authentication
2. **Device Type** using react-device-detect
3. **Routes to appropriate interface:**
   - Desktop roles → Desktop interface (unless on mobile device)
   - Mobile roles → Mobile interface (regardless of device)

## 🔐 Authentication Flow

1. User logs in with email/password
2. System verifies credentials and retrieves user role
3. Interface router determines appropriate interface
4. User is redirected to role-specific dashboard

### Demo Accounts
- **Manager:** manager@primerose.com / demo123
- **Worker:** worker@primerose.com / demo123

## 🛠️ Development Guidelines

### Component Structure
```tsx
// Desktop Component Example
const DesktopComponent: React.FC<Props> = ({ user }) => {
  // Complex logic, multiple states
  return (
    <Card>
      {/* Information-dense layout */}
    </Card>
  );
};

// Mobile Component Example  
const MobileComponent: React.FC<Props> = ({ user }) => {
  // Simplified logic, focused functionality
  return (
    <Box sx={{ p: 2 }}>
      {/* Touch-friendly layout */}
    </Box>
  );
};
```

### State Management
- **Redux Toolkit** for global state
- **Local state** for component-specific data
- **Async thunks** for API calls
- **Error handling** with user-friendly messages

### Styling Guidelines
- **Material-UI theme** for consistent design
- **Responsive breakpoints** for different screen sizes
- **Touch-friendly** sizing for mobile (48px+ targets)
- **High contrast** for outdoor visibility

## 📦 Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run test suite
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 🔗 API Integration

The frontend communicates with the backend API for:
- Authentication and authorization
- User management
- Farm and crop data
- Task management
- Real-time updates

### API Configuration
```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
```

## 📈 Performance Considerations

- **Code splitting** by interface type
- **Lazy loading** for non-critical components  
- **Optimistic updates** for better UX
- **Caching** for frequently accessed data
- **Image optimization** for mobile networks

## 🚧 Roadmap

### Phase 1 (Current)
- ✅ Basic dual interface architecture
- ✅ Role-based routing
- ✅ Authentication system
- ✅ Basic dashboard and task management

### Phase 2 (Next)
- 🔄 Complete page implementations
- 🔄 Real-time data integration
- 🔄 Offline support for mobile
- 🔄 Advanced analytics and charts

### Phase 3 (Future)
- 📋 Push notifications
- 📋 PWA capabilities
- 📋 Advanced reporting
- 📋 Machine learning insights

## 🤝 Contributing

1. Follow the established architecture patterns
2. Maintain separation between desktop and mobile interfaces
3. Write responsive, accessible code
4. Test on both desktop and mobile devices
5. Update documentation for new features

---

**Built with ❤️ for modern agricultural operations**