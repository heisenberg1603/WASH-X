/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  MapPin, 
  ClipboardList, 
  UserPlus, 
  Settings as SettingsIcon, 
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Menu,
  ChevronRight,
  Download,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
interface Employee {
  id: string;
  name: string;
  role: string;
  phone: string;
  createdAt: string;
}

interface AttendanceEntry {
  id: string;
  employeeId: string;
  date: string;
  timestamp: string;
  location: { lat: number; lng: number };
  distance: number;
}

interface Settings {
  location: { lat: number; lng: number };
  radiusMeters: number;
  businessName: string;
}

interface AppData {
  employees: Employee[];
  attendance: AttendanceEntry[];
  settings: Settings;
}

// --- Components ---

export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [data, setData] = useState<AppData | null>(null);
  const [view, setView] = useState<'employee' | 'manager'>('employee');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/data');
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [fetchData]);

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center font-mono transition-colors ${isDark ? 'bg-black text-yellow-500' : 'bg-white text-yellow-600'}`}>
      <motion.div 
        animate={{ opacity: [0.5, 1, 0.5] }} 
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        BOOTING_CORE_SYSTEM...
      </motion.div>
    </div>
  );

  return (
    <div className={`min-h-screen font-sans selection:bg-yellow-500/30 p-6 transition-colors duration-500 ${isDark ? 'bg-black text-white' : 'light-theme bg-zinc-50 text-black'}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <header className="flex justify-between items-center mb-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
              <span className="text-black font-black text-2xl group-hover:scale-110 transition-transform">X</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight uppercase leading-none">{data?.settings.businessName || 'MR. WASH X'}</h1>
              <p className={`text-[10px] font-bold tracking-widest uppercase mt-1 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Attendance Management System</p>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <div className={`hidden md:flex p-1.5 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
              <button 
                onClick={() => setView('employee')}
                className={`px-6 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${view === 'employee' ? 'bg-yellow-500 text-black shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Employee View
              </button>
              <button 
                onClick={() => setView('manager')}
                className={`px-6 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${view === 'manager' ? 'bg-yellow-500 text-black shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Manager Access
              </button>
            </div>

            <div className="flex items-center gap-6">
              <button 
                onClick={() => setIsDark(!isDark)}
                className={`p-2 rounded-xl border transition-all ${isDark ? 'bg-zinc-900 border-zinc-800 text-yellow-500 hover:border-yellow-500/50' : 'bg-white border-zinc-200 text-yellow-600 hover:border-yellow-600/50 shadow-sm'}`}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <div className="text-right hidden sm:block">
                <div className={`text-xl font-mono leading-none font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className={`text-[10px] uppercase font-black tracking-widest mt-1 ${isDark ? 'text-yellow-500' : 'text-yellow-600'}`}>
                  {currentTime.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="min-h-[640px]">
          <AnimatePresence mode="wait">
            {view === 'employee' ? (
              <motion.div
                key="employee-view"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
              >
                <EmployeeView data={data!} onRefresh={fetchData} isDark={isDark} />
              </motion.div>
            ) : (
              <motion.div
                key="manager-view"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
              >
                <ManagerView data={data!} onRefresh={fetchData} isDark={isDark} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className="pt-8 flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-widest border-t border-slate-900">
          <div className="flex gap-6">
            <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> SYSTEM_ONLINE</span>
            <span>GPS_ACCURACY: HIGH</span>
            <span className="hidden sm:inline">REGION: ASIA-SOUTH-1</span>
          </div>
          <div className="flex gap-6">
            <button className="hover:text-cyan-400 transition-colors cursor-pointer">Support</button>
            <button className="hover:text-cyan-400 transition-colors cursor-pointer">Security Protocol</button>
          </div>
        </footer>
      </div>
      
      {error && (
        <div className="fixed bottom-6 right-6 bg-red-950 text-red-400 px-6 py-3 rounded-2xl text-xs font-bold border border-red-900 shadow-2xl backdrop-blur-xl z-[100] uppercase tracking-widest font-mono">
          [!] CRITICAL_ERROR: {error}
        </div>
      )}
    </div>
  );
}

// --- Views ---

function EmployeeView({ data, onRefresh, isDark }: { data: AppData; onRefresh: () => void; isDark: boolean }) {
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleCheckIn = async () => {
    if (!selectedEmployee) return;
    setCheckingIn(true);
    setStatus(null);

    if (!navigator.geolocation) {
      setStatus({ type: 'error', message: 'ERROR: GEOLOCATION_UNSUPPORTED' });
      setCheckingIn(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const res = await fetch('/api/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employeeId: selectedEmployee,
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.error);
        setStatus({ type: 'success', message: 'ATTENDANCE_LOCKED_SUCCESSFULLY' });
        onRefresh();
      } catch (err: any) {
        setStatus({ type: 'error', message: err.message.toUpperCase() });
      } finally {
        setCheckingIn(false);
      }
    }, (err) => {
      setStatus({ type: 'error', message: 'ERROR: PERMISSION_DENIED' });
      setCheckingIn(false);
    });
  };

  const today = new Date().toISOString().split('T')[0];
  const isMarked = (id: string) => data.attendance.some(a => a.employeeId === id && a.date === today);

  return (
    <div className="grid grid-cols-12 gap-6 h-full">
      {/* Main Check-In Card */}
      <div className={`col-span-12 lg:col-span-8 rounded-[2.5rem] border p-8 flex flex-col justify-between relative overflow-hidden group transition-colors ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-xl'}`}>
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <MapPin className="w-64 h-64 -mr-16 -mt-16 rotate-12" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <span className={`backdrop-blur px-3 py-1 rounded-full text-[10px] font-black border flex items-center gap-2 ${isDark ? 'bg-black/80 border-zinc-700' : 'bg-zinc-100 border-zinc-200 text-black'}`}>
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> TERMINAL_ACTIVE
            </span>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Select ID below</span>
          </div>

          <h2 className="text-4xl font-black mb-10 leading-tight">CHOOSE YOUR <br /><span className={isDark ? 'text-yellow-500' : 'text-yellow-600'}>IDENTIFICATION.</span></h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-w-4xl">
            {data.employees.map(emp => (
              <button
                key={emp.id}
                onClick={() => setSelectedEmployee(emp.id)}
                disabled={isMarked(emp.id)}
                className={`group relative h-24 rounded-3xl p-4 flex flex-col justify-between transition-all border ${
                  isMarked(emp.id)
                    ? isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-700 opacity-50' : 'bg-zinc-50 border-zinc-200 text-zinc-400 opacity-50'
                    : selectedEmployee === emp.id
                      ? 'bg-yellow-500 border-yellow-400 text-black shadow-2xl shadow-yellow-500/20'
                      : isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-500' : 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:border-yellow-500/50'
                }`}
              >
                <div className="flex justify-between items-start w-full">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${selectedEmployee === emp.id ? 'bg-black text-yellow-500' : isDark ? 'bg-black border border-zinc-700' : 'bg-white border border-zinc-200'}`}>
                    {emp.name[0]}
                  </div>
                  {isMarked(emp.id) && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-tighter truncate">{emp.name}</p>
                  <p className={`text-[8px] font-bold uppercase tracking-widest opacity-60`}>{emp.role}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <AnimatePresence>
            {selectedEmployee && !isMarked(selectedEmployee) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="w-full max-w-sm"
              >
                <button
                  onClick={handleCheckIn}
                  disabled={checkingIn}
                  className={`w-full h-16 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-2xl ${isDark ? 'bg-white text-black hover:bg-yellow-500 shadow-white/5' : 'bg-black text-white hover:bg-yellow-600 shadow-black/10'}`}
                >
                  {checkingIn ? (
                    <div className={`w-6 h-6 border-4 border-t-transparent rounded-full animate-spin ${isDark ? 'border-zinc-900' : 'border-white'}`} />
                  ) : (
                    <>
                      <Clock className="w-5 h-5" />
                      AUTHORIZE_CHECK_IN
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Side Grid Items */}
      <div className="col-span-12 lg:col-span-4 grid grid-cols-1 gap-6">
        {/* Status Card */}
        <div className={`rounded-[2.5rem] p-8 flex flex-col justify-between h-[240px] transition-colors ${isDark ? 'bg-yellow-500 text-black' : 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20'}`}>
          <div>
            <div className="text-[10px] font-black tracking-[0.2em] mb-2 uppercase opacity-60">Current Phase</div>
            <div className="text-4xl font-black leading-none uppercase">Morning <br />Shift</div>
          </div>
          <div className="flex justify-between items-end">
            <div className="text-xs font-bold uppercase tracking-wider">{data.attendance.filter(a => a.date === today).length}/{data.employees.length} Site Units</div>
            <div className="w-12 h-12 rounded-2xl border-2 border-black/20 flex items-center justify-center">
              <ChevronRight className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* History Card */}
        <div className={`rounded-[2.5rem] border p-8 flex flex-col h-[340px] transition-colors ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
           <h3 className="text-sm font-black uppercase tracking-[0.15em] text-zinc-500 mb-6 flex items-center gap-3">
             <Clock className="w-4 h-4" /> LOG_ARCHIVE
           </h3>
           <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
             {data.attendance.slice(-4).reverse().map(entry => {
               const emp = data.employees.find(e => e.id === entry.employeeId);
               return (
                 <div key={entry.id} className={`flex items-center justify-between p-4 rounded-3xl border transition-colors ${isDark ? 'bg-zinc-800/50 border-zinc-700/50' : 'bg-zinc-50 border-zinc-100'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full border flex items-center justify-center text-xs font-black uppercase ${isDark ? 'bg-zinc-800 border-zinc-700 text-yellow-500' : 'bg-white border-zinc-200 text-yellow-600'}`}>
                        {emp?.name[0]}
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase truncate max-w-[100px]">{emp?.name || '??'}</p>
                        <p className="text-[8px] font-mono text-zinc-500 uppercase">{new Date(entry.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    <div className={`text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-tighter ${isDark ? 'bg-yellow-500/10 text-yellow-500' : 'bg-yellow-100 text-yellow-700'}`}>
                      CONFIRMED
                    </div>
                 </div>
               );
             })}
             {data.attendance.length === 0 && (
               <div className="h-full flex items-center justify-center text-[10px] text-slate-700 font-mono italic tracking-widest">
                 NO_DATA_POINTS_FOUND
               </div>
             )}
           </div>
        </div>
      </div>

      {/* Fixed Status Message Overlay */}
      <AnimatePresence>
        {status && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[80] p-5 rounded-[2rem] shadow-2xl flex items-center gap-4 border-2 ${
              status.type === 'success' 
              ? 'bg-slate-900 border-green-500/50 text-green-400' 
              : 'bg-slate-900 border-red-500/50 text-red-400'
            }`}
          >
            {status.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
            <span className="text-xs font-black uppercase tracking-[0.1em]">{status.message}</span>
            <button onClick={() => setStatus(null)} className="ml-4 hover:text-white transition-colors">
              <XCircle className="w-4 h-4 opacity-50" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ManagerView({ data, onRefresh, isDark }: { data: AppData; onRefresh: () => void; isDark: boolean }) {
  const [activeTab, setActiveTab] = useState<'employees' | 'reports'>('employees');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ name: '', role: 'Washer', phone: '' });

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmployee)
      });
      if (res.ok) {
        onRefresh();
        setShowAddModal(false);
        setNewEmployee({ name: '', role: 'Washer', phone: '' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getAttendanceStats = () => {
    const stats: Record<string, number> = {};
    data.attendance.forEach(a => {
      const month = new Date(a.date).toLocaleString('default', { month: 'short' });
      stats[month] = (stats[month] || 0) + 1;
    });
    return stats;
  };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthData = getAttendanceStats();

  return (
    <div className="grid grid-cols-12 gap-6 h-full">
      {/* 1. Quick Stats Card (Bento Row 1) */}
      <div className={`col-span-12 md:col-span-4 rounded-[2.5rem] p-8 flex flex-col justify-between transition-colors ${isDark ? 'bg-yellow-500 text-black' : 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20'}`}>
        <div>
          <div className="text-[10px] font-black tracking-widest mb-1 uppercase opacity-60">Total Check-Ins</div>
          <div className="text-6xl font-black">{data.attendance.length}</div>
        </div>
        <div className="flex justify-between items-end">
          <div className="text-xs font-bold uppercase tracking-wider">{data.employees.length} Active Staff</div>
          <div className="w-12 h-12 rounded-2xl border-2 border-black/10 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2. Monthly Trend Preview (Bento Row 1) */}
      <div className={`col-span-12 md:col-span-8 rounded-[2.5rem] border p-8 transition-colors ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
        <div className="flex justify-between items-start mb-10">
          <h3 className={`font-black text-sm uppercase tracking-[0.15em] ${isDark ? 'text-yellow-500' : 'text-yellow-600'}`}>Attendance_Flow</h3>
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Past 6 Months</span>
        </div>
        <div className="flex items-end gap-3 h-32 mb-6">
          {months.slice(-6).map((month, i) => {
             const val = monthData[month] || 2; // placeholder if 0
             const height = (val / Math.max(...Object.values(monthData), 10)) * 100;
             return (
               <div key={month} className="flex-1 flex flex-col items-center gap-3">
                 <div 
                   className={`w-full rounded-xl transition-all duration-500 ${i === 5 ? (isDark ? 'bg-yellow-500' : 'bg-yellow-400') : (isDark ? 'bg-zinc-800' : 'bg-zinc-100')}`} 
                   style={{ height: `${Math.max(height, 10)}%` }} 
                 />
                 <span className="text-[8px] font-black uppercase text-zinc-600">{month}</span>
               </div>
             )
          })}
        </div>
      </div>

      {/* 3. Team Status Sidebar (Bento Row 2) */}
      <div className={`col-span-12 lg:col-span-4 rounded-[2.5rem] border p-8 flex flex-col h-full lg:min-h-[440px] transition-colors ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
        <div className="flex items-center justify-between mb-8">
           <h3 className="text-sm font-black uppercase tracking-[0.15em] text-zinc-500 flex items-center gap-3">
             <Users className="w-4 h-4" /> TEAM_UNITS
           </h3>
           <div className="flex items-center gap-1">
             <span className="w-2 h-2 bg-green-500 rounded-full"></span>
             <span className={`text-[10px] font-black text-green-500`}>{data.employees.length}</span>
           </div>
        </div>
        
        <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
          {data.employees.map(emp => (
            <div key={emp.id} className={`flex items-center justify-between p-4 rounded-3xl border group transition-colors ${isDark ? 'bg-zinc-800/50 border-zinc-700/50 hover:border-yellow-500/50' : 'bg-zinc-50 border-zinc-100 hover:border-yellow-500 shadow-sm hover:shadow-md'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center text-xs font-black transition-colors ${isDark ? 'bg-zinc-700 border-zinc-600 group-hover:bg-yellow-500 group-hover:text-black' : 'bg-white border-zinc-200 group-hover:bg-yellow-400 group-hover:text-black'}`}>
                  {emp.name[0]}
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase">{emp.name}</p>
                  <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">{emp.role}</p>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 transition-colors ${isDark ? 'text-zinc-700 group-hover:text-yellow-500' : 'text-zinc-300 group-hover:text-yellow-600'}`} />
            </div>
          ))}
          {data.employees.length === 0 && (
            <div className={`py-12 text-center text-[10px] font-mono uppercase tracking-widest border border-dashed rounded-3xl ${isDark ? 'text-zinc-700 border-zinc-800' : 'text-zinc-400 border-zinc-200'}`}>
              [ NO_PERSONNEL_LOGGED ]
            </div>
          )}
        </div>
      </div>

      {/* 4. Action / Details Panel (Bento Row 2) */}
      <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
        {/* Recruitment Card */}
        <div 
          onClick={() => setShowAddModal(true)}
          className={`rounded-[2.5rem] p-1.5 flex items-center justify-center group cursor-pointer active:scale-[0.98] transition-all h-[140px] ${isDark ? 'bg-white shadow-white/5' : 'bg-zinc-200 shadow-xl'}`}
        >
          <div className={`w-full h-full rounded-[2.2rem] border-4 flex flex-col items-center justify-center gap-2 transition-colors ${isDark ? 'border-zinc-950 text-black hover:bg-yellow-500' : 'border-zinc-300 text-zinc-900 hover:bg-yellow-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-2xl font-black ${isDark ? 'bg-zinc-950 text-white' : 'bg-zinc-900 text-white'}`}>+</div>
            <span className="font-black text-sm uppercase tracking-[0.2em]">REGISTER_NEW_STAFF</span>
          </div>
        </div>

        {/* System Settings / Map Card */}
        <div className={`flex-1 rounded-[2.5rem] border p-8 flex flex-col justify-between group overflow-hidden relative transition-colors ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-xl'}`}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(${isDark ? '#475569' : '#94a3b8'} 1px, transparent 1px)`, backgroundSize: '30px 30px' }}></div>
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-black text-sm uppercase tracking-[0.1em] text-zinc-500 mb-1">Operational_Radius</h3>
                <p className={`text-3xl font-black ${isDark ? 'text-white' : 'text-black'}`}>{data.settings.radiusMeters}m</p>
              </div>
              <SettingsIcon className={`w-6 h-6 transition-transform duration-700 group-hover:rotate-90 ${isDark ? 'text-zinc-600' : 'text-zinc-300'}`} />
            </div>
            
            <div className="mt-auto grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-3xl border ${isDark ? 'bg-black/50 border-zinc-800' : 'bg-zinc-50 border-zinc-100'}`}>
                <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">GPS_Lat</span>
                <span className={`text-xs font-mono font-bold ${isDark ? 'text-white' : 'text-black'}`}>{data.settings.location.lat.toFixed(4)}</span>
              </div>
              <div className={`p-4 rounded-3xl border ${isDark ? 'bg-black/50 border-zinc-800' : 'bg-zinc-50 border-zinc-100'}`}>
                <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">GPS_Long</span>
                <span className={`text-xs font-mono font-bold ${isDark ? 'text-white' : 'text-black'}`}>{data.settings.location.lng.toFixed(4)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 flex items-center justify-center z-[100] px-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className={`absolute inset-0 backdrop-blur-md ${isDark ? 'bg-black/90' : 'bg-zinc-200/80'}`} 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className={`relative w-full max-w-lg border-4 p-10 rounded-[3rem] shadow-2xl z-[110] transition-colors ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'}`}
            >
              <h3 className={`text-3xl font-black mb-8 flex items-center gap-4 ${isDark ? 'text-yellow-500' : 'text-yellow-600'}`}>
                 <UserPlus className="w-8 h-8" /> STAFF_ENROLL
              </h3>
              <form onSubmit={handleAddEmployee} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Full_Legal_Name</label>
                  <input 
                    required
                    value={newEmployee.name}
                    onChange={e => setNewEmployee({ ...newEmployee, name: e.target.value })}
                    placeholder="ENTER_NAME..."
                    className={`w-full border-2 rounded-2xl px-6 py-4 text-sm font-bold focus:border-yellow-500 outline-none transition-colors uppercase ${isDark ? 'bg-black border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200 text-black'}`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Designation</label>
                    <select 
                      value={newEmployee.role}
                      onChange={e => setNewEmployee({ ...newEmployee, role: e.target.value })}
                      className={`w-full border-2 rounded-2xl px-6 py-4 text-sm font-bold focus:border-yellow-500 outline-none transition-colors appearance-none uppercase ${isDark ? 'bg-black border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200 text-black'}`}
                    >
                      <option>Washer</option>
                      <option>Supervisor</option>
                      <option>Manager</option>
                      <option>Detailer</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Comm_Link</label>
                    <input 
                      required
                      value={newEmployee.phone}
                      onChange={e => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                      placeholder="+CONTACT_ID"
                      className={`w-full border-2 rounded-2xl px-6 py-4 text-sm font-bold focus:border-yellow-500 outline-none transition-colors ${isDark ? 'bg-black border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200 text-black'}`}
                    />
                  </div>
                </div>
                <div className="pt-8 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className={`flex-1 px-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-colors ${isDark ? 'border-zinc-800 hover:bg-zinc-800 text-zinc-400' : 'border-zinc-200 hover:bg-zinc-100 text-zinc-500'}`}
                  >
                    Abort
                  </button>
                  <button 
                    type="submit"
                    className={`flex-1 px-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors shadow-xl ${isDark ? 'bg-yellow-500 text-black hover:bg-white shadow-yellow-500/20' : 'bg-yellow-500 text-black hover:bg-yellow-600 shadow-yellow-500/10'}`}
                  >
                    Commit_Entry
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

