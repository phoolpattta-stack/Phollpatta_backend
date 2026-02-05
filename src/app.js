// const express = require('express');
// const app = express();
// const cors = require('cors');
// const cookieParser = require("cookie-parser");
// const reviewRoutes = require("./routes/review.routes");
// const userRoutes = require("./routes/user.routes");
// const adminUserRoutes = require("./routes/admin.user.routes");
// require("dotenv").config();
// app.use(cookieParser());
// const adminRoutes = require("./routes/admin.routes");

// app.use(cors({
//   origin: ["http://localhost:3001","http://localhost:3000"],
//   credentials: true,
// }));
// app.use("/api/admin", adminUserRoutes);



// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use("/api/admin-dashboard", adminRoutes);

// app.use('/api/auth', require('./routes/auth.routes'));
// app.use("/api/users", userRoutes);

// app.use("/api/products", require("./routes/product.routes"));
// app.use("/api/cart", require("./routes/cart.routes"));
// app.use("/api/checkout", require("./routes/checkout.routes"));
// app.use("/api/coupons", require("./routes/coupon.routes"));
// app.use("/api/payment", require("./routes/payment.routes"));
// app.use("/api/orders", require("./routes/order.routes"));
// app.use("/api/orders", require("./routes/order.routes"));
// app.use("/api/reviews", reviewRoutes);

// app.get('/health', (req, res) => {
//   res.json({ status: 'OK' });
// });

// module.exports = app;


//updated
// const express = require('express');
// const app = express();
// const cors = require('cors');
// const cookieParser = require("cookie-parser");
// const reviewRoutes = require("./routes/review.routes");
// const userRoutes = require("./routes/user.routes");
// const adminUserRoutes = require("./routes/admin.user.routes");
// const adminRoutes = require("./routes/admin.routes");
// require("dotenv").config();

// // ✅ MIDDLEWARE MUST COME FIRST - BEFORE ALL ROUTES
// app.use(cors({
//   origin: ["http://localhost:3001", "http://localhost:3000"],
//   credentials: true,
// }));

// app.use(express.json()); // ✅ MOVED TO TOP
// app.use(express.urlencoded({ extended: true })); // ✅ MOVED TO TOP
// app.use(cookieParser()); // ✅ MOVED TO TOP

// // ✅ NOW REGISTER ALL ROUTES
// app.use("/api/admin", adminUserRoutes);
// app.use("/api/admin-dashboard", adminRoutes);
// app.use('/api/auth', require('./routes/auth.routes'));
// app.use("/api/users", userRoutes);
// app.use("/api/products", require("./routes/product.routes"));
// app.use("/api/cart", require("./routes/cart.routes"));
// app.use("/api/checkout", require("./routes/checkout.routes"));
// app.use("/api/coupons", require("./routes/coupon.routes"));
// app.use("/api/payment", require("./routes/payment.routes"));
// app.use("/api/orders", require("./routes/order.routes")); // ✅ ONLY ONCE
// app.use("/api/reviews", reviewRoutes);

// app.get('/health', (req, res) => {
//   res.json({ status: 'OK' });
// });

// module.exports = app;

//latest 

const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require("cookie-parser");
const reviewRoutes = require("./routes/review.routes");
const userRoutes = require("./routes/user.routes");
const adminUserRoutes = require("./routes/admin.user.routes");
const adminRoutes = require("./routes/admin.routes");
require("dotenv").config();
app.set("trust proxy", 1);


// ✅ PRODUCTION-READY CORS CONFIGURATION
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ["http://localhost:3001", "http://localhost:3000","https://phoolpatta.com",  "https://www.phoolpatta.com"," phoolpatta-admin.vercel.app", "https://phoolpatta-admin-9blicikkw-phoolpattas-projects.vercel.app"];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ ALL ROUTES
app.use("/api/admin", adminUserRoutes);
app.use("/api/admin-dashboard", adminRoutes);
app.use('/api/auth', require('./routes/auth.routes'));
app.use("/api/users", userRoutes);
app.use("/api/products", require("./routes/product.routes"));
app.use("/api/cart", require("./routes/cart.routes"));
app.use("/api/checkout", require("./routes/checkout.routes"));
app.use("/api/coupons", require("./routes/coupon.routes"));
app.use("/api/payment", require("./routes/payment.routes"));
app.use("/api/orders", require("./routes/order.routes"));
app.use("/api/reviews", reviewRoutes);

// ✅ Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ✅ 404 handler (optional but recommended)
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// ✅ Global error handler (optional but recommended)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;
