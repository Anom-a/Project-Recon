import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, Send, X, Bot, User, Sparkles, Minimize2 } from 'lucide-react';
import type { ChatMessage } from '@/src/shared/types';

const AI_RESPONSES: Record<string, string> = {
  'pid': "**PID Control for VEX Robotics:**\n\nPID stands for Proportional-Integral-Derivative. Here's a quick breakdown:\n\n• **P (Proportional):** Corrects based on current error. Higher P = faster response but can overshoot.\n• **I (Integral):** Corrects accumulated error over time. Helps eliminate steady-state error.\n• **D (Derivative):** Predicts future error based on rate of change. Reduces overshoot.\n\n**Recommended starting values for VEX V5:**\n- P: 0.5, I: 0.01, D: 0.3\n\nWould you like me to explain how to implement this in VEXcode?",
  'sensor': "**Common VEX V5 Sensors:**\n\n1. **Inertial Sensor** — Measures rotation and acceleration. Essential for autonomous turns.\n2. **Distance Sensor** — Ultrasonic ranging up to 200cm. Great for wall following.\n3. **Optical Sensor** — Detects color and proximity. Used in sorting mechanisms.\n4. **Vision Sensor** — Camera-based color blob detection. Advanced autonomous navigation.\n5. **Rotation Sensor** — Precise shaft position tracking for arm/lift control.\n\nWhich sensor would you like to learn more about?",
  'competition': "**VEX Competition Tips:**\n\n🏆 **Before the event:**\n- Test autonomous routines on multiple field conditions\n- Prepare a detailed engineering notebook\n- Practice driver skills courses\n\n⚙️ **At the event:**\n- Scout other teams during qualification matches\n- Keep spare parts organized and accessible\n- Communicate clearly with your alliance partner\n\n📋 **For judges:**\n- Be prepared to explain your design process\n- Show iteration — judges love to see how you improved\n- Demonstrate teamwork and documentation\n\nWant me to help you with autonomous strategy?",
  'default': "Great question! Here are some things I can help you with:\n\n🤖 **Robotics:** VEX V5/IQ building techniques, motor configurations, gear ratios\n📝 **Programming:** PID control, autonomous routines, sensor integration\n🏆 **Competitions:** Strategy, notebook tips, driver skills practice\n🔧 **Troubleshooting:** Motor issues, sensor calibration, code debugging\n📚 **Learning:** Course recommendations, practice exercises\n\nWhat would you like to explore?"
};

function getAIResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes('pid') || lower.includes('control') || lower.includes('proportional')) return AI_RESPONSES['pid'];
  if (lower.includes('sensor') || lower.includes('detect') || lower.includes('vision')) return AI_RESPONSES['sensor'];
  if (lower.includes('competition') || lower.includes('tournament') || lower.includes('judge')) return AI_RESPONSES['competition'];
  return AI_RESPONSES['default'];
}

export default function AiTutor() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '0', role: 'assistant', content: "Hi! I'm your **Ethio Robotics AI Tutor** 🤖\n\nI can help you with VEX programming, sensor setup, competition prep, and more. What would you like to learn about?", timestamp: 'now' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || isTyping) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: input.trim(), timestamp: 'now' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: getAIResponse(userMsg.content), timestamp: 'now' };
      setMessages(prev => [...prev, response]);
      setIsTyping(false);
    }, 800 + Math.random() * 800);
  };

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }} animate={{ scale: 1 }} whileHover={{ scale: 1.1 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-brand-blue to-[#1a2670] text-white rounded-full shadow-xl shadow-brand-blue/40 flex items-center justify-center z-50 hover:shadow-2xl transition-shadow"
      >
        <Bot className="w-7 h-7" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
      </motion.button>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      className="fixed bottom-6 right-6 z-50 w-[380px] max-h-[560px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-blue to-[#1a2670] px-5 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center"><Sparkles className="w-5 h-5 text-slate-900" /></div>
          <div><p className="font-bold text-white text-sm">AI Tutor</p><p className="text-blue-300 text-[10px]">Powered by Gemini</p></div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setIsMinimized(!isMinimized)} className="text-white/70 hover:text-white p-1.5 hover:bg-white/15 rounded-lg transition-colors" title="Minimize"><Minimize2 className="w-4 h-4" /></button>
          <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white p-1.5 hover:bg-white/15 rounded-lg transition-colors" title="Close"><X className="w-4 h-4" /></button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[380px]">
            {messages.map(msg => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${msg.role === 'assistant' ? 'bg-brand-blue/20' : 'bg-slate-100'}`}>
                  {msg.role === 'assistant' ? <Bot className="w-4 h-4 text-brand-blue" /> : <User className="w-4 h-4 text-slate-400" />}
                </div>
                <div className={`max-w-[260px] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'assistant' ? 'bg-slate-100 text-slate-700 rounded-tl-sm' : 'bg-brand-blue text-white rounded-tr-sm'
                }`}>
                  <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-brand-blue/20 flex items-center justify-center"><Bot className="w-4 h-4 text-brand-blue" /></div>
                <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1">
                  {[0, 1, 2].map(i => (<motion.div key={i} animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }} className="w-2 h-2 bg-slate-400 rounded-full" />))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="px-4 pb-2 flex gap-2 flex-wrap">
            {['PID Control', 'Sensors', 'Competition Tips'].map(q => (
              <button key={q} onClick={() => { setInput(q); }} className="text-[10px] font-bold text-brand-blue bg-brand-blue/10 px-3 py-1.5 rounded-full hover:bg-brand-blue/20 transition-colors">{q}</button>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-slate-200">
            <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2 border border-slate-200 focus-within:border-brand-blue transition-colors">
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Ask me about robotics..." className="flex-1 bg-transparent text-sm outline-none text-slate-900 placeholder:text-slate-500" />
              <button onClick={sendMessage} disabled={!input.trim() || isTyping}
                className="w-8 h-8 bg-brand-blue text-white rounded-lg flex items-center justify-center hover:bg-[#1a2670] disabled:bg-slate-100 disabled:text-slate-500 transition-colors active:scale-90">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
