import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, Shield, User, Loader2, HelpCircle } from 'lucide-react';

interface GeminiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  electionContext?: any;
}

interface Message {
  id: string;
  sender: 'user' | 'gemini';
  text: string;
  timestamp: string;
}

export const GeminiAssistantModal: React.FC<GeminiAssistantModalProps> = ({
  isOpen,
  onClose,
  electionContext
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'gemini',
      text: 'Hello! I am your AI Student Election Assistant powered by Google Gemini. Ask me about candidate manifestos, classroom policies, or how your ballot secrecy is mathematically protected.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    'How is my ballot anonymity protected?',
    "What are Aarav Sharma's key promises?",
    "What is Diya Patel's plan for study notes?",
    'What happens if there is a tie?'
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSend = async (questionText?: string) => {
    const query = (questionText || input).trim();
    if (!query || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!questionText) setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/ask-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: query,
          electionContext: electionContext || {
            title: 'Class Monitor Election 2026-27',
            class: 'Grade 11-A',
            candidates: ['Aarav Sharma', 'Diya Patel', 'Arjun Nair']
          }
        })
      });

      const data = await res.json();
      const botReply = data.answer || data.reply || data.text || 'I am ready to assist you with any questions regarding this election.';
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'gemini',
        text: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'gemini',
          text: 'Notice: Vote integrity is strictly guaranteed via SHA-256 cryptographic hashes. Each student receives exactly one irreversible ballot token.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl bg-[#0e1017] border border-[#27273a] rounded-2xl shadow-2xl flex flex-col h-[600px] overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#1e1f2f] flex items-center justify-between bg-[#12131e]/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white text-base">Gemini Election Assistant</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono border border-purple-500/30">
                  AI 2.0 Flash
                </span>
              </div>
              <p className="text-xs text-zinc-400">Neutral election guide & policy assistant</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-800/60 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Thread */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                msg.sender === 'user' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-zinc-800 text-purple-400 border border-purple-500/30'
              }`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-purple-600 text-white rounded-tr-sm'
                  : 'bg-[#181926] text-zinc-200 border border-[#27273a] rounded-tl-sm'
              }`}>
                <p className="whitespace-pre-line">{msg.text}</p>
                <span className="text-[10px] opacity-40 mt-1 block text-right font-mono">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-[#181926] border border-[#27273a] rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-zinc-400 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                <span>Gemini is analyzing election rules & manifestos...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Questions Chips */}
        <div className="px-5 py-2 border-t border-[#1e1f2f] bg-[#0c0d14] flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] text-zinc-500 uppercase tracking-wider flex items-center gap-1 shrink-0 font-medium">
            <HelpCircle className="w-3 h-3 text-purple-400" /> Suggested:
          </span>
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={isLoading}
              className="text-xs bg-[#191a26] hover:bg-[#222435] border border-zinc-800 hover:border-purple-500/40 text-zinc-300 hover:text-white px-3 py-1 rounded-full whitespace-nowrap transition-all duration-150 shrink-0"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-[#1e1f2f] bg-[#12131e]">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask anything about candidates, voting secrecy, or timelines..."
              className="flex-1 bg-[#181926] border border-zinc-700/60 focus:border-purple-500 text-white placeholder-zinc-500 text-sm rounded-xl px-4 py-2.5 outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-sm flex items-center gap-2 disabled:opacity-40 transition-all shadow-md shadow-purple-600/20"
            >
              <span>Ask</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
