const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const generationConfig = {
  temperature: 1,
  topP: 0.9,
  topK: 40,
  maxOutputTokens: 3000,
};

// Convert * bullets to proper HTML
function beautifyResponse(rawText) {
  const lines = rawText.split("\n");
  let formatted = "";

  let inList = false;
  lines.forEach((line) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("*")) {
      if (!inList) {
        formatted += "<ul>";
        inList = true;
      }
      const clean = trimmed.replace(/^\*+/, "").trim();
      formatted += `<li>${clean}</li>`;
    } else {
      if (inList) {
        formatted += "</ul>";
        inList = false;
      }
      formatted += `<p>${trimmed}</p>`;
    }
  });

  if (inList) formatted += "</ul>";

  return formatted;
}

// Starting prompt
const initialPrompt = `You are FinBotX – an AI-powered Indian financial assistant. You only respond for Indian users in INR and related financial products. Respond professionally with helpful insights. Format response with <ul>, <ol>, <p>, <strong> where needed.`;

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  try {
    const chatSession = model.startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [{ text: initialPrompt }],
        },
      ],
    });

    const result = await chatSession.sendMessage(message);
    const rawText = result.response.text();
    const html = beautifyResponse(rawText);

    res.json({ html });
  } catch (err) {
    console.error("Gemini error:", err);
    res.status(500).json({ error: "Something went wrong!" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${3000}`);
});
