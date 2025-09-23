# PrimeRoseFarms - Agricultural Farm Management System

A comprehensive, role-based farm management application designed for modern agricultural operations. Features intelligent automation, real-time monitoring, and business process-driven workflows.

## 🌟 Features

- **Role-Based Access Control** - Admin, Manager, Agronomist, Farmer, Worker, HR, Sales, Demo roles
- **Dual Interface Design** - Desktop for complex operations, mobile for field workers
- **Intelligent Automation** - Sensor-driven automation with manager configuration
- **Real-Time Monitoring** - IoT sensor integration with automated alerts
- **Business Process-Driven** - 15 comprehensive business processes documented and implemented
- **Cost Management** - Automated budget calculations and profitability analysis
- **Market Intelligence** - External price feeds and predictive analysis
- **Multi-Farm Support** - Manage multiple farms with granular permissions

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** 9.0.0 or higher
- **MongoDB** (local installation or Docker)

### Installation Options

#### Option 1: Complete Quick Start (Recommended)
```powershell
# Clone the repository
git clone https://github.com/primerosefarms/farm-management-system.git
cd farm-management-system

# Run complete setup and start
.\quick-start.ps1
```

#### Option 2: Manual Setup
```powershell
# Install dependencies
npm run install:all

# Setup environment
npm run setup

# Start development servers
npm run start-dev

# Create demo users
npm run create-demo-users
```

#### Option 3: Individual Commands
```powershell
# Backend only
npm run dev

# Frontend only (in separate terminal)
npm run dev:frontend

# Both simultaneously
npm run dev:both
```

### 🔧 Development Scripts

| Command | Description |
|---------|-------------|
| `npm run quick-start` | Complete setup and start (recommended for first time) |
| `npm run start-dev` | Start both frontend and backend |
| `npm run stop-dev` | Stop all development servers |
| `npm run create-demo-users` | Create demo users for testing |
| `npm run dev` | Start backend only |
| `npm run dev:frontend` | Start frontend only |
| `npm run install:all` | Install all dependencies |

## 🌐 Application URLs

- **Frontend Application**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **API Health Check**: http://localhost:3000/api/v1/health

## 👤 Demo Accounts

All demo accounts use password: `demo123`

| Role | Email | Description |
|------|-------|-------------|
| Admin | admin@primerose.com | Full system access |
| Manager | manager@primerose.com | Farm operations oversight |
| Agronomist | agronomist@primerose.com | Plant data and expertise |
| Farmer | farmer@primerose.com | Field management |
| Worker | worker@primerose.com | Field tasks execution |
| HR | hr@primerose.com | Personnel management |
| Sales | sales@primerose.com | Customer relations |
| Demo | demo@primerose.com | Limited demo access |

## 📋 System Architecture

### Backend Structure
```
src/
├── middleware/          # Authentication, logging, security
├── models/             # 15 comprehensive database models
├── routes/             # Business process-driven APIs
├── utils/              # Encryption, logging utilities
├── config/             # Database and environment config
└── types/              # TypeScript interfaces
```

### Frontend Structure
```
client/
├── src/
│   ├── components/     # React components
│   │   ├── desktop/    # Desktop interface
│   │   └── mobile/     # Mobile interface
│   ├── store/          # Redux state management
│   ├── types/          # TypeScript interfaces
│   └── utils/          # Frontend utilities
```

## 🔒 Security Features

- **Multi-Layer Encryption** - AES-256-GCM with field-level encryption
- **JWT Authentication** - Role-based token authentication
- **Granular Permissions** - Farm-specific, block-level, time-based access
- **Audit Trails** - Comprehensive activity logging
- **Data Protection** - Four-level classification system

## 📊 Core Business Processes

1. **Agronomist Plant Data Input** - Plant specifications and care schedules
2. **Manager Block Management** - Block assignment and capacity planning
3. **Manager Plant Assignment** - Plant-to-block optimization
4. **Harvester Recording** - Quality assessment and yield tracking
5. **Customer Order Management** - Multi-channel order processing
6. **Farm Planning Management** - Strategic planning and target setting
7. **Workforce Management** - Automated task generation and tracking
8. **Sensor Data Management** - Real-time monitoring and automation
9. **Market Data Intelligence** - Price prediction and analysis
10. **Financial Planning** - Budget calculation and P&L tracking
11. **Environmental Data Integration** - Weather and sensor data fusion

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **MongoDB** with Mongoose
- **JWT** authentication
- **Winston** logging
- **Helmet** security

### Frontend
- **React 18** with TypeScript
- **Redux Toolkit** state management
- **Material-UI** components
- **React Router** routing
- **Axios** HTTP client

### Database Models
- **15 Comprehensive Models** covering all farm operations
- **Advanced Business Logic** with calculations and validations
- **Performance Optimized** with strategic indexing
- **Type Safe** with zero TypeScript errors

## 🔧 Development

### MongoDB Setup

#### Option 1: Docker (Recommended)
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### Option 2: Local Installation
Download and install MongoDB from [mongodb.com](https://www.mongodb.com/try/download/community)

#### Option 3: MongoDB Atlas
Use cloud MongoDB service at [mongodb.com/atlas](https://www.mongodb.com/atlas)

### Environment Configuration

Copy `env.example` to `.env` and configure:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/primerosefarms

# JWT Secrets
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# Encryption Keys
ENCRYPTION_KEY_PUBLIC=base64-encoded-key
ENCRYPTION_KEY_INTERNAL=base64-encoded-key
ENCRYPTION_KEY_CONFIDENTIAL=base64-encoded-key
ENCRYPTION_KEY_RESTRICTED=base64-encoded-key
```

### Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📈 API Documentation

The system implements business process-driven APIs focused on workflows rather than generic CRUD operations:

- **Manager APIs** (`/api/v1/manager/`) - Strategic planning and optimization
- **Worker APIs** (`/api/v1/worker/`) - Task management and execution
- **Sales APIs** (`/api/v1/sales/`) - Order management and customer relations
- **Sensor APIs** (`/api/v1/sensor/`) - Real-time monitoring and control

See `API_DOCUMENTATION.md` for detailed endpoint documentation.

## 🏗️ Project Status

- ✅ **Backend**: Complete with 15 models and business process APIs
- ✅ **Frontend**: React app with dual-interface architecture
- ✅ **Authentication**: JWT with granular permissions
- ✅ **Database**: Comprehensive models with business logic
- ✅ **Security**: Multi-layer encryption and audit trails
- ✅ **Documentation**: Complete process flow and API documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and ensure they pass
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue on GitHub
- Check the documentation in `/docs`
- Review the process flows in `ProcessFlow.md`
- Examine the system architecture in `SystemArchitecture.md`

## 🎯 Roadmap

- [ ] Advanced analytics dashboard
- [ ] Mobile app for field workers
- [ ] Machine learning yield predictions
- [ ] Integration with external market APIs
- [ ] Advanced reporting system
- [ ] Multi-language support

---

**Built with 🌱 for modern agriculture**