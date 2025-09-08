import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Init Supabase server client (use service_role key server-side)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing Supabase env vars.");
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// GROQ config
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = process.env.GROQ_API_URL || "https://api.groq.ai/v1";
if (!GROQ_API_KEY) {
  console.warn("Warning: GROQ_API_KEY not set. QA will fail until set.");
}

// Utility: simple relevance search (Postgres ILIKE match + ranking)
async function searchScraped(query, limit = 10) {
  // We do a basic search: url/title/content ILIKE %query% and order by starting point
  // For production consider embeddings (pgvector) for better retrieval
  const { data, error } = await supabase
    .from("scraped_content")
    .select("id,url,title,content,created_at,is_bookmarked")
    .ilike("content", `%${query}%`)
    .limit(limit);

  if (error) {
    console.error("Supabase search error:", error);
    return { error };
  }

  // If no results, broaden search to title/url
  if ((!data || data.length === 0) && query.trim().length > 0) {
    const { data: d2, error: e2 } = await supabase
      .from("scraped_content")
      .select("id,url,title,content,created_at,is_bookmarked")
      .or(`title.ilike.%${query}%,url.ilike.%${query}%`)
      .limit(limit);

    if (e2) return { error: e2 };
    return { data: d2 || [] };
  }

  return { data: data || [] };
}

// Endpoint: search (used by frontend for dashboard & saved page)
app.get("/api/search", async (req, res) => {
  const q = req.query.q || "";
  const userId = req.query.user_id || null;
  try {
    let query = supabase.from("scraped_content").select("*");

    if (userId) {
      query = query.eq("user_id", userId); // filter by user_id
    }

    if (q) {
      query = query.or(
        `content.ilike.%${q}%,title.ilike.%${q}%,url.ilike.%${q}%`
      );
    }

    // sort by latest first
    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) return res.status(500).json({ error });
    res.json({ results: data || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

// Endpoint: toggle bookmark
app.post("/api/bookmark/:id", async (req, res) => {
  const id = req.params.id;
  const { is_bookmarked } = req.body;
  const { data, error } = await supabase
    .from("scraped_content")
    .update({ is_bookmarked })
    .eq("id", id);

  if (error) return res.status(500).json({ error });
  res.json({ data });
});

// Endpoint: delete article
app.delete("/api/article/:id", async (req, res) => {
  const id = req.params.id;
  const { error } = await supabase.from("scraped_content").delete().eq("id", id);
  if (error) return res.status(500).json({ error });
  res.json({ success: true });
});

// Endpoint: QA (Retrieval + Groq call)
app.post("/api/qa", async (req, res) => {
  const { question, top_k = 5, docIds = null } = req.body;
  if (!question || question.trim() === "") {
    return res.status(400).json({ error: "Missing question" });
  }

  try {
    // 1) fetch top docs: if docIds provided, fetch those, else search for question
    let docs = [];
    if (Array.isArray(docIds) && docIds.length > 0) {
      const { data, error } = await supabase
        .from("scraped_content")
        .select("id,url,title,content")
        .in("id", docIds)
        .limit(top_k);
      if (error) return res.status(500).json({ error });
      docs = data;
    } else {
      const { data, error } = await searchScraped(question, top_k);
      if (error) return res.status(500).json({ error });
      docs = data;
    }

    // 2) Build context string (include title + excerpt). We'll truncate to keep prompt sizes reasonable.
    const makeExcerpt = (text, n = 1200) => {
      if (!text) return "";
      return text.length > n ? text.slice(0, n) + "..." : text;
    };

    let contextParts = docs.map((d, idx) => {
      return `Source ${idx + 1} - URL: ${d.url}\nTitle: ${d.title || "—"}\nContent excerpt:\n${makeExcerpt(d.content || "")}\n\n`;
    }).join("\n");

    if (contextParts.trim().length === 0) {
      contextParts = "No relevant scraped documents found.";
    }

    // 3) Craft prompt for model (system + user style). Adjust instruction to be "human-friendly"
    const systemInstruction = `
You are a helpful AI assistant. Use the provided scraped content to answer the user's question. 
- Produce a concise, human-friendly answer in plain language (2-6 short paragraphs). 
- Only use the information present in the provided content. 
- After the answer, include a "Sources:" section listing the source numbers and their URLs (e.g., Source 1: https://...). 
- Do not make up information beyond the provided content.
- If the content is minimal, summarize what is available without unnecessary apologies.
    `.trim();

    const userPrompt = `
QUESTION: ${question}

CONTEXT (scraped documents):
${contextParts}

Answer the question using ONLY the context above. Be concise and include the "Sources:" list after the answer.
    `.trim();

    // 4) Call Groq API
    // NOTE: adjust the request shape to match the Groq API you have — below is a template.
    const groqPayload = {
        model: "llama-3.1-8b-instant",
        messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 800,
        top_p: 1,
        stream: false
    };

    const groqResp = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    groqPayload,
        {
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${GROQ_API_KEY}`,
            },
            timeout: 120000,
        }
    );

    // groqResp.data shape may vary; extract the model text accordingly
    // const modelText = groqResp.data?.output || groqResp.data?.result || groqResp.data?.text || JSON.stringify(groqResp.data);
    const modelText = groqResp.data?.choices?.[0]?.message?.content?.trim() || "No answer returned from model.";

    // 5) Build returned sources list (keep URLs + ids)
    const sources = docs.map((d, idx) => ({
      id: d.id,
      url: d.url,
      title: d.title || "",
      excerpt: (d.content || "").slice(0, 300)
    }));

    res.json({
      answer: modelText,
      sources,
      raw: groqResp.data
    });

  } catch (err) {
    console.error("QA error", err?.response?.data || err.message || err);
    res.status(500).json({ error: "QA failed", detail: err?.response?.data || err?.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Backend listening on ${PORT}`));
