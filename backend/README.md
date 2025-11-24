# 🦷 OHIF Dental Backend API

Backend server for OHIF Dental Viewer with JWT authentication and state persistence.

## 🏗️ Tech Stack

- **Node.js** + **Express.js** - Backend framework
- **SQLite3** - Lightweight database
- **JWT** (jsonwebtoken) - Authentication
- **bcryptjs** - Password hashing
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API protection

---

## 📦 Installation

### Prerequisites
- Node.js >= 14.x
- npm or yarn

### Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install
# or
yarn install

# Copy environment file
cp .env.example .env

# Edit .env and set your configuration
# (Optional: Change JWT_SECRET for production)
```

---

## 🚀 Running the Server

### Development Mode (with auto-reload)
```bash
npm run dev
# or
yarn dev
```

### Production Mode
```bash
npm start
# or
yarn start
```

### Initialize Database (optional - done automatically)
```bash
npm run init-db
# or
yarn init-db
```

The server will start on **http://localhost:5000** by default.

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Header
For protected routes, include JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Authentication Endpoints

### 1. Register User
**POST** `/api/auth/register`

**Request Body:**
```json
{
  "email": "dentist@example.com",
  "password": "securePassword123",
  "fullName": "Dr. John Doe",
  "role": "dentist"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "dentist@example.com",
      "fullName": "Dr. John Doe",
      "role": "dentist"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 2. Login User
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "dentist@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "dentist@example.com",
      "fullName": "Dr. John Doe",
      "role": "dentist"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 3. Get Current User
**GET** `/api/auth/me`
**Auth Required:** ✅ Yes

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "dentist@example.com",
      "fullName": "Dr. John Doe",
      "role": "dentist",
      "createdAt": "2025-01-22T10:00:00.000Z"
    }
  }
}
```

---

## 📏 Measurements Endpoints

### 1. Get All Measurements
**GET** `/api/measurements`
**Auth Required:** ✅ Yes
**Query Params:** `patientId`, `studyInstanceUID` (optional)

**Example:**
```
GET /api/measurements?patientId=P123&studyInstanceUID=1.2.3.4.5
```

**Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": {
    "measurements": [
      {
        "id": "measure-uuid-1",
        "type": "periapical_length",
        "label": "Periapical Length",
        "value": 14.5,
        "unit": "mm",
        "toothNumber": {
          "universal": 8,
          "fdi": "11"
        },
        "timestamp": "2025-01-22T10:30:00.000Z",
        "patientId": "P123",
        "studyInstanceUID": "1.2.3.4.5",
        "metadata": null,
        "createdAt": "2025-01-22T10:30:05.000Z"
      }
    ]
  }
}
```

---

### 2. Create Measurement
**POST** `/api/measurements`
**Auth Required:** ✅ Yes

**Request Body:**
```json
{
  "measurementId": "measure-uuid-1",
  "patientId": "P123",
  "studyInstanceUID": "1.2.3.4.5",
  "type": "periapical_length",
  "label": "Periapical Length",
  "value": 14.5,
  "unit": "mm",
  "toothNumber": {
    "universal": 8,
    "fdi": "11"
  },
  "timestamp": "2025-01-22T10:30:00.000Z",
  "metadata": {
    "imageId": "wadouri:...",
    "viewport": 1
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Measurement created successfully",
  "data": {
    "id": "measure-uuid-1",
    "dbId": 1
  }
}
```

---

### 3. Bulk Create Measurements
**POST** `/api/measurements/bulk`
**Auth Required:** ✅ Yes

**Request Body:**
```json
{
  "measurements": [
    {
      "id": "measure-1",
      "patientId": "P123",
      "studyInstanceUID": "1.2.3.4.5",
      "type": "periapical_length",
      "label": "Periapical Length",
      "value": 14.5,
      "unit": "mm",
      "timestamp": "2025-01-22T10:30:00.000Z"
    },
    {
      "id": "measure-2",
      "patientId": "P123",
      "studyInstanceUID": "1.2.3.4.5",
      "type": "canal_angle",
      "label": "Canal Angle",
      "value": 32.0,
      "unit": "degrees",
      "timestamp": "2025-01-22T10:31:00.000Z"
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "2 measurements created successfully",
  "data": {
    "insertedCount": 2,
    "totalSubmitted": 2
  }
}
```

---

### 4. Delete Measurement
**DELETE** `/api/measurements/:id`
**Auth Required:** ✅ Yes

**Example:**
```
DELETE /api/measurements/measure-uuid-1
```

**Response (200):**
```json
{
  "success": true,
  "message": "Measurement deleted successfully"
}
```

---

### 5. Delete All Study Measurements
**DELETE** `/api/measurements/study/:studyInstanceUID`
**Auth Required:** ✅ Yes

**Example:**
```
DELETE /api/measurements/study/1.2.3.4.5
```

