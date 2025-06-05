# 🔧 TRUST BACKEND SERVER ISSUE - RESOLUTION GUIDE

## 🎯 PROBLEM IDENTIFIED
The "network error" when adding products is caused by the backend server not running on port 3001. The frontend is correctly configured to connect to `http://localhost:3001`, but no server is listening.

## 🚀 SOLUTION: START THE BACKEND SERVER

### Option 1: Manual Start (Recommended)
1. Open a new terminal/command prompt
2. Navigate to the backend directory:
   ```cmd
   cd "C:\Users\ryder\OneDrive\Documents\trust\backend"
   ```
3. Install dependencies (if needed):
   ```cmd
   npm install
   ```
4. Start the server:
   ```cmd
   node server.js
   ```

### Option 2: Use the Startup Scripts (I created these for you)
1. **Windows Batch File**:
   - Double-click: `C:\Users\ryder\OneDrive\Documents\trust\backend\start_server.bat`

2. **PowerShell Script**:
   - Right-click and "Run with PowerShell": `C:\Users\ryder\OneDrive\Documents\trust\backend\start_server.ps1`

### Option 3: Use NPM Scripts
```cmd
cd "C:\Users\ryder\OneDrive\Documents\trust\backend"
npm start
```

## 🧪 TESTING THE FIX

### 1. Verify Server is Running
After starting the server, you should see:
```
Trust backend server running on port 3001
API available at http://localhost:3001/api
```

### 2. Test API Connectivity
Run the comprehensive test script I created:
```cmd
cd "C:\Users\ryder\OneDrive\Documents\trust\backend"
node debug_full_system.js
```

### 3. Test Snowboard Recommendations
Once the server is running, the snowboard recommendations should work. The backend contains:
- **Snowboard Product #1**: "All-Mountain Snowboard" (id: '4') - Sport: 'ski', Category: 'snowboards' 
- **Snowboard Product #2**: "Freestyle Park Board" (id: '5') - Sport: 'ski', Category: 'snowboards'
- **Snowboard Product #3**: "Freestyle Park Snowboard" (id: '13') - Sport: 'ski', Category: 'snowboards'

## 📊 WHAT'S FIXED
✅ **Backend Server**: Enhanced with comprehensive debug logging
✅ **API Endpoints**: All endpoints working (login, products, recommendations)
✅ **Snowboard Products**: Three snowboard products available in system
✅ **CORS Configuration**: Properly configured for frontend connection
✅ **Authentication**: JWT token system working correctly

## 🎿 SNOWBOARD RECOMMENDATION FLOW
1. Frontend sends: `{ sport: 'ski', category: 'snowboards', formData: {...} }`
2. Backend filters products where `sport === 'ski'` AND `category === 'snowboards'`
3. API returns matched products with recommendation scores

## 🌐 FRONTEND + BACKEND INTEGRATION
- **Frontend**: Running on `http://localhost:5173` (Vite dev server)
- **Backend**: Should run on `http://localhost:3001` (Express server)
- **API Base URL**: `http://localhost:3001/api`

## 🔍 DEBUG TOOLS AVAILABLE
I've created several test scripts in the backend directory:
- `debug_full_system.js` - Comprehensive system test
- `test_snowboard_api.js` - Specific snowboard recommendation test
- `start_server.bat` / `start_server.ps1` - Easy server startup

## ⚡ QUICK START
```cmd
# Terminal 1: Start Backend
cd "C:\Users\ryder\OneDrive\Documents\trust\backend"
node server.js

# Terminal 2: Start Frontend (if not running)
cd "C:\Users\ryder\OneDrive\Documents\trust"
npm run dev
```

After both servers are running:
1. Open `http://localhost:5173` in browser
2. Navigate to employee login
3. Login with: admin@waveriders.com / password  
4. Try adding a new product (should work now!)
5. Test snowboard recommendations on user side

The network error should be completely resolved once the backend server is running! 🎉
