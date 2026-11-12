const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, mode = "chat", history = [] } = req.body || {};

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    let modeInstruction = "";

    if (mode === "plan") {
      modeInstruction =
        "Break the user's goal into clear, practical steps. Keep the plan organized and actionable.";
    }

    if (mode === "execute") {
      modeInstruction =
        "Act as a practical AI agent. Focus on producing useful outputs and concrete next steps. Never claim that you completed an external action unless a connected tool actually confirms it.";
    }

    const instructions = `
You are Nexora AI.

Nexora is a practical, goal-driven AI agent built to think, create, plan, and help users act.

${modeInstruction}

Be clear, useful, and concise.
If you do not know something, say so instead of inventing information.
Do not claim to have accessed websites, accounts, files, or external services unless you actually have access to them.
`;

    const input = [
      ...history.map((item) => ({
        role: item.role,
        content: item.content,
      })),
      {
        role: "user",
        content: message,
      },
    ];

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-6.1-sol",
      instructions,
      input,
    });

    return res.status(200).json({
      reply: response.output_text || "I couldn't generate a response.",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Nexora AI could not process your request.",
      details: error.message,
    });
  }
};
