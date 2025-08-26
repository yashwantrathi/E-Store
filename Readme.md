# 🛒 E-Store: A Modern E-Commerce Web Application
E-Store is a modern e-commerce platform built as a Web Development Major Project. It provides a seamless shopping experience for users and a powerful admin dashboard for managing products, orders, and customers. This project demonstrates full-stack web development skills, including frontend, backend, authentication, and data management.

🔗 Project Video: [Click Here]https://drive.google.com/file/d/1yefQuLapvV72ibpmGlSC6G46afT1Neo6/view?usp=sharing)

## ✨ Features
### 👤 User Storefront
- 🛍️ Product Catalog – Browse all products dynamically fetched from the backend
- 🔍 Search & Filter – Search by name, category, or description
- 🛒 Cart Management – Add, remove, and update product quantities
- 🔑 User Authentication – Register and login securely
- 💳 Checkout & Payments: Cash on Delivery (COD) and UPI Payment (QR Code generated with exact order amount) with upload option for payment screenshot
- 📦 Order History – Track previous orders and status updates
- 🔔 Notifications – Get confirmation when order is placed
### 🛠️ Admin Dashboard
- 📊 Dashboard Overview – View total revenue, number of orders, products, and users
- 📦 Order Management – Approve, reject, or update order statuses
- 🛍️ Product Management – Add, edit, and remove products with images
- 👥 Customer Management – View and manage registered users
- 🔐 Secure Admin Access – Separate login for admins

## 🏗️ Architecture
The system follows a client-server architecture:
[Frontend] <--> [Backend API] <--> [JSON Database]  
HTML/CSS/JS <--> Express.js <--> JSON files (products, users, orders)  
- Frontend: Handles UI/UX for users and admins  
- Backend: Exposes REST APIs for authentication, products, orders, and users  
- Database: Lightweight JSON file storage for simplicity  

## 🛠️ Tech Stack
| Layer       | Technology         | Why Used? |
|-------------|-------------------|------------|
| Frontend    | HTML5, CSS3, JavaScript | Lightweight, no framework overhead |
| Backend     | Node.js + Express.js | Fast and simple server-side routing |
| Database    | JSON Files | Easy to manage for small-scale projects |
| Icons       | Font Awesome | For UI icons |

## 🚀 Getting Started
### Prerequisites
- Install Node.js (includes npm)
### Installation & Setup
Clone the repository using `git clone https://github.com/your-username/estore.git` and then `cd estore`. Next, move into the backend folder using `cd backend` and install dependencies with `npm install`. Once done, run the backend server with `npm start`. The backend will now be available at http://localhost:5000. For the frontend, simply navigate to the `frontend/index.html` file and open it in your browser. You can either double-click it or use the VS Code Live Server extension.

## 📂 Project Structure
.
├── backend/               # Server-side code  
│   ├── data/              # JSON database (admins, users, orders, products)  
│   ├── public/images/     # Product images  
│   ├── routes/            # Express route handlers  
│   └── server.js          # Backend entry point  
└── frontend/              # Client-side code  
    ├── css/               # Stylesheets  
    ├── js/                # JavaScript logic  
    ├── pages/             # Additional HTML pages  
    └── index.html         # Homepage  

## 🔐 Authentication Flow
Users and Admins have separate login credentials. Passwords are stored securely in `users.json` and `admins.json`. Sessions are maintained during user activity, ensuring authenticated access. Unauthorized users cannot access admin pages, protecting sensitive operations like order and product management.

## 🧪 Testing the Project
To test the project, first register a new user and login. Browse products, add them to the cart, and proceed to place an order using either Cash on Delivery or UPI Payment. For UPI, a unique QR code is generated and a payment screenshot must be uploaded. Once the order is placed, login as Admin to check if the order appears in the dashboard. Update its status, manage products, or view customers. This ensures that both user and admin flows work correctly.

## 🚀 Future Improvements
- Implement JWT-based authentication for better security instead of session storage
- Migrate JSON-based storage to a real database like MongoDB or MySQL
- Add a production-ready payment gateway such as Stripe or Razorpay
- Improve UI with Tailwind CSS or Bootstrap for responsive design
- Deploy the project on cloud platforms like Vercel/Netlify for frontend and Render/Heroku for backend

## 🤝 Contributing
Contributions are welcome. Fork the repository, make your changes, and submit a pull request. For significant changes, open an issue first to discuss the proposed modifications.

## 📄 License
This project is licensed under the MIT License, allowing others to use, modify, and distribute it with attribution.

## 👨‍💻 Developer
Developed by **Yashwanth Rathi**  
📧 Email: yashwanthrathi18@gmail.com  
🔗 LinkedIn: [linkedin.com/in/yashwanth-rathi](https://www.linkedin.com/in/yashwanth-rathi)  
🔗 GitHub: [github.com/yashwanthrathi](https://github.com/yashwanthrathi)
Summary Of commands 
# Clone the repository
git clone https://github.com/your-username/estore.git
cd estore

# Move to backend and install dependencies
cd backend
npm install

# Start backend server
npm start
# Runs at http://localhost:5000

# Open frontend
# Just open frontend/index.html in browser OR use VS Code Live Server

