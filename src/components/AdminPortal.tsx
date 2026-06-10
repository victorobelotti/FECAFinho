import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCampusStore } from '../store/useCampusStore';
import { 
  Lock, Mail, Eye, EyeOff, ArrowRight, Home, 
  Map as MapIcon, Monitor, FileText, Brain, 
  Search, Plus, Edit, Trash2, X, Check,
  Loader2, ShieldCheck, Upload, Info,
  Layers, RefreshCcw, ChevronRight, Users, 
  Trash, UserPlus, HelpCircle, Sun, Moon, Power
} from 'lucide-react';
import { cn } from '../lib/utils';

// Interfaces for Users and Maps
interface AdminUser {
  id: string;
  name: string;
  ra: string;
  role: 'Aluno' | 'Coordenador' | 'Admin' | 'Professor';
  email: string;
  createdAt: string;
  password?: string;
}

interface MapInfo {
  id: string;
  name: string;
  version: string;
  lastModified: string;
  status: 'Sincronizado' | 'Desatualizado' | 'Processando';
  nodesCount: number;
  thumbnail: string;
}

const INITIAL_USERS: AdminUser[] = [
  { id: '1', name: 'Victor Belotti', ra: '2201934', role: 'Admin', email: 'victor@fecaf.com.br', createdAt: '22/05/2026', password: 'SenhaVictor123!' },
  { id: '2', name: 'Ana Silva Santos', ra: '2204551', role: 'Aluno', email: 'anasilva@fecaf.com.br', createdAt: '18/05/2026', password: 'SenhaAna456!' },
  { id: '3', name: 'Prof. Ricardo Santos', ra: '2100998', role: 'Coordenador', email: 'ricardo@fecaf.com.br', createdAt: '10/05/2026', password: 'SenhaRicardo789!' },
  { id: '4', name: 'Dra. Julia Costa', ra: '2208872', role: 'Professor', email: 'juliacosta@fecaf.com.br', createdAt: '14/05/2026', password: 'SenhaJulia012!' },
];

const INITIAL_MAPS: MapInfo[] = [
  { id: '1', name: 'Pavimento Térreo', version: 'v2.4', lastModified: '18/05/2026', status: 'Sincronizado', nodesCount: 42, thumbnail: 'grid-pattern' },
  { id: '2', name: '1º Andar - Blocos A/B', version: 'v2.1', lastModified: '15/05/2026', status: 'Desatualizado', nodesCount: 38, thumbnail: 'grid-pattern' },
  { id: '3', name: 'Subsolo 01 - Estacionamento', version: 'v1.8', lastModified: '10/05/2026', status: 'Sincronizado', nodesCount: 24, thumbnail: 'grid-pattern' },
];

