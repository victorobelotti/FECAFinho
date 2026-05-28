import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

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

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(503).json({ 
          error: "Serviço de IA não configurado.",
          fallback: "Opa, no momento estou operando apenas offline. Use o mapa para se guiar!"
        });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: message,
        config: {
          systemInstruction: "Você é o FECAFinho, o mascote virtual e guia inteligente do campus UniFECAF. Você é amigável, prestativo e conhece tudo sobre o campus. Sua missão é ajudar alunos e visitantes a encontrar salas, laboratórios e serviços. Mantenha as respostas curtas e objetivas."
        }
      });
      
      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Erro na API de Chat:", error);
      
      const errorMsg = error?.message || String(error);
      const isSpendCap = errorMsg.includes("spending cap") || errorMsg.includes("RESOURCE_EXHAUSTED") || error?.status === 429;
      const isExpiredKey = errorMsg.includes("expired") || errorMsg.includes("API_KEY_INVALID") || errorMsg.includes("INVALID_ARGUMENT");

      if (isSpendCap) {
        return res.status(429).json({
          error: "Limite de gastos excedido.",
          fallback: "Falta configurar o Spend Cap! No Google AI Studio, a cobrança é ativada em faturamento, mas você precisa aumentar o limite de gastos para usá-lo. Acesse https://ai.studio/spend e ajuste o seu 'Project spend cap' (por padrão fica zerado)."
        });
      }

      if (isExpiredKey) {
        return res.status(401).json({
          error: "Chave de API inválida.",
          fallback: "Sua chave de API do Gemini no Google AI Studio parece inválida ou expirou. Por favor, crie uma nova chave na plataforma ou revise-a na aba de segredos do app."
        });
      }

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
