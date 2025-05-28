import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configuración de la IA (movida del frontend)
const AI_CONFIG = {
  API_ENDPOINT: process.env.AI_API_ENDPOINT || "http://10.14.255.61/v1/chat/completions",
  API_KEY: process.env.AI_API_KEY || "sk-mDmOn2bG9Z3GDNW-x8wdeQ",
  MODEL: process.env.AI_MODEL || "gpt-3.5-turbo"
};

// Función para llamar a la API de IA
async function getChatCompletion(messages, systemPrompt) {
  try {
    const apiMessages = [
      ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
      ...messages,
    ];

    const requestBody = {
      model: AI_CONFIG.MODEL,
      messages: apiMessages,
    };

    const response = await fetch(AI_CONFIG.API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AI_CONFIG.API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling AI API:', error);
    throw error;
  }
}

// Rutas
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend funcionando correctamente' });
});

// Endpoint para el chat
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, systemPrompt } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ 
        error: 'Se requiere un array de mensajes' 
      });
    }

    // Validar formato de mensajes
    const isValidMessage = (msg) => 
      msg && 
      typeof msg === 'object' && 
      typeof msg.role === 'string' && 
      typeof msg.content === 'string' &&
      ['user', 'ai', 'assistant', 'system'].includes(msg.role);

    if (!messages.every(isValidMessage)) {
      return res.status(400).json({ 
        error: 'Formato de mensaje inválido. Cada mensaje debe tener role y content' 
      });
    }

    // Llamar a la IA
    const aiResponse = await getChatCompletion(messages, systemPrompt);

    res.json({
      success: true,
      response: aiResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error en /api/chat:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// Endpoint para obtener configuración (sin exponer la API key)
app.get('/api/config', (req, res) => {
  res.json({
    model: AI_CONFIG.MODEL,
    status: 'connected'
  });
});

// Manejo de errores global
app.use((error, req, res, next) => {
  console.error('Error no manejado:', error);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor'
  });
});

// Ruta para 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Backend ejecutándose en http://localhost:${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api/chat`);
  console.log(`🔧 Health check: http://localhost:${PORT}/health`);
});

export default app;
