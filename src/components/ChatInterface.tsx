import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Mic, X } from 'lucide-react';
import { MascotIllustration } from './MascotIllustration';
import { useCampusStore } from '../store/useCampusStore';
import { CAMPUS_NODES, findPath } from '../lib/campus-data';
import { cn } from '../lib/utils';

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string; status?: 'pending' | 'sent' }[]>([
    { role: 'bot', text: 'Olá! Sou o FECAFinho. Digite para onde deseja ir ou escolha um local no menu lateral!' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);

  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Desculpe, seu navegador não suporta reconhecimento de voz.' }]);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;
      setInput(speechToText);
      // Optional: automatically send message after voice result
      // processAIResponse(speechToText); 
    };

    recognition.onerror = (event: any) => {
      console.error('Erro no reconhecimento de voz:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const sendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isTyping) return;

    // 1. UI-Blocking Prevention: Update DOM instantly and clear input
    const userMsg = trimmedInput;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg, status: 'pending' }]);
    
    // Non-blocking processing
    processAIResponse(userMsg);
  };

  const { selectNode, setNavigationPath, setFloor, isDarkMode } = useCampusStore();

  const processAIResponse = async (userMsg: string) => {
    setIsTyping(true);
    try {
      const lowerMsg = userMsg.toLowerCase();
      
      // Navigation Intent Detection
      const destinationMap: Record<string, string> = {
        'sala 10': 'sub2-45',
        'sala 07': 'sub1-34',
        'sala 06': 'sub1-33',
        'laboratorio 01': 'ter-12',
        'laboratorio 02': 'ter-13',
        'laboratorio 03': 'ter-14',
        'arena': 'ter-58',
        'recepção': 'ter-10',
        'recept': 'ter-10',
        'praca': 'ter-54',
        'estacionamento': 'sub2-53',
        'garagem': 'sub2-53',
        'gamer': 'sub2-42'
      };

      let targetId = '';
      for (const [key, id] of Object.entries(destinationMap)) {
        if (lowerMsg.includes(key)) {
          targetId = id;
          break;
        }
      }

      if (targetId) {
        const targetNode = CAMPUS_NODES.find(n => n.id === targetId);
        if (targetNode) {
          await new Promise(r => setTimeout(r, 600));
          // Trigger Map Updates
          setFloor(targetNode.floor);
          selectNode(targetId);
          const path = findPath('totem-base', targetId);
          setNavigationPath(path);
          
          setMessages(prev => [...prev, { role: 'bot', text: `Com certeza! Tracei a melhor rota para o ${targetNode.name} no nível ${targetNode.floor === 0 ? 'Térreo' : 'S' + targetNode.floor}. Siga as linhas verdes no mapa!` }]);
          setIsTyping(false);
          return;
        }
      }
      
      // Local semantic match simulator (Generic)
      if (lowerMsg.includes('sala') || lowerMsg.includes('laboratorio') || lowerMsg.includes('onde')) {
        await new Promise(r => setTimeout(r, 800)); 
        setMessages(prev => [...prev, { role: 'bot', text: 'Localizei o espaço e tracei a rota otimizada no mapa para você! Verifique o painel lateral.' }]);
      } else {
        // AI Fallback using local API route
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userMsg }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.fallback || 'Erro na comunicação com a IA');
        }

        const data = await response.json();
        setMessages(prev => [...prev, { role: 'bot', text: data.text }]);
      }
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'bot', text: error.message || "Opa, no momento estou operando apenas offline. Use o mapa para se guiar!" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={cn(
      "w-[450px] flex flex-col items-stretch relative transition-all duration-500 border-l shadow-2xl z-20",
      isDarkMode ? "bg-slate-950 border-slate-900" : "bg-white border-slate-100"
    )}>
      {/* Header */}
      <div className={cn(
        "p-8 border-b flex items-center gap-4 transition-all duration-500",
        isDarkMode ? "bg-slate-900/50 border-slate-800" : "bg-white/50 border-slate-50"
      )}>
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-fecaf-blue/10 shadow-lg flex items-center justify-center">
          <MascotIllustration className="w-full h-full" />
        </div>
        <div>
          <h3 className={cn(
            "font-black uppercase tracking-tight text-lg transition-colors duration-500",
            isDarkMode ? "text-slate-100" : "text-slate-800"
          )}>Assistente IA</h3>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-fecaf-green animate-pulse" />
            <span className="text-[10px] font-black text-fecaf-green uppercase tracking-widest leading-none">Online</span>
          </div>
        </div>
      </div>

      {/* Messages with Skeleton indicator */}
      <div className={cn(
        "flex-1 overflow-y-auto p-8 space-y-6 transition-colors duration-500",
        isDarkMode ? "bg-slate-900/20" : "bg-slate-50/30"
      )}>
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className={cn(
                "max-w-[85%] p-6 rounded-[28px] text-sm font-medium leading-relaxed shadow-sm transition-all duration-500",
                msg.role === 'bot' 
                  ? (isDarkMode 
                      ? "bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none"
                      : "bg-white text-slate-700 rounded-bl-none border border-slate-100"
                    ) 
                  : "bg-fecaf-blue text-white ml-auto rounded-br-none shadow-fecaf-blue/20"
              )}
            >
              {msg.text}
              {msg.status === 'pending' && (
                <span className="block text-[8px] mt-1 opacity-50 uppercase font-black">Enviando...</span>
              )}
            </motion.div>
          ))}
          {isTyping && (
             <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className={cn(
                 "p-6 rounded-full w-24 flex justify-center gap-1.5 border transition-all duration-500",
                 isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
               )}
             >
               <div className="w-2 h-2 bg-fecaf-green rounded-full animate-bounce [animation-delay:-0.3s]" />
               <div className="w-2 h-2 bg-fecaf-green rounded-full animate-bounce [animation-delay:-0.15s]" />
               <div className="w-2 h-2 bg-fecaf-green rounded-full animate-bounce" />
             </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area - High Ergonomics */}
      <div className={cn(
        "p-8 border-t transition-all duration-500",
        isDarkMode ? "border-slate-900 bg-slate-950" : "border-slate-50 bg-white"
      )}>
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Fale com o totem..."
            disabled={isTyping}
            className={cn(
              "w-full pl-8 pr-28 py-7 rounded-[32px] border-2 focus:ring-0 text-md font-bold transition-all shadow-inner",
              isDarkMode 
                ? "bg-slate-900 border-slate-800 focus:border-fecaf-green text-white placeholder:text-slate-600" 
                : "bg-slate-50 border-slate-100 focus:border-fecaf-blue text-slate-800 placeholder:text-slate-300"
            )}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button 
              onClick={startListening}
              className={cn(
                "p-4 transition-all relative rounded-xl",
                isListening 
                  ? "text-rose-500 bg-rose-50" 
                  : (isDarkMode ? "text-slate-600 hover:text-fecaf-green" : "text-slate-300 hover:text-fecaf-blue")
              )}
              title="Ativar Microfone"
            >
              <Mic className={cn("w-7 h-7", isListening && "animate-pulse")} />
              {isListening && (
                <motion.div
                  layoutId="mic-pulse"
                  className="absolute inset-0 rounded-xl bg-rose-200 opacity-20"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
              )}
            </button>
            <button 
              onClick={sendMessage}
              disabled={isTyping}
              className={cn(
                "p-4 rounded-2xl shadow-xl transition-all active:scale-95",
                isTyping 
                  ? "bg-slate-200 text-slate-400" 
                  : "bg-fecaf-blue text-white hover:bg-blue-600"
              )}
            >
              <Send className="w-7 h-7" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
