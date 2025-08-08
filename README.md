# MediSync — Smart Healthcare Management System

## 🚀 Project Overview

MediSync is a full-stack web application designed for hospitals and clinics to efficiently manage doctor appointments, patient records, complaints, feedback, and medical reports. It also integrates AI capabilities using **Gemini 2.5 Pro** to intelligently review uploaded reports and give insight summaries.

---

## 🛠️ Tech Stack Used

### 🔹 Frontend

* **React.js (v19)** — UI Library for building responsive interfaces
* **React Router DOM (v7.6.3)** — SPA routing and dynamic navigation
* **Recoil.js** — State management
* **TailwindCSS (v4.1.4)** — Utility-first styling with dark mode support
* **SweetAlert2** — Enhanced alert modals
* **Swiper.js** — Carousel integration for doctor testimonials
* **Lucide-react** — Icon library
* **PDF.js** — For rendering uploaded medical reports
* **Google Gemini API (via @google/generative-ai)** — For report reviews and AI summaries
* **Vite (v6.3.0)** — Fast build tool and dev server

### 🔹 Backend

* **Node.js** — Runtime environment
* **Express.js (v5.1.0)** — Web framework
* **MongoDB + Mongoose (v8.16.1)** — NoSQL database and ORM
* **JWT (v9.0.2)** — Authentication
* **bcryptjs (v3.0.2)** — Password hashing
* **dotenv** — Environment variable management
* **Twilio (v4.0.0)** — SMS notifications/reminders
* **faker-js** — Dummy data generation for development

### 🔹 Dev Tools & Deployment

* **Nodemon** — Auto-restart dev server
* **Render** — Backend deployment
* **Vercel** — Frontend deployment
* **Git & GitHub** — Version control

---

## 🌟 Core Features

### 👨‍⚕️ Doctor Module

* Register/Login
* Profile View & Update
* View Appointment List
* Upload and Review Medical Reports
* AI Report Summary using Gemini 2.5 Pro

### 🧑‍🦱 Patient Module

* Sign-up/Login
* Book Appointments
* View Doctor Profiles
* Submit Feedback and Complaints
* Access Uploaded Reports

### 🔧 Admin Panel

* Dashboard with Appointment Analytics
* Manage Users (Doctors & Patients)
* Handle Complaints and Feedback
* Delete or Edit Accounts

### 🤖 AI-Powered Report Review (Gemini 2.5 Pro)

* Patients upload PDF reports.
* `pdfjs-dist` extracts text from the report.
* Text is analyzed by **Gemini 2.5 Pro**.
* Output: User-friendly health summary and AI insights.
* Optional: Continue chatting with the AI for further discussion.

### 🌐 UI/UX

* Fully responsive design
* Dark mode toggle
* Interactive modals and alerts
* Carousel and icon-rich layouts

---

## 🏢 E-Pharmacy Module

### 👨‍⚕️ For Customers (All Users)

* Browse and search medicines with filters
* Add medicines to cart and manage quantities
* Razorpay integrated checkout
* Track order status and history
* Cancel orders before delivery

### 💼 For Sellers

* Seller dashboard to manage products
* Add new medicines with image uploads
* View and manage incoming orders
* Update delivery status
* Manage stock levels and inventory

### 📆 For Admins

* Monitor all platform-wide orders
* Manage all payments via Razorpay admin account

### ✨ Planned Enhancements

* Email notifications for order updates
* SMS notifications for delivery status
* Prescription upload and verification
* Medicine reviews and ratings
* Bulk order handling
* Advanced analytics and reporting
* Mobile app integration

---

## 🎯 Role-Based Access & Security

### Roles & Routes

* **Patient/Doctor/Admin**

  * Access: `/medicine-store`
  * Features: Browse, search, cart, checkout, view orders

* **Seller**

  * Access: `/seller-dashboard`
  * Features: Manage medicines, view orders, update delivery status
  * Register as "Medicine Seller"

* **Admin**

  * Access: `/admin-dashboard`
  * Features: Monitor all orders, manage payments
  * Additional: `/orders/admin/all` for full platform view

### Security Highlights

* **Role-based Access**: Strict permission control
* **Razorpay Signature Verification**: Ensures payment integrity
* **Secure Image Uploads**: File type and size validation
* **Order & Seller Authorization**: Scoped access to respective entities

---

## 📝 Setup Instructions

1. Clone the repo

```bash
git clone https://github.com/yourusername/medisync.git
```

2. Navigate to frontend & install dependencies

```bash
cd frontend
npm install
npm run dev
```

3. Navigate to backend & install dependencies

```bash
cd backend
npm install
npm run dev
```

4. Create a `.env` file in the backend and add your environment variables

---

## 📷 Screenshots (Optional)

*Add screenshots here to show off UI components, dashboards, and features.*

![Screenshot](https://user-images.githubusercontent.com/your-uploaded-image-link.png)

---

**Built with ❤️ by Team MediSync**
