const express = require("express");
const session = require("express-session");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// إعداد الجلسة
app.use(session({
  secret: "espace-secret-key", // يمكن تغييره
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // true فقط مع https
}));

// تقديم ملفات public (مثل login.html)
app.use(express.static(path.join(__dirname, "public")));

// معالجة تسجيل الدخول
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "1234") {
    req.session.loggedIn = true;
    res.redirect("/dashboard");
  } else {
    res.send("⚠️ اسم المستخدم أو كلمة المرور غير صحيحة.<br><a href='/login.html'>🔙 العودة</a>");
  }
});

// عرض صفحة dashboard للأعضاء فقط
app.get("/dashboard", (req, res) => {
  if (req.session.loggedIn) {
    res.sendFile(path.join(__dirname, "views", "dashboard.html"));
  } else {
    res.redirect("/login.html");
  }
});

// حماية ملفات protected
app.use("/protected", (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.status(403).send("🛑 ممنوع الوصول، يجب تسجيل الدخول.");
  }
});

// تقديم الملفات المحمية
app.use("/protected", express.static(path.join(__dirname, "protected")));

// تشغيل السيرفر
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
