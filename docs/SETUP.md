# College ERP Setup Guide

## Prerequisites
- Node.js v18+ or v20+
- MySQL 8.0+ / MariaDB 10.5+
- Expo CLI (`npm install -g expo-cli`)
- Expo Go mobile app (iOS / Android) or emulator

## Database Initialization
1. Start MySQL and create a new, disposable development database.
2. Inspect `database/schema.sql` before using it. It drops and recreates tables, so run it only against a new disposable database. Never run it against a database containing data you need to keep.
3. Run the schema and seed scripts only against that development database:
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```
The seed accounts and their shared password are development fixtures. Do not use or expose them in production.

## Backend Configuration & Start
1. Go to `backend/` directory:
```bash
cd backend
cp .env.example .env
npm install
```
Edit `.env` to point to the disposable development database before seeding. The example secrets, database password, and wildcard CORS value are development-only. Never copy them into production. Then run:
```bash
npm run db:seed
npm run dev
```
The Express backend listens on `0.0.0.0:5000`; the local API is `http://localhost:5000/api/v1`.

## Mobile Application Start
1. Go to `mobile/` directory:
```bash
cd mobile
npm install
npm run start
```
2. Scan the Expo QR code using Expo Go on your mobile device or launch Android Studio / Xcode Simulator.

### Physical device on a mobile hotspot

- Keep the laptop and phone on the same hotspot network, and start the backend before logging in.
- If Expo host detection does not resolve the laptop address, set `EXPO_PUBLIC_API_URL=http://<laptop-hotspot-ip>:5000/api/v1` in `mobile/.env`. Find the laptop's IPv4 address with `ipconfig`; do not use `localhost` for a physical phone.
- Allow inbound TCP port 5000 through Windows Firewall on the active private network if the phone cannot reach the API.
- Restart Expo after changing the URL with `npx expo start -c` from `mobile/` so the value is included in the app bundle.
- A successful API connection also requires the backend's MySQL database to be available. Physical-device hotspot login has not been verified in this audit.

## Default Credentials
Development seed accounts use password: `password123`. Use them only with a disposable local development database; never deploy these accounts or password.

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

## Safe verification commands

From the repository root, run the checks that do not write to the configured database:

```bash
cd backend
npm run build
npx jest --runInBand --runTestsByPath tests/auth.security.test.ts
cd ../mobile
npx tsc --noEmit
```

Do not run the other backend integration tests until their database configuration is proven to point to a disposable test database.
