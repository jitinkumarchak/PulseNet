
# PulseNet 🚑

### Real-Time Emergency Healthcare Coordination Platform

PulseNet is a full-stack healthcare coordination platform that helps patients find nearby hospitals, check resource availability, request emergency care, and receive real-time updates. Hospitals can manage resources, handle incoming emergency requests, and coordinate ambulance services through a dedicated dashboard.

---

## 📸 Screenshots

### Patient Registration

<img width="1536" height="1024" alt="image" src="https://github.com/user-attachments/assets/9739e6c0-2afa-4107-a350-5637824f72fb" />

### Appointment Scheduling

<img width="1536" height="1024" alt="image" src="https://github.com/user-attachments/assets/cb535e86-f6d8-4586-9499-b8566c61ee3f" />


### Hospital Dashboard

<img width="1536" height="1024" alt="image" src="https://github.com/user-attachments/assets/78c551e7-056c-4759-839d-8fe57793c910" />


### Emergency Request System

*Add screenshot here*

### Maps & Hospital Discovery

*Add screenshot here*

---

## ✨ Features

### 👤 Patient Features

* User Registration & Authentication
* Find Nearby Hospitals
* View ICU & General Bed Availability
* Emergency Bed Requests
* Real-Time Request Status Tracking
* Appointment Scheduling
* Interactive Hospital Map
* Ambulance Tracking (In Progress)
* Live Notifications

### 🏥 Hospital Features

* Hospital Authentication
* Resource Management
* ICU Bed Management
* General Bed Management
* Oxygen Availability Management
* Incoming Emergency Request Dashboard
* Approve / Reject Requests
* Real-Time Updates via Socket.io
* Ambulance Assignment

### 🚑 Ambulance Features

* Ambulance Management
* Availability Tracking
* Automatic Assignment
* Live Location Tracking (Upcoming)

### 👨‍💼 Admin Features

* Doctor Management
* Department Management
* Hospital Monitoring
* Analytics Dashboard
* User Management

---

# 🏗️ System Architecture

```text
Patient
   │
   ▼
React Frontend
   │
   ▼
Node.js + Express API
   │
 ┌─┴───────────────┐
 │ Socket.io Server │
 └─┬───────────────┘
   │
   ▼
MongoDB Atlas
```

### Core Services

* Authentication Service
* Hospital Recommendation Engine
* Request Management Service
* Ambulance Assignment Service
* Real-Time Notification Service

---

# 🛠️ Tech Stack

## Frontend

* React.js
* Vite
* Tailwind CSS
* React Router DOM
* Socket.io Client
* React Leaflet
* Framer Motion

## Backend

* Node.js
* Express.js
* Socket.io
* JWT Authentication
* bcryptjs

## Database

* MongoDB
* Mongoose

## Maps

* OpenStreetMap
* Leaflet

## Deployment

* Frontend: Vercel
* Backend: Render / Railway
* Database: MongoDB Atlas

---

# 📂 Project Structure

```bash
PulseNet
│
├── frontend
│   ├── src
│   │   ├── pages
│   │   ├── components
│   │   ├── services
│   │   ├── hooks
│   │   └── assets
│
├── backend
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── socket
│   └── server.js
│
└── README.md
```

---

# 🗄️ Database Collections

## Users

```js
{
  name,
  email,
  password,
  phone,
  address
}
```

## Hospitals

```js
{
  name,
  email,
  resources,
  location,
  reliabilityScore
}
```

## Requests

```js
{
  userId,
  hospitalId,
  type,
  status,
  ambulanceAssigned
}
```

## Ambulances

```js
{
  hospitalId,
  driverName,
  status,
  location
}
```

---

# ⚡ Real-Time Features

PulseNet uses Socket.io rooms for targeted communication.

### Hospital Rooms

```js
joinHospital(hospitalId)
```

### User Rooms

```js
joinUser(userId)
```

### Events

```js
newRequest
requestUpdated
userRequestUpdated
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/jitinkumarchak/PulseNet.git
```

---

## Backend Setup

```bash
cd backend

npm install
```

Create `.env`

```env
PORT=5000

MONGO_URI=your_mongodb_uri

JWT_SECRET=your_secret_key
```

Run Backend

```bash
npm run dev
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

---

# 🔥 Current Development Status

### Completed

* [x] Hospital Authentication
* [x] Resource Management
* [x] Emergency Request System
* [x] Real-Time Updates
* [x] Socket Rooms
* [x] Hospital Recommendation Logic
* [x] Interactive Maps
* [x] Dashboard UI
* [x] Ambulance Assignment Logic

### In Progress

* [ ] Live Ambulance Tracking
* [ ] Doctor Management
* [ ] Department Management
* [ ] Appointment Booking
* [ ] Push Notifications
* [ ] Admin Analytics

---

# 🎯 Future Enhancements

* AI-Based Hospital Recommendation
* Predictive Bed Availability
* Ambulance ETA Estimation
* Push Notifications
* Multi-Hospital Coordination
* Health Records Integration
* Emergency Contact Integration

---

# 👨‍💻 Author

**Jitin Kumar Chak**

Founder & Developer of PulseNet

GitHub:

[Jitin Kumar Chak GitHub](https://github.com/jitinkumarchak?utm_source=chatgpt.com)

---

# 📜 License

This project is licensed under the MIT License.

---
