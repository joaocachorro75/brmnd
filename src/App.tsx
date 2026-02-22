import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe, 
  Users, 
  Calendar, 
  Building2, 
  Search, 
  Plus, 
  MapPin, 
  Clock, 
  Send, 
  X, 
  Menu, 
  LogIn, 
  UserPlus, 
  LogOut, 
  ShieldCheck, 
  CheckCircle2, 
  Settings,
  CreditCard,
  Settings2,
  DollarSign,
  Briefcase,
  Heart,
  MessageSquare,
  BookOpen,
  FileText,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { findBrazilianBusinesses, askAIGuide } from '@/src/services/geminiService';
import Markdown from 'react-markdown';
import { io, Socket } from 'socket.io-client';

// --- Types ---

interface User {
  id: string;
  name: string;
  role: 'user' | 'admin';
  avatar: string;
  plan?: string;
}

interface Message {
  id: number;
  user: string;
  text: string;
  time: string;
}

interface Meetup {
  id: number;
  title: string;
  location: string;
  date: string;
  attendees: number;
  creator: string;
}

interface Business {
  id: number;
  name: string;
  type: string;
  location: string;
  status: 'pending' | 'approved' | 'rejected';
  description?: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
}

// --- Components ---

const Navbar = ({ user, onLogin, onRegister, onAdmin, onLogout, settings }: any) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-stone-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-emerald-200 group-hover:scale-110 transition-transform overflow-hidden">
              {settings?.logo?.length > 2 ? (
                <img src={settings.logo} className="w-full h-full object-cover" alt="" />
              ) : (
                settings?.logo || 'B'
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter text-stone-900 leading-none">{settings?.siteName || 'BRASILNOMUNDO'}</span>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Global Community</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-10">
            <div className="flex items-center gap-8">
              <a href="#negocios" className="text-xs font-bold uppercase tracking-widest text-stone-500 hover:text-emerald-600 transition-colors">Negócios</a>
              <a href="#comunidade" className="text-xs font-bold uppercase tracking-widest text-stone-500 hover:text-emerald-600 transition-colors">Comunidade</a>
              <a href="#encontros" className="text-xs font-bold uppercase tracking-widest text-stone-500 hover:text-emerald-600 transition-colors">Encontros</a>
              <a href="#blog" className="text-xs font-bold uppercase tracking-widest text-stone-500 hover:text-emerald-600 transition-colors">Blog</a>
              <a href="#guia" className="text-xs font-bold uppercase tracking-widest text-stone-500 hover:text-emerald-600 transition-colors">Guia AI</a>
            </div>
            
            <div className="h-6 w-px bg-stone-200" />

            {user ? (
              <div className="flex items-center gap-4">
                {user.role === 'admin' && (
                  <button onClick={onAdmin} className="p-2.5 bg-stone-900 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-stone-200">
                    <ShieldCheck size={18} />
                  </button>
                )}
                <div className="flex items-center gap-3 bg-stone-50 pl-1.5 pr-4 py-1.5 rounded-2xl border border-stone-100 group cursor-pointer hover:bg-white transition-colors">
                  <img src={user.avatar} className="w-8 h-8 rounded-xl shadow-sm" alt="" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-stone-800 leading-none">{user.name}</span>
                    <button onClick={onLogout} className="text-[10px] font-bold text-stone-400 hover:text-red-500 text-left">Sair</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <button onClick={onLogin} className="text-xs font-bold uppercase tracking-widest text-stone-500 hover:text-stone-900 transition-colors">Login</button>
                <button onClick={onRegister} className="bg-emerald-600 text-white px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 active:scale-95">
                  Cadastrar
                </button>
              </div>
            )}
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-stone-600 p-2">
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-stone-200 overflow-hidden"
          >
            <div className="p-6 space-y-6">
              <a href="#negocios" className="block text-lg font-bold text-stone-800">Negócios</a>
              <a href="#comunidade" className="block text-lg font-bold text-stone-800">Comunidade</a>
              <a href="#encontros" className="block text-lg font-bold text-stone-800">Encontros</a>
              <a href="#guia" className="block text-lg font-bold text-stone-800">Guia AI</a>
              {!user ? (
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-stone-100">
                  <button onClick={onLogin} className="py-4 text-stone-600 font-bold border border-stone-200 rounded-2xl">Login</button>
                  <button onClick={onRegister} className="py-4 bg-emerald-600 text-white rounded-2xl font-bold">Cadastrar</button>
                </div>
              ) : (
                <button onClick={onLogout} className="w-full py-4 bg-stone-100 text-stone-600 rounded-2xl font-bold">Sair</button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const ChatRoom = ({ socket, user }: { socket: Socket | null, user: User | null }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/state').then(res => res.json()).then(data => setMessages(data.messages));

    if (socket) {
      socket.on('message:new', (msg: Message) => {
        setMessages(prev => [...prev, msg]);
      });
    }
    return () => { socket?.off('message:new'); };
  }, [socket]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !socket || !user) return;
    socket.emit('message:send', { user: user.name, text: input, avatar: user.avatar });
    setInput('');
  };

  return (
    <div className="bg-white rounded-[3rem] border border-stone-200 shadow-2xl overflow-hidden flex flex-col h-[600px] relative">
      <div className="bg-stone-900 p-6 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-500/20">
              B
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-stone-900 rounded-full" />
          </div>
          <div>
            <h3 className="text-white font-black tracking-tight">COMUNIDADE GLOBAL</h3>
            <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Chat em Tempo Real</p>
          </div>
        </div>
        <div className="flex -space-x-2">
          {[1,2,3].map(i => (
            <img key={i} src={`https://picsum.photos/seed/${i+50}/100`} className="w-8 h-8 rounded-full border-2 border-stone-900" alt="" />
          ))}
          <div className="w-8 h-8 rounded-full bg-stone-800 border-2 border-stone-900 flex items-center justify-center text-[10px] font-bold text-stone-400">+12</div>
        </div>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-stone-50/50">
        {messages.map((msg) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={msg.id} 
            className={cn("flex gap-3", msg.user === user?.name ? "flex-row-reverse" : "flex-row")}
          >
            <img src={`https://picsum.photos/seed/${msg.user}/100`} className="w-10 h-10 rounded-xl shadow-sm self-end" alt="" />
            <div className={cn("flex flex-col", msg.user === user?.name ? "items-end" : "items-start")}>
              <div className={cn(
                "max-w-[280px] p-4 rounded-[1.5rem] text-sm font-medium leading-relaxed shadow-sm",
                msg.user === user?.name 
                  ? "bg-emerald-600 text-white rounded-br-none" 
                  : "bg-white text-stone-800 border border-stone-100 rounded-bl-none"
              )}>
                <p className="text-[10px] font-black mb-1 opacity-50 uppercase tracking-widest">{msg.user}</p>
                <p>{msg.text}</p>
              </div>
              <span className="text-[9px] font-black text-stone-300 mt-2 uppercase tracking-widest">
                {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-6 bg-white border-t border-stone-100 flex gap-4">
        <div className="flex-1 relative">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={user ? "Sua mensagem..." : "Faça login para participar"}
            disabled={!user}
            className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
          />
        </div>
        <button 
          onClick={sendMessage}
          disabled={!user || !input.trim()}
          className="bg-stone-900 text-white w-14 h-14 rounded-2xl flex items-center justify-center hover:bg-emerald-600 transition-all disabled:opacity-20 shadow-xl shadow-stone-200 active:scale-90"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

const MeetupsSection = ({ socket, user }: any) => {
  const [meetups, setMeetups] = useState<Meetup[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newMeetup, setNewMeetup] = useState({ title: '', location: '', date: '' });

  useEffect(() => {
    fetch('/api/state').then(res => res.json()).then(data => setMeetups(data.meetups));
    if (socket) {
      socket.on('meetup:new', (m: Meetup) => setMeetups(prev => [m, ...prev]));
    }
    return () => { socket?.off('meetup:new'); };
  }, [socket]);

  const handleCreate = async () => {
    if (!newMeetup.title || !user) return;
    await fetch('/api/meetups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newMeetup, creator: user.name })
    });
    setShowForm(false);
    setNewMeetup({ title: '', location: '', date: '' });
  };

  return (
    <section id="encontros" className="py-20 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">Encontros & Eventos</h2>
            <p className="text-stone-600 max-w-xl">Marque um café, um futebol ou um churrasco. A vida fora do Brasil é melhor com amigos.</p>
          </div>
          <button 
            onClick={() => user ? setShowForm(true) : alert('Faça login para criar encontros')}
            className="flex items-center gap-2 bg-stone-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-stone-800 transition-all shadow-lg"
          >
            <Plus size={20} /> Criar Encontro
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {meetups.map(meetup => (
            <motion.div 
              key={meetup.id}
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm hover:shadow-xl transition-all"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                  <Calendar size={24} />
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                  <Users size={12} /> {meetup.attendees} confirmados
                </div>
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-2">{meetup.title}</h3>
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-stone-500 text-sm">
                  <MapPin size={14} /> {meetup.location}
                </div>
                <div className="flex items-center gap-2 text-stone-500 text-sm">
                  <Clock size={14} /> {new Date(meetup.date).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-stone-50">
                <span className="text-xs text-stone-400">Criado por <span className="font-bold text-stone-600">{meetup.creator}</span></span>
                <button className="text-sm font-bold text-emerald-600 hover:text-emerald-700">Confirmar Presença</button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-stone-900">Novo Encontro</h3>
                <button onClick={() => setShowForm(false)} className="text-stone-400 hover:text-stone-600"><X /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase mb-2">Título</label>
                  <input 
                    value={newMeetup.title}
                    onChange={(e) => setNewMeetup({...newMeetup, title: e.target.value})}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Ex: Churrasco dos Brasileiros"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase mb-2">Local</label>
                  <input 
                    value={newMeetup.location}
                    onChange={(e) => setNewMeetup({...newMeetup, location: e.target.value})}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Ex: Central Park, NY"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase mb-2">Data</label>
                  <input 
                    type="date"
                    value={newMeetup.date}
                    onChange={(e) => setNewMeetup({...newMeetup, date: e.target.value})}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <button 
                  onClick={handleCreate}
                  className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold mt-4 hover:bg-emerald-700 transition-all shadow-lg"
                >
                  Publicar Encontro
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

const AdminDashboard = ({ onClose, settings, onSettingsUpdate }: any) => {
  const [fullState, setFullState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'plans' | 'settings'>('stats');
  const [newLogo, setNewLogo] = useState(settings?.logo || '');
  const [newSiteName, setNewSiteName] = useState(settings?.siteName || '');

  useEffect(() => {
    if (settings) {
      setNewLogo(settings.logo);
      setNewSiteName(settings.siteName);
    }
  }, [settings]);

  const fetchFullState = async () => {
    try {
      const res = await fetch('/api/admin/full-state');
      if (res.ok) {
        const data = await res.json();
        setFullState(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFullState();
  }, []);

  const approveBusiness = async (id: number) => {
    await fetch(`/api/admin/businesses/${id}/approve`, { method: 'POST' });
    fetchFullState();
  };

  const handleSaveSettings = async () => {
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ logo: newLogo, siteName: newSiteName })
    });
    if (res.ok) {
      onSettingsUpdate(await res.json());
      alert('Configurações salvas!');
    }
  };

  if (loading) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/90 backdrop-blur-xl">
      <motion.div 
        initial={{ y: 50, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-6xl rounded-[3.5rem] p-12 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar relative"
      >
        <div className="flex justify-between items-start mb-12">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-stone-900 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-stone-200">
              <ShieldCheck size={40} />
            </div>
            <div>
              <h3 className="text-4xl font-black text-stone-900 tracking-tighter">SUPER ADMIN</h3>
              <p className="text-stone-400 text-xs font-black uppercase tracking-[0.2em] mt-1">Gestão da Plataforma Global</p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 bg-stone-50 text-stone-300 hover:text-stone-900 hover:bg-stone-100 rounded-2xl transition-all"><X size={32} /></button>
        </div>

        <div className="flex gap-4 mb-12 overflow-x-auto pb-2">
          {[
            { id: 'stats', label: 'Estatísticas', icon: ShieldCheck },
            { id: 'plans', label: 'Planos & Assinaturas', icon: CreditCard },
            { id: 'settings', label: 'Configurações', icon: Settings2 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap",
                activeTab === tab.id ? "bg-stone-900 text-white shadow-xl" : "bg-stone-50 text-stone-400 hover:bg-stone-100"
              )}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'stats' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
              {[
                { label: 'Usuários', val: fullState?.users?.length || 0, color: 'emerald' },
                { label: 'Negócios', val: fullState?.businesses?.length || 0, color: 'stone' },
                { label: 'Encontros', val: fullState?.meetups?.length || 0, color: 'stone' },
                { label: 'Mensagens', val: fullState?.messages?.length || 0, color: 'stone' }
              ].map((s, i) => (
                <div key={i} className={cn(
                  "p-8 rounded-[2.5rem] border transition-all",
                  s.color === 'emerald' ? "bg-emerald-50 border-emerald-100" : "bg-stone-50 border-stone-100"
                )}>
                  <p className={cn("text-[10px] font-black uppercase tracking-widest mb-3", s.color === 'emerald' ? "text-emerald-600" : "text-stone-400")}>{s.label}</p>
                  <p className={cn("text-5xl font-black tracking-tighter", s.color === 'emerald' ? "text-emerald-900" : "text-stone-900")}>{s.val}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-black text-stone-900 tracking-tight flex items-center gap-3">
                    <Building2 size={24} className="text-emerald-600" /> NEGÓCIOS PENDENTES
                  </h4>
                  <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                    {fullState?.businesses?.filter((b: any) => b.status === 'pending').length} aguardando
                  </span>
                </div>
                <div className="space-y-4">
                  {fullState?.businesses?.filter((b: any) => b.status === 'pending').map((b: any) => (
                    <div key={b.id} className="p-6 bg-stone-50 rounded-[2rem] border border-stone-100 hover:bg-white hover:shadow-xl transition-all group">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="font-black text-stone-900 text-lg tracking-tight">{b.name}</p>
                          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{b.type} • {b.location}</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => approveBusiness(b.id)}
                            className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                          >
                            <CheckCircle2 size={18} />
                          </button>
                          <button className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all">
                            <X size={18} />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-stone-500 font-medium leading-relaxed">{b.description}</p>
                    </div>
                  ))}
                  {fullState?.businesses?.filter((b: any) => b.status === 'pending').length === 0 && (
                    <div className="p-12 text-center border-2 border-dashed border-stone-100 rounded-[2rem]">
                      <p className="text-stone-300 font-bold uppercase tracking-widest text-xs">Nenhum negócio pendente</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-8">
                <h4 className="text-xl font-black text-stone-900 tracking-tight flex items-center gap-3">
                  <Users size={24} className="text-emerald-600" /> ÚLTIMOS USUÁRIOS
                </h4>
                <div className="bg-stone-50 rounded-[2.5rem] border border-stone-100 overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-stone-200">
                        <th className="px-6 py-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">Usuário</th>
                        <th className="px-6 py-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">Role</th>
                        <th className="px-6 py-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {fullState?.users?.slice(0, 5).map((u: any) => (
                        <tr key={u.id} className="hover:bg-white transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img src={u.avatar} className="w-8 h-8 rounded-xl" alt="" />
                              <span className="text-sm font-bold text-stone-900">{u.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-widest",
                              u.role === 'admin' ? "bg-stone-900 text-white" : "bg-emerald-50 text-emerald-600"
                            )}>{u.role}</span>
                          </td>
                          <td className="px-6 py-4">
                            <button className="text-stone-300 hover:text-stone-900 transition-colors"><Settings size={16} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'plans' && (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {fullState?.plans?.map((plan: any, idx: number) => (
                <div key={plan.id} className="p-10 bg-stone-50 rounded-[3rem] border border-stone-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8">
                    <CreditCard size={40} className="text-stone-200" />
                  </div>
                  <h4 className="text-2xl font-black text-stone-900 mb-6 tracking-tight">{plan.name}</h4>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-1">Preço (R$)</label>
                      <input 
                        type="number"
                        value={plan.price}
                        onChange={(e) => {
                          const newPlans = [...fullState.plans];
                          newPlans[idx].price = parseFloat(e.target.value);
                          setFullState({ ...fullState, plans: newPlans });
                        }}
                        className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                      />
                    </div>
                    <button 
                      onClick={async () => {
                        const res = await fetch('/api/admin/plans', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(fullState.plans)
                        });
                        if (res.ok) alert('Planos atualizados!');
                      }}
                      className="w-full py-4 bg-stone-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all"
                    >
                      Salvar Alterações do Plano
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl space-y-12">
            <div className="space-y-8">
              <div>
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-4 ml-1">Logomarca (Texto ou URL)</label>
                <div className="flex gap-4">
                  <input 
                    value={newLogo}
                    onChange={(e) => setNewLogo(e.target.value)}
                    className="flex-1 bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium" 
                    placeholder="Ex: B ou URL da imagem" 
                  />
                  <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">
                    {newLogo.length > 2 ? <img src={newLogo} className="w-full h-full object-cover rounded-2xl" alt="" /> : newLogo}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-4 ml-1">Nome do Site</label>
                <input 
                  value={newSiteName}
                  onChange={(e) => setNewSiteName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium" 
                  placeholder="Brasil no Mundo" 
                />
              </div>
              <button 
                onClick={handleSaveSettings}
                className="px-12 py-5 bg-stone-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-2xl shadow-stone-200"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const PricingModal = ({ onClose, plans, onUpgrade }: any) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white w-full max-w-4xl rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden"
      >
        <div className="flex justify-between items-center mb-12">
          <div>
            <h3 className="text-4xl font-black text-stone-900 tracking-tighter">PLANOS & ASSINATURAS</h3>
            <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mt-1">Escolha o melhor para você</p>
          </div>
          <button onClick={onClose} className="text-stone-300 hover:text-stone-900 transition-colors"><X size={32} /></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {plans?.map((plan: any) => (
            <div key={plan.id} className={cn(
              "p-10 rounded-[3rem] border transition-all relative group",
              plan.id === 'pro' ? "bg-stone-900 text-white border-stone-800 shadow-2xl shadow-stone-200" : "bg-stone-50 border-stone-100 text-stone-900"
            )}>
              {plan.id === 'pro' && (
                <div className="absolute top-6 right-6 bg-emerald-500 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Recomendado</div>
              )}
              <h4 className="text-2xl font-black mb-2 tracking-tight">{plan.name}</h4>
              <p className={cn("text-5xl font-black mb-8 tracking-tighter", plan.id === 'pro' ? "text-emerald-400" : "text-emerald-600")}>
                R$ {plan.price.toFixed(2)}<span className="text-sm opacity-50 font-bold">/mês</span>
              </p>
              <ul className="space-y-4 mb-12">
                {plan.features.map((f: string, i: number) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-medium">
                    <CheckCircle2 size={16} className={plan.id === 'pro' ? "text-emerald-400" : "text-emerald-500"} /> {f}
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => onUpgrade(plan.id)}
                className={cn(
                  "w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all",
                  plan.id === 'pro' ? "bg-emerald-500 text-white hover:bg-emerald-400" : "bg-white border border-stone-200 text-stone-900 hover:bg-stone-900 hover:text-white"
                )}
              >
                {plan.id === 'pro' ? 'Assinar Agora' : 'Plano Atual'}
              </button>
            </div>
          ))}
        </div>
        
        <div className="mt-12 flex items-center justify-center gap-4 text-stone-400">
          <DollarSign size={20} />
          <p className="text-xs font-bold uppercase tracking-widest">Pagamento seguro via PayPal em qualquer moeda</p>
        </div>
      </motion.div>
    </div>
  );
};

const Blog = ({ posts, user, onPostCreate }: any) => {
  return (
    <section id="blog" className="py-32 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-16">
          <div>
            <div className="flex items-center gap-3 text-emerald-600 mb-4">
              <BookOpen size={20} />
              <span className="text-xs font-black uppercase tracking-[0.3em]">Comunidade & Histórias</span>
            </div>
            <h2 className="text-5xl font-black text-stone-900 tracking-tighter">BLOG BRASIL NO MUNDO</h2>
          </div>
          {user && (
            <button 
              onClick={onPostCreate}
              className="flex items-center gap-3 bg-stone-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-stone-200"
            >
              <FileText size={18} /> Escrever Post
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts?.map((post: any) => (
            <motion.div 
              key={post.id}
              whileHover={{ y: -10 }}
              className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm hover:shadow-2xl transition-all group"
            >
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4">{new Date(post.date).toLocaleDateString()}</p>
              <h3 className="text-2xl font-black text-stone-900 mb-4 tracking-tight group-hover:text-emerald-600 transition-colors">{post.title}</h3>
              <p className="text-stone-500 text-sm leading-relaxed mb-8 line-clamp-3">{post.content}</p>
              <div className="flex items-center justify-between pt-6 border-t border-stone-50">
                <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Por {post.author}</span>
                <button className="text-emerald-600 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">Ler Mais <Plus size={14} /></button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showAuth, setShowAuth] = useState<'login' | 'register' | null>(null);
  const [showBusinessReg, setShowBusinessReg] = useState(false);
  const [showPostCreate, setShowPostCreate] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [newBusiness, setNewBusiness] = useState({ name: '', type: '', location: '', description: '' });
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [authData, setAuthData] = useState({ email: '', password: '', name: '' });
  const [authError, setAuthError] = useState('');
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    const s = io();
    setSocket(s);
    
    // Check if logged in
    fetch('/api/auth/me').then(res => {
      if (res.ok) return res.json();
      throw new Error();
    }).then(setUser).catch(() => setUser(null));

    // Fetch state
    fetch('/api/state').then(res => res.json()).then(data => {
      setSettings(data.settings);
      setPlans(data.plans);
      setBusinesses(data.businesses.filter((b: any) => b.status === 'approved'));
      setPosts(data.posts || []);
    });

    if (s) {
      s.on('business:approved', (b: Business) => {
        setBusinesses(prev => [...prev, b]);
      });
      s.on('post:approved', (p: Post) => {
        setPosts(prev => [...prev, p]);
      });
      s.on('settings:updated', (newSettings: any) => {
        setSettings(newSettings);
      });
      s.on('plans:updated', (newPlans: any[]) => {
        setPlans(newPlans);
      });
    }

    return () => { 
      s.off('business:approved');
      s.off('post:approved');
      s.off('settings:updated');
      s.off('plans:updated');
      s.disconnect(); 
    };
  }, []);

  const handleAiAsk = async () => {
    if (!aiQuestion.trim()) return;
    setIsAiLoading(true);
    setAiAnswer('');
    try {
      const answer = await askAIGuide(aiQuestion, "Usuário buscando suporte na plataforma Brasil no Mundo");
      setAiAnswer(answer || '');
    } catch (err) {
      setAiAnswer('Desculpe, tive um problema ao processar sua pergunta. Tente novamente.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleLogin = async () => {
    setAuthError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authData.email, password: authData.password })
      });
      if (!res.ok) throw new Error('Credenciais inválidas');
      const data = await res.json();
      setUser(data);
      setShowAuth(null);
      setAuthData({ email: '', password: '', name: '' });
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const handleRegister = async () => {
    setAuthError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authData)
      });
      if (!res.ok) throw new Error('Erro ao cadastrar');
      const data = await res.json();
      setUser(data);
      setShowAuth(null);
      setAuthData({ email: '', password: '', name: '' });
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  };

  const handleRegisterBusiness = async () => {
    if (!newBusiness.name || !user) return;
    
    if (user.plan !== 'pro' && user.role !== 'admin') {
      setShowPricing(true);
      return;
    }

    await fetch('/api/businesses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBusiness)
    });
    setShowBusinessReg(false);
    setNewBusiness({ name: '', type: '', location: '', description: '' });
    alert('Negócio enviado para aprovação!');
  };

  const handleUpgrade = async (planId: string) => {
    if (planId === 'free') return;
    
    // In a real app, this would trigger PayPal checkout
    const res = await fetch('/api/payments/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId })
    });
    
    if (res.ok) {
      const { orderId } = await res.json();
      // Mocking successful capture
      const captureRes = await fetch('/api/payments/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, planId })
      });
      
      if (captureRes.ok) {
        const { plan } = await captureRes.json();
        setUser(prev => prev ? { ...prev, plan } : null);
        setShowPricing(false);
        alert('Assinatura Pro ativada com sucesso!');
      }
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.title || !newPost.content) return;
    await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPost)
    });
    setShowPostCreate(false);
    setNewPost({ title: '', content: '' });
    alert('Post enviado para aprovação do admin!');
  };

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <Navbar 
        user={user} 
        settings={settings}
        onLogin={() => setShowAuth('login')} 
        onRegister={() => setShowAuth('register')}
        onAdmin={() => setShowAdmin(true)}
        onLogout={handleLogout}
      />
      
      <main>
        {/* Hero Section */}
        <section className="relative pt-40 pb-24 overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-yellow-500/10 rounded-full blur-[150px] animate-pulse [animation-delay:2s]" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-100 mb-8">
                  <Globe size={14} /> Global Brazilian Network
                </div>
                <h1 className="text-6xl md:text-8xl font-black text-stone-900 mb-8 tracking-tighter leading-[0.9]">
                  {settings?.siteName?.split(' ')[0] || 'O BRASIL'} <br />
                  <span className="text-emerald-600 italic font-serif font-light">{settings?.siteName?.split(' ').slice(1).join(' ') || 'sem fronteiras.'}</span>
                </h1>
                <p className="text-xl text-stone-500 mb-12 leading-relaxed max-w-lg font-medium">
                  A maior plataforma de conexão para brasileiros no exterior. Negócios, encontros e suporte real em qualquer lugar do mundo.
                </p>
                <div className="flex flex-wrap gap-6">
                  <a href="#negocios" className="px-10 py-5 bg-stone-900 text-white rounded-[2rem] font-bold text-sm uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-2xl shadow-stone-200 active:scale-95">
                    Explorar Negócios
                  </a>
                  <a href="#encontros" className="px-10 py-5 bg-white text-stone-900 border-2 border-stone-100 rounded-[2rem] font-bold text-sm uppercase tracking-widest hover:bg-stone-50 transition-all active:scale-95">
                    Ver Encontros
                  </a>
                </div>
                
                <div className="mt-16 flex items-center gap-6">
                  <div className="flex -space-x-4">
                    {[1,2,3,4].map(i => (
                      <img key={i} src={`https://picsum.photos/seed/${i+10}/100`} className="w-12 h-12 rounded-2xl border-4 border-white shadow-lg" alt="" />
                    ))}
                  </div>
                  <p className="text-sm font-bold text-stone-400">
                    <span className="text-stone-900">+5.000</span> brasileiros conectados
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative"
              >
                <div className="absolute -inset-4 bg-emerald-600/5 rounded-[3rem] blur-2xl -z-10" />
                <ChatRoom socket={socket} user={user} />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Meetups Section */}
        <MeetupsSection socket={socket} user={user} />

        {/* Directory Section */}
        <section id="negocios" className="py-32 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
              <div className="max-w-2xl">
                <h2 className="text-4xl md:text-6xl font-black text-stone-900 mb-6 tracking-tighter">DIRETÓRIO DE NEGÓCIOS</h2>
                <p className="text-stone-500 text-lg font-medium leading-relaxed">Apoie o empreendedorismo brasileiro. Encontre serviços e produtos com o tempero e a confiança de casa.</p>
              </div>
              <button 
                onClick={() => user ? setShowBusinessReg(true) : setShowAuth('login')}
                className="group flex items-center gap-4 bg-emerald-600 text-white pl-8 pr-4 py-4 rounded-[2rem] font-bold text-sm uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-100"
              >
                Cadastrar Negócio
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:rotate-90 transition-transform">
                  <Plus size={20} />
                </div>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {businesses.length > 0 ? businesses.map((b, i) => (
                <motion.div 
                  key={b.id || i}
                  whileHover={{ y: -10 }}
                  className="bg-stone-50 p-10 rounded-[3rem] border border-stone-100 hover:bg-white hover:shadow-2xl hover:shadow-stone-200 transition-all group"
                >
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-stone-900 shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <Building2 size={32} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl">{b.type}</span>
                  </div>
                  <h3 className="text-2xl font-black text-stone-900 mb-2 tracking-tight">{b.name}</h3>
                  <p className="text-stone-400 text-xs font-bold mb-6 flex items-center gap-2"><MapPin size={14} className="text-emerald-500" /> {b.location}</p>
                  <p className="text-stone-500 text-sm leading-relaxed mb-8 font-medium">{b.description}</p>
                  <button className="w-full py-4 bg-white border border-stone-200 text-stone-900 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-stone-900 hover:text-white transition-all">Ver Perfil</button>
                </motion.div>
              )) : (
                <div className="col-span-full p-20 text-center bg-stone-50 rounded-[3rem] border-2 border-dashed border-stone-200">
                  <p className="text-stone-400 font-bold uppercase tracking-widest text-sm">Nenhum negócio aprovado ainda.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* AI Guide */}
        <section id="guia" className="py-32 bg-stone-900 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-600/10 blur-[150px] -z-0" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-10 border border-emerald-500/20">
                  <Globe size={16} /> Inteligência Artificial
                </div>
                <h2 className="text-5xl md:text-7xl font-black mb-8 leading-[0.9] tracking-tighter">
                  SEU GUIA <br />
                  <span className="text-emerald-400">BRASILEIRO.</span>
                </h2>
                <p className="text-stone-400 text-xl mb-12 leading-relaxed font-medium">
                  Dúvidas sobre vistos, como abrir conta no exterior, ou onde encontrar o melhor açaí? Pergunte ao nosso guia inteligente.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group">
                    <p className="text-[10px] font-black text-emerald-400 uppercase mb-3 tracking-widest">Documentação</p>
                    <p className="text-sm text-stone-300 font-medium group-hover:text-white transition-colors">"Como validar meu diploma na Europa?"</p>
                  </div>
                  <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group">
                    <p className="text-[10px] font-black text-emerald-400 uppercase mb-3 tracking-widest">Cultura</p>
                    <p className="text-sm text-stone-300 font-medium group-hover:text-white transition-colors">"Dicas para recém-chegados em Portugal."</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/10 shadow-2xl">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center font-black text-2xl shadow-xl shadow-emerald-500/20">G</div>
                  <div>
                    <h4 className="font-black text-lg tracking-tight">Guia Brasil no Mundo</h4>
                    <p className="text-[10px] text-emerald-400 uppercase tracking-[0.2em] font-black">AI Assistant • Online</p>
                  </div>
                </div>
                <div className="min-h-[180px] mb-10 text-stone-300 text-lg font-medium leading-relaxed italic">
                  {isAiLoading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  ) : aiAnswer || "Olá! Sou sua IA de suporte. Como posso ajudar sua jornada no exterior hoje?"}
                </div>
                <div className="relative">
                  <input 
                    type="text" 
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAiAsk()}
                    placeholder="Digite sua pergunta..." 
                    className="w-full bg-white/10 border border-white/10 rounded-2xl py-5 pl-8 pr-20 outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all text-white placeholder:text-stone-500 font-medium"
                  />
                  <button 
                    onClick={handleAiAsk}
                    disabled={isAiLoading || !aiQuestion.trim()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-emerald-500 text-white p-4 rounded-xl hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50"
                  >
                    <Search size={24} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-stone-50 py-20 border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg overflow-hidden">
                {settings?.logo?.length > 2 ? (
                  <img src={settings.logo} className="w-full h-full object-cover" alt="" />
                ) : (
                  settings?.logo || 'B'
                )}
              </div>
              <span className="text-xl font-black tracking-tighter text-stone-900">{settings?.siteName || 'BRASILNOMUNDO'}</span>
            </div>
            <div className="flex gap-12 text-xs font-black uppercase tracking-widest text-stone-400">
              <a href="#" className="hover:text-emerald-600 transition-colors">Sobre</a>
              <a href="#" className="hover:text-emerald-600 transition-colors">Privacidade</a>
              <a href="#" className="hover:text-emerald-600 transition-colors">Termos</a>
            </div>
            <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest">
              © 2024 Brasil no Mundo. Fortalecendo raízes.
            </p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AnimatePresence>
        {showAuth && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-emerald-600" />
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-3xl font-black text-stone-900 tracking-tight">{showAuth === 'login' ? 'BEM-VINDO' : 'CRIAR CONTA'}</h3>
                  <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mt-1">Acesse a comunidade global</p>
                </div>
                <button onClick={() => setShowAuth(null)} className="text-stone-300 hover:text-stone-900 transition-colors"><X size={32} /></button>
              </div>
              
              {authError && <p className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold mb-6 border border-red-100">{authError}</p>}

              <div className="space-y-6">
                {showAuth === 'register' && (
                  <div>
                    <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-1">Nome Completo</label>
                    <input 
                      value={authData.name}
                      onChange={(e) => setAuthData({...authData, name: e.target.value})}
                      className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium" 
                      placeholder="Seu nome" 
                    />
                  </div>
                )}
                <div>
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-1">E-mail</label>
                  <input 
                    value={authData.email}
                    onChange={(e) => setAuthData({...authData, email: e.target.value})}
                    className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium" 
                    placeholder="seu@email.com" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-1">Senha</label>
                  <input 
                    type="password" 
                    value={authData.password}
                    onChange={(e) => setAuthData({...authData, password: e.target.value})}
                    className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium" 
                    placeholder="••••••••" 
                  />
                </div>
                
                <button 
                  onClick={showAuth === 'login' ? handleLogin : handleRegister}
                  className="w-full bg-stone-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] mt-6 hover:bg-emerald-600 transition-all shadow-2xl shadow-stone-200 flex items-center justify-center gap-3"
                >
                  {showAuth === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}
                  {showAuth === 'login' ? 'Entrar Agora' : 'Finalizar Cadastro'}
                </button>

                {showAuth === 'login' && (
                  <div className="mt-8 p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                    <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-2">Acesso Super Admin:</p>
                    <p className="text-xs text-emerald-900 font-medium">Email: <span className="font-bold">admin@brasilnomundo.com</span></p>
                    <p className="text-xs text-emerald-900 font-medium">Senha: <span className="font-bold">admin123</span></p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {showAdmin && <AdminDashboard settings={settings} onSettingsUpdate={setSettings} onClose={() => setShowAdmin(false)} />}
        {showPricing && <PricingModal plans={plans} onUpgrade={handleUpgrade} onClose={() => setShowPricing(false)} />}
        {showPostCreate && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-emerald-600" />
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-3xl font-black text-stone-900 tracking-tight">ESCREVER POST</h3>
                  <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mt-1">Compartilhe sua experiência</p>
                </div>
                <button onClick={() => setShowPostCreate(false)} className="text-stone-300 hover:text-stone-900 transition-colors"><X size={32} /></button>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-1">Título</label>
                  <input 
                    value={newPost.title}
                    onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                    className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium" 
                    placeholder="Ex: Como abrir conta no exterior" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-1">Conteúdo</label>
                  <textarea 
                    value={newPost.content}
                    onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                    rows={6}
                    className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium resize-none" 
                    placeholder="Escreva aqui..." 
                  />
                </div>
                <button 
                  onClick={handleCreatePost}
                  className="w-full bg-stone-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] mt-6 hover:bg-emerald-600 transition-all shadow-2xl shadow-stone-200"
                >
                  Enviar para Aprovação
                </button>
              </div>
            </motion.div>
          </div>
        )}
        {showBusinessReg && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-emerald-600" />
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-3xl font-black text-stone-900 tracking-tight">CADASTRAR NEGÓCIO</h3>
                  <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mt-1">Divulgue para a comunidade</p>
                </div>
                <button onClick={() => setShowBusinessReg(false)} className="text-stone-300 hover:text-stone-900 transition-colors"><X size={32} /></button>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-1">Nome do Negócio</label>
                  <input 
                    value={newBusiness.name}
                    onChange={(e) => setNewBusiness({...newBusiness, name: e.target.value})}
                    className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium" 
                    placeholder="Ex: Padaria Brasil" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-1">Tipo</label>
                  <select 
                    value={newBusiness.type}
                    onChange={(e) => setNewBusiness({...newBusiness, type: e.target.value})}
                    className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium appearance-none"
                  >
                    <option value="">Selecione...</option>
                    <option value="Restaurante">Restaurante</option>
                    <option value="Mercado">Mercado</option>
                    <option value="Serviços">Serviços</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-1">Localização</label>
                  <input 
                    value={newBusiness.location}
                    onChange={(e) => setNewBusiness({...newBusiness, location: e.target.value})}
                    className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium" 
                    placeholder="Ex: Londres, UK" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-1">Descrição</label>
                  <textarea 
                    value={newBusiness.description}
                    onChange={(e) => setNewBusiness({...newBusiness, description: e.target.value})}
                    className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium resize-none" 
                    rows={3}
                    placeholder="Conte um pouco sobre seu negócio..."
                  />
                </div>
                <button 
                  onClick={handleRegisterBusiness}
                  className="w-full bg-stone-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] mt-6 hover:bg-emerald-600 transition-all shadow-2xl shadow-stone-200"
                >
                  Enviar para Aprovação
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
