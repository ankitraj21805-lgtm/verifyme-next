"use client";

import { useEffect, useMemo, useState } from "react";

type Task = { id: number; title: string; note?: string; done: boolean };

type ParsedAction = {
  action?: string;
  intent?: string;
  title?: string;
  message?: string;
  notes?: string;
  targetValue?: string;
  params?: Record<string, any>;
};

const PROXY_URL = "/v1/assistant/command";

function localFallback(input: string): ParsedAction {
  const text = input.trim();
  const low = text.toLowerCase();
  if (low.includes("call") || low.includes("dial")) {
    const number = text.match(/[+]?\d[\d\s-]{7,}\d/)?.[0]?.replace(/[\s-]/g, "");
    return number
      ? { action: "dial_call", targetValue: number, message: `Open dialer for ${number}` }
      : { action: "chat", message: "Number bhejo, main phone dialer open kar dunga. Example: call +919876543210" };
  }
  if (low.includes("message") || low.includes("whatsapp") || low.includes("msg")) {
    const body = text.replace(/message|whatsapp|msg/gi, "").trim() || text;
    return { action: "draft_message", message: body };
  }
  if (low.includes("remind") || low.includes("task") || low.includes("yaad")) {
    return { action: "create_task", title: text.replace(/remind me|remind|task|yaad/gi, "").trim() || "New reminder", notes: "Saved locally" };
  }
  if (low.includes("plan") || low.includes("routine") || low.includes("study")) {
    return { action: "chat", message: "Plan: 1) Main goal clear karo. 2) 3 small tasks banao. 3) 45 min focused work. 4) 10 min review. 5) Before sleep next step decide karo." };
  }
  return { action: "chat", message: "AI backend key set hone ke baad main smart response dunga. Abhi local mode me message draft, call dialer, tasks aur basic planning active hai." };
}

