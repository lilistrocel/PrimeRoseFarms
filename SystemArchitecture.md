# System Architecture

This document tracks the structure and communication patterns of the PrimeRoseFarms application(s).

## Current Status

**Project Phase:** Architecture Planning
**Architecture Status:** Multi-role agricultural farm management system
**Target Users:** Admin, Manager, Agronomist, Farmer, Worker, HR, Sales, Demo Account

## Project Structure

```
PrimeRoseFarms/
├── CodingRules.md          # Development guidelines and standards
├── DevLog.md              # Development progress and decisions log
├── SystemArchitecture.md  # This file - system structure documentation
└── README.md              # Project overview
```

## User Roles and Interfaces

### Role Definitions
1. **Admin** - Full system access, user management, system configuration
2. **Manager** - Farm operations oversight, reporting, resource allocation
3. **Agronomist** - Crop planning, soil analysis, agricultural expertise
4. **Farmer** - Field management, worker supervision, daily operations
5. **Worker** - Field tasks, harvesting, planting, maintenance
6. **HR** - Personnel management, scheduling, payroll
7. **Sales** - Customer relations, order management, market analysis
8. **Demo Account** - Limited access for demonstrations and training

### Interface Requirements
- Role-based dashboard customization
- Contextual navigation and features
- Permission-based data access
- Responsive design for mobile/tablet field use

## Application Architecture

### Proposed Architecture: Multi-Tenant Web Application
- **Frontend:** React-based SPA with role-based routing
- **Backend:** Node.js/Express API with role-based middleware
- **Database:** PostgreSQL with role-based access control
- **Authentication:** JWT-based with role claims
- **Real-time:** WebSocket for live updates (harvest progress, alerts)

### Core Modules
1. **Authentication & Authorization**
2. **User Management**
3. **Farm Operations**
4. **Crop Management**
5. **Worker Management**
6. **Inventory & Equipment**
7. **Reporting & Analytics**
8. **Communication System**

## Communication Patterns

### API Communication
- RESTful APIs for CRUD operations
- WebSocket for real-time updates
- Role-based endpoint access control

### Data Flow
- Centralized state management (Redux/Context)
- Role-based data filtering at API level
- Real-time synchronization for critical operations

## Technology Stack

### Frontend
- **Framework:** React 18+ with TypeScript
- **State Management:** Redux Toolkit
- **UI Library:** Material-UI or Ant Design
- **Routing:** React Router with role-based guards
- **Charts:** Chart.js or Recharts for analytics

### Backend
- **Runtime:** Node.js with Express
- **Language:** TypeScript
- **Authentication:** Passport.js with JWT
- **Database ORM:** Prisma or TypeORM
- **Real-time:** Socket.io

### Database
- **Primary:** PostgreSQL
- **Caching:** Redis (optional)
- **File Storage:** AWS S3 or local storage

### DevOps
- **Containerization:** Docker
- **Process Management:** PM2
- **Environment:** Windows 11 Pro development

## Dependencies

*To be defined during implementation phase*

---

**Last Updated:** Initial creation
**Version:** 1.0