export const AdminPortal: React.FC = () => {
  const setView = useCampusStore((state) => state.setView);
  const isDarkMode = useCampusStore((state) => state.isDarkMode);
  const toggleDarkMode = useCampusStore((state) => state.toggleDarkMode);
  
  // Authentication State
  const [isLogged, setIsLogged] = useState(false);
  const [loggedUser, setLoggedUser] = useState<AdminUser | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Tab State: 'users' or 'maps' or other panels
  const [activeTab, setActiveTab] = useState<'users' | 'maps' | 'totems' | 'logs' | 'ai'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Shared databases
  const [usersList, setUsersList] = useState<AdminUser[]>(() => {
    try {
      const saved = localStorage.getItem('FECAF_ADMIN_USERS');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
      return INITIAL_USERS;
    } catch (e) {
      console.error('Error loading users from localStorage:', e);
      return INITIAL_USERS;
    }
  });
  
  const [mapsList, setMapsList] = useState<MapInfo[]>(() => {
    try {
      const saved = localStorage.getItem('FECAF_ADMIN_MAPS');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
      return INITIAL_MAPS;
    } catch (e) {
      console.error('Error loading maps from localStorage:', e);
      return INITIAL_MAPS;
    }
  });

  // Persist users to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('FECAF_ADMIN_USERS', JSON.stringify(usersList));
    } catch (e) {
      console.error('Error saving users to localStorage:', e);
    }
  }, [usersList]);

  // Persist maps to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('FECAF_ADMIN_MAPS', JSON.stringify(mapsList));
    } catch (e) {
      console.error('Error saving maps to localStorage:', e);
    }
  }, [mapsList]);

  // Active drawers
  const [isUserDrawerOpen, setIsUserDrawerOpen] = useState(false);
  const [isMapDrawerOpen, setIsMapDrawerOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // User Form State
  const [userForm, setUserForm] = useState({
    name: '',
    ra: '',
    emailPrefix: '',
    role: 'Aluno' as AdminUser['role'],
    tempPassword: '',
  });
  const [showFormPassword, setShowFormPassword] = useState(false);
  const [isSavingUser, setIsSavingUser] = useState(false);

  const handleCloseUserDrawer = () => {
    setIsUserDrawerOpen(false);
    setEditingUserId(null);
    setUserForm({
      name: '',
      ra: '',
      emailPrefix: '',
      role: 'Aluno',
      tempPassword: '',
    });
  };

  // Map Upload / Form State
  const [selectedFloor, setSelectedFloor] = useState('0');
  const [isProcessingMap, setIsProcessingMap] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Totem/AI mock states
  const [isAiSaving, setIsAiSaving] = useState(false);
  const [aiSystemPrompt, setAiSystemPrompt] = useState(
    'Você é o FECAFinho, o mascote virtual e guia inteligente do campus UniFECAF. Você é amigável, prestativo e conhece tudo sobre o campus.'
  );

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setLoginError('Por favor preencha todos os campos.');
      return;
    }
    setLoginError('');
    setIsLoggingIn(true);
    setTimeout(() => {
      const targetEmail = email.trim().toLowerCase();
      const targetPassword = password.trim();

      if (targetEmail === 'admin@unifecaf.edu.br' && targetPassword === 'admin123') {
        setLoggedUser({
          id: 'admin',
          name: 'Victor Belotti',
          ra: '2201934',
          role: 'Admin',
          email: 'admin@unifecaf.edu.br',
          createdAt: '22/05/2026',
          password: 'admin123',
        });
        setIsLogged(true);
      } else {
        const matchedUser = usersList.find(
          u => u.email.trim().toLowerCase() === targetEmail && u.password === targetPassword
        );
        if (matchedUser) {
          setLoggedUser(matchedUser);
          setIsLogged(true);
        } else {
          setLoginError('E-mail ou senha incorretos. Por favor, verifique suas credenciais e tente novamente.');
        }
      }
      setIsLoggingIn(false);
    }, 1100);
  };

  // Helper for password strength
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'Sem senha', color: 'bg-slate-800' };
    if (pass.length < 5) return { score: 25, label: 'Fraca', color: 'bg-rose-500' };
    if (pass.length < 8) return { score: 60, label: 'Moderada', color: 'bg-amber-500' };
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    const hasNumber = /\d/.test(pass);
    if (hasSpecial && hasNumber) {
      return { score: 100, label: 'Forte (Segura)', color: 'bg-emerald-500' };
    }
    return { score: 80, label: 'Boa', color: 'bg-indigo-500' };
  };

  // Actions
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.name.trim() || !userForm.ra.trim() || !userForm.emailPrefix.trim()) {
      alert('Por favor, preencha todos os campos obrigatórios!');
      return;
    }

    setIsSavingUser(true);
    setTimeout(() => {
      const fullEmail = `${userForm.emailPrefix.toLowerCase().trim()}@fecaf.com.br`;
      
      if (editingUserId) {
        // Edit mode
        setUsersList(prev => prev.map(u => u.id === editingUserId ? {
          ...u,
          name: userForm.name.trim(),
          ra: userForm.ra.trim(),
          role: userForm.role,
          email: fullEmail,
          password: userForm.tempPassword.trim(),
        } : u));
        setToastMessage('Registro de usuário atualizado com sucesso!');
      } else {
        // Add mode
        const newUser: AdminUser = {
          id: String(Date.now()),
          name: userForm.name.trim(),
          ra: userForm.ra.trim(),
          role: userForm.role,
          email: fullEmail,
          createdAt: new Date().toLocaleDateString('pt-BR'),
          password: userForm.tempPassword.trim(),
        };
        setUsersList([newUser, ...usersList]);
        setToastMessage('Novo e-mail institucional cadastrado com sucesso!');
      }

      setIsSavingUser(false);
      setIsUserDrawerOpen(false);
      setEditingUserId(null);
      
      // Reset form
      setUserForm({
        name: '',
        ra: '',
        emailPrefix: '',
        role: 'Aluno',
        tempPassword: '',
      });

      // Show toast
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    }, 1500);
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Tem certeza de que deseja remover este usuário?')) {
      setUsersList(usersList.filter(u => u.id !== userId));
      setToastMessage('Registro de usuário removido com sucesso.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const handleProcessMap = () => {
    setIsProcessingMap(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsProcessingMap(false);
          setIsMapDrawerOpen(false);
          setUploadProgress(0);
          
          setMapsList(prev => prev.map(m => 
            m.name.includes(selectedFloor === '0' ? 'Térreo' : 'Andar') 
            ? { ...m, status: 'Sincronizado', version: 'v2.5', lastModified: 'Hoje' } 
            : m
          ));

          setToastMessage('Nova malha de caminhos compilada e aplicada aos totens com sucesso!');
          setShowToast(true);
          setTimeout(() => setShowToast(false), 4500);
        }, 600);
      }
    }, 80);
  };

  const filteredUsers = usersList.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.ra.includes(searchQuery) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLogged) {
    return (
      <div className="flex-1 flex bg-[#020617] h-screen overflow-hidden font-sans">
        {/* Universal Success Toast */}
        <AnimatePresence>
          {showToast && (
            <motion.div 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 20, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="fixed top-4 right-8 z-[100] bg-[#052e16] border border-green-500/30 text-green-400 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-xl"
            >
              <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                <Check className="w-4 h-4 text-green-500" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-[10px] uppercase tracking-widest leading-none mb-1">Sucesso</span>
                <span className="text-xs font-bold">{toastMessage}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sidebar Navigation */}
        <div className="w-24 md:w-60 lg:w-72 bg-[#0a0f1e] border-r border-slate-800/50 flex flex-col items-center py-10 shrink-0 transition-all duration-300">
          <div className="mb-14 px-4 md:px-5 lg:px-8 w-full flex items-center gap-2.5 md:gap-3 lg:gap-4">
            <div className="w-12 h-12 rounded-2xl bg-fecaf-blue flex items-center justify-center shadow-lg shadow-fecaf-blue/20 shrink-0">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div className="hidden md:block">
              <h3 className="text-white font-black uppercase text-xs tracking-tighter italic leading-none">FECAFinho</h3>
              <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.2em] mt-1">Sistemas Indoor</p>
            </div>
          </div>

          <nav className="flex-1 w-full px-2 md:px-3 lg:px-4 space-y-2 md:space-y-2.5 lg:space-y-3">
            {[
              { id: 'users', label: 'Usuários/Contas', icon: Users },
              { id: 'maps', label: 'Gerenciar Mapas', icon: MapIcon },
              { id: 'totems', label: 'Status dos Totens', icon: Monitor },
              { id: 'logs', label: 'Logs de Navega', icon: FileText },
              { id: 'ai', label: 'Configurações IA', icon: Brain },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setSearchQuery('');
                }}
                className={cn(
                  "w-full flex items-center gap-2.5 md:gap-3 lg:gap-4 px-3 md:px-3 lg:px-4 py-3 md:py-3.5 lg:py-4 rounded-2xl transition-all group",
                  activeTab === item.id 
                    ? "bg-[#7c3aed]/10 text-[#a78bfa] shadow-[0_0_20px_rgba(124,58,237,0.05)] border border-[#7c3aed]/20" 
                    : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                )}
              >
                <item.icon className={cn("w-5 h-5 md:w-5 md:h-5 lg:w-6 lg:h-6 shrink-0", activeTab === item.id ? "drop-shadow-[0_0_8px_rgba(167,139,250,0.5)]" : "")} />
                <span className="hidden md:block font-black text-[10px] lg:text-[11px] uppercase tracking-widest leading-none mt-0.5">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto px-2 md:px-3 lg:px-4 w-full">
            <div className="p-3 md:p-3 lg:p-4 bg-slate-900/40 rounded-[24px] border border-slate-800/50 mb-3 md:mb-3 lg:mb-4 hidden md:block">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 lg:mb-3">Core de IA</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-fecaf-green animate-pulse shrink-0" />
                <span className="text-white font-bold text-[11px] lg:text-xs">V3.5 Gemini Ativo</span>
              </div>
            </div>
            
            <button 
              onClick={() => setView('welcome')}
              className="flex items-center gap-2 px-4 md:px-4 lg:px-8 py-4 lg:py-5 text-slate-600 hover:text-white transition-all w-full"
            >
              <Home className="w-5 h-5 lg:w-6 lg:h-6 shrink-0" />
              <span className="hidden md:block font-black text-[10px] lg:text-[11px] uppercase tracking-widest mt-0.5">Mapa Geral</span>
            </button>
          </div>
        </div>

        {/* Workspace Area */}
        <main className="flex-1 relative flex flex-col min-w-0">
          
          {/* Dashboard Header Bar */}
          <header className="h-24 px-4 md:px-6 lg:px-10 flex items-center justify-between border-b border-slate-800/50 bg-[#020617]/50 backdrop-blur-md z-10 shrink-0">
            <div className="flex items-center gap-4 md:gap-8">
              <div className="flex items-center gap-3 md:gap-4 group cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#7c3aed] to-slate-800 flex items-center justify-center border border-slate-700 group-hover:border-fecaf-blue transition-all font-black text-xs text-white shrink-0">
                  {loggedUser ? loggedUser.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'AD'}
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-black text-sm tracking-tighter uppercase italic leading-none">
                    {loggedUser ? loggedUser.name.split(' ')[0] : 'ADMIN'}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-fecaf-green shrink-0" />
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-sans">
                      {loggedUser ? (loggedUser.role === 'Admin' ? 'Admin Master' : loggedUser.role) : 'Membro'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="h-6 w-px bg-slate-800 hidden lg:block" />

              <h1 className="hidden lg:block text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic mb-[-2px]">
                {activeTab === 'users' ? 'Painel de Gerenciamento de Usuários' : 'Sistemas Avançados do Totem'}
              </h1>
            </div>
            
            <div className="flex items-center gap-3 lg:gap-8">
              {/* Tablet Toolbar: Displays only between 768px (md) and 1024px (lg) */}
              <button
                type="button"
                onClick={toggleDarkMode}
                className="hidden md:flex lg:hidden p-3 rounded-xl bg-white/5 border border-white/10 text-[#a78bfa] hover:text-white hover:bg-white/10 transition-all items-center justify-center cursor-pointer shrink-0"
                title="Alternar Tema"
              >
                {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-400" />}
              </button>

              <button
                type="button"
                onClick={() => setView('welcome')}
                className="hidden md:flex lg:hidden p-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all items-center justify-center cursor-pointer shrink-0"
                title="Voltar ao Totem"
              >
                <Home className="w-5 h-5" />
              </button>

              <button 
                onClick={() => {
                  setIsLogged(false);
                  setLoggedUser(null);
                }}
                className="bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white px-5 lg:px-8 py-3 rounded-xl font-black text-[9px] uppercase tracking-[0.3em] transition-all shrink-0"
              >
                Encerrar Sessão
              </button>
            </div>
          </header>

          {/* Tab Content Panels */}
          {activeTab === 'users' && (
            <div className="flex-1 flex flex-col min-h-0 p-6 md:p-6 lg:p-12 overflow-y-auto custom-scrollbar">
              <div className="flex flex-col md:flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
                <div>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tighter uppercase italic leading-none mb-3">Usuários Cadastrados</h2>
                  <p className="text-slate-500 text-xs font-bold">
                    Painel para controle e cadastro de e-mails institucionais com acessos liberados no ecossistema do FECAFinho.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  {/* Search bar */}
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 focus-within:text-[#a78bfa] transition-colors" />
                    <input 
                      type="text"
                      placeholder="Buscar por nome, RA ou e-mail..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-slate-900/80 border border-slate-800 rounded-xl py-3 pl-11 pr-6 text-sm text-white focus:border-[#7c3aed] transition-all w-full sm:w-72 md:w-64 lg:w-72"
                    />
                  </div>

                  <button 
                    onClick={() => {
                      setEditingUserId(null);
                      setUserForm({
                        name: '',
                        ra: '',
                        emailPrefix: '',
                        role: 'Aluno',
                        tempPassword: '',
                      });
                      setIsUserDrawerOpen(true);
                    }}
                    className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-6 py-3.5 rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-purple-500/15 transition-all active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Usuário
                  </button>
                </div>
              </div>

              {/* Data Grid (Master View) */}
              <div className="bg-[#0a0f1e]/40 border border-slate-800/40 rounded-[32px] overflow-x-auto custom-scrollbar backdrop-blur-sm shadow-2xl">
                <table className="w-full min-w-[750px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800/40 bg-slate-950/20">
                      <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Nome Completo</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">RA (Cadastro)</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Nível de Acesso</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">E-mail Institucional</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">Criado em</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/20">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-8 py-16 text-center text-slate-500 font-bold">
                          Nenhum usuário encontrado correspondente à pesquisa.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user.id} className="group hover:bg-white/[0.01] transition-colors">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-900 border border-slate-700/60 flex items-center justify-center font-black text-xs text-[#a78bfa]">
                                {user.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                              </div>
                              <span className="font-bold text-white tracking-tight leading-none">{user.name}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5 font-mono text-xs text-slate-400">{user.ra}</td>
                          <td className="px-8 py-5">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider inline-block",
                              user.role === 'Admin' ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                              user.role === 'Coordenador' ? "bg-purple-500/10 text-[#c084fc] border border-purple-550/20" :
                              user.role === 'Professor' ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                              "bg-[#00a859]/10 text-[#22c55e] border border-[#00a859]/20"
                            )}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-sm text-slate-400 font-medium">{user.email}</td>
                          <td className="px-8 py-5 text-center text-xs text-slate-500 font-bold">{user.createdAt}</td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex items-center justify-end gap-2 pr-2">
                              <button 
                                onClick={() => {
                                  setEditingUserId(user.id);
                                  setUserForm({
                                    name: user.name,
                                    ra: user.ra,
                                    emailPrefix: user.email.split('@')[0],
                                    role: user.role,
                                    tempPassword: user.password || '',
                                  });
                                  setIsUserDrawerOpen(true);
                                }}
                                className="p-2 rounded-lg bg-slate-800/40 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                                title="Editar Usuário"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteUser(user.id)}
                                className="p-2 rounded-lg bg-slate-800/40 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                title="Remover Usuário"
                              >
                                <Trash className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Informative Tip Box */}
              <div className="mt-8 bg-[#0a0f1e]/20 border border-slate-800/60 rounded-2xl p-6 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-[#7c3aed]/10 text-[#a78bfa]">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm mb-0.5">Dica de Gestão de E-mails</h4>
                  <p className="text-xs text-slate-400">
                    Novos e-mails cadastrados aqui recebem e-mails automáticos para ativação e podem acessar salas, laboratórios, andares e relatórios avançados de cada campus através de seus logins institucionais.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'maps' && (
            <div className="flex-1 overflow-y-auto p-6 md:p-6 lg:p-12 custom-scrollbar">
              <div className="flex flex-col gap-6 md:flex-col md:items-start lg:flex-row lg:items-end lg:justify-between mb-10">
                <div>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tighter uppercase italic leading-none mb-4">Gerenciar Mapas</h2>
                  <p className="text-slate-500 text-xs font-bold flex items-center gap-2">
                    <Layers className="w-4 h-4" /> 
                    Total de {mapsList.length} malhas de caminhos ativas sincronizadas com os totens UniFECAF.
                  </p>
                </div>

                <button 
                  onClick={() => setIsMapDrawerOpen(true)}
                  className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-8 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center gap-3 shadow-2xl shadow-purple-500/20 transition-all active:scale-95 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Atualizar Novo Mapa
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {mapsList.map((map) => (
                  <motion.div 
                    key={map.id}
                    whileHover={{ y: -8 }}
                    className="bg-[#0a0f1e]/40 border border-slate-800/50 rounded-[32px] p-6 lg:p-8 flex flex-col group transition-all hover:bg-[#0a0f1e]/60 hover:border-slate-700 backdrop-blur-sm"
                  >
                    <div className="aspect-video w-full bg-[#020617] rounded-3xl relative overflow-hidden mb-8 border border-white/5 shadow-inner">
                      <div className="absolute inset-0 opacity-[0.03] bg-pattern" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <MapIcon className="w-12 h-12 text-slate-800" />
                      </div>
                      <div className="absolute top-4 right-4 capitalize">
                        <span className={cn(
                           "px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider",
                           map.status === 'Sincronizado' ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        )}>
                          {map.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row justify-between items-start md:items-start lg:items-start gap-4 mb-6">
                      <div>
                        <h4 className="text-xl font-black text-white tracking-tight italic mb-1">{map.name}</h4>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Versão: {map.version}</p>
                      </div>
                      <div className="text-left md:text-left lg:text-right shrink-0">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Última Modif.</p>
                        <p className="text-xs font-bold text-slate-300">{map.lastModified}</p>
                      </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-slate-800/30 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <RefreshCcw className="w-3.5 h-3.5 text-fecaf-blue" />
                          <span className="text-[11px] font-bold text-slate-400">{map.nodesCount} Nós</span>
                        </div>
                      </div>
                      <button className="text-slate-500 hover:text-white flex items-center gap-2 font-black text-[9px] uppercase tracking-[0.2em] transition-all">
                        Editar Malha
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'totems' && (
            <div className="flex-1 overflow-y-auto p-6 md:p-6 lg:p-12 custom-scrollbar space-y-10">
              <div>
                <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none mb-3">Status dos Totens</h2>
                <p className="text-slate-500 text-xs font-bold">Unidades de Hardware físicas registradas e operando nas recepções da faculdade.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { name: 'Totem Principal - Térreo', loc: 'Recepção Bloco A', status: 'Online', ip: '192.168.10.15', ping: '12ms' },
                  { name: 'Totem Secundário - Auditório', loc: 'Saguão do Bloco B', status: 'Online', ip: '192.168.10.16', ping: '15ms' },
                  { name: 'Totem Apoio - Vestibular', loc: 'Entrada Lateral', status: 'Offline', ip: '192.168.10.22', ping: '--' },
                ].map((totem, i) => (
                  <div key={i} className="bg-[#0a0f1e]/40 border border-slate-800/60 rounded-[32px] p-8 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h4 className="text-xl font-black text-white italic tracking-tight">{totem.name}</h4>
                        <p className="text-xs text-slate-400 mt-1">{totem.loc}</p>
                      </div>
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider",
                        totem.status === 'Online' ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      )}>
                        {totem.status}
                      </span>
                    </div>
                    <div className="border-t border-slate-800/30 pt-6 flex justify-between text-xs font-mono text-slate-500">
                      <span>IP: {totem.ip}</span>
                      <span>Ping: {totem.ping}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="flex-1 overflow-y-auto p-6 md:p-6 lg:p-12 custom-scrollbar space-y-10">
              <div>
                <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none mb-3">Logs & Feedback</h2>
                <p className="text-slate-500 text-xs font-bold">Relatório das pesquisas por voz de usuários reais em tempo de execução nos totens.</p>
              </div>

              <div className="bg-[#0a0f1e]/40 border border-slate-800/60 rounded-[32px] overflow-hidden">
                <div className="px-8 py-5 border-b border-slate-800/40 bg-slate-950/20 flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Logs</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">Transmissão Ativa</span>
                  </div>
                </div>
                <div className="p-8 space-y-4 font-mono text-xs text-slate-400 max-h-96 overflow-y-auto">
                  <p className="text-slate-500">[23:38:12] - Conversa por voz iniciada no Totem Principal</p>
                  <p className="text-slate-200">&gt; Pergunta: "Onde fica a secretaria de vestibular?"</p>
                  <p className="text-green-500">&lt; Resposta do FECAFinho: "A secretaria fica no térreo seguindo em frente!" - Rota Traçada</p>
                  <p className="border-b border-slate-800/30 pb-3" />
                  <p className="text-slate-500">[23:35:45] - Conversa por voz iniciada no Totem Principal</p>
                  <p className="text-slate-200">&gt; Pergunta: "Como faço para achar o laboratório 3 de informática?"</p>
                  <p className="text-green-500">&lt; Resposta do FECAFinho: "Suba até o 1º andar do bloco B!" - Rota Traçada</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="flex-1 overflow-y-auto p-6 md:p-6 lg:p-12 custom-scrollbar space-y-10">
              <div>
                <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none mb-3">Configurações de IA</h2>
                <p className="text-slate-500 text-xs font-bold">Ajustes finos do mascote inteligente FECAFinho alimentado pelo Gemini.</p>
              </div>

              <div className="bg-[#0a0f1e]/40 border border-slate-800/60 rounded-[32px] p-8 max-w-3xl space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Instruções do Sistema (Prompt)</label>
                  <textarea 
                    value={aiSystemPrompt}
                    onChange={(e) => setAiSystemPrompt(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-white text-sm focus:border-fecaf-blue transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Modelo Líder</label>
                    <select className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-5 text-white text-xs font-bold">
                      <option>gemini-1.5-flash (Otimizado)</option>
                      <option>gemini-1.5-pro (Raciocínio Complexo)</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Temperatura de IA</label>
                    <input type="range" min="0" max="1" step="0.1" defaultValue="0.4" className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer mt-5 accent-[#7c3aed]" />
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setIsAiSaving(true);
                    setTimeout(() => {
                      setIsAiSaving(false);
                      setToastMessage('Instruções de IA atualizadas nos totens!');
                      setShowToast(true);
                      setTimeout(() => setShowToast(false), 3000);
                    }, 1200);
                  }}
                  disabled={isAiSaving}
                  className="bg-[#7c3aed] hover:bg-[#6d28d9] px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 text-white disabled:opacity-50"
                >
                  {isAiSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Atualizar Motor IA
                </button>
              </div>
            </div>
          )}

          {/* DRAWER 1: USER REGISTRATION / EMAIL INTERFACE */}
          <AnimatePresence>
            {isUserDrawerOpen && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => !isSavingUser && handleCloseUserDrawer()}
                  className="absolute inset-0 bg-[#020617]/70 backdrop-blur-sm z-40"
                />
                <motion.div 
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="absolute top-0 right-0 h-full w-full max-w-lg bg-[#0a0f1e] border-l border-slate-800 z-50 shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col"
                >
                  {/* Drawer Header */}
                  <div className="p-10 border-b border-slate-800/50 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black text-white tracking-tight leading-none mb-1">
                        {editingUserId ? 'Editar Usuário' : 'Cadastrar Novo Usuário'}
                      </h2>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        {editingUserId ? 'Atualizar dados e credenciais' : 'Adicionar e-mail institucional'}
                      </p>
                    </div>
                    <button 
                      onClick={() => !isSavingUser && handleCloseUserDrawer()}
                      className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-slate-400 transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Drawer Form Body */}
                  <form onSubmit={handleCreateUser} className="flex-1 overflow-y-auto p-10 space-y-6 custom-scrollbar">
                    {/* Full Name */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo *</label>
                      <input 
                        type="text"
                        value={userForm.name}
                        onChange={e => setUserForm({ ...userForm, name: e.target.value })}
                        className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 px-6 text-white text-md focus:border-fecaf-blue transition-all"
                        placeholder="Ex: João da Silva Santos"
                        required
                      />
                    </div>

                    {/* Numeric RA Mask Validation & Role Select */}
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Registro Acadêmico (RA) *</label>
                        <input 
                          type="text"
                          value={userForm.ra}
                          onChange={e => {
                            // Only allow numbers to act as validation mask
                            const numbers = e.target.value.replace(/\D/g, '');
                            setUserForm({ ...userForm, ra: numbers });
                          }}
                          className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 px-6 text-white font-mono text-md focus:border-fecaf-blue transition-all"
                          placeholder="Ex: 2201452"
                          maxLength={12}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cargo / Nível de Acesso</label>
                        <select 
                          value={userForm.role}
                          onChange={e => setUserForm({ ...userForm, role: e.target.value as any })}
                          className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 px-6 text-white text-md focus:border-[#7c3aed] transition-all appearance-none cursor-pointer"
                        >
                          <option value="Aluno">Aluno</option>
                          <option value="Coordenador">Coordenador</option>
                          <option value="Professor">Professor</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </div>
                    </div>

                    {/* Institutional Email prefix registration */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail Institucional *</label>
                      <div className="relative">
                        <input 
                          type="text"
                          value={userForm.emailPrefix}
                          onChange={e => setUserForm({ ...userForm, emailPrefix: e.target.value })}
                          className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-6 pr-32 text-white font-mono text-md focus:border-fecaf-blue transition-all"
                          placeholder="usuario.fecaf"
                          required
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 py-1.5 px-2 bg-slate-950/60 rounded-xl border border-white/5 pointer-events-none">
                          <span className="text-[10px] font-black text-[#a78bfa] tracking-tighter">@fecaf.com.br</span>
                        </div>
                      </div>
                    </div>

                    {/* Provision Password with strength meter */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center ml-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Senha Provisória</label>
                        {userForm.tempPassword && (
                          <span className="text-[10px] font-bold text-slate-500">
                            Força: <b className="text-white">{getPasswordStrength(userForm.tempPassword).label}</b>
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input 
                          type={showFormPassword ? 'text' : 'password'}
                          value={userForm.tempPassword}
                          onChange={e => setUserForm({ ...userForm, tempPassword: e.target.value })}
                          className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-6 pr-14 text-white text-md focus:border-fecaf-blue transition-all"
                          placeholder="Crie ou use senha automática"
                        />
                        <button 
                          type="button"
                          onClick={() => setShowFormPassword(!showFormPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                        >
                          {showFormPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {/* Strength Indication Bar */}
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mt-3">
                        <motion.div 
                          className={cn(
                            "h-full transition-all duration-300",
                            getPasswordStrength(userForm.tempPassword).color
                          )}
                          initial={{ width: 0 }}
                          animate={{ width: `${getPasswordStrength(userForm.tempPassword).score}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800/30 flex gap-4">
                      <button 
                        type="button"
                        onClick={handleCloseUserDrawer}
                        className="flex-1 py-4 rounded-2xl border border-slate-800 text-slate-400 font-bold uppercase tracking-widest text-[11px] hover:bg-white/5 transition-all"
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit"
                        disabled={isSavingUser}
                        className="flex-[2] py-4 rounded-2xl bg-[#8b5cf6] text-white font-black uppercase tracking-widest text-[11px] hover:bg-[#7c3aed] transition-all flex items-center justify-center gap-3 shadow-xl shadow-purple-500/10 active:scale-95 disabled:opacity-50"
                      >
                        {isSavingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        {isSavingUser ? 'Salvando...' : (editingUserId ? 'Salvar Edição' : 'Salvar Registro')}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* DRAWER 2: MAP COMPILER DRAWER */}
          <AnimatePresence>
            {isMapDrawerOpen && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => !isProcessingMap && setIsMapDrawerOpen(false)}
                  className="absolute inset-0 bg-[#020617]/80 backdrop-blur-md z-40"
                />
                <motion.div 
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="absolute top-0 right-0 h-full w-full max-w-xl bg-[#0a1020] border-l border-slate-800 z-50 shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col"
                >
                  <div className="p-10 border-b border-slate-800/50 flex items-center justify-between shrink-0">
                    <div>
                      <h2 className="text-2xl font-black text-white tracking-tight uppercase italic leading-none mb-1">Redefinir Malha</h2>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ingestão de dados geoespaciais</p>
                    </div>
                    <button 
                      onClick={() => !isProcessingMap && setIsMapDrawerOpen(false)}
                      className="w-12 h-12 rounded-full hover:bg-white/5 flex items-center justify-center text-slate-500 transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-12 space-y-10 custom-scrollbar">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Selecionar Pavimento</label>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { id: '0', label: 'Térreo' },
                          { id: '1', label: 'Subsolo 01' },
                          { id: '2', label: 'Subsolo 02' },
                          { id: '3', label: '1º Andar' },
                        ].map(floor => (
                          <button
                            key={floor.id}
                            onClick={() => setSelectedFloor(floor.id)}
                            className={cn(
                              "py-4 px-6 rounded-2xl font-bold text-sm transition-all border",
                              selectedFloor === floor.id 
                                ? "bg-[#7c3aed]/10 border-[#7c3aed] text-white" 
                                : "bg-slate-900/50 border-slate-800 text-slate-500 hover:text-slate-300"
                            )}
                          >
                            {floor.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Arquivos de Referência</label>
                      <div className="border-2 border-dashed border-slate-800 rounded-[32px] p-12 flex flex-col items-center justify-center bg-slate-900/20 hover:bg-slate-900/40 transition-all cursor-pointer group">
                        <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                          <Upload className="w-7 h-7 text-fecaf-blue" />
                        </div>
                        <h4 className="text-white font-bold mb-2">Upload de Plantas (PDF) ou Malha (CSV)</h4>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest italic flex items-center gap-1.5">
                          Arraste os arquivos da nova planta aqui
                        </p>
                      </div>
                    </div>

                    <div className="bg-[#052e16]/20 border border-green-500/10 rounded-2xl p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                          <Info className="w-4 h-4 text-green-400" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-1">Regras de Validação</span>
                          <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                            O arquivo CSV enviado deve corresponder estritamente às definições de nós (X, Y) para recálculo por menor caminho utilizando Algoritmo de Dijkstra.
                          </p>
                        </div>
                      </div>
                    </div>

                    {isProcessingMap && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-end">
                          <span className="text-[10px] font-black text-[#a78bfa] uppercase tracking-widest">Processando compilação...</span>
                          <span className="text-xl font-black text-white italic">{uploadProgress}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-[#7c3aed] shadow-[0_0_20px_rgba(124,58,237,0.4)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-10 border-t border-slate-800/50 flex gap-4 shrink-0">
                    <button 
                      onClick={() => setIsMapDrawerOpen(false)}
                      disabled={isProcessingMap}
                      className="flex-1 py-5 rounded-2xl border border-slate-800 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:bg-white/5 transition-all"
                    >
                      Descartar
                    </button>
                    <button 
                      onClick={handleProcessMap}
                      disabled={isProcessingMap}
                      className="flex-[2] py-5 rounded-2xl bg-[#7c3aed] text-white font-black uppercase tracking-widest text-[10px] hover:bg-[#6d28d9] transition-all flex items-center justify-center gap-3 shadow-xl shadow-purple-500/20"
                    >
                      {isProcessingMap ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
                      {isProcessingMap ? 'Processando...' : 'Processar e Sincronizar'}
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </main>
      </div>
    );
  }

  // LOGIN PAGE FOR RESTRICTED ADMINISTRATOR AREAS
  return (
    <div className="flex-1 bg-[#020817] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_#050e20_0%,_#020817_100%)] min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-12 rounded-[48px] shadow-[0_40px_100px_rgba(0,0,0,0.6)]"
      >
        <div className="flex flex-col items-center mb-12">
          <div className="w-20 h-20 rounded-3xl bg-[#7c3aed]/10 flex items-center justify-center mb-8 border border-white/10 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <ShieldCheck className="w-10 h-10 text-[#a78bfa] relative z-10" />
          </div>
          <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter italic">Indoor Admin</h1>
          <p className="text-slate-500 font-black text-[9px] uppercase tracking-[0.4em]">Sistemas Inteligentes UniFECAF</p>
        </div>

        {loginError && (
          <div className="mb-6 bg-rose-500/10 border border-rose-500/25 rounded-2xl p-4 text-rose-400 text-xs font-semibold">
            {loginError}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Credencial de Engenharia</label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@unifecaf.edu.br"
                className="w-full bg-slate-900/50 border border-slate-800 rounded-3xl py-6 pl-14 pr-6 text-white focus:border-[#7c3aed] transition-all placeholder:text-slate-700 font-bold"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Chave de Segurança</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900/50 border border-slate-800 rounded-3xl py-6 pl-14 pr-14 text-white focus:border-[#7c3aed] transition-all placeholder:text-slate-700 font-bold"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoggingIn}
            className="w-full bg-fecaf-blue hover:bg-blue-600 text-white font-black py-6 rounded-3xl flex items-center justify-center gap-3 shadow-2xl shadow-fecaf-blue/10 transition-all group active:scale-95 disabled:opacity-50 mt-4"
          >
            {isLoggingIn ? <Loader2 className="w-6 h-6 animate-spin" /> : (
              <>
                Acessar Central de Controle
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <button 
          onClick={() => setView('welcome')}
          className="mt-14 w-full text-slate-600 hover:text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-colors"
        >
          <Home className="w-4 h-4" /> Voltar ao Início
        </button>
      </motion.div>
    </div>
  );
};
