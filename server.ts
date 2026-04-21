import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "cat-prep-secret-key";

// Simple JSON-based storage to mimic Google Sheets
const DB_PATH = path.join(__dirname, "db.json");

interface DB {
  students: any[];
  courseMaterials: any[];
  videoLectures: any[];
  unverifiedQuestions: any[];
  approvedQuestions: any[];
  dailyTests: any[];
  testResults: any[];
  assignedTests: any[];
  announcements: any[];
}

const initialDB: DB = {
  students: [
    {
      id: "S001",
      email: "student@example.com",
      password: bcrypt.hashSync("password123", 10),
      name: "Demo Student",
      phone: "1234567890",
      registrationDate: new Date().toISOString(),
      status: "Active",
      role: "student"
    },
    {
      id: "A001",
      email: "admin@example.com",
      password: bcrypt.hashSync("admin123", 10),
      name: "Admin User",
      phone: "0987654321",
      registrationDate: new Date().toISOString(),
      status: "Active",
      role: "admin"
    }
  ],
  courseMaterials: [
    {
      id: "CM001",
      topicName: "Number Systems",
      section: "Quantitative",
      googleSheetLink: "#",
      googleDriveLink: "#",
      description: "Basics of Number Systems for CAT.",
      dateAdded: new Date().toISOString()
    }
  ],
  videoLectures: [
    {
      id: "VL001",
      topicName: "Arithmetic Basics",
      section: "Quantitative",
      googleSheetLink: "#",
      googleDriveLink: "#",
      duration: 45,
      instructorName: "Expert Tutor",
      dateUploaded: new Date().toISOString()
    }
  ],
  unverifiedQuestions: [],
  approvedQuestions: [],
  dailyTests: [],
  testResults: [],
  assignedTests: [],
  announcements: [
    {
      id: "AN001",
      title: "Welcome to CAT Prep Pro",
      content: "Good luck with your preparation!",
      createdDate: new Date().toISOString(),
      createdBy: "Admin"
    }
  ]
};

function getDB(): DB {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(initialDB, null, 2));
    return initialDB;
  }
  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
}

function saveDB(db: DB) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // API Routes
  app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    const db = getDB();
    const user = db.students.find(s => s.email === email);

    if (user && bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  });

  app.get("/api/profile", authenticateToken, (req: any, res) => {
    const db = getDB();
    const user = db.students.find(s => s.id === req.user.id);
    if (user) {
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  });

  app.get("/api/course-materials", authenticateToken, (req, res) => {
    res.json(getDB().courseMaterials);
  });

  app.get("/api/video-lectures", authenticateToken, (req, res) => {
    res.json(getDB().videoLectures);
  });

  app.get("/api/announcements", authenticateToken, (req, res) => {
    res.json(getDB().announcements);
  });

  // Question Management
  app.get("/api/unverified-questions", authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    res.json(getDB().unverifiedQuestions);
  });

  app.post("/api/questions/verify", authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    const { questionIds, action } = req.body; // action: 'approve' | 'reject'
    const db = getDB();
    
    if (action === 'approve') {
      const approved = db.unverifiedQuestions.filter(q => questionIds.includes(q.id));
      db.approvedQuestions.push(...approved.map(q => ({ ...q, approvedDate: new Date().toISOString() })));
    }
    
    db.unverifiedQuestions = db.unverifiedQuestions.filter(q => !questionIds.includes(q.id));
    saveDB(db);
    res.json({ success: true });
  });

  app.post("/api/questions/save-unverified", authenticateToken, (req: any, res) => {
    // This would be called by the frontend after generating questions with Gemini
    if (req.user.role !== 'admin') return res.sendStatus(403);
    const { questions } = req.body;
    const db = getDB();
    db.unverifiedQuestions.push(...questions.map((q: any) => ({ ...q, id: `UQ${Date.now()}${Math.random()}` })));
    saveDB(db);
    res.json({ success: true });
  });

  app.get("/api/daily-test", authenticateToken, (req, res) => {
    const db = getDB();
    const today = new Date().toISOString().split('T')[0];
    const test = db.dailyTests.find(t => t.testDate === today);
    
    if (test) {
      const questions = db.approvedQuestions.filter(q => test.questionIds.includes(q.id));
      res.json({ ...test, questions });
    } else {
      // If no test for today, try to create one from approved questions
      const approvedToday = db.approvedQuestions.filter(q => q.approvedDate?.startsWith(today));
      if (approvedToday.length >= 20) {
        const newTest = {
          id: `DT${Date.now()}`,
          testDate: today,
          questionIds: approvedToday.slice(0, 20).map(q => q.id)
        };
        db.dailyTests.push(newTest);
        saveDB(db);
        res.json({ ...newTest, questions: approvedToday.slice(0, 20) });
      } else {
        res.status(404).json({ message: "No test available for today yet. Admin needs to approve questions." });
      }
    }
  });

  app.post("/api/test-results", authenticateToken, (req: any, res) => {
    const { testId, totalScore, correctAnswers, wrongAnswers, skippedQuestions, timeSpent, sectionScores, studentAnswers } = req.body;
    const db = getDB();
    const result = {
      id: `TR${Date.now()}`,
      studentId: req.user.id,
      testDate: new Date().toISOString(),
      testId,
      totalScore,
      correctAnswers,
      wrongAnswers,
      skippedQuestions,
      timeSpent,
      sectionScores,
      studentAnswers
    };
    db.testResults.push(result);
    saveDB(db);
    res.json(result);
  });

  app.get("/api/performance", authenticateToken, (req: any, res) => {
    const db = getDB();
    const results = db.testResults.filter(r => r.studentId === req.user.id);
    res.json(results);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
