import React, { useState, useEffect, useRef } from 'react';
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

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

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
      const normalizeText = (txt: string) => {
        return txt
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "") // remove accents
          .replace(/[^a-z0-9]/g, " ") // replace non-alphanumeric with space
          .replace(/\s+/g, " ") // reduce multiple spaces
          .trim();
      };

      const normalizedInput = normalizeText(userMsg);
      let targetId = '';      // Check category keywords
      const isLab = /\blabs?\b|\blaboratorio\b/i.test(normalizedInput);
      const isSala = /\bsalas?\b/i.test(normalizedInput);
      const isGamer = /\bgamer\b|\bgames?\b|\bjogos\b/i.test(normalizedInput);
      const isRecepcao = /\brecepcao\b|\brecep\b|\brecept\b|\bentrada\b/i.test(normalizedInput);
      const isArena = /\barena\b|\bauditorio\b/i.test(normalizedInput);
      const isPraca = /\bpraca\b|\balimentacao\b|\bcomida\b|\bfood\b/i.test(normalizedInput);
      const isEstacionamento = /\bestacionamento\b|\bgaragem\b/i.test(normalizedInput);
      const isPc = /\bcomputador\b|\bcomputadores\b|\bpc\b|\bpcs\b|\bmaquina\b|\bmaquinas\b|\binformatica\b/i.test(normalizedInput);

      // Extract numbers to match specific rooms/labs
      const numbers = normalizedInput.match(/\d+/g);
      const num = numbers ? parseInt(numbers[0], 10) : null;

      if ((isLab || isPc) && num !== null) {
        if (num === 1) targetId = 'ter-12';
        else if (num === 2) targetId = 'ter-13';
        else if (num === 3) targetId = 'ter-14';
      } else if (isPc && num === null) {
        targetId = 'ter-12'; // Default to Lab 1
      } else if (isSala && num !== null) {
        if (num === 6) targetId = 'sub1-33';
        else if (num === 7) targetId = 'sub1-34';
        else if (num === 10) targetId = 'sub2-45';
      } else if (isGamer) {
        targetId = 'sub2-42';
      } else if (isRecepcao) {
        targetId = 'ter-10';
      } else if (isArena) {
        targetId = 'ter-58';
      } else if (isPraca) {
        targetId = 'ter-54';
      } else if (isEstacionamento) {
        targetId = 'sub2-53';
      }

      // If we didn't match via exact category/number structure, try standard substring fallback mapping
      if (!targetId) {
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

        const lowerMsg = userMsg.toLowerCase();
        for (const [key, id] of Object.entries(destinationMap)) {
          if (lowerMsg.includes(key)) {
            targetId = id;
            break;
          }
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
          
          let botText = `Com certeza! Tracei a melhor rota para o ${targetNode.name} no nível ${targetNode.floor === 0 ? 'Térreo' : 'S' + targetNode.floor}. Siga as linhas verdes no mapa!`;
          if (isPc && num === null) {
            botText = `Claro! Temos os Laboratórios de Informática 01, 02 e 03 equipados com computadores no Pavimento Térreo. Tracei a rota para o Laboratório 01! Siga as linhas verdes no mapa.`;
          } else if (isPc && num !== null) {
            botText = `Com certeza! Temos computadores disponíveis no Laboratório 0${num} no Pavimento Térreo. Tracei a rota para ele! Siga as linhas verdes no mapa.`;
          }
          
          setMessages(prev => [...prev, { role: 'bot', text: botText }]);
          setIsTyping(false);
          return;
        }
      }
      
      // Local semantic match simulator (Generic fallback)
      const hasRoomKeyword = /\bsalas?\b|\blaboratorios?\b|\blabs?\b/i.test(normalizedInput);
      if (hasRoomKeyword) {
        await new Promise(r => setTimeout(r, 800)); 
        setMessages(prev => [...prev, { role: 'bot', text: 'Eu reconheci que você procura uma sala ou laboratório, mas não entendi qual número. Por favor, especifique como "Sala 10" ou "Laboratório 3", ou selecione no painel lateral!' }]);
      } else {
        // AI Fallback using local API route
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userMsg }),
        });

        if (!response.ok) {
          let errorMessage = 'Desculpe, serviço de IA temporariamente indisponível. Que tal usar o mapa para se guiar?';
          try {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const errorData = await response.json();
              errorMessage = errorData.fallback || errorData.error || errorMessage;
            }
          } catch (e) {
            console.error('Erro ao ler erro da API:', e);
          }
          throw new Error(errorMessage);
        }

        let responseText = '';
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            responseText = data.text;
          } else {
            throw new Error('Resposta não-JSON');
          }
        } catch (e) {
          throw new Error('Opa, no momento estou operando apenas offline. Use o mapa para se guiar!');
        }

        setMessages(prev => [...prev, { role: 'bot', text: responseText }]);
      }
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'bot', text: error.message || "Opa, no momento estou operando apenas offline. Use o mapa para se guiar!" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={cn(
      "w-full h-full min-w-[320px] max-w-full flex-shrink-0 flex flex-col items-stretch relative transition-all duration-500 border-t lg:border-t-0 lg:border-l shadow-2xl z-20 overflow-hidden",
      isDarkMode ? "bg-slate-950 border-slate-900" : "bg-white border-slate-100"
    )}>
      {/* Header */}
      <div className={cn(
        "p-4 md:p-6 border-b flex items-center gap-3 md:gap-4 transition-all duration-500 shrink-0",
        isDarkMode ? "bg-slate-900/50 border-slate-800" : "bg-white/50 border-slate-50"
      )}>
        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-fecaf-blue/10 shadow-lg flex items-center justify-center shrink-0">
          <MascotIllustration className="w-full h-full" />
        </div>
        <div>
          <h3 className={cn(
            "font-black uppercase tracking-tight text-base md:text-lg transition-colors duration-500",
            isDarkMode ? "text-slate-100" : "text-slate-800"
          )}>Assistente IA</h3>
          <div className="flex items-center gap-1.5 md:gap-2">
            <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-fecaf-green animate-pulse" />
            <span className="text-[9px] md:text-[10px] font-black text-fecaf-green uppercase tracking-widest leading-none">Online</span>
          </div>
        </div>
      </div>

      {/* Messages with Skeleton indicator */}
      <div className={cn(
        "flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 transition-colors duration-500",
        isDarkMode ? "bg-slate-900/20" : "bg-slate-50/30"
      )}>
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className={cn(
                "max-w-[85%] p-4 md:p-6 rounded-[24px] md:rounded-[28px] text-xs md:text-sm font-medium leading-relaxed shadow-sm transition-all duration-500",
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
                 "p-4 md:p-6 rounded-3xl w-20 md:w-24 flex justify-center gap-1.5 border transition-all duration-500",
                 isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
               )}
             >
               <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-fecaf-green rounded-full animate-bounce [animation-delay:-0.3s]" />
               <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-fecaf-green rounded-full animate-bounce [animation-delay:-0.15s]" />
               <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-fecaf-green rounded-full animate-bounce" />
             </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - High Ergonomics */}
      <div className={cn(
        "p-4 md:p-6 border-t transition-all duration-500 shrink-0",
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
              "w-full pl-5 md:pl-8 pr-24 md:pr-28 py-4 md:py-6 rounded-[24px] md:rounded-[32px] border-2 focus:ring-0 text-sm md:text-md font-bold transition-all shadow-inner",
              isDarkMode 
                ? "bg-slate-900 border-slate-800 focus:border-fecaf-green text-white placeholder:text-slate-600" 
                : "bg-slate-50 border-slate-100 focus:border-fecaf-blue text-slate-800 placeholder:text-slate-300"
            )}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button 
              onClick={startListening}
              className={cn(
                "p-2.5 md:p-3.5 transition-all relative rounded-lg md:rounded-xl",
                isListening 
                  ? "text-rose-500 bg-rose-50" 
                  : (isDarkMode ? "text-slate-600 hover:text-fecaf-green" : "text-slate-300 hover:text-fecaf-blue")
              )}
              title="Ativar Microfone"
            >
              <Mic className={cn("w-5 h-5 md:w-6 md:h-6", isListening && "animate-pulse")} />
              {isListening && (
                <motion.div
                  layoutId="mic-pulse"
                  className="absolute inset-0 rounded-lg md:rounded-xl bg-rose-200 opacity-20"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
              )}
            </button>
            <button 
              onClick={sendMessage}
              disabled={isTyping}
              className={cn(
                "p-2.5 md:p-3 rounded-lg md:rounded-xl shadow-md transition-all active:scale-95",
                isTyping 
                  ? "bg-slate-200 text-slate-400" 
                  : "bg-fecaf-blue text-white hover:bg-blue-600"
              )}
            >
              <Send className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
