const express = require("express");
const session = require("express-session");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// إعداد الجلسة
app.use(session({
  secret: "espace-secret-key", // غيّره عند الإنتاج!
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // true فقط إذا كان الموقع على HTTPS
    maxAge: 1000 * 60 * 60 // مدة الجلسة: 1 ساعة
  }
}));

// السماح بمعالجة بيانات النماذج
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ✅ تقديم ملفات static
app.use(express.static(path.join(__dirname, "public"))); // login.html و css
app.use("/frontend", express.static(path.join(__dirname, "../frontend"))); // أنشطة وألعاب

// ✅ صفحة تسجيل الدخول
app.get("/login.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// ✅ معالجة POST لتسجيل الدخول
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "1234") {
    req.session.loggedIn = true;
    res.redirect("/views/dashboard.html");
  } else {
    res.status(401).send("❌ اسم المستخدم أو كلمة المرور غير صحيحة.<br><a href='/login.html'>🔙 العودة</a>");
  }
});

// ✅ التحقق من الجلسة (مفيد للـ frontend)
app.get("/check-session", (req, res) => {
  if (req.session.loggedIn) {
    res.sendStatus(200);
  } else {
    res.sendStatus(401);
  }
});

// ✅ تسجيل الخروج
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login.html");
  });
});

// ✅ تقديم صفحات views المحمية (dashboard، library...)
app.get("/views/:page", (req, res) => {
  if (req.session.loggedIn) {
    res.sendFile(path.join(__dirname, "views", req.params.page));
  } else {
    res.redirect("/login.html");
  }
});

// ✅ حماية ملفات داخل مجلد /protected
app.use("/protected", (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.status(403).send("🛑 ممنوع الوصول، يرجى تسجيل الدخول.");
  }
});

// ✅ تقديم محتوى protected بعد التحقق
app.use("/protected", express.static(path.join(__dirname, "protected")));

// ✅ تشغيل السيرفر
app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});
