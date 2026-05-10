# BookMyService 

BookMyService is a comprehensive full-stack service booking platform designed to connect customers with service vendors. It features a robust role-based system with dedicated dashboards for Customers, Vendors, and Administrators.

##  Features

###  User Roles
- **Customer**: Browse services, book appointments, manage bookings, and receive OTP-based secure login.
- **Vendor**: Create and manage service listings, track bookings, and manage business profile.
- **Admin**: Oversee the entire platform, manage users, and monitor system activity.

###  Key Functionalities
- **Secure Authentication**: JWT-based authentication with OTP verification for customers and password-based login for vendors/admins.
- **Dynamic Dashboards**: Tailored experiences for each user role to manage their specific tasks efficiently.
- **Service Management**: Vendors can easily add, edit, and remove services.
- **Booking System**: Real-time booking flow with status tracking (Pending, Confirmed, Completed, Cancelled).
- **Email Notifications**: Automated email alerts for OTPs and booking updates using Nodemailer.
- **Responsive Design**: Fully responsive UI built with Tailwind CSS, ensuring a seamless experience across devices.

##  Tech Stack

**Frontend:**
- React (Vite)
- Tailwind CSS
- React Router DOM
- Axios
- Lucide React (Icons)
- React Hot Toast (Notifications)

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose
- JSON Web Token (JWT)
- Nodemailer (Email service)
- Bcryptjs (Password hashing)

##  Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (Local or Atlas)

### 1. Clone the repository
```bash
git clone <repository-url>
cd BookMyService
```

### 2. Backend Setup
```bash
cd server
cp .env.example .env
npm install
```
Update the `.env` file with your MongoDB URI and SMTP credentials.

**Seed the database:**
To create initial demo accounts (Admin, Vendor, Customer):
```bash
npm run seed
```

**Start the server:**
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd client
cp .env.example .env
npm install
```
Ensure `VITE_API_URL` in `.env` points to your backend (default: `http://localhost:5000/api`).

**Start the client:**
```bash
npm run dev
```

##  Demo Accounts

After running the seed script, you can use these accounts:

- **Admin**: `admin@bookmyservice.com` / `Admin@12345`
- **Vendor**: `vendor@bookmyservice.com` / `Vendor@123`
- **Customer**: `customer@bookmyservice.com` (Login via OTP)

> **Note**: If SMTP credentials are not configured in the server's `.env`, OTPs will be printed to the server console.

##  Deployment

### Backend (Render)
The project includes a `render.yaml` for easy deployment on Render.
- Connect your GitHub repository to Render.
- Use the Blueprint feature to deploy using the provided `render.yaml`.

### Frontend (Vercel)
The project is configured for Vercel deployment with `vercel.json` for SPA routing.
- Connect your repository to Vercel.
- Set the root directory to `client`.
- Add `VITE_API_URL` as an environment variable pointing to your deployed backend.
##  Project Structure

```text
BookMyService/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── context/     # Auth context
│   │   └── api/         # Axios instance
├── server/              # Node.js backend
│   ├── src/
│   │   ├── controllers/ # Request handlers
│   │   ├── models/      # Mongoose schemas
│   │   ├── routes/      # API routes
│   │   └── utils/       # Helpers (OTP, Mail, etc.)
└── README.md
```

