const express = require("express");
const session = require("express-session");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// إعداد الجلسة
app.use(session({
  secret: "espace-secret-key", // غيّره في الإنتاج
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // اجعله true فقط مع https
}));

// السماح بمعالجة البيانات المرسلة من النماذج
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ✅ تقديم ملفات static العامة
app.use(express.static(path.join(__dirname, "public"))); // يحتوي على login.html و CSS إن وُجد
app.use("/frontend", express.static(path.join(__dirname, "../frontend"))); // لتقديم الأنشطة والتجارب

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
    res.send("⚠️ اسم المستخدم أو كلمة المرور غير صحيحة.<br><a href='/login.html'>🔙 العودة</a>");
  }
});

// ✅ تأكيد الجلسة
app.get("/check-session", (req, res) => {
  if (req.session.loggedIn) {
    res.sendStatus(200); // OK
  } else {
    res.sendStatus(401); // Unauthorized
  }
});

// ✅ تسجيل الخروج
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login.html");
  });
});

// ✅ تقديم صفحات views (مثل dashboard و library)
app.get("/views/:page", (req, res) => {
  if (req.session.loggedIn) {
    res.sendFile(path.join(__dirname, "views", req.params.page));
  } else {
    res.redirect("/login.html");
  }
});

// ✅ حماية مجلد /protected
app.use("/protected", (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.status(403).send("🛑 ممنوع الوصول، يجب تسجيل الدخول.");
  }
});
app.use("/protected", express.static(path.join(__dirname, "protected")));

// ✅ تشغيل الخادم
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
