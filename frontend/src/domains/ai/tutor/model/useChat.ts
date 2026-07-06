import { useState, useCallback } from 'react';
import type { ChatMessage } from '../../../../shared/types';

const AI_RESPONSES: Record<string, string> = {
  pid: "**PID Control for VEX Robotics:**\n\nP = Proportional (current error), I = Integral (accumulated error), D = Derivative (rate of change).\n\nRecommended VEX V5 values: P: 0.5, I: 0.01, D: 0.3",
  sensor: "**Common VEX V5 Sensors:** Inertial (rotation), Distance (ultrasonic up to 200cm), Optical (color/proximity), Vision (camera blob detection), Rotation (shaft position).",
  competition: "**Competition Tips:** Test autonomous on multiple field surfaces, keep spare parts organized, scout other teams, explain your design process clearly to judges.",
  default: "I can help with: PID control, sensor integration, competition strategy, troubleshooting, motor configurations, and more. What would you like to learn?",
};

function getResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes('pid') || lower.includes('control')) return AI_RESPONSES.pid;
  if (lower.includes('sensor') || lower.includes('vision')) return AI_RESPONSES.sensor;
  if (lower.includes('competition') || lower.includes('tournament')) return AI_RESPONSES.competition;
  return AI_RESPONSES.default;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '0', role: 'assistant', content: "Hi! I'm your **Ethio Robotics AI Tutor**. Ask me about PID, sensors, competitions, or anything robotics!", timestamp: 'now' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = useCallback((content: string) => {
    if (!content.trim() || isTyping) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content, timestamp: 'now' };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: getResponse(content), timestamp: 'now' }]);
      setIsTyping(false);
    }, 600 + Math.random() * 600);
  }, [isTyping]);

  return { messages, sendMessage, isTyping };
}
