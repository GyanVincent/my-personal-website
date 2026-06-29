import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) return new Response("AI not configured", { status: 500 });

        let body: any;
        try { body = await request.json(); } catch { return new Response("Invalid JSON", { status: 400 }); }
        const messages: Array<{ role: string; content: string }> = Array.isArray(body?.messages) ? body.messages : [];
        if (!messages.length) return new Response("messages required", { status: 400 });

        // Load fresh context from Lovable Cloud
        let context = "";
        try {
          const supa = supabaseAdmin;
          const [{ data: profile }, { data: skills }, { data: projects }, { data: certs }] = await Promise.all([
            supa.from("profiles").select("*").limit(1).maybeSingle(),
            supa.from("skills").select("name,category,level").order("sort_order"),
            supa.from("projects").select("title,description,tech,live_url").order("sort_order"),
            supa.from("certificates").select("title,issuer,issued_at"),
          ]);
          context = [
            `# About Vincent`,
            profile ? `Name: ${profile.full_name}\nHeadline: ${profile.headline}\nLocation: ${profile.location}\nBio: ${profile.bio}\nEmail: ${profile.email}\nWhatsApp: ${profile.whatsapp}` : "",
            `\n# Services Offered`,
            `Website Development, Mobile App Development, AI Automation, AI Agent Development, Prompt Engineering, API Integration, Technical Consultation`,
            `\n# Skills`,
            (skills ?? []).map((s) => `- ${s.name} (${s.category}) — ${s.level}%`).join("\n"),
            `\n# Projects`,
            (projects ?? []).map((p) => `- ${p.title}: ${p.description} [tech: ${(p.tech ?? []).join(", ")}]`).join("\n"),
            `\n# Certifications`,
            (certs ?? []).map((c) => `- ${c.title} — ${c.issuer}`).join("\n") || "(none listed)",
          ].join("\n");
        } catch (e) {
          console.error("context load failed", e);
        }

        const system = `You are "Vincent AI", the AI assistant on Vincent Gyan's personal website (VinTechAI).
Answer concisely (under 200 words unless asked for detail), warmly, and in the first person on Vincent's behalf when describing his work.
Only use the verified information below; if asked something you don't know, say so and point to the Contact page.
Use markdown sparingly (lists, **bold**) when it helps.

CONTEXT:
${context}`;

        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "system", content: system }, ...messages.slice(-12)],
            temperature: 0.6,
            max_tokens: 600,
          }),
        });

        if (!groqRes.ok) {
          const t = await groqRes.text();
          console.error("groq error", groqRes.status, t);
          return new Response(`AI error: ${groqRes.status}`, { status: 502 });
        }
        const data = await groqRes.json();
        const reply = data?.choices?.[0]?.message?.content ?? "Sorry, no response.";
        return Response.json({ reply });
      },
    },
  },
});
