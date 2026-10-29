"use client";

import React, { useState, useRef, useEffect } from "react";
import { api } from "@/services/api";
import { Bot, Send, User, Sparkles, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  category?: string;
  confidence?: number;
}

export const AIAssistantView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "ai",
      text: "👋 Hello! I am the **Traffic Intelligence AI Core**.\n\nI analyze live sensory telemetry across 110 road corridors, multi-horizon XGBoost forecasts, weather radar, and CAD incident feeds. How can I assist your dispatch operations today?",
      timestamp: "Just now",
      category: "welcome",
      confidence: 1.0
    }
  ]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQueries = [
    "Why is traffic high right now?",
    "Which roads are currently severe?",
    "What will traffic look like in 30 minutes?",
    "What are the peak traffic hours?",
    "How does rain affect traffic?",
    "Which road has the highest congestion risk?",
    "Why is Western Express Highway predicted to become congested?"
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.askAssistant(textToSend);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: res.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: res.category,
        confidence: res.confidence
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: "I encountered an error querying the traffic database. Please ensure the backend telematics service is reachable.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="p-4 rounded-xl bg-[#0D1527] border border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              Traffic Intelligence AI Assistant
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-semibold border border-cyan-700/50">
                Data Grounded
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Natural language intelligence directly querying live SQL tables, XGBoost forecasts & weather impact
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Telematics RAG Active</span>
        </div>
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0 text-xs">
        <span className="text-[11px] text-slate-500 font-medium shrink-0 flex items-center gap-1 pl-1">
          <Sparkles className="w-3 h-3 text-cyan-400" /> Prompts:
        </span>
        {suggestedQueries.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="px-2.5 py-1 rounded-lg bg-[#0D1527] hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-white shrink-0 transition-colors text-[11px]"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 rounded-xl bg-[#090E1A] border border-slate-800/80 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              msg.sender === "user"
                ? "bg-blue-600 text-white"
                : "bg-cyan-500/10 border border-cyan-500/30 text-cyan-400"
            }`}>
              {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Message Bubble */}
            <div className={`max-w-[80%] p-3.5 rounded-2xl text-xs space-y-1 ${
              msg.sender === "user"
                ? "bg-blue-600 text-white rounded-tr-none"
                : "bg-[#0D1527] border border-slate-800 text-slate-200 rounded-tl-none shadow-lg"
            }`}>
              {/* Message text with newline & bold support */}
              <div className="whitespace-pre-line leading-relaxed">
                {msg.text}
              </div>

              {/* Timestamp & Verification metadata */}
              <div className={`flex items-center gap-2 pt-1 text-[10px] ${
                msg.sender === "user" ? "text-blue-200 justify-end" : "text-slate-500 justify-between"
              }`}>
                <span>{msg.timestamp}</span>
                {msg.sender === "ai" && msg.confidence && (
                  <span className="font-mono text-cyan-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Verified: {Math.round(msg.confidence * 100)}%
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-[#0D1527] border border-slate-800 text-slate-400 text-xs rounded-tl-none flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              <span>Querying live telematics database & inference engine...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-2.5 rounded-xl bg-[#0D1527] border border-slate-800 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask about live congestion, weather impact, 30m forecasts, or a specific road corridor..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            className="flex-1 bg-transparent px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-40 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
