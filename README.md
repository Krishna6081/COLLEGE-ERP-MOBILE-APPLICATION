# College ERP Mobile Application & Backend Suite

A full-stack, enterprise-grade College ERP application built with React Native (Expo) + TypeScript + Node.js (Express) + MySQL.

## Project Architecture
- **Mobile (`mobile/`)**: React Native, TypeScript, Expo, React Navigation, Zustand, Axios, Expo SecureStore.
- **Backend (`backend/`)**: Node.js, Express, TypeScript, MySQL (mysql2/promise), JWT Auth, RBAC, Multer, Winston logging.
- **Database (`database/`)**: Normalized MySQL schema (78 tables), seed script with sample data.
- **Docs (`docs/`)**: API specifications, database design, role matrices, setup guides.

## Quick Start Guide

### 1. Database Setup
Create database and seed sample data:
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

### 2. Backend Start
```bash
cd backend
npm install
npm run db:seed
npm run dev
```

### 3. Mobile App Start
```bash
cd mobile
npm install
npm run start
```

## Features & Modules
- **Authentication**: JWT Access Token + Refresh Token with SecureStore, RBAC permission middleware.
- **Role-Based Dashboards**: Customized screens for Student, Faculty, Admin, HOD, Principal, Parent, Accountant, Librarian, Exam Cell, Placement Officer.
- **Core ERP Modules**:
  - Student & Faculty CRUD
  - Attendance marking & shortage alerts
  - Timetable scheduling & conflict prevention
  - Assignments & Study Material
  - Examinations & Result publication
  - Fee structures & receipt generation
  - Library cataloging & book issues
  - Hostel & Transport allocations
  - Placement drives & application tracking
  - Certificates & QR-verification ID Cards
  - Notices, Events & Grievance complaints
  - Audit logging & System settings

## License
MIT License
