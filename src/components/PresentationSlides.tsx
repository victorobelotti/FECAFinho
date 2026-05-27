import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCampusStore } from '../store/useCampusStore';
import { 
  Presentation, ChevronLeft, ChevronRight, Play, Pause, 
  MapPin, HelpCircle, Cpu, Sliders, Layers, RefreshCcw, 
  Check, Copy, ArrowRight, Brain, AlertCircle, Award
} from 'lucide-react';
import { cn } from '../lib/utils';

interface Slide {
  id: number;
  category: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<any>;
  color: string;
  points: { title: string; desc: string }[];
  technicalInfo?: string;
}

export const PresentationSlides: React.FC = () => {
  const isDarkMode = useCampusStore((state) => state.isDarkMode);
  const setView = useCampusStore((state) => state.setView);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isCopied, setIsCopied] = useState(false);

  const slides: Slide[] = [
    {
      id: 0,
      category: "Apresentação do Projeto",
      title: "FECAFinho: Orientação Inteligente",
      subtitle: "Guia Assistido e Mapeamento Indoor Baseado em Inteligência Artificial",
      icon: Award,
      color: "from-blue-500 to-indigo-600",
      points: [
        { title: "Inovação Acadêmica UniFECAF", desc: "Totem multimídia projetado para melhorar a mobilidade urbana escolar e navegação nas instalações do campus." },
        { title: "Navegação Sem Estresse", desc: "Auxilia novos alunos, professores e visitantes na localização de salas, laboratórios, auditórios e sanitários." },
        { title: "Experiência Multimodal", desc: "Suporta interações de toque interativas, comando de voz assistidos, mapas 2D vivos e respostas inteligentes por IA." }
      ],
      technicalInfo: "Tecnologias: React 18, Vite, Zustand, Tailwind CSS v4, Motion (Animações), Lucide Icons"
    },
    {
      id: 1,
      category: "Análise de Cenário",
      title: "O Problema de Navegação",
      subtitle: "O desafio dos campi verticais e infraestruturas complexas",
      icon: AlertCircle,
      color: "from-rose-500 to-orange-600",
      points: [
        { title: "Campi Verticais Multi-Blocos", desc: "Múltiplos andares (Subsolo S2, S1, Térreo) com salas distribuídas e blocos conectados criam desorientação natural no primeiro período letivo." },
        { title: "Perda de Tempo Letivo", desc: "Visitantes e novos matriculados gastam em média de 10 a 15 minutos procurando laboratórios específicos de informática ou coordenações." },
        { title: "Ausência de GPS Interno", desc: "O sinal de GPS convencional falha totalmente dentro de estruturas de concreto armado, impossibilitando navegação móvel tradicional." }
      ],
      technicalInfo: "Motivador principal: Redução em 95% do tempo de atendimento de recepção na semana de início das aulas."
    },
    {
      id: 2,
      category: "Conceito Central",
      title: "A Solução Proposta",
      subtitle: "União entre Inteligência Conversacional e Mapa Físico Indoor",
      icon: HelpCircle,
      color: "from-fecaf-green to-emerald-600",
      points: [
        { title: "Mascote Físico e Digital", desc: "Utiliza a imagem simpática do mascote 'FECAFinho' para construir uma ponte de comunicação empática, empoderando o usuário com respostas amigáveis." },
        { title: "Navegação Síncrona", desc: "O usuário faz uma pergunta por áudio e o sistema automaticamente: 1) Responde por voz, 2) Mostra as direções, 3) Traça o caminho exato no mapa." },
        { title: "Acessibilidade Universal", desc: "Suporta alto-contraste, modo escuro confortável para fotossensibilidade e navegação com grande escala de toque." }
      ],
      technicalInfo: "Arquitetura integrada: Voz -> Resposta IA -> Seleção de Nós -> Cálculo de Rota Dinâmica no Mapa."
    },
    {
      id: 3,
      category: "Core Científico: Roteamento",
      title: "Algoritmo de Dijkstra",
      subtitle: "Como calculamos o menor caminho do totem até o seu destino",
      icon: Sliders,
      color: "from-fecaf-blue to-cyan-600",
      points: [
        { title: "Nós e Arestas Georreferenciadas", desc: "O campus é modelado como um grafo matemático ponderado. Cada sala, elevador ou corredor é um 'Nó' com coordenadas (x, y) reais." },
        { title: "Cálculo do Menor Caminho", desc: "Ao selecionar um ponto (ex: Laboratório Rio 02), o algoritmo calcula o menor caminho pelas conexões navegáveis do pavimento." },
        { title: "Tratamento Multi-Pavimentos", desc: "Se o destino está no Subsolo S1 ou S2, o sistema direciona o usuário ao nó de escada ou elevador adequado, alternando os mapas." }
      ],
      technicalInfo: "Algoritmo: Dijkstra puro rodando no cliente em tempo de execução para rotas imediatas (~2ms de processamento)."
    },
    {
      id: 4,
      category: "Inteligência Artificial",
      title: "Coração Cognitivo - Gemini API",
      subtitle: "Processamento de linguagem natural refinado e contextualizado",
      icon: Brain,
      color: "from-purple-500 to-fuchsia-600",
      points: [
        { title: "Motor Conversacional Provedor", desc: "Alimentado pelo Gemini 1.5 Flash do Google, processando intenções naturais em vez de comandos rígidos e estáticos baseados em botões limitados." },
        { title: "System Prompt Estruturado", desc: "Configurado como o guia oficial do campus, adaptando-se a gírias acadêmicas e respondendo sempre de forma motivadora." },
        { title: "Controle de Contexto das Salas", desc: "Mapeamento semântico que entende que 'onde tem computador' se refere aos Laboratórios de Informática e aponta a rota devida." }
      ],
      technicalInfo: "API Key segura gerenciada via servidor de desenvolvimento Node.js / Express por proxies protegidos."
    },
    {
      id: 5,
      category: "Painel Administrativo",
      title: "Controle & Sincronização",
      subtitle: "Uma central de comando em tempo real para os coordenadores",
      icon: Layers,
      color: "from-amber-500 to-orange-600",
      points: [
        { title: "Gestão de E-mails Institucionais", desc: "Cadastro de alunos, professores e coordenadores com níveis de acesso seguros no ecossistema (ex: Victor Belotti como Administrador)." },
        { title: "Sincronização de Malhas de Caminhos", desc: "Possibilidade de carregar e compilar novas malhas de mapa (versões v2.4, v2.5), forçando atualizações em todos os totens." },
        { title: "Monitoramento de Hardware", desc: "Visão em tempo real de IPs, pings e status de serviço ativos e inativos dos totens físicos de atendimento." }
      ],
      technicalInfo: "Armazenamento sincronizado híbrido com LocalStorage e suporte de persistência de modificações em sessão."
    },
    {
      id: 6,
      category: "Interfaces & UX/UI",
      title: "Design de Alta Performance",
      subtitle: "Pensado em termos de legibilidade, toques físicos e acessibilidade",
      icon: MapPin,
      color: "from-emerald-500 to-teal-600",
      points: [
        { title: "Visual Clean e Moderno", desc: "Layout desenvolvido em grid fluido, tipografia legível de alta performance e uso cirúrgico das cores institucionais FECAF (Azul e Verde)." },
        { title: "Botões de Toque de 44px", desc: "Dimensionado especificamente para telas de totem interativas com navegação tátil ágil, prevenindo cliques acidentais." },
        { title: "Resiliência a Redimensionamentos", desc: "Interface perfeita para telas horizontais de totem, adaptando-se confortavelmente também para Tablets de recepção e Mobile." }
      ],
      technicalInfo: "Estilização via Tailwind v4 CSS com transição de layouts guiada por Motion para eliminar flickering."
    },
    {
      id: 7,
      category: "Faturamento & Futuro",
      title: "Próximos Passos (IoT)",
      subtitle: "O futuro da orientação indoor na UniFECAF",
      icon: RefreshCcw,
      color: "from-indigo-500 to-blue-600",
      points: [
        { title: "Geração de QR Codes Dinâmicos", desc: "Envio das orientações impressas do totem diretamente ao smartphone do aluno com apenas um toque na tela." },
        { title: "Sinalização de Leds nos Corredores", desc: "Integração IoT que acende lâmpadas inteligentes no teto para criar trilhas físicas vermelhas/verdes guiando o usuário até a porta." },
        { title: "Análise Preditiva de Tráfego", desc: "Aproveitamento dos dados de perguntas para identificar as salas mais procuradas e reorganizar as secretarias para evitar filas físicas." }
      ],
      technicalInfo: "Potencial de expansão: App nativo PWA com suporte a bússola giroscópica em realidade aumentada."
    }
  ];

  const handleNext = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const copyMarkdownToClipboard = () => {
    const formattedMarkdown = slides.map(s => {
      const bulletList = s.points.map(p => `* **${p.title}**: ${p.desc}`).join('\n');
      return `### SLIDE ${s.id + 1}: ${s.title}\n*${s.subtitle}*\n\n${bulletList}\n\n*${s.technicalInfo || ''}*\n\n---`;
    }).join('\n\n');

    navigator.clipboard.writeText(formattedMarkdown).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const currentSlide = slides[currentSlideIndex];
  const IconComponent = currentSlide.icon;

  return (
    <div className={cn(
      "flex-1 flex flex-col h-full overflow-hidden transition-colors duration-500",
      isDarkMode ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-800"
    )}>
      {/* Upper Navigation Header */}
      <div className={cn(
        "p-4 md:p-6 border-b flex flex-col sm:flex-row items-center sm:justify-between justify-center gap-4 shrink-0 transition-colors duration-500",
        isDarkMode ? "bg-slate-900/40 border-slate-800/80" : "bg-white/80 border-slate-100"
      )}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-fecaf-blue flex items-center justify-center text-white shadow-lg shadow-fecaf-blue/20">
            <Presentation className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm md:text-base font-black uppercase tracking-wider italic">Painel de Slides do Projeto</h2>
            <p className="text-[10px] md:text-xs text-slate-400 font-bold">FECAFinho - Totem de Atendimento Inteligente</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={copyMarkdownToClipboard}
            className={cn(
              "px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95 border",
              isCopied 
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                : "bg-fecaf-green hover:bg-[#008f4c] text-white border-transparent shadow-md"
            )}
            title="Copiar texto de todos os slides no formato Markdown"
          >
            {isCopied ? <Check className="w-4.5 h-4.5" /> : <Copy className="w-4.5 h-4.5" />}
            {isCopied ? "Copiado!" : "Copiar Texto dos Slides"}
          </button>

          <button
            onClick={() => setView('map')}
            className={cn(
              "px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 border",
              isDarkMode ? "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            )}
          >
            Sair da Apresentação
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Slide Deck Space */}
      <div className="flex-1 relative flex items-center justify-center p-4 md:p-8 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-fecaf-blue/5 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-pattern opacity-[0.02] pointer-events-none" />

        {/* Slide Stage Card with Motion Animation */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentSlideIndex}
            initial={{ opacity: 0, x: 80, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -80, scale: 0.98 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className={cn(
              "w-full max-w-5xl aspect-video md:min-h-[500px] rounded-[32px] md:rounded-[40px] shadow-2xl border flex flex-col md:flex-row overflow-hidden transition-all duration-500",
              isDarkMode ? "bg-slate-900/60 border-slate-800/80 text-white" : "bg-white border-slate-100 text-slate-800"
            )}
          >
            {/* Slide left accent panel containing Category, Big Icon, Category Badge */}
            <div className={cn(
              "md:w-[40%] bg-gradient-to-br p-10 md:p-14 flex flex-col justify-between text-white shrink-0 relative overflow-hidden",
              currentSlide.color
            )}>
              {/* Overlay graphics */}
              <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
              <div className="absolute -left-16 -bottom-16 w-48 h-48 rounded-full bg-black/10 blur-2xl pointer-events-none" />
              <div className="absolute inset-0 bg-pattern opacity-[0.05] pointer-events-none" />

              <div className="relative z-10">
                <span className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.2em] leading-none inline-block">
                  {currentSlide.category}
                </span>
                <div className="mt-8 md:mt-14 shrink-0">
                  <IconComponent className="w-16 h-16 md:w-20 md:h-20 drop-shadow-2xl text-white" />
                </div>
              </div>

              <div className="relative z-10 mt-10 md:mt-0">
                <p className="text-white/60 font-black text-[10px] uppercase tracking-widest mb-1.5">FECAF • Projeto Integrador</p>
                <h4 className="text-sm md:text-base font-bold text-white tracking-widest uppercase">SLIDE {currentSlide.id + 1} / 8</h4>
              </div>
            </div>

            {/* Slide text contents panel on the right */}
            <div className="flex-1 p-8 md:p-14 flex flex-col justify-between overflow-y-auto">
              <div>
                <h3 className="text-2xl md:text-4xl font-black tracking-tight leading-tight uppercase italic mb-2 select-text">
                  {currentSlide.title}
                </h3>
                <p className={cn(
                  "text-xs md:text-sm font-semibold tracking-wide italic mb-8 border-l-4 py-1 pl-4",
                  isDarkMode ? "text-slate-400 border-fecaf-blue/50" : "text-slate-500 border-fecaf-blue"
                )}>
                  {currentSlide.subtitle}
                </p>

                <div className="space-y-6 md:space-y-7 select-text">
                  {currentSlide.points.map((point, index) => (
                    <div key={index} className="flex gap-4 items-start">
                      <div className="w-6 h-6 rounded-lg bg-fecaf-green/10 dark:bg-fecaf-green/20 flex items-center justify-center text-fecaf-green shrink-0 mt-1">
                        <Check className="w-3.5 h-3.5 stroke-[3px]" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-black text-sm md:text-base text-slate-800 dark:text-slate-100 uppercase tracking-wide mb-1 leading-snug">
                          {point.title}
                        </h4>
                        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                          {point.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lower Section Technical Info */}
              {currentSlide.technicalInfo && (
                <div className={cn(
                  "mt-10 md:mt-8 pt-6 border-t font-mono text-[10px] md:text-xs font-bold uppercase tracking-wider flex items-center gap-2",
                  isDarkMode ? "border-slate-800/80 text-slate-500" : "border-slate-100 text-slate-400"
                )}>
                  <Cpu className="w-4 h-4 text-fecaf-blue" />
                  <span>{currentSlide.technicalInfo}</span>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slide Navigation Foot Controller with Indicators */}
      <div className={cn(
        "px-6 py-5 border-t flex items-center justify-between gap-6 shrink-0 transition-colors duration-500",
        isDarkMode ? "bg-slate-900/30 border-slate-800/80" : "bg-white border-slate-100"
      )}>
        {/* Previous Button */}
        <button
          onClick={handlePrev}
          className={cn(
            "w-12 h-12 md:w-36 rounded-2xl flex items-center justify-center gap-2 border shadow-sm transition-all active:scale-95 touch-manipulation cursor-pointer font-black text-xs uppercase tracking-widest leading-none",
            isDarkMode 
              ? "bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800" 
              : "bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          )}
        >
          <ChevronLeft className="w-5 h-5 shrink-0" />
          <span className="hidden md:inline">Anterior</span>
        </button>

        {/* Dynamic Nav Indicators */}
        <div className="flex items-center gap-2 max-w-[200px] overflow-x-auto justify-center select-none">
          {slides.map((s, index) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlideIndex(index)}
              className={cn(
                "h-2.5 rounded-full transition-all duration-300",
                currentSlideIndex === index 
                  ? "w-8 bg-fecaf-green" 
                  : "w-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-400 dark:hover:bg-slate-600"
              )}
              title={`Ir para Slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Next/Finish Button */}
        <button
          onClick={handleNext}
          className={cn(
            "w-12 h-12 md:w-36 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 touch-manipulation cursor-pointer font-black text-xs uppercase tracking-widest leading-none text-white",
            "bg-fecaf-blue hover:bg-[#0c5980]"
          )}
        >
          <span className="hidden md:inline">Continuar</span>
          <ChevronRight className="w-5 h-5 shrink-0" />
        </button>
      </div>
    </div>
  );
};
