# College ERP Mobile Application & Backend Suite

A full-stack, enterprise-grade College ERP application built with React Native (Expo) + TypeScript + Node.js (Express) + MySQL.

## Project Architecture
- **Mobile (`mobile/`)**: React Native, TypeScript, Expo, React Navigation, Zustand, Axios, Expo SecureStore.
- **Backend (`backend/`)**: Node.js, Express, TypeScript, MySQL (mysql2/promise), JWT Auth, RBAC, Multer, Winston logging.
- **Database (`database/`)**: MySQL bootstrap schema (81 tables), seed script with development sample data.
- **Docs (`docs/`)**: API specifications, database design, role matrices, setup guides.

## Quick Start Guide

### 1. Database Setup
Use a new, disposable development database. `database/schema.sql` creates `college_erp_db`, drops existing tables, and recreates them; never run it against a database containing data you need to keep or against production.
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
The feature areas below are represented to different degrees in the current codebase. This list does not claim complete CRUD or verified database persistence; see the audit reports in `docs/` for route, screen, permission, and test status.
- **Authentication**: JWT Access Token + Refresh Token with SecureStore, RBAC permission middleware.
- **Role-Based Dashboards**: Screens are provided for all 13 roles: Super Admin, College Admin, Principal, Vice Principal, HOD, Faculty, Student, Parent, Accountant, Librarian, Exam Cell, Placement Officer, and Non-Teaching Staff. Dashboard data and full role permissions are not yet verified end to end; see the audit reports in `docs/`.
- **Feature areas**:
  - Student and faculty records, attendance, timetable, assignments, study materials, examinations, and results.
  - Fees and manual payment recording; online payment processing is not configured.
  - Library catalog and circulation, placement drives, notices, events, complaints, and certificate requests.
  - Super Admin college, role, academic configuration, and settings screens.
  - Hostel, transport, scholarships, assets, laboratories, ID cards, and messaging have schema tables but lack complete mobile/API workflows.

## License
MIT License
