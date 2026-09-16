import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Send } from "lucide-react";

export default function AIAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! I'm your Richfield Connect AI Assistant. Ask me about jobs, mentors, events, the CV builder, or anything else!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", text: input };
    setMessages([...messages, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await base44.functions.invoke("aiAssistant", { message: input });
      const reply = res.data?.reply || "Sorry, I couldn't process that.";
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    } catch (e) {
      setMessages((prev) => [...prev, { role: "assistant", text: "Error: " + (e.message || "Something went wrong.") }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = ["How do I build a CV?", "Find me a mentor", "What events are coming up?", "How does CodeHub work?"];

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C8102E] to-[#0A1A3F] flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#0A1A3F]">AI Assistant</h1>
          <p className="text-muted-foreground text-sm">Your smart guide to Richfield Connect.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm flex flex-col h-[calc(100vh-280px)] min-h-[400px]">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${m.role === "user" ? "bg-[#0A1A3F] text-white" : "bg-gray-100"}`}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm text-muted-foreground">Thinking...</div>
            </div>
          )}
          <div ref={endRef} />
        </div>
        {messages.length <= 1 && (
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button key={s} onClick={() => setInput(s)} className="text-xs px-3 py-1.5 rounded-full border hover:bg-gray-50">
                {s}
              </button>
            ))}
          </div>
        )}
        <div className="p-3 border-t flex gap-2">
          <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Ask anything..." className="flex-1" />
          <Button onClick={send} disabled={loading} size="icon" className="bg-[#C8102E] hover:bg-[#C8102E]/90">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
