import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenerativeAI } from "@google/generative-ai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Google AI Initialization
  const genAI = process.env.GEMINI_API_KEY 
    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    : null;

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date() });
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: "Mensagem é obrigatória" });
      }

      if (!genAI) {
        return res.status(503).json({ 
          error: "Serviço de IA não configurado.",
          fallback: "Opa, no momento estou operando apenas offline. Use o mapa para se guiar!"
        });
      }

      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: "Você é o FECAFinho, o mascote virtual e guia inteligente do campus UniFECAF. Você é amigável, prestativo e conhece tudo sobre o campus. Sua missão é ajudar alunos e visitantes a encontrar salas, laboratórios e serviços. Mantenha as respostas curtas e objetivas."
      });
      
      const result = await model.generateContent(message);
      const response = await result.response;
      res.json({ text: response.text() });
    } catch (error) {
      console.error("Erro na API de Chat:", error);
      res.status(500).json({ error: "erro interno no processamento da IA" });
    }
  });

  // Example API for map data (might eventually come from a real DB)
  app.get("/api/map-data", (req, res) => {
    // This could read from a file or DB
    res.json({
      nodes: [],
      edges: []
    });
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
