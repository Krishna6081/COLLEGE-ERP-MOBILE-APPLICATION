# College ERP Setup Guide

## Prerequisites
- Node.js v18+ or v20+
- MySQL 8.0+ / MariaDB 10.5+
- Expo CLI (`npm install -g expo-cli`)
- Expo Go mobile app (iOS / Android) or emulator

## Database Initialization
1. Start your local MySQL server.
2. Run schema and seed scripts:
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

## Backend Configuration & Start
1. Go to `backend/` directory:
```bash
cd backend
cp .env.example .env
npm install
npm run db:seed
npm run dev
```
The Express backend server runs on `http://localhost:5000/api/v1`.

## Mobile Application Start
1. Go to `mobile/` directory:
```bash
cd mobile
npm install
npm run start
```
2. Scan the Expo QR code using Expo Go on your mobile device or launch Android Studio / Xcode Simulator.

## Default Credentials
All seed accounts use password: `password123`

| Role | Username | Email |
|---|---|---|
| Super Admin | superadmin | superadmin@mit-eng.edu |
| College Admin | collegeadmin | admin@mit-eng.edu |
| Principal | principal | principal@mit-eng.edu |
| Vice Principal | viceprincipal | vp@mit-eng.edu |
| HOD (CSE) | hod_cse | hod.cse@mit-eng.edu |
| Faculty | faculty_john | john.smith@mit-eng.edu |
| Student | student_alex | alex.johnson@student.mit-eng.edu |
| Parent | parent_david | david.johnson@gmail.com |
| Accountant | accountant | accountant@mit-eng.edu |
| Librarian | librarian | librarian@mit-eng.edu |
| Exam Cell | examcell | examcell@mit-eng.edu |
| Placement Officer | placement | placement@mit-eng.edu |
