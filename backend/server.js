const express = require("express");
const session = require("express-session");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ إعداد الجلسة
app.use(session({
  secret: "espace-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // يجب أن يكون true فقط إذا كان HTTPS
    maxAge: 1000 * 60 * 60 // صلاحية الجلسة ساعة
  }
}));

// ✅ معالجة بيانات النماذج
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ✅ تقديم ملفات static
app.use(express.static(path.join(__dirname, "public"))); // login.html
app.use("/frontend", express.static(path.join(__dirname, "../frontend"))); // الصور و HTML

// ✅ صفحة login.html
app.get("/login.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// ✅ تسجيل الدخول
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "1234") {
    req.session.loggedIn = true;
    res.redirect("/views/dashboard.html");
  } else {
    res.send("⚠️ اسم المستخدم أو كلمة المرور غير صحيحة.<br><a href='/login.html'>🔙 العودة</a>");
  }
});

// ✅ تسجيل الخروج
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login.html");
  });
});

// ✅ التحقق من الجلسة
app.get("/check-session", (req, res) => {
  if (req.session.loggedIn) {
    res.sendStatus(200);
  } else {
    res.sendStatus(401);
  }
});

// ✅ تقديم صفحات views فقط للأعضاء
app.get("/views/:page", (req, res) => {
  if (req.session.loggedIn) {
    const filePath = path.join(__dirname, "views", req.params.page);
    res.sendFile(filePath);
  } else {
    res.redirect("/login.html");
  }
});

// ✅ حماية مجلد /protected بالكامل
app.use("/protected", (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.status(403).send("🛑 ممنوع الوصول، يجب تسجيل الدخول.");
  }
});
app.use("/protected", express.static(path.join(__dirname, "protected"))); // مثل الكتب

// ✅ تشغيل الخادم
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