**Response (200):**
```json
{
  "success": true,
  "message": "5 measurements deleted successfully"
}
```

---

## 💾 Viewer State Endpoints

### 1. Get Viewer State
**GET** `/api/viewer-state`
**Auth Required:** ✅ Yes
**Query Params:** `patientId`, `studyInstanceUID` (optional)

**Example:**
```
GET /api/viewer-state?patientId=P123&studyInstanceUID=1.2.3.4.5
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "state": {
      "theme": "dental-dark",
      "selectedTeeth": [
        {
          "universal": 8,
          "fdi": "11",
          "quadrant": 1,
          "position": 1
        }
      ],
      "viewportSettings": {
        "windowLevel": 40,
        "windowWidth": 400,
        "zoom": 1.5
      },
      "patientId": "P123",
      "studyInstanceUID": "1.2.3.4.5",
      "lastAccessed": "2025-01-22T10:30:00.000Z"
    }
  }
}
```

---

### 2. Save Viewer State
**POST** `/api/viewer-state`
**Auth Required:** ✅ Yes

**Request Body:**
```json
{
  "patientId": "P123",
  "studyInstanceUID": "1.2.3.4.5",
  "theme": "dental-dark",
  "selectedTeeth": [
    {
      "universal": 8,
      "fdi": "11",
      "quadrant": 1,
      "position": 1
    }
  ],
  "viewportSettings": {
    "windowLevel": 40,
    "windowWidth": 400,
    "zoom": 1.5
  }
}
```

**Response (201 or 200):**
```json
{
  "success": true,
  "message": "Viewer state saved successfully",
  "data": {
    "id": 1
  }
}
```

---

### 3. Delete Viewer State
**DELETE** `/api/viewer-state`
**Auth Required:** ✅ Yes
**Query Params:** `patientId` or `studyInstanceUID` (required)

**Example:**
```
DELETE /api/viewer-state?patientId=P123&studyInstanceUID=1.2.3.4.5
```

**Response (200):**
```json
{
  "success": true,
  "message": "1 viewer state(s) deleted successfully"
}
```

---

## ❌ Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (development only)"
}
```

### Common Error Codes

- **400** - Bad Request (missing/invalid parameters)
- **401** - Unauthorized (invalid/missing token)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found
- **409** - Conflict (duplicate resource)
- **500** - Internal Server Error

---

## 🧪 Testing the API

### Using cURL

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Get Measurements (with token):**
```bash
curl -X GET http://localhost:5000/api/measurements \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Postman

1. Import the API endpoints
2. Set environment variable `BASE_URL` = `http://localhost:5000`
3. For protected routes, add header: `Authorization: Bearer <token>`

---

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'dentist',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Measurements Table
```sql
CREATE TABLE measurements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  measurement_id TEXT UNIQUE NOT NULL,
  patient_id TEXT NOT NULL,
  study_instance_uid TEXT NOT NULL,
  type TEXT NOT NULL,
  label TEXT NOT NULL,
  value REAL NOT NULL,
  unit TEXT NOT NULL,
  tooth_number_universal INTEGER,
  tooth_number_fdi TEXT,
  timestamp DATETIME NOT NULL,
  metadata TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Viewer State Table
```sql
CREATE TABLE viewer_state (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  patient_id TEXT,
  study_instance_uid TEXT,
  theme TEXT DEFAULT 'dental',
  selected_teeth TEXT,
  viewport_settings TEXT,
  last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, patient_id, study_instance_uid)
);
```

---

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt with salt rounds
- **Helmet.js** - Security headers
- **CORS** - Configured for frontend origin only
- **Rate Limiting** - 100 requests per 15 minutes
- **Input Validation** - Email and password validation
- **SQL Injection Protection** - Parameterized queries

---

## 📝 Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d

# Database
DB_PATH=./dental_viewer.db

# CORS
FRONTEND_URL=http://localhost:3000
```

---

## 🚀 Deployment

### Production Checklist

- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Set `NODE_ENV=production`
- [ ] Use proper database (PostgreSQL/MySQL) instead of SQLite for scale
- [ ] Set up HTTPS/SSL
- [ ] Configure proper CORS origins
- [ ] Set up logging (Winston, Morgan)
- [ ] Add monitoring (PM2, New Relic)
- [ ] Configure rate limiting per use case
- [ ] Set up backups for database

### Deployment Platforms

- **Railway** - Easy Node.js deployment
- **Render** - Free tier available
- **Heroku** - Simple deployment
- **AWS EC2** - Full control
- **DigitalOcean** - Droplets or App Platform

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🤝 Support

For issues or questions:
1. Check this README
2. Review the API responses for error messages
3. Check server logs in console

---

**Backend Status:** ✅ Fully Functional
**Version:** 1.0.0
**Last Updated:** January 2025
