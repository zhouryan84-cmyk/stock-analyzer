import { corsHeaders, callDeepSeek, SYSTEM_PROMPT } from "./_shared.js";

export default async function handler(req, res) {
  corsHeaders(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { apiKey, history, question, stock } = req.body || {};
  if (!apiKey || !question) return res.status(400).json({ error: "缺少参数" });

  // history: [{role, content}, ...] — the full prior conversation including the report
  const messages = [
    {
      role: "system",
      content: SYSTEM_PROMPT + `\n\n当前分析的股票是【${stock}】。用户已收到完整分析报告，现在进行追问。请基于已有分析内容，结合你的专业知识，针对性地回答用户的问题。回答要具体、专业，可以使用数据和逻辑论证。`
    },
    ...(history || []),
    { role: "user", content: question }
  ];

  try {
    const text = await callDeepSeek(apiKey, messages);
    return res.status(200).json({ result: text });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
