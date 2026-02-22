import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = "brasil-no-mundo-secret-key-2024";

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  const PORT = 3000;

  // In-memory "Database"
  const db = {
    settings: {
      logo: "B",
      siteName: "Brasil no Mundo"
    },
    plans: [
      { id: "free", name: "Grátis", price: 0, features: ["Chat Global", "Ver Encontros", "Ver Negócios"] },
      { id: "pro", name: "Pro", price: 29.90, features: ["Tudo do Grátis", "Cadastrar Negócios", "Destaque no Diretório"] }
    ],
    users: [
      { 
        id: "admin-1", 
        name: "Super Admin", 
        email: "admin@brasilnomundo.com", 
        password: await bcrypt.hash("admin123", 10), 
        role: "admin", 
        plan: "pro",
        avatar: "https://picsum.photos/seed/admin/100" 
      }
    ],
    messages: [
      { id: 1, user: "Mariana", text: "Olá pessoal! Alguém em Toronto?", time: new Date().toISOString() },
      { id: 2, user: "João", text: "Oi Mariana! Eu estou em Dublin, mas morei aí ano passado.", time: new Date().toISOString() }
    ],
    meetups: [
      { id: 1, title: "Churrasco no Park", location: "Phoenix Park, Dublin", date: "2024-03-10", attendees: 15, creator: "João" },
      { id: 2, title: "Café com Empreendedores", location: "Brickell, Miami", date: "2024-03-15", attendees: 8, creator: "Ana" }
    ],
    businesses: [
      { id: 1, name: "Sabor do Brasil", type: "Restaurante", location: "Lisboa, PT", status: "approved", description: "O melhor da culinária mineira no coração de Lisboa." },
      { id: 2, name: "Mercado Tropical", type: "Mercado", location: "Miami, EUA", status: "approved", description: "Pão de queijo, guaraná e todos os produtos que você sente falta." }
    ],
    posts: [
      { id: 1, title: "Dicas para morar em Portugal", content: "Portugal é um país incrível para brasileiros...", author: "Super Admin", status: "approved", date: new Date().toISOString() }
    ],
    transactions: []
  };

  app.use(express.json());
  app.use(cookieParser());

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.sendStatus(401);
    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // API Routes
  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user = db.users.find(u => u.email === email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }
    const token = jwt.sign({ id: user.id, name: user.name, role: user.role, avatar: user.avatar, plan: user.plan || 'free' }, JWT_SECRET);
    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: 'none' });
    res.json({ id: user.id, name: user.name, role: user.role, avatar: user.avatar, plan: user.plan || 'free' });
  });

  app.post("/api/auth/register", async (req, res) => {
    const { name, email, password } = req.body;
    if (db.users.find(u => u.email === email)) return res.status(400).json({ message: "E-mail já cadastrado" });
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role: "user",
      plan: "free",
      avatar: `https://picsum.photos/seed/${name}/100`
    };
    db.users.push(newUser as any);
    const token = jwt.sign({ id: newUser.id, name: newUser.name, role: newUser.role, avatar: newUser.avatar, plan: newUser.plan }, JWT_SECRET);
    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: 'none' });
    res.json({ id: newUser.id, name: newUser.name, role: newUser.role, avatar: newUser.avatar, plan: newUser.plan });
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token");
    res.sendStatus(200);
  });

  app.get("/api/auth/me", (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Não autenticado" });
    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ message: "Token inválido" });
      res.json(user);
    });
  });

  app.get("/api/state", (req, res) => {
    res.json({
      settings: db.settings,
      plans: db.plans,
      messages: db.messages,
      meetups: db.meetups,
      businesses: db.businesses.filter(b => b.status === "approved"),
      posts: db.posts.filter(p => p.status === "approved"),
      adminStats: {
        users: db.users.length,
        businesses: db.businesses.length,
        meetups: db.meetups.length,
        pendingBusinesses: db.businesses.filter(b => b.status === "pending").length,
        pendingPosts: db.posts.filter(p => p.status === "pending").length
      }
    });
  });

  app.post("/api/admin/settings", authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    db.settings = { ...db.settings, ...req.body };
    io.emit("settings:updated", db.settings);
    res.json(db.settings);
  });

  app.post("/api/admin/plans", authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    db.plans = req.body;
    io.emit("plans:updated", db.plans);
    res.json(db.plans);
  });

  // Blog Routes
  app.post("/api/posts", authenticateToken, (req: any, res) => {
    const { title, content } = req.body;
    const newPost = {
      id: Date.now(),
      title,
      content,
      author: req.user.name,
      status: "pending",
      date: new Date().toISOString()
    };
    db.posts.push(newPost);
    res.json(newPost);
  });

  app.post("/api/admin/posts/:id/approve", authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    const post = db.posts.find(p => p.id === parseInt(req.params.id));
    if (post) {
      post.status = "approved";
      io.emit("post:approved", post);
      res.json(post);
    } else {
      res.sendStatus(404);
    }
  });

  app.post("/api/admin/posts/:id/reject", authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    const post = db.posts.find(p => p.id === parseInt(req.params.id));
    if (post) {
      post.status = "rejected";
      res.json(post);
    } else {
      res.sendStatus(404);
    }
  });

  // PayPal Integration Mock / Structure
  app.post("/api/payments/create-order", authenticateToken, async (req: any, res) => {
    const { planId } = req.body;
    const plan = db.plans.find(p => p.id === planId);
    if (!plan) return res.status(404).json({ message: "Plano não encontrado" });

    res.json({ 
      orderId: `PAYPAL-${Date.now()}`,
      amount: plan.price,
      currency: "BRL"
    });
  });

  app.post("/api/payments/capture-order", authenticateToken, async (req: any, res) => {
    const { orderId, planId } = req.body;
    const user = db.users.find(u => u.id === req.user.id);
    const plan = db.plans.find(p => p.id === planId);
    
    if (user && plan) {
      user.plan = planId;
      db.transactions.push({
        id: orderId,
        userId: user.id,
        userName: user.name,
        planId,
        amount: plan.price,
        date: new Date().toISOString()
      });
      res.json({ success: true, plan: planId });
    } else {
      res.status(404).json({ message: "Usuário ou plano não encontrado" });
    }
  });

  app.get("/api/admin/full-state", authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    res.json(db);
  });

  app.post("/api/meetups", authenticateToken, (req: any, res) => {
    const meetup = { ...req.body, id: Date.now(), attendees: 1, creator: req.user.name };
    db.meetups.push(meetup);
    io.emit("meetup:new", meetup);
    res.json(meetup);
  });

  app.post("/api/businesses", authenticateToken, (req: any, res) => {
    const business = { ...req.body, id: Date.now(), status: "pending" };
    db.businesses.push(business);
    res.json(business);
  });

  app.post("/api/admin/businesses/:id/approve", authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    const business = db.businesses.find(b => b.id === parseInt(req.params.id));
    if (business) {
      business.status = "approved";
      io.emit("business:approved", business);
    }
    res.sendStatus(200);
  });

  // Socket.io Logic
  io.on("connection", (socket) => {
    socket.on("message:send", (msg) => {
      const newMsg = { ...msg, id: Date.now(), time: new Date().toISOString() };
      db.messages.push(newMsg);
      if (db.messages.length > 50) db.messages.shift();
      io.emit("message:new", newMsg);
    });
  });

  // Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => res.sendFile(path.join(__dirname, "dist", "index.html")));
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
