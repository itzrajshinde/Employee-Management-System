# QuickEMS — Employee Management System

A full-stack Employee Management System for handling attendance, leave, payslips, and automated notifications.

## Features

- Role-based access control (Admin / Employee)
- Employee CRUD management
- Attendance tracking with clock-in / clock-out
- Leave application and approval workflow
- Payslip generation and print view
- Dashboard with key metrics
- Automated email reminders via background jobs (Inngest)
  - Auto check-out after 10 hours with a 9-hour reminder
  - Leave action reminder to admin after 24 hours
  - Daily attendance reminder cron at 11:30 AM UTC

## Tech Stack

**Frontend** — React 19, Vite, Tailwind CSS 4, React Router 7, Axios, Lucide React

**Backend** — Node.js 20, Express 5, MongoDB (Mongoose), JWT, Bcrypt, Inngest, Nodemailer (Brevo SMTP)

## Project Structure

```
├── client/          # React frontend (Vite)
├── server/          # Express backend
└── vercel.json      # Root deployment config
```

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB Atlas URI
- Inngest account (event key + signing key)
- Brevo SMTP credentials

### 1. Clone the repo

```bash
git clone https://github.com/your-username/quickems.git
cd quickems
```

### 2. Configure environment variables

**`server/.env`**
```env
JWT_SECRET=your_jwt_secret
MONGODB_URI=your_mongodb_connection_string
ADMIN_EMAIL=admin@example.com
INNGEST_EVENT_KEY=your_inngest_event_key
INNGEST_SIGNING_KEY=your_inngest_signing_key
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SENDER_EMAIL=your_sender_email
```

**`client/.env`**
```env
VITE_BASE_URL=http://localhost:4000
```

### 3. Install dependencies

```bash
# Server
cd server && npm install

# Client
cd ../client && npm install
```

### 4. Seed the database (optional)

```bash
cd server && npm run seed
```

### 5. Run the app

```bash
# Start backend (from /server)
npm run dev

# Start frontend (from /client)
npm run dev
```

Frontend runs on `http://localhost:5173`, backend on `http://localhost:4000`.

## API Endpoints

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/session` | Auth |
| POST | `/api/auth/change-password` | Auth |
| GET/POST | `/api/employees` | Admin |
| PUT/DELETE | `/api/employees/:id` | Admin |
| POST | `/api/attendance/clock-in` | Auth |
| POST | `/api/attendance/clock-out` | Auth |
| GET | `/api/attendance/all` | Admin |
| GET | `/api/attendance/:employeeId` | Auth |
| GET/POST | `/api/leaves` | Auth |
| PATCH | `/api/leaves/:id` | Admin |
| GET/POST | `/api/payslips` | Auth / Admin |
| GET | `/api/payslips/:id` | Auth |
| GET/PUT | `/api/profile` | Auth |
| GET | `/api/dashboard` | Auth |

## Deployment

The project is configured for Vercel deployment.

- **Backend** — deploy from the root or `/server` using `@vercel/node`
- **Frontend** — deploy from `/client`; SPA rewrites are pre-configured in `client/vercel.json`

Update `VITE_BASE_URL` in the client environment to point to your deployed backend URL.

## License

MIT
