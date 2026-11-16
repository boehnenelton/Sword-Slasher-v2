/**
 * Library:         server.ts
 * Module Purpose:  Express Server & Gemini AI Studio API Proxy Handler
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com
 * Relational_ID:   105a0900-2026-1102-9999-000000000901
 * Version:         1.0.0
 * Release_Version: 300
 */

import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to assemble system context for Gemini AI Advisor
function getGameSystemContext(): string {
  let context = `[SWORD SLASHER 2 - GAME ENGINE & BEJSON 105 DATASET ARCHITECT ADVISOR CONTEXT]\n`;
  context += `Project Name: Sword Slasher RPG: Shadow Link's Awakening (Sword Slasher 2 / SS2)\n`;
  context += `BEJSON Specification: BEJSON 105 Schema v2.0.0-105 format (Integrity Era)\n`;
  context += `Release Version: 300\n`;
  context += `Architecture Mandates:\n`;
  context += `- 100% Decoupled BEJSON Game Data: All physics, tile maps, actor stats, items, audio specs, biomes, and quests exist strictly in BEJSON tables inside game_data/raw/ (or public/data/). Zero hardcoded game stats in engine code.\n`;
  context += `- Modular Subsystem Library Family: powered by lib_bejson_gamingss2_engine (core, physics, map, input, state, hud, menu, settings, intro, items, inventory, dialog, events, effects, quests, player, animations, errors).\n`;
  context += `- Single-File HTML Injection: raw tables compiled by Engines/Experimental/Compiler/Compile.py into compiled_game_bundle.105.bejson, injected into standalone-game.html.\n`;
  context += `- Experimental Testing Engine: Python/Flask server (Engines/PY/) for real-time data testing & compilation verification.\n\n`;

  // Read raw dataset names if available
  const publicDataDir = path.join(process.cwd(), 'public', 'data');
  if (fs.existsSync(publicDataDir)) {
    context += `[RAW BEJSON TABLES LISTING]\n`;
    const files = fs.readdirSync(publicDataDir, { recursive: true });
    for (const f of files) {
      if (typeof f === 'string' && (f.endsWith('.bejson') || f.endsWith('.json'))) {
        context += `- ${f}\n`;
      }
    }
  }

  return context;
}

// /api/gemini/advisor - Gemini AI Studio Architect Advisor Endpoint
app.post('/api/gemini/advisor', async (req, res) => {
  try {
    const { prompt, model, customApiKey, enableExternalKeys } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt string is required.' });
    }

    const apiKey = (enableExternalKeys && customApiKey) ? customApiKey : process.env.GEMINI_API_KEY;

    const ai = new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const targetModel = model || 'gemini-3.6-flash';
    const systemContext = getGameSystemContext();

    const response = await ai.models.generateContent({
      model: targetModel,
      contents: `${systemContext}\n\n[USER QUESTION / DEBUG QUERY]\n${prompt}`,
      config: {
        systemInstruction: `You are the lead Game Engine & BEJSON Data Architect Advisor for Sword Slasher 2 (SS2). You have full architectural awareness of the BEJSON 105 matrix schemas, AABB swept physics engine, 2.5D rendering layer rules, lib_bejson_gamingss2_engine library family, and offline Python/Flask compiler. Provide clear, concise, actionable technical advice and code recommendations. Keep your tone direct, expert, and grounded.`,
      },
    });

    return res.json({ text: response.text || 'No response text generated.' });
  } catch (error: any) {
    console.error('Gemini API Advisor Error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate response from Gemini AI Studio API.',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: 3000 },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      if (req.originalUrl.startsWith('/api')) return next();
      try {
        const templatePath = path.resolve(process.cwd(), 'index.html');
        let template = fs.readFileSync(templatePath, 'utf-8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.join(process.cwd(), 'dist')));
    app.use('*', (req, res) => {
      res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[Server] Sword Slasher 2 Express Server running on http://localhost:${PORT}`);
  });
}

startServer();