export default function PersonalAIAssistantPage() {
  const [tab, setTab] = useState<"chat" | "tasks" | "settings">("chat");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ from: "user" | "bot"; text: string }[]>([
    { from: "bot", text: "Hi Ankit, main safe Personal AI Assistant hoon. Message draft, call dialer, tasks, reminders aur planning me help kar sakta hoon." }
  ]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      setTasks(JSON.parse(localStorage.getItem("personal-ai-tasks") || "[]"));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem("personal-ai-tasks", JSON.stringify(tasks));
  }, [tasks, ready]);

  const status = useMemo(() => busy ? "Thinking" : "Live", [busy]);

  async function askAssistant(text: string) {
    try {
      const res = await fetch(PROXY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage: text })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "proxy_error");
      return JSON.parse(data.rawJson || "{}");
    } catch {
      return localFallback(text);
    }
  }

  function addBot(text: string) {
    setMessages((m) => [...m, { from: "bot", text }]);
  }

  function openMessageDraft(body: string) {
    const encoded = encodeURIComponent(body);
    const useWhatsapp = confirm(`Draft ready:\n\n${body}\n\nOK = WhatsApp, Cancel = Copy text`);
    if (useWhatsapp) window.open(`https://wa.me/?text=${encoded}`, "_blank");
    else navigator.clipboard?.writeText(body);
  }

  async function handleAction(action: ParsedAction) {
    const name = String(action.action || action.intent || "chat").toLowerCase();
    const params = action.params || {};
    if (name.includes("draft_message") || name.includes("draft")) {
      const body = action.message || params.messageBody || params.message || "";
      addBot("Draft ready. Main automatically send nahi karunga — aap confirm karke bhejoge.");
      openMessageDraft(body);
      return;
    }
    if (name.includes("dial_call") || name.includes("dial")) {
      const num = action.targetValue || params.rawNumber || "";
      if (!num) return addBot("Phone number bhejo, main dialer open kar dunga.");
      if (confirm(`Open dialer for ${num}?`)) window.location.href = `tel:${num}`;
      addBot(`Dialer handoff ready for ${num}.`);
      return;
    }
    if (name.includes("create_task") || name.includes("reminder") || name.includes("task")) {
      const title = action.title || action.message || params.title || "New task";
      setTasks((t) => [{ id: Date.now(), title, note: action.notes || params.notes || "", done: false }, ...t]);
      addBot(`Task saved: ${title}`);
      return;
    }
    addBot(action.message || params.answer || action.notes || "Okay.");
  }

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setBusy(true);
    setMessages((m) => [...m, { from: "user", text }]);
    const action = await askAssistant(text);
    await handleAction(action);
    setBusy(false);
  }

  function startVoice() {
    const W = window as any;
    const SpeechRecognition = W.SpeechRecognition || W.webkitSpeechRecognition;
    if (!SpeechRecognition) return addBot("Voice input is browser dependent. Android Chrome me try karo.");
    const rec = new SpeechRecognition();
    rec.lang = "en-IN";
    rec.onresult = (e: any) => setInput(e.results[0][0].transcript);
    rec.start();
  }

  const css = `
    .pai-wrap{min-height:100vh;background:#0f1115;color:#e8eaed;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;padding:18px;display:flex;justify-content:center}.pai{width:100%;max-width:480px;background:#171a21;border:1px solid #2a2f3a;border-radius:24px;overflow:hidden;box-shadow:0 24px 80px rgba(0,0,0,.35)}.top{padding:18px;border-bottom:1px solid #2a2f3a;display:flex;align-items:center;justify-content:space-between}.top h1{font-size:18px;margin:0}.pill{font-size:12px;color:#9aa0ab;border:1px solid #2a2f3a;border-radius:20px;padding:6px 10px}.tabs{display:flex;background:#11141a}.tabs button{flex:1;background:transparent;border:0;color:#9aa0ab;padding:12px;font-weight:700}.tabs button.active{color:#4f8cff;border-bottom:2px solid #4f8cff}.body{height:620px;max-height:72vh;display:flex;flex-direction:column;padding:14px}.messages{flex:1;overflow:auto;display:flex;flex-direction:column;gap:10px}.msg{max-width:82%;padding:11px 13px;border-radius:16px;font-size:14px;line-height:1.45}.msg.user{align-self:flex-end;background:#2f6fe0;color:white;border-bottom-right-radius:5px}.msg.bot{align-self:flex-start;background:#1f232c;border-bottom-left-radius:5px}.input{border-top:1px solid #2a2f3a;padding-top:12px;display:flex;gap:8px}.input input{flex:1;background:#1f232c;color:#fff;border:1px solid #2a2f3a;border-radius:22px;padding:12px 14px;outline:none}.input button,.primary{background:#4f8cff;color:white;border:0;border-radius:12px;padding:11px 14px;font-weight:800}.icon{border-radius:50%!important;width:44px}.notice{background:#1f232c;border:1px solid #2a2f3a;border-radius:16px;padding:14px;color:#9aa0ab;font-size:13px;line-height:1.55;margin-bottom:12px}.task{background:#1f232c;border:1px solid #2a2f3a;border-radius:14px;padding:12px;margin-bottom:10px;display:flex;gap:10px;align-items:flex-start}.task span{flex:1}.task.done span{text-decoration:line-through;color:#9aa0ab}.danger{background:#e05a5a!important}.small{font-size:12px;color:#9aa0ab}.empty{text-align:center;margin-top:80px;color:#9aa0ab}.safe{padding:14px;font-size:12px;color:#9aa0ab;border-top:1px solid #2a2f3a;line-height:1.55}
  `;

  return (
    <main className="pai-wrap">
      <style>{css}</style>
      <section className="pai">
        <div className="top"><h1>🤖 Personal AI Assistant</h1><div className="pill">● {status}</div></div>
        <div className="tabs">
          <button onClick={() => setTab("chat")} className={tab === "chat" ? "active" : ""}>Chat</button>
          <button onClick={() => setTab("tasks")} className={tab === "tasks" ? "active" : ""}>Tasks</button>
          <button onClick={() => setTab("settings")} className={tab === "settings" ? "active" : ""}>Safety</button>
        </div>
        {tab === "chat" && <div className="body">
          <div className="notice">Safe mode: app background messages/call logs nahi padhta, aur message/call automatically send nahi karta. Aap final confirm karte ho.</div>
          <div className="messages">{messages.map((m,i)=><div key={i} className={`msg ${m.from}`}>{m.text}</div>)}</div>
          <div className="input"><button className="icon" onClick={startVoice}>🎙️</button><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter') send();}} placeholder="Type command: message, call, remind, plan..."/><button onClick={send}>➤</button></div>
        </div>}
        {tab === "tasks" && <div className="body">
          <div className="notice">Local tasks/reminders browser storage me save hote hain.</div>
          {tasks.length===0 ? <div className="empty">No tasks yet. Try: remind me to apply for jobs</div> : tasks.map(t=><div key={t.id} className={`task ${t.done?'done':''}`}><input type="checkbox" checked={t.done} onChange={()=>setTasks(tasks.map(x=>x.id===t.id?{...x,done:!x.done}:x))}/><span>{t.title}<br/><b className="small">{t.note}</b></span><button onClick={()=>setTasks(tasks.filter(x=>x.id!==t.id))}>🗑</button></div>)}
        </div>}
        {tab === "settings" && <div className="body">
          <div className="notice"><b>Privacy:</b> No hidden SMS, no call log reading, no background sending, no secret recording. Calls open dialer only. Messages open WhatsApp/copy draft only.</div>
          <button className="primary danger" onClick={()=>{localStorage.removeItem('personal-ai-tasks');setTasks([]);}}>Delete all local data</button>
          <p className="small">For full Claude AI response, Vercel environment variable ANTHROPIC_API_KEY must be added in project settings.</p>
        </div>}
        <div className="safe">Open this link on Android Chrome → three dots → Add to Home screen.</div>
      </section>
    </main>
  );
}
