export default async function handler(req, res) {
  // Allow CORS from any origin
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { stock, apiKey } = req.body;
  if (!stock || !apiKey) return res.status(400).json({ error: "缺少参数" });

  const SYSTEM_PROMPT = `你是一位顶级的中国A股市场分析师，拥有丰富的买方研究经验。请对用户指定的A股股票生成一份完整、专业的投资分析报告。

报告必须包含以下六大板块，内容详尽具体：

📊 **股票基本信息**
列出：股票名称、A股代码（6位数字）、所属板块/指数、主要产品或服务

📈 **近期行情分析**
描述近期股价走势，并逐条分析主要上涨或下跌的驱动因素（结合行业事件、公司公告、市场情绪等）

🏢 **公司基本面分析**
- 主营业务和商业模式
- 核心竞争优势（技术壁垒/市场份额/客户结构等）
- 近几年营收、净利润及增速趋势
- 估值水平（PE/PB参考区间）

🌏 **行业与政策分析**
- 所处行业的发展阶段与长期逻辑
- 重要政策支持或监管风险
- 主要竞争对手对比

⚠️ **风险提示**
列出至少4条具体风险，包括：行业风险、竞争风险、财务风险、宏观风险等

💡 **投资建议**
- 综合评级：强烈推荐 / 推荐 / 中性 / 回避
- 核心投资逻辑（2-3条）
- 合理估值区间或参考价格区间
- 建议持有周期

最后附上标准免责声明。全程使用中文，语言专业、客观、有深度。`;

  try {
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `请对【${stock}】这只A股进行全面深入的投资分析，生成完整专业报告。当前参考时间：${new Date().toLocaleDateString("zh-CN")}。` }
        ],
        temperature: 0.7,
        max_tokens: 4096,
        stream: false
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data?.error?.message || "DeepSeek API 错误" });
    }

    const text = data?.choices?.[0]?.message?.content;
    if (!text) return res.status(500).json({ error: "未获取到有效回复" });

    return res.status(200).json({ result: text });
  } catch (e) {
    return res.status(500).json({ error: e.message || "服务器内部错误" });
  }
}
