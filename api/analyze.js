import { corsHeaders, callDeepSeek, SYSTEM_PROMPT } from "./_shared.js";

export default async function handler(req, res) {
  corsHeaders(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { stock, apiKey } = req.body || {};
  if (!stock || !apiKey) return res.status(400).json({ error: "缺少参数 stock 或 apiKey" });

  try {
    const text = await callDeepSeek(apiKey, [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `请对【${stock}】这只A股进行全面深入的投资分析，重点分析其主营产品价格变化及行业整体价格走势。当前参考时间：${new Date().toLocaleDateString("zh-CN")}。` }
    ]);
    return res.status(200).json({ result: text });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
