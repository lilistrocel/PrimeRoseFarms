# 🚀 PrimeRose Farms Setup Guide

## ❌ **Current Issues Fixed:**

### 1. ✅ **Duplicate Schema Index Warnings**
- **Fixed:** Removed `unique: true` from schema fields that also have explicit `.index()` calls
- **Models Updated:** UserData, CustomerData, SensorData, InventoryData
- **Result:** No more mongoose index warnings

### 2. 🔧 **MongoDB Connection Issue**
The application needs a MongoDB database to run. You have three options:

## 📊 **MongoDB Setup Options:**

### **Option A: MongoDB Atlas (Cloud) - RECOMMENDED for Development**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Update the `.env` file

### **Option B: Local MongoDB Installation**
1. Download and install [MongoDB Community Server](https://www.mongodb.com/try/download/community)
2. Start MongoDB service:
   ```bash
   # Windows (if installed as service)
   net start MongoDB
   
   # Or run manually
   mongod --dbpath "C:\data\db"
   ```

### **Option C: Docker MongoDB (Quickest)**
```bash
# Install Docker Desktop if not installed
# Then run:
docker run --name primerose-mongo -p 27017:27017 -d mongo:latest
```

## 🔧 **Environment Configuration:**

### **Step 1: Create .env file**
```bash
# Copy the example file
copy env.example .env
```

### **Step 2: Update .env with your MongoDB connection**

**For MongoDB Atlas:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/primerosefarms?retryWrites=true&w=majority
```

**For Local MongoDB:**
```env
MONGODB_URI=mongodb://localhost:27017/primerosefarms
```

**For Docker MongoDB:**
```env
MONGODB_URI=mongodb://localhost:27017/primerosefarms
```

### **Step 3: Update other environment variables**
The `.env` file has placeholder values. Update these for security:

```env
# JWT Configuration (change these!)
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here

# Encryption Key (must be exactly 32 characters)
ENCRYPTION_KEY=your-32-character-encryption-key!!
```

## 🏃‍♂️ **Running the Application:**

### **Backend (API Server)**
```bash
# Build and start backend
npm run build
npm start

# OR for development with auto-reload
npm run dev
```

### **Frontend (React App)**
```bash
# In a new terminal
cd client
npm start
```

## 🔗 **Access the Application:**

### **Frontend Interfaces:**
- **Frontend:** http://localhost:3001
- **API:** http://localhost:3000

### **Demo Accounts:**
```
Manager: manager@primerose.com / demo123
Worker: worker@primerose.com / demo123
```

### **Interface Selection:**
- **Desktop Interface:** Admin, Manager, Agronomist, HR, Sales
- **Mobile Interface:** Worker, Farmer

## 📱 **Testing Both Interfaces:**

### **Desktop Interface (Complex)**
1. Open http://localhost:3001 on desktop browser
2. Login as: `manager@primerose.com` / `demo123`
3. You'll see a comprehensive dashboard with:
   - Advanced analytics and charts
   - Multi-panel layouts
   - Complex data visualization
   - Full navigation sidebar

### **Mobile Interface (Simplified)**
1. Open http://localhost:3001 on mobile browser OR
2. Use Chrome DevTools to simulate mobile device
3. Login as: `worker@primerose.com` / `demo123`
4. You'll see a simplified interface with:
   - Large touch-friendly buttons
   - Bottom navigation
   - Task-focused layout
   - Essential functions only

## 🛠️ **Development Commands:**

### **Backend:**
```bash
npm run dev          # Development with auto-reload
npm run build        # Build TypeScript
npm start            # Start production server
npm test             # Run comprehensive tests
npm run test:watch   # Run tests in watch mode
```

### **Frontend:**
```bash
cd client
npm start            # Start React development server
npm run build        # Build for production
npm test             # Run React tests
```

## 🐛 **Troubleshooting:**

### **MongoDB Connection Issues:**
- ✅ Check if MongoDB is running
- ✅ Verify connection string in `.env`
- ✅ Check firewall settings
- ✅ For Atlas: Whitelist your IP address

### **Port Conflicts:**
- **Backend:** Port 3000 (change with `PORT=3001` in .env)
- **Frontend:** Port 3001 (React will auto-assign if 3000 is taken)

### **Dependencies Issues:**
```bash
# Backend
npm install

# Frontend
cd client && npm install
```

## 🎯 **Next Steps:**

Once both interfaces are running:
1. **Test Role-Based Routing:** Login with different roles to see interface switching
2. **Mobile Testing:** Use responsive design tools to test mobile interface
3. **API Testing:** Use the desktop interface to interact with the backend APIs
4. **Development:** Start building additional features using the established patterns

---

**🌱 Your agricultural farm management system is ready to grow!**
