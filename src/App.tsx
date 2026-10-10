import React, { useState, useEffect } from "react";
import { 
  Bell, 
  Settings as SettingsIcon, 
  ChevronRight, 
  Sparkles, 
  RefreshCw,
  TrendingUp, 
  DollarSign, 
  Percent, 
  ShoppingBag, 
  User as UserIcon,
  Search,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle,
  FileText,
  Bookmark,
  ArrowUpRight,
  MessageSquare,
  Bot,
  FolderOpen,
  UserPlus,
  ShieldAlert,
  Trash2,
  Lock,
  ShieldCheck,
  UserSquare2,
  CloudSun,
  Music,
  Download,
  Coins,
  Menu,
  X,
  Boxes,
  Database,
  ArrowRightLeft,
  VolumeX,
  Volume2
} from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell,
  Legend,
  ComposedChart,
  Line
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import Sidebar from "./components/Sidebar";
import StatsCard from "./components/StatsCard";
import DriveManager from "./components/DriveManager";
import MartinChat from "./components/MartinChat";
import HelpCenter from "./components/HelpCenter";
import LandingPage from "./components/LandingPage";
import DashboardTabs from "./components/DashboardTabs";
import VoiceDemoModule from "./components/VoiceDemoModule";
import { WhatsAppVoiceInventory } from "./components/WhatsAppVoiceInventory";
import { EmployeeOperarioView } from "./components/EmployeeOperarioView";
import { useBusinessReportData, downloadBusinessReportCsv } from "./lib/businessReport";
import MartinCallAlertsModule from "./components/MartinCallAlertsModule";
import PushNotificationManager from "./components/PushNotificationManager";
import { GmailManager } from "./components/GmailManager";
import DatabaseCleanManager from "./components/DatabaseCleanManager";
import { setupForegroundPushListener, getNotificationPermission } from "./lib/fcmService";
import { 
  initAuth, 
  googleSignIn, 
  logout, 
  isUserAuthorized, 
  getWhitelistedEmails, 
  addWhitelistedEmail, 
  removeWhitelistedEmail, 
  getWhitelistedUsers,
  addOrUpdateWhitelistedUser,
  removeWhitelistedUser,
  MASTER_ADMIN_EMAIL 
} from "./auth";
import { UserRole, AuthorizedUser } from "./types";
import { createBackupSnapshot, loadFromLocalMemory, STORAGE_KEYS } from "./lib/localMemory";

import { User } from "firebase/auth";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>(() => {
    const lastState = loadFromLocalMemory<any>(STORAGE_KEYS.LAST_SAFE_STATE, null);
    if (lastState && lastState.activeTab && lastState.activeTab !== "landing") {
      return lastState.activeTab;
    }
    return "inicio";
  });

  // Auto-save active tab snapshot to local memory
  useEffect(() => {
    createBackupSnapshot({ activeTab });
  }, [activeTab]);
  const [showAIChat, setShowAIChat] = useState<boolean>(true);
  const [showDemoAnyway, setShowDemoAnyway] = useState<boolean>(true);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  
  // Weather state (Buenos Aires interactive widget)
  const [weatherExpanded, setWeatherExpanded] = useState<boolean>(false);
  const [escudoTérmico, setEscudoTérmico] = useState<boolean>(false);
  const [weatherData, setWeatherData] = useState({
    temp: 11, // realistic winter temp in Buenos Aires (July)
    feelsLike: 9,
    condition: "Despejado y Frío",
    icon: "❄️",
    humidity: 78,
    windSpeed: 14,
    loading: true,
    error: false,
    extended: [
      { day: "Jue", temp: "13° / 7°", icon: "⛅", desc: "Nublado" },
      { day: "Vie", temp: "15° / 8°", icon: "☀️", desc: "Despejado" },
      { day: "Sáb", temp: "12° / 6°", icon: "🌧️", desc: "Lluvia" },
      { day: "Dom", temp: "11° / 5°", icon: "❄️", desc: "Frío" },
      { day: "Lun", temp: "14° / 8°", icon: "☀️", desc: "Despejado" }
    ],
    lastUpdated: new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
  });
  
  // Live financial rates state (Dólar, Euro, Merval with refresh function)
  const [rates, setRates] = useState({
    dollarBlueCompra: 1210,
    dollarBlueVenta: 1230,
    dollarBlueTrend: 0.8,
    dollarOficialCompra: 935,
    dollarOficialVenta: 975,
    dollarOficialTrend: 0.1,
    euroCompra: 1325,
    euroVenta: 1355,
    euroTrend: -0.2,
    merval: 1425800,
    mervalTrend: 1.45,
  });
  const [ratesRefreshing, setRatesRefreshing] = useState<boolean>(false);
  const [salesChartMode, setSalesChartMode] = useState<"bar" | "trend" | "both" | "compare">("both");

  // YouTube Ambient playlist selection state
  const [selectedPlaylist, setSelectedPlaylist] = useState<string>("lofi");
  const [youtubeVolume, setYoutubeVolume] = useState<number>(50);
  const [businessReport] = useBusinessReportData();
  
  // Google Authentication & Role states
  const [user, setUser] = useState<User | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [initialAuthChecking, setInitialAuthChecking] = useState<boolean>(true);

  // Firebase Cloud Messaging Foreground listener
  useEffect(() => {
    const unsubscribe = setupForegroundPushListener((payload) => {
      console.log("🔔 [FCM Push Event received]:", payload);
      if (payload.tab) {
        setActiveTab(payload.tab);
      }
    });
    return () => unsubscribe();
  }, []);

  // RBAC Roles States
  const [userRole, setUserRole] = useState<UserRole>("owner");
  const [userDisplayName, setUserDisplayName] = useState<string>("Noemí Carvallo");
  const [usersList, setUsersList] = useState<AuthorizedUser[]>([]);
  const [accessCodeUser, setAccessCodeUser] = useState<AuthorizedUser | null>(null);
  const [actingUser, setActingUser] = useState<AuthorizedUser | null>(null);

  // Access Whitelist states
  const [isAuthorized, setIsAuthorized] = useState<boolean>(true);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(false);
  const [whitelist, setWhitelist] = useState<string[]>([]);
  const [newEmailToWhitelist, setNewEmailToWhitelist] = useState<string>("");
  const [newUserName, setNewUserName] = useState<string>("");
  const [newUserRole, setNewUserRole] = useState<UserRole>("deposito");
  const [newUserCode, setNewUserCode] = useState<string>("");
  const [whitelistError, setWhitelistError] = useState<string | null>(null);
  const [whitelistSuccess, setWhitelistSuccess] = useState<string | null>(null);

  // Custom API Key states for Gemini credits allocation
  const [customApiKey, setCustomApiKey] = useState<string>(() => {
    return localStorage.getItem("user_gemini_api_key") || "";
  });
  const [apiKeySuccess, setApiKeySuccess] = useState<string | null>(null);

  // Security lock states for sensitive sections (Drive, Config, Usuarios)
  const [adminUnlocked, setAdminUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem("admin_session_unlocked") === "true";
  });
  const [adminPasscode, setAdminPasscode] = useState<string>("");
  const [adminPasscodeError, setAdminPasscodeError] = useState<string | null>(null);
  const [adminSecretKey, setAdminSecretKey] = useState<string>(() => {
    return localStorage.getItem("admin_secret_key") || "1972";
  });
  const [tempAdminSecretKey, setTempAdminSecretKey] = useState<string>(() => {
    return localStorage.getItem("admin_secret_key") || "1972";
  });

  // Single user role derived automatically from authentication / whitelist session
  const isOperarioUser = userRole === "operario" || userRole === "empleado";

  useEffect(() => {
    // Safety auto-dismiss timer so the splash screen never hangs
    const safetyTimer = setTimeout(() => {
      setInitialAuthChecking(false);
    }, 600);

    const unsubscribe = initAuth(
      (u, token) => {
        setUser(u);
        setGoogleToken(token);
        setInitialAuthChecking(false);
        clearTimeout(safetyTimer);
      },
      () => {
        setUser(null);
        setGoogleToken(null);
        setInitialAuthChecking(false);
        clearTimeout(safetyTimer);
      }
    );
    return () => {
      clearTimeout(safetyTimer);
      unsubscribe();
    };
  }, []);

  // Main access and roles verification hook
  useEffect(() => {
    const verifyAccess = async () => {
      setCheckingAuth(true);
      try {
        // Load the authorized users from DB (or fallback)
        const uList = await getWhitelistedUsers();
        setUsersList(uList);
        setWhitelist(uList.map(u => u.email));

        if (user) {
          const authEmail = user.email?.toLowerCase().trim();
          
          if (authEmail === MASTER_ADMIN_EMAIL.toLowerCase().trim()) {
            setUserRole("owner");
            setUserDisplayName("Noemí Carvallo");
            setIsAuthorized(true);
          } else {
            // Find in loaded whitelisted users list
            const foundUser = uList.find(u => u.email.toLowerCase().trim() === authEmail);
            if (foundUser) {
              setUserRole(foundUser.role);
              setUserDisplayName(foundUser.name);
              setIsAuthorized(true);
            } else {
              setIsAuthorized(false);
            }
          }
        } else if (accessCodeUser) {
          setUserRole(accessCodeUser.role);
          setUserDisplayName(accessCodeUser.name);
          setIsAuthorized(true);
        } else {
          // Logged out with no access code session: defaults to Owner for immediate demo preview
          setUserRole("owner");
          setUserDisplayName("Noemí Carvallo");
          setIsAuthorized(true);
        }
      } catch (e) {
        console.error("Error verifying access and roles:", e);
      } finally {
        setCheckingAuth(false);
      }
    };
    verifyAccess();
  }, [user, accessCodeUser]);

  // Automatically redirect to dashboard once user is signed in and authorized
  useEffect(() => {
    if ((user || accessCodeUser) && isAuthorized && activeTab === "landing") {
      setActiveTab("inicio");
    }
  }, [user, accessCodeUser, isAuthorized, activeTab]);

  const handleSignIn = async () => {
    try {
      const res = await googleSignIn();
      if (res && res.user) {
        setUser(res.user);
        setGoogleToken(res.accessToken);
      }
    } catch (err) {
      console.warn("Manejando intento de autenticación de Google:", err);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setUser(null);
      setGoogleToken(null);
      setAccessCodeUser(null);
      setUserRole("owner"); // default back to owner for mock preview
      setUserDisplayName("Noemí Carvallo");
      setIsAuthorized(true);
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };


  const handleAddEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setWhitelistError(null);
    setWhitelistSuccess(null);
    const email = newEmailToWhitelist.trim().toLowerCase();
    const name = newUserName.trim();
    const code = newUserCode.trim().toUpperCase();
    
    if (!email) {
      setWhitelistError("Por favor ingresá un correo electrónico.");
      return;
    }
    if (email === MASTER_ADMIN_EMAIL.toLowerCase().trim()) {
      setWhitelistError("El administrador principal (Noemí) ya tiene acceso total garantizado por defecto.");
      return;
    }
    
    // Simple email regex validation
    if (!/\S+@\S+\.\S+/.test(email)) {
      setWhitelistError("Por favor ingresá un formato de correo electrónico válido.");
      return;
    }

    try {
      const ok = await addOrUpdateWhitelistedUser({
        email,
        role: newUserRole,
        name: name || email.split("@")[0],
        customCode: code
      });
      if (ok) {
        setWhitelistSuccess(`Se ha guardado exitosamente el usuario: ${email}`);
        setNewEmailToWhitelist("");
        setNewUserName("");
        setNewUserCode("");
        setNewUserRole("deposito");
        
        const uList = await getWhitelistedUsers();
        setUsersList(uList);
        setWhitelist(uList.map(u => u.email));
      } else {
        setWhitelistError("Error al guardar el usuario en la base de datos.");
      }
    } catch (err) {
      setWhitelistError("Error de conexión con la base de datos.");
    }
  };

  const handleRemoveEmail = async (email: string) => {
    if (email.toLowerCase().trim() === MASTER_ADMIN_EMAIL.toLowerCase().trim()) return;
    if (!confirm(`¿Estás seguro que querés revocar el acceso para el usuario ${email}?`)) return;
    
    setWhitelistError(null);
    setWhitelistSuccess(null);
    
    try {
      const ok = await removeWhitelistedUser(email);
      if (ok) {
        setWhitelistSuccess(`Se ha revocado correctamente el acceso de: ${email}`);
        const uList = await getWhitelistedUsers();
        setUsersList(uList);
        setWhitelist(uList.map(u => u.email));
      } else {
        setWhitelistError("Error al remover el usuario.");
      }
    } catch (err) {
      setWhitelistError("Error de conexión.");
    }
  };

  // Fluctuate currency exchange rates randomly to simulate real-time live data feed
  const refreshFinancialRates = () => {
    setRatesRefreshing(true);
    setTimeout(() => {
      setRates((prev) => {
        const blueDiff = (Math.random() - 0.48) * 6; // slight upward bias
        const oficialDiff = (Math.random() - 0.5) * 1.5;
        const euroDiff = (Math.random() - 0.5) * 4;
        const mervalDiff = (Math.random() - 0.42) * 3500;
        
        return {
          dollarBlueCompra: Math.round(prev.dollarBlueCompra + blueDiff),
          dollarBlueVenta: Math.round(prev.dollarBlueVenta + blueDiff),
          dollarBlueTrend: Number((prev.dollarBlueTrend + (Math.random() - 0.48) * 0.15).toFixed(2)),
          dollarOficialCompra: Math.round(prev.dollarOficialCompra + oficialDiff),
          dollarOficialVenta: Math.round(prev.dollarOficialVenta + oficialDiff),
          dollarOficialTrend: Number((prev.dollarOficialTrend + (Math.random() - 0.5) * 0.03).toFixed(2)),
          euroCompra: Math.round(prev.euroCompra + euroDiff),
          euroVenta: Math.round(prev.euroVenta + euroDiff),
          euroTrend: Number((prev.euroTrend + (Math.random() - 0.5) * 0.08).toFixed(2)),
          merval: Math.round(prev.merval + mervalDiff),
          mervalTrend: Number((prev.mervalTrend + (Math.random() - 0.45) * 0.15).toFixed(2)),
        };
      });
      setRatesRefreshing(false);
    }, 600);
  };

  // Compile and export business report as a downloadable CSV for print or share
  const exportBusinessReport = () => {
    downloadBusinessReportCsv(businessReport);
  };

  // Note scratchpad state (Noemi's quick notes)
  const [notes, setNotes] = useState<string>("");

  // Time & Date info
  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");

  // Reminders states
  const [calendarReminders, setCalendarReminders] = useState<any[]>([]);
  const [showRemindersModal, setShowRemindersModal] = useState<boolean>(false);

  useEffect(() => {
    // Set ticking clock & date updating live from real-time system calendar
    const updateDateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = { 
        weekday: "long", 
        day: "numeric",
        month: "long", 
        year: "numeric"
      };
      setCurrentDate(now.toLocaleDateString("es-ES", options));
      setCurrentTime(now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }));
    };
    updateDateTime();
    const clockInterval = setInterval(updateDateTime, 1000);

    // Checker for Noemí's scheduled events Today & Tomorrow
    const checkReminders = () => {
      const stored = localStorage.getItem("noemi_calendar_events");
      if (!stored) return;
      const parsedEvents = JSON.parse(stored);
      
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);

      const getLocalDateStr = (d: Date) => {
        const y = d.getFullYear();
        const m = (d.getMonth() + 1).toString().padStart(2, "0");
        const dayStr = d.getDate().toString().padStart(2, "0");
        return `${y}-${m}-${dayStr}`;
      };

      const todayStr = getLocalDateStr(today);
      const tomorrowStr = getLocalDateStr(tomorrow);

      const activeToday = parsedEvents.filter((e: any) => e.date === todayStr).map((e: any) => ({ ...e, isToday: true }));
      const activeTomorrow = parsedEvents.filter((e: any) => e.date === tomorrowStr).map((e: any) => ({ ...e, isToday: false }));
      
      const combined = [...activeToday, ...activeTomorrow];
      if (combined.length > 0) {
        setCalendarReminders(combined);
        // Only trigger modal show if not already dismissed in this browser session
        if (sessionStorage.getItem("reminders_dismissed") !== "true") {
          setShowRemindersModal(true);
        }
      } else {
        setCalendarReminders([]);
      }
    };

    // Run check on load
    checkReminders();
    
    // Listen to custom updates from SidebarCalendar
    window.addEventListener("calendar-events-updated", checkReminders);

    return () => {
      clearInterval(clockInterval);
      window.removeEventListener("calendar-events-updated", checkReminders);
    };
  }, []);

  // Fetch live weather from Palermo/Recoleta (Buenos Aires)
  const fetchWeather = async () => {
    try {
      setWeatherData(prev => ({ ...prev, loading: true, error: false }));
      const response = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=-34.5889&longitude=-58.4092&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=America/Argentina/Buenos_Aires&forecast_days=5"
      );
      if (!response.ok) throw new Error("Weather API error");
      const data = await response.json();
      
      const current = data.current;
      const code = current.weather_code;
      
      // Map WMO weather codes to Spanish descriptions & emojis
      let condition = "Despejado";
      let icon = "☀️";
      if (code === 0) { condition = "Despejado"; icon = "☀️"; }
      else if (code >= 1 && code <= 3) { condition = "Parcialmente Nublado"; icon = "🌤️"; }
      else if (code === 45 || code === 48) { condition = "Niebla"; icon = "🌫️"; }
      else if (code >= 51 && code <= 57) { condition = "Llovizna Ligera"; icon = "🌧️"; }
      else if (code >= 61 && code <= 67) { condition = "Lluvia"; icon = "🌧️"; }
      else if (code >= 71 && code <= 77) { condition = "Frío Intenso"; icon = "❄️"; }
      else if (code >= 80 && code <= 82) { condition = "Chubascos"; icon = "🌦️"; }
      else if (code >= 95 && code <= 99) { condition = "Tormenta"; icon = "⛈️"; }

      // Map 5-day forecast
      const daysOfWeek = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
      const extendedForecast = data.daily.time.map((timeStr: string, idx: number) => {
        const dateObj = new Date(timeStr + "T00:00:00");
        const dayName = daysOfWeek[dateObj.getDay()];
        const dCode = data.daily.weather_code[idx];
        
        let dIcon = "☀️";
        let dDesc = "Despejado";
        if (dCode === 0) { dIcon = "☀️"; dDesc = "Despejado"; }
        else if (dCode >= 1 && dCode <= 3) { dIcon = "🌤️"; dDesc = "Nublado"; }
        else if (dCode === 45 || dCode === 48) { dIcon = "🌫️"; dDesc = "Niebla"; }
        else if (dCode >= 51 && dCode <= 67) { dIcon = "🌧️"; dDesc = "Lluvia"; }
        else if (dCode >= 71 && dCode <= 77) { dIcon = "❄️"; dDesc = "Frío"; }
        else if (dCode >= 80 && dCode <= 82) { dIcon = "🌦️"; dDesc = "Chubascos"; }
        else if (dCode >= 95 && dCode <= 99) { dIcon = "⛈️"; dDesc = "Tormenta"; }

        const maxTemp = Math.round(data.daily.temperature_2m_max[idx]);
        const minTemp = Math.round(data.daily.temperature_2m_min[idx]);

        return {
          day: dayName,
          temp: `${maxTemp}° / ${minTemp}°`,
          icon: dIcon,
          desc: dDesc
        };
      });

      const currentTemp = Math.round(current.temperature_2m);
      setWeatherData({
        temp: currentTemp,
        feelsLike: Math.round(current.apparent_temperature),
        condition,
        icon,
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m),
        loading: false,
        error: false,
        extended: extendedForecast,
        lastUpdated: new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
      });

      if (currentTemp > 26) {
        setEscudoTérmico(true);
      }
    } catch (err) {
      console.error("Failed to fetch weather:", err);
      setWeatherData(prev => ({ 
        ...prev, 
        loading: false, 
        error: true,
        lastUpdated: new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
      }));
    }
  };

  useEffect(() => {
    fetchWeather();
    // Refresh weather every 15 minutes
    const weatherInterval = setInterval(fetchWeather, 15 * 60 * 1000);
    return () => clearInterval(weatherInterval);
  }, []);

  // Format currency helpers
  const formatARS = (val: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0
    }).format(val);
  };

  // Recharts Chart Data
  const sales7DaysData = [
    { name: "Jue", ventas: 1150000, ventasAnoAnterior: 1020000 },
    { name: "Vie", ventas: 1210000, ventasAnoAnterior: 1080000 },
    { name: "Sáb", ventas: 1340000, ventasAnoAnterior: 1190000 },
    { name: "Dom", ventas: 1450000, ventasAnoAnterior: 1280000 },
    { name: "Lun", ventas: 1250000, ventasAnoAnterior: 1100000 },
    { name: "Mar", ventas: 1180000, ventasAnoAnterior: 1050000 },
    { name: "Mié", ventas: 1250000, ventasAnoAnterior: 1120000 }, // Today (Jun 30 / Jul 8 index)
  ];

  // Calculate 3-day moving average for trend/overlay
  const salesDataWithMA = sales7DaysData.map((item, index) => {
    let sum = 0;
    let count = 0;
    for (let i = Math.max(0, index - 2); i <= index; i++) {
      sum += sales7DaysData[i].ventas;
      count++;
    }
    return {
      ...item,
      mediaMovil: Math.round(sum / count)
    };
  });

  const categoryData = [
    { name: "Golosinas", value: 2750300, color: "#3b82f6" },
    { name: "Bebidas", value: 3320000, color: "#10b981" },
    { name: "Almacén", value: 2250200, color: "#8b5cf6" },
    { name: "Limpieza", value: 1238500, color: "#f59e0b" },
    { name: "Lácteos", value: 1750400, color: "#ec4899" },
    { name: "Otros", value: 550100, color: "#64748b" },
  ];

  if (checkingAuth) {
    return (
      <div className="h-screen w-screen bg-[#0a1128] flex flex-col items-center justify-center text-white font-sans gap-4">
        <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-sm font-semibold tracking-wide text-slate-300">Verificando permisos de acceso...</p>
      </div>
    );
  }

  if (user && !isAuthorized) {
    return (
      <div className="h-screen w-screen bg-[#0a1128] flex flex-col items-center justify-center font-sans px-4">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl text-center space-y-6"
        >
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <h1 className="font-display font-bold text-xl text-white">Acceso Restringido</h1>
            <p className="text-xs text-rose-400 font-mono bg-rose-950/20 py-1 px-3.5 rounded-full inline-block">
              {user.email}
            </p>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed text-left">
            Tu cuenta de Google no se encuentra en la lista de usuarios autorizados para ingresar a <strong>Smart Commerce</strong>. 
            <br /><br />
            Para acceder, por favor solicitale a <strong>Noemi</strong> (Administradora Principal) que autorice tu correo electrónico desde el panel de control de usuarios.
          </p>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
            <div className="text-left">
              <span className="text-[10px] text-slate-500 block uppercase font-mono font-bold">Sesión activa</span>
              <span className="text-xs font-semibold text-slate-300 truncate block max-w-[150px]">{user.displayName || "Invitado"}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-rose-600/10 cursor-pointer"
            >
              Cerrar Sesión / Salir
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (initialAuthChecking) {
    return (
      <div className="min-h-screen bg-[#070d1e] flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="space-y-6 max-w-sm w-full">
          {/* Pulsing smart commerce logo */}
          <div className="flex justify-center">
            <div className="p-4 bg-indigo-600/10 border border-indigo-500/20 rounded-3xl text-indigo-400 animate-pulse shadow-lg shadow-indigo-500/5">
              <ShoppingBag className="w-10 h-10" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-lg font-bold text-white tracking-tight">Smart Commerce</h1>
            <p className="text-xs text-slate-400 font-mono flex items-center justify-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              <span>Iniciando sistema seguro...</span>
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setInitialAuthChecking(false);
                setShowDemoAnyway(true);
                if (activeTab === "landing") setActiveTab("inicio");
              }}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Ingresar a Smart Commerce</span>
              <ArrowRightLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === "landing") {
    return (
      <LandingPage 
        onBackToDashboard={() => {
          setShowDemoAnyway(true);
          setActiveTab("inicio");
        }} 
        userEmail={user?.email} 
        onSignIn={async () => {
          await handleSignIn();
          setShowDemoAnyway(true);
          setActiveTab("inicio");
        }} 
      />
    );
  }

  return (
    <div id="app-root" className="flex h-screen bg-slate-50 font-sans text-slate-600 overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userRole={userRole}
      />

      {/* Main Panel */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Header Bar */}
        <header id="app-header" className="h-13 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 border-b border-indigo-950/20 px-3 md:px-5 flex items-center justify-between shrink-0 shadow-md z-10">
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-white md:hidden cursor-pointer flex items-center justify-center shrink-0 border border-white/10"
              title="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-extrabold text-white font-display tracking-wide flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-xl border border-white/10 shadow-sm">
                <Bot className="w-4 h-4 text-emerald-300" />
                <span>Martín IA</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Push Notifications FCM Button */}
            <button
              id="header-push-fcm-btn"
              onClick={() => setActiveTab("notificaciones_push")}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer border ${
                activeTab === "notificaciones_push"
                  ? "bg-emerald-500 text-white border-emerald-400"
                  : "bg-white/10 hover:bg-white/20 text-white border-white/15"
              }`}
              title="Alertas Push FCM"
            >
              <Bell className="w-3.5 h-3.5 text-emerald-300" />
              <span className="hidden md:inline">Push</span>
            </button>

            {/* Automatic Single Role Indicator Badge */}
            <div className="hidden sm:flex items-center bg-slate-950/40 px-3 py-1 rounded-xl border border-white/20 text-xs font-bold text-slate-200 gap-1.5 shrink-0">
              <span className={`w-2 h-2 rounded-full ${isOperarioUser ? "bg-emerald-400" : "bg-indigo-400"} animate-pulse`} />
              {isOperarioUser ? "👷 Operario" : userRole === "deposito" ? "📦 Depósito" : userRole.startsWith("supervisor_") ? "🔍 Supervisor" : "💼 Gerencia"}
            </div>

            {/* Google Authentication / User Profile Info */}
            <div className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-xl px-2.5 py-1 shadow-sm shrink-0 text-white">
              {user ? (
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="text-[11px] font-extrabold text-white block truncate max-w-[110px] leading-tight">{user.displayName || "Noemi"}</span>
                    <span className="text-[9px] font-bold text-emerald-300 uppercase font-mono flex items-center justify-end gap-1 leading-tight">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      <span>En línea</span>
                    </span>
                  </div>
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt="Google avatar" 
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-lg border border-emerald-300 shadow-sm shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold shadow-sm text-xs shrink-0">
                      {user.displayName?.charAt(0) || "N"}
                    </div>
                  )}
                  <button 
                    onClick={handleSignOut}
                    className="px-1.5 py-0.5 bg-white/10 hover:bg-rose-600 text-white rounded-lg transition-all text-[10px] font-bold cursor-pointer shrink-0"
                    title="Salir"
                  >
                    Salir
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSignIn}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-800 text-xs font-bold rounded-lg transition-all shadow-sm cursor-pointer"
                >
                  <FolderOpen className="w-3.5 h-3.5 shrink-0 text-blue-600" />
                  <span>Conectar Drive</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Inner Content scroll zone */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          
          {/* Middle Workspace Area */}
          <main className={`flex-1 min-h-0 ${activeTab === "chat_martin" || (activeTab === "inicio" && isOperarioUser) ? "flex flex-col h-full overflow-hidden p-0 md:p-2" : "overflow-y-auto p-3 md:p-5 space-y-4"}`}>
            
            <AnimatePresence mode="wait">
              {activeTab === "inicio" && (
                isOperarioUser ? (
                  <motion.div
                    key="operario-inicio"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="w-full h-full flex flex-col"
                  >
                    <EmployeeOperarioView 
                      userDisplayName={accessCodeUser?.name || user?.displayName || user?.email?.split("@")[0] || "Operario de Local"} 
                      googleToken={googleToken}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="inicio-tab"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                  {/* CARTEL ROJO GIGANTE PERSISTENTE - MÓDULO DE PREVENCIÓN TÉRMICA */}
                  {escudoTérmico && (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      className="bg-gradient-to-r from-red-600 via-red-700 to-rose-800 text-white p-6 rounded-3xl shadow-2xl border-2 border-red-500 relative overflow-hidden"
                    >
                      {/* Warning stripes pattern overlay */}
                      <div className="absolute inset-0 opacity-[0.03] bg-[repeating-linear-gradient(45deg,transparent,transparent_20px,#fff_20px,#fff_40px)] pointer-events-none" />
                      
                      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3.5 bg-white/10 border border-white/20 text-white rounded-2xl shadow-inner shrink-0 animate-pulse">
                            <ShieldAlert className="w-8 h-8 text-yellow-300" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[9.5px] font-extrabold uppercase tracking-widest text-yellow-300 font-mono bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/20">
                                ESCUDO TÉRMICO ACTIVO • ALERTA DE PÉRDIDAS
                              </span>
                              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-ping" />
                            </div>
                            <h2 className="text-lg md:text-xl font-display font-extrabold tracking-tight text-white leading-tight uppercase">
                              Tareas obligatorias: Mover exhibidores de chocolate al sol y limpiar filtros de aire acondicionado
                            </h2>
                            <p className="text-xs text-rose-100 font-medium leading-relaxed max-w-4xl">
                              La temperatura ambiental detectada ha superado el límite térmico crítico de <strong className="text-yellow-300 font-bold font-mono">26°C</strong> en Buenos Aires. Es crucial realizar estas tareas prioritarias de forma inmediata.
                            </p>
                          </div>
                        </div>
                        
                        <div className="shrink-0 flex gap-2 w-full md:w-auto">
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm("¿Confirmas que ya se realizaron todas las tareas de prevención térmica obligatorias?")) {
                                setEscudoTérmico(false);
                              }
                            }}
                            className="w-full md:w-auto px-5 py-3 bg-yellow-400 hover:bg-yellow-300 text-red-950 font-bold text-xs rounded-xl shadow-lg transition-all border border-yellow-300 cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wider"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Marcar Completado
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Welcome Greeting Card */}
                  <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-950 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5 relative z-10">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">Inteligencia Comercial</span>
                      </div>
                      <h2 className="text-xl font-display font-bold tracking-tight text-white">
                        ¡Bienvenida Noemi! 👋
                      </h2>
                      <p className="text-xs text-indigo-200 leading-normal max-w-xl">
                        Acá tenés el resumen de tu negocio al día de hoy. Martín ya leyó los últimos archivos de la carpeta <strong className="text-indigo-400 font-semibold font-mono">Martin Sistema</strong> y está disponible para brindarte el informe analítico.
                      </p>
                    </div>

                    <div className="relative z-10 shrink-0 flex flex-wrap gap-2.5">
                      <button
                        onClick={exportBusinessReport}
                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer border border-indigo-500/30"
                      >
                        <Download className="w-4 h-4 shrink-0" />
                        <span>Descargar Reporte (CSV)</span>
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab("drive");
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-indigo-50 text-indigo-900 text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                      >
                        📂 Ver Carpeta Drive (Martin Sistema)
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Decorative abstract glowing vector circles */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl -mr-16 -mt-16" />
                    <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-purple-600/10 rounded-full blur-2xl" />
                  </div>

                  {/* Bento Grid: MSN Collage Premium (Clima, Finanzas, Novedades Noemí y Música) */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Columna 1: Clima & Pronóstico Buenos Aires (MSN Collage Style) */}
                    <div 
                      onClick={() => setWeatherExpanded(!weatherExpanded)}
                      className="group bg-gradient-to-br from-[#0a1124]/90 via-[#0c1630]/85 to-[#050a16]/95 border border-indigo-500/20 backdrop-blur-xl p-5 rounded-3xl flex flex-col justify-between hover:border-indigo-400/35 transition-all duration-300 shadow-xl relative overflow-hidden cursor-pointer"
                    >
                      {/* Ambient background decorative glow */}
                      <div className="absolute -top-12 -right-12 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/15 transition-all duration-500" />
                      <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-sky-500/5 rounded-full blur-3xl" />
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-full text-[9px] font-mono font-bold tracking-wider uppercase">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                              Clima en vivo
                            </span>
                            <h3 className="font-display font-extrabold text-sm text-white tracking-tight flex items-center gap-1.5 mt-1">
                              <CloudSun className="w-4 h-4 text-indigo-400" />
                              Recoleta & Palermo
                            </h3>
                            <p className="text-[10px] text-slate-400 font-medium">Buenos Aires • Act: {weatherData.lastUpdated}</p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                fetchWeather();
                              }}
                              className="p-1.5 bg-[#16223f] hover:bg-indigo-600 border border-indigo-500/20 rounded-lg text-slate-300 hover:text-white transition-all cursor-pointer"
                              title="Sincronizar clima"
                            >
                              <RefreshCw className={`w-3 h-3 ${weatherData.loading ? "animate-spin text-indigo-400" : ""}`} />
                            </button>
                            <span className="text-[9.5px] font-mono font-bold bg-[#1e293b]/60 text-slate-300 border border-slate-700/40 px-2 py-0.5 rounded-lg hover:bg-indigo-600 hover:text-white transition-all shrink-0">
                              {weatherExpanded ? "Ver menos ✕" : "Expandir pronóstico ↗"}
                            </span>
                          </div>
                        </div>

                        {/* Current Temperature Segment */}
                        <div className="flex items-center gap-4 bg-[#111a36]/50 border border-indigo-500/10 p-4 rounded-2xl relative overflow-hidden">
                          <div className="text-4xl filter drop-shadow-[0_0_8px_rgba(255,191,0,0.2)] animate-bounce duration-1000">{weatherData.icon}</div>
                          <div>
                            <div className="text-2xl font-extrabold font-mono text-white tracking-tight flex items-baseline gap-1">
                              <span>{weatherData.temp}°C</span>
                              <span className="text-[10px] font-medium text-slate-400 font-sans">Sensación: {weatherData.feelsLike}°</span>
                            </div>
                            <div className="text-xs font-bold text-indigo-200">{weatherData.condition}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5 font-mono">Hum: {weatherData.humidity}% • Viento: {weatherData.windSpeed} km/h</div>
                          </div>
                          {/* Absolute micro live beacon */}
                          <span className="absolute top-2 right-2 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                        </div>

                        {/* 5-day custom weather grid inside collage */}
                        <AnimatePresence>
                          {weatherExpanded && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden space-y-3 pt-2"
                              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking content
                            >
                              <div className="border-t border-[#1e293b]/40 pt-3">
                                <span className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2 font-mono">Pronóstico Extendido MSN:</span>
                                <div className="grid grid-cols-5 gap-1.5 text-center">
                                  {weatherData.extended.map((item, idx) => (
                                    <div key={idx} className="p-1.5 bg-[#0f172e]/60 rounded-xl border border-indigo-500/10 hover:border-indigo-500/20 transition-colors">
                                      <span className="text-[9.5px] text-slate-400 block font-bold font-mono">{item.day}</span>
                                      <span className="text-lg my-1 block">{item.icon}</span>
                                      <span className="text-[10.5px] font-bold text-white font-mono">{item.temp}</span>
                                      <span className="text-[8px] text-slate-400 block truncate font-sans">{item.desc}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Módulo de Prevención Térmica (Climate triggered + Manual override) */}
                      <div className="mt-4 pt-3.5 border-t border-[#1e293b]/40 space-y-2.5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                            Prevención Térmica
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider font-mono ${
                            escudoTérmico 
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse" 
                              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          }`}>
                            {escudoTérmico ? "Escudo Activo 🚨" : "Seguro ✅"}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between text-[9px] text-slate-400">
                          <span>Umbral Crítico: &gt;26°C</span>
                          <span className="font-mono">Temp Actual: {weatherData.temp}°C</span>
                        </div>

                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEscudoTérmico(!escudoTérmico)}
                            className={`w-full py-1.5 px-2 rounded-xl text-[10px] font-bold transition-all text-center border cursor-pointer ${
                              escudoTérmico
                                ? "bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/30"
                                : "bg-[#111a36]/60 hover:bg-[#16223f] text-slate-400 border-transparent hover:text-white"
                            }`}
                          >
                            {escudoTérmico ? "Desactivar Escudo Térmico" : "Activar Escudo Térmico Manual"}
                          </button>
                        </div>
                      </div>

                      {/* Bottom Insight Quote - Weather dependent suggestion */}
                      <div className="mt-4 pt-3.5 border-t border-[#1e293b]/40">
                        <div className="bg-indigo-950/40 border border-indigo-500/15 p-3 rounded-2xl">
                          <p className="text-[10px] text-slate-300 leading-relaxed font-sans italic">
                            💡 <strong className="text-indigo-300 font-semibold">Criterio Operativo de Martín:</strong> {weatherData.temp < 13 
                              ? "Día frío: priorizar reposición de infusiones, chocolates y galletitas en los 38 locales de la red." 
                              : "Día templado: asegurar stock de bebidas frías, aguas y alfajores en heladeras de exhibición."
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Columna 2: Finanzas al Instante & Índices Globales (MSN Executive Style) */}
                    <div className="bg-gradient-to-br from-[#0a1124]/90 via-[#0c1630]/85 to-[#050a16]/95 border border-indigo-500/20 backdrop-blur-xl p-5 rounded-3xl flex flex-col justify-between hover:border-indigo-400/35 transition-all duration-300 shadow-xl relative overflow-hidden">
                      {/* Ambient background decorative glow */}
                      <div className="absolute -top-12 -right-12 w-28 h-28 bg-emerald-500/5 rounded-full blur-2xl" />
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-full text-[9px] font-mono font-bold tracking-wider uppercase">
                              Mercado Libre y Divisas
                            </span>
                            <h3 className="font-display font-extrabold text-sm text-white tracking-tight flex items-center gap-1.5 mt-1">
                              <Coins className="w-4 h-4 text-emerald-400" />
                              Cotizaciones y Bolsa MSN
                            </h3>
                            <p className="text-[10px] text-slate-400 font-medium">Actualizado al instante (ARS)</p>
                          </div>

                          <button 
                            onClick={refreshFinancialRates}
                            disabled={ratesRefreshing}
                            className="p-2 bg-[#16223f] hover:bg-indigo-600 border border-indigo-500/20 rounded-xl text-slate-300 hover:text-white transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                            title="Refrescar cotizaciones en vivo"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${ratesRefreshing ? "animate-spin text-emerald-400" : ""}`} />
                          </button>
                        </div>

                        {/* Collage Grid of financial values */}
                        <div className="grid grid-cols-2 gap-2.5">
                          
                          {/* Dólar Blue */}
                          <div className="p-3 bg-[#111a36]/50 rounded-xl border border-indigo-500/10 hover:bg-[#111a36]/80 transition-all">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-400">Dólar Blue</span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono ${rates.dollarBlueTrend >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                                {rates.dollarBlueTrend >= 0 ? "▲" : "▼"} {Math.abs(rates.dollarBlueTrend)}%
                              </span>
                            </div>
                            <div className="text-slate-200 mt-2 flex flex-col font-mono">
                              <span className="text-[12px] font-extrabold text-white">$ {rates.dollarBlueVenta} <span className="text-[8.5px] font-normal text-slate-500 font-sans">venta</span></span>
                              <span className="text-[9.5px] text-slate-400 mt-0.5">Compra: $ {rates.dollarBlueCompra}</span>
                            </div>
                          </div>

                          {/* Dólar Oficial */}
                          <div className="p-3 bg-[#111a36]/50 rounded-xl border border-indigo-500/10 hover:bg-[#111a36]/80 transition-all">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-400">Dólar Oficial</span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono ${rates.dollarOficialTrend >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                                {rates.dollarOficialTrend >= 0 ? "▲" : "▼"} {Math.abs(rates.dollarOficialTrend)}%
                              </span>
                            </div>
                            <div className="text-slate-200 mt-2 flex flex-col font-mono">
                              <span className="text-[12px] font-extrabold text-white">$ {rates.dollarOficialVenta} <span className="text-[8.5px] font-normal text-slate-500 font-sans">venta</span></span>
                              <span className="text-[9.5px] text-slate-400 mt-0.5">Compra: $ {rates.dollarOficialCompra}</span>
                            </div>
                          </div>

                          {/* Euro */}
                          <div className="p-3 bg-[#111a36]/50 rounded-xl border border-indigo-500/10 hover:bg-[#111a36]/80 transition-all">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-400">Euro oficial</span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono ${rates.euroTrend >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                                {rates.euroTrend >= 0 ? "▲" : "▼"} {Math.abs(rates.euroTrend)}%
                              </span>
                            </div>
                            <div className="text-slate-200 mt-2 flex flex-col font-mono">
                              <span className="text-[12px] font-extrabold text-white">$ {rates.euroVenta} <span className="text-[8.5px] font-normal text-slate-500 font-sans">venta</span></span>
                              <span className="text-[9.5px] text-slate-400 mt-0.5">Compra: $ {rates.euroCompra}</span>
                            </div>
                          </div>

                          {/* Índice Merval */}
                          <div className="p-3 bg-[#111a36]/50 rounded-xl border border-indigo-500/10 hover:bg-[#111a36]/80 transition-all">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-400">S&P MERVAL</span>
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded font-mono bg-emerald-500/10 text-emerald-400">
                                ▲ {rates.mervalTrend}%
                              </span>
                            </div>
                            <div className="text-slate-200 mt-2 flex flex-col font-mono">
                              <span className="text-[12px] font-extrabold text-white truncate">{rates.merval.toLocaleString()} pts</span>
                              <span className="text-[8.5px] text-emerald-500 font-sans font-semibold mt-0.5 flex items-center gap-0.5">
                                <ArrowUpRight className="w-2.5 h-2.5" /> Bolsa Nacional
                              </span>
                            </div>
                          </div>

                          {/* S&P 500 Wall Street (MSN Collage additions) */}
                          <div className="p-3 bg-[#111a36]/30 rounded-xl border border-indigo-500/5 hover:bg-[#111a36]/50 transition-all">
                            <div className="flex items-center justify-between">
                              <span className="text-[9.5px] font-bold text-slate-500 font-mono">S&P 500 (USA)</span>
                              <span className="text-[8.5px] font-bold text-emerald-400 font-mono">▲ 0.42%</span>
                            </div>
                            <div className="text-slate-300 mt-1.5 font-mono text-[11px] font-semibold leading-none">
                              5.485,20 pts
                            </div>
                          </div>

                          {/* NASDAQ Wall Street (MSN Collage additions) */}
                          <div className="p-3 bg-[#111a36]/30 rounded-xl border border-indigo-500/5 hover:bg-[#111a36]/50 transition-all">
                            <div className="flex items-center justify-between">
                              <span className="text-[9.5px] font-bold text-slate-500 font-mono">NASDAQ (Tech)</span>
                              <span className="text-[8.5px] font-bold text-emerald-400 font-mono">▲ 0.75%</span>
                            </div>
                            <div className="text-slate-300 mt-1.5 font-mono text-[11px] font-semibold leading-none">
                              19.114,80 pts
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Live Market Bar Footer */}
                      <div className="mt-4 pt-3.5 border-t border-[#1e293b]/40 flex items-center justify-between text-[9px] text-slate-400 font-mono">
                        <span className="flex items-center gap-1 text-slate-500">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                          CONECTADO AL MERVAL
                        </span>
                        <span>BCRA • BUE</span>
                      </div>
                    </div>

                    {/* Columna 3: Centro de Control Operativo - 38 Sucursales Tbest */}
                    <div className="bg-gradient-to-br from-[#0a1124]/90 via-[#0c1630]/85 to-[#050a16]/95 border border-indigo-500/20 backdrop-blur-xl p-5 rounded-3xl flex flex-col justify-between hover:border-indigo-400/35 transition-all duration-300 shadow-xl relative overflow-hidden">
                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between border-b border-[#1e293b]/40 pb-2.5">
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-full text-[9px] font-mono font-bold tracking-wider uppercase">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Operaciones en Tiempo Real
                            </span>
                            <h3 className="font-display font-extrabold text-sm text-white tracking-tight flex items-center gap-1.5 mt-0.5">
                              <Boxes className="w-4 h-4 text-emerald-400" />
                              Red de 38 Sucursales Tbest
                            </h3>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded-lg border border-white/10">
                            Activo
                          </span>
                        </div>

                        {/* 4 Indicadores Clave de Operaciones */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2.5 bg-[#111a36]/60 border border-indigo-500/15 rounded-xl">
                            <span className="text-[9px] text-slate-400 font-mono uppercase block">Sucursales</span>
                            <span className="text-sm font-extrabold text-white font-mono mt-0.5 block">38 Locales</span>
                            <span className="text-[8.5px] text-emerald-400 font-semibold mt-0.5 block">100% Monitoreadas</span>
                          </div>

                          <div className="p-2.5 bg-[#111a36]/60 border border-indigo-500/15 rounded-xl">
                            <span className="text-[9px] text-slate-400 font-mono uppercase block">Base Maestra</span>
                            <span className="text-sm font-extrabold text-white font-mono mt-0.5 block">350+ Artículos</span>
                            <span className="text-[8.5px] text-indigo-300 font-semibold mt-0.5 block">STOCK_ACTUAL</span>
                          </div>

                          <div className="p-2.5 bg-[#111a36]/60 border border-indigo-500/15 rounded-xl">
                            <span className="text-[9px] text-slate-400 font-mono uppercase block">WhatsApp Voz</span>
                            <span className="text-sm font-extrabold text-white font-mono mt-0.5 block">Activo</span>
                            <span className="text-[8.5px] text-emerald-400 font-semibold mt-0.5 block">IA de Normalización</span>
                          </div>

                          <div className="p-2.5 bg-[#111a36]/60 border border-indigo-500/15 rounded-xl">
                            <span className="text-[9px] text-slate-400 font-mono uppercase block">Director IA</span>
                            <span className="text-sm font-extrabold text-white font-mono mt-0.5 block">Martín Online</span>
                            <span className="text-[8.5px] text-indigo-300 font-semibold mt-0.5 block">Consultas en Vivo</span>
                          </div>
                        </div>

                        {/* Botones de Acción Operativa Rápida */}
                        <div className="space-y-1.5 pt-1">
                          <button
                            onClick={() => setActiveTab("chat_martin")}
                            className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-between shadow-sm cursor-pointer"
                          >
                            <span className="flex items-center gap-1.5">
                              <Bot className="w-3.5 h-3.5 text-emerald-300" />
                              Consultar a Martín IA (Director)
                            </span>
                            <span className="text-[10px] opacity-75 font-mono">Abrir →</span>
                          </button>

                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              onClick={() => setActiveTab("drive")}
                              className="py-1.5 px-2.5 bg-[#111a36]/70 hover:bg-[#18254b] text-slate-200 border border-indigo-500/20 rounded-xl text-[10.5px] font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Database className="w-3 h-3 text-indigo-400" />
                              Base Maestra
                            </button>
                            <button
                              onClick={() => setActiveTab("agente_remitos")}
                              className="py-1.5 px-2.5 bg-[#111a36]/70 hover:bg-[#18254b] text-slate-200 border border-indigo-500/20 rounded-xl text-[10.5px] font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <ArrowRightLeft className="w-3 h-3 text-emerald-400" />
                              Agente Remitos
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-[#1e293b]/40 flex items-center justify-between text-[9px] text-slate-400 font-mono">
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          SISTEMA OPERACIONAL
                        </span>
                        <span>SMART COMMERCE</span>
                      </div>
                    </div>

                  </div>

                  {/* 5 KPI Stat Cards Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <StatsCard
                      id="ventas"
                      title="Ventas del día"
                      value="$ 1.250.000"
                      diff={12.5}
                      diffLabel="vs ayer"
                      icon={DollarSign}
                      color="blue"
                    />
                    <StatsCard
                      id="ganancias"
                      title="Ganancia del día"
                      value="$ 312.500"
                      diff={15.3}
                      diffLabel="vs ayer"
                      icon={TrendingUp}
                      color="green"
                    />
                    <StatsCard
                      id="margen"
                      title="Margen de ganancia"
                      value="25.0%"
                      diff={2.1}
                      diffLabel="vs ayer"
                      icon={Percent}
                      color="purple"
                    />
                    <StatsCard
                      id="ticket"
                      title="Ticket promedio"
                      value="$ 4.350"
                      diff={8.7}
                      diffLabel="vs ayer"
                      icon={ShoppingBag}
                      color="orange"
                    />
                    <StatsCard
                      id="productos"
                      title="Productos vendidos"
                      value="287"
                      diff={9.2}
                      diffLabel="vs ayer"
                      icon={ShoppingBag}
                      color="cyan"
                    />
                  </div>

                  {/* Charts section & Important Notifications Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Bar Chart 7 Days with Trend Toggle */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <h3 className="font-display font-bold text-xs text-slate-800 uppercase tracking-wider">Ventas: Últimos 7 días</h3>
                          <p className="text-[10px] text-slate-400">Total diario facturado en ARS</p>
                        </div>
                        {/* Selector de Vista de Tendencia (Moving Average) */}
                        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/50 self-start sm:self-center">
                          <button
                            onClick={() => setSalesChartMode("bar")}
                            className={`px-2 py-0.5 text-[9.5px] font-semibold rounded-md transition-all ${
                              salesChartMode === "bar"
                                ? "bg-white text-indigo-600 shadow-sm"
                                : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            Barras
                          </button>
                          <button
                            onClick={() => setSalesChartMode("trend")}
                            className={`px-2 py-0.5 text-[9.5px] font-semibold rounded-md transition-all ${
                              salesChartMode === "trend"
                                ? "bg-white text-indigo-600 shadow-sm"
                                : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            Tendencia
                          </button>
                          <button
                            onClick={() => setSalesChartMode("both")}
                            className={`px-2 py-0.5 text-[9.5px] font-semibold rounded-md transition-all ${
                              salesChartMode === "both"
                                ? "bg-white text-indigo-600 shadow-sm"
                                : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            Ambos
                          </button>
                          <button
                            onClick={() => setSalesChartMode("compare")}
                            className={`px-2 py-0.5 text-[9.5px] font-semibold rounded-md transition-all ${
                              salesChartMode === "compare"
                                ? "bg-white text-indigo-600 shadow-sm"
                                : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            vs. Año Anterior
                          </button>
                        </div>
                      </div>
                      <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={salesDataWithMA}>
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} width={45} tickFormatter={(tick) => `$${tick/1000}k`} />
                            <Tooltip 
                              formatter={(value: any, name: string) => {
                                let label = "Ventas";
                                if (name === "mediaMovil") label = "Media Móvil (3d)";
                                if (name === "ventasAnoAnterior") label = "Año Anterior";
                                return [`$ ${value ? value.toLocaleString() : 0}`, label];
                              }} 
                              labelClassName="text-[10px] font-bold" 
                            />
                            {/* Bar View */}
                            {(salesChartMode === "bar" || salesChartMode === "both" || salesChartMode === "compare") && (
                              <Bar dataKey="ventas" name="ventas" fill="#4f46e5" radius={[4, 4, 0, 0]} opacity={salesChartMode === "both" ? 0.75 : salesChartMode === "compare" ? 0.85 : 1} />
                            )}
                            {/* Trend Line (Moving Average) */}
                            {(salesChartMode === "trend" || salesChartMode === "both") && (
                              <Line 
                                type="monotone" 
                                dataKey="mediaMovil" 
                                name="mediaMovil"
                                stroke="#10b981" 
                                strokeWidth={3} 
                                dot={{ r: 3.5, fill: "#10b981", strokeWidth: 1.5 }}
                                activeDot={{ r: 5.5 }} 
                              />
                            )}
                            {/* Reference Line for Year-over-Year Comparison */}
                            {salesChartMode === "compare" && (
                              <Line 
                                type="monotone" 
                                dataKey="ventasAnoAnterior" 
                                name="ventasAnoAnterior"
                                stroke="#f59e0b" 
                                strokeWidth={2.5} 
                                strokeDasharray="4 4"
                                dot={{ r: 3.5, fill: "#f59e0b", strokeWidth: 1.5 }}
                                activeDot={{ r: 5.5 }} 
                              />
                            )}
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Donut Chart Categories */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col space-y-4">
                      <div>
                        <h3 className="font-display font-bold text-xs text-slate-800 uppercase tracking-wider">Ventas por Categoría</h3>
                        <p className="text-[10px] text-slate-400">Distribución de ingresos totales</p>
                      </div>
                      <div className="h-48 w-full flex items-center justify-center relative">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={categoryData}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={70}
                              paddingAngle={2}
                              dataKey="value"
                            >
                              {categoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value: any) => [`$ ${value.toLocaleString()}`, "Monto"]} />
                          </PieChart>
                        </ResponsiveContainer>
                        {/* Core text label in donut center */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
                          <span className="text-[10px] text-slate-400 uppercase font-bold">Total</span>
                          <span className="text-sm font-bold text-slate-800 font-mono">$11.8M</span>
                        </div>
                      </div>
                    </div>

                    {/* Important Notifications Card */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col space-y-4">
                      <div>
                        <h3 className="font-display font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5 text-amber-600">
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          Alertas Importantes
                        </h3>
                        <p className="text-[10px] text-slate-400">Atención requerida para gestión</p>
                      </div>

                      <div className="space-y-3 flex-1 overflow-y-auto">
                        {/* Alert 1 */}
                        <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
                          <div className="p-1.5 bg-amber-100 text-amber-800 rounded-lg text-xs font-bold">0</div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-800 leading-tight">Alertas de Stock</h4>
                            <p className="text-[10px] text-slate-500 mt-0.5">Evaluación en tiempo real según planillas</p>
                          </div>
                        </div>

                        {/* Alert 2 */}
                        <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3">
                          <div className="p-1.5 bg-rose-100 text-rose-800 rounded-lg text-xs font-bold">0</div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-800 leading-tight">Facturas pendientes por vencer</h4>
                            <p className="text-[10px] text-slate-500 mt-0.5">Sin comprobantes pendientes</p>
                          </div>
                        </div>

                        {/* Alert 3 */}
                        <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
                          <div className="p-1.5 bg-blue-100 text-blue-800 rounded-lg text-xs font-bold">18</div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-800 leading-tight">Productos con baja rotación</h4>
                            <p className="text-[10px] text-slate-500 mt-0.5">Categoría "Otros" sin ventas en 30 días</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Business tables details (Rentabilidad, Top 5, Resumen caja, Accesos, Notas) */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Rentabilidad Table */}
                    <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col space-y-4">
                      <div>
                        <h3 className="font-display font-bold text-xs text-slate-800 uppercase tracking-wider">Rentabilidad por Categoría</h3>
                        <p className="text-[10px] text-slate-400">Rendimiento y ventas de stock consolidados</p>
                      </div>

                      <div className="border border-slate-100 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold">
                                <th className="p-3">Categoría</th>
                                <th className="p-3">Ventas Totales</th>
                                <th className="p-3">Costo Total</th>
                                <th className="p-3">Margen Promedio</th>
                                <th className="p-3">Rendimiento</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-mono text-slate-600 bg-white">
                              {[
                                { name: "Golosinas", ventas: 2750300, costo: 1925210, margen: "30.0%", trend: "Alto", color: "text-emerald-600 bg-emerald-50" },
                                { name: "Bebidas", ventas: 3320000, costo: 2490000, margen: "25.0%", trend: "Medio", color: "text-blue-600 bg-blue-50" },
                                { name: "Almacén", ventas: 2250200, costo: 1800160, margen: "20.0%", trend: "Medio", color: "text-blue-600 bg-blue-50" },
                                { name: "Limpieza", ventas: 1238500, costo: 866950, margen: "30.0%", trend: "Alto", color: "text-emerald-600 bg-emerald-50" },
                                { name: "Lácteos", ventas: 1750400, costo: 1400320, margen: "20.0%", trend: "Medio", color: "text-blue-600 bg-blue-50" },
                                { name: "Otros", ventas: 550100, costo: 412575, margen: "25.0%", trend: "Bajo", color: "text-rose-600 bg-rose-50" }
                              ].map((row, i) => (
                                <tr key={i} className="hover:bg-slate-50/40">
                                  <td className="p-3 font-sans font-bold text-slate-800">{row.name}</td>
                                  <td className="p-3">{formatARS(row.ventas)}</td>
                                  <td className="p-3 text-slate-400">{formatARS(row.costo)}</td>
                                  <td className="p-3 text-indigo-600 font-bold">{row.margen}</td>
                                  <td className="p-3">
                                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${row.color}`}>
                                      {row.trend}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* Top 5 Best Sellers Table */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col space-y-4">
                      <div>
                        <h3 className="font-display font-bold text-xs text-slate-800 uppercase tracking-wider">Top 5 Productos más Vendidos</h3>
                        <p className="text-[10px] text-slate-400">Productos líderes del mes</p>
                      </div>

                      <div className="border border-slate-100 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold">
                              <th className="p-3 w-8">#</th>
                              <th className="p-3">Producto</th>
                              <th className="p-3 text-right">Un.</th>
                              <th className="p-3 text-right">Venta</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-mono text-slate-600 bg-white">
                            {[
                              { rank: 1, name: "Coca-Cola 1.5L", units: 125, sales: 187500 },
                              { rank: 2, name: "Chocolate 24h", units: 98, sales: 156800 },
                              { rank: 3, name: "Yerba Mate 1Kg", units: 85, sales: 102000 },
                              { rank: 4, name: "Galletitas Pepitos", units: 72, sales: 93600 },
                              { rank: 5, name: "Agua Mineral 1.5L", units: 65, sales: 78000 }
                            ].map((row, i) => (
                              <tr key={i} className="hover:bg-slate-50/40">
                                <td className="p-3 font-sans font-bold text-slate-400">{row.rank}</td>
                                <td className="p-3 font-sans font-semibold text-slate-800">{row.name}</td>
                                <td className="p-3 text-right font-bold text-slate-500">{row.units}</td>
                                <td className="p-3 text-right font-bold text-slate-800">{formatARS(row.sales)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Cash Drawer, Shortcuts, Notes Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Resumen de Caja */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col space-y-4">
                      <div>
                        <h3 className="font-display font-bold text-xs text-slate-800 uppercase tracking-wider">Resumen de Caja Diaria</h3>
                        <p className="text-[10px] text-slate-400">Reconciliación y medios de cobro</p>
                      </div>

                      <div className="space-y-2.5 font-mono text-xs flex-1">
                        <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors">
                          <span className="text-slate-500">Efectivo:</span>
                          <span className="font-bold text-slate-800">$ 120.000 ARS</span>
                        </div>
                        <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors">
                          <span className="text-slate-500">Tarjetas (D/C):</span>
                          <span className="font-bold text-slate-800">$ 480.000 ARS</span>
                        </div>
                        <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors">
                          <span className="text-slate-500">Transferencias:</span>
                          <span className="font-bold text-slate-800">$ 130.000 ARS</span>
                        </div>
                        <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors">
                          <span className="text-slate-500">Otros (Vales/CtaCte):</span>
                          <span className="font-bold text-slate-800">$ 0 ARS</span>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between p-2 text-indigo-700 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
                          <span className="font-sans font-bold uppercase tracking-wider text-[10px]">Cerrado consolidado:</span>
                          <span className="font-bold text-sm">$ 730.000 ARS</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Shortcuts */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col space-y-4">
                      <div>
                        <h3 className="font-display font-bold text-xs text-slate-800 uppercase tracking-wider">Accesos Rápidos</h3>
                        <p className="text-[10px] text-slate-400">Atajos de operación ágil</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 flex-1 justify-center">
                        <button onClick={() => alert("Función para abrir facturación")} className="p-3.5 bg-indigo-50 hover:bg-indigo-100/70 border border-indigo-100 text-indigo-700 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all text-center">
                          <DollarSign className="w-5 h-5 shrink-0" />
                          <span className="text-[10px] font-bold leading-tight">Nueva Venta</span>
                        </button>
                        <button onClick={() => alert("Función para registrar órdenes de compras")} className="p-3.5 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-100 text-emerald-700 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all text-center">
                          <ShoppingBag className="w-5 h-5 shrink-0" />
                          <span className="text-[10px] font-bold leading-tight">Nueva Compra</span>
                        </button>
                        <button onClick={() => alert("Abrir planilla de arqueo de caja")} className="p-3.5 bg-purple-50 hover:bg-purple-100/70 border border-purple-100 text-purple-700 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all text-center">
                          <CheckCircle className="w-5 h-5 shrink-0" />
                          <span className="text-[10px] font-bold leading-tight">Arqueo de Caja</span>
                        </button>
                        <button onClick={() => { setActiveTab("drive"); }} className="p-3.5 bg-amber-50 hover:bg-amber-100/70 border border-amber-100 text-amber-700 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all text-center">
                          <FileText className="w-5 h-5 shrink-0" />
                          <span className="text-[10px] font-bold leading-tight">Martin Sistema</span>
                        </button>
                      </div>
                    </div>

                    {/* Quick Notepad */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-display font-bold text-xs text-slate-800 uppercase tracking-wider">Notas rápidas</h3>
                          <p className="text-[10px] text-slate-400">Scratchpad de persistencia local</p>
                        </div>
                        <Bookmark className="w-4 h-4 text-slate-300" />
                      </div>

                      <div className="flex-1 flex flex-col">
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="w-full flex-1 p-3 bg-amber-50/50 border border-amber-100 rounded-xl text-xs font-mono text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-300 resize-none leading-relaxed"
                          placeholder="Apunta tus pendientes financieros aquí..."
                        />
                      </div>
                    </div>

                  </div>
                </motion.div>
              ))}

              {/* Interceptor de Clave de Seguridad para secciones sensibles */}
              {["drive", "usuarios", "config"].includes(activeTab) && !adminUnlocked && (
                <motion.div
                  key="security-lock-gate"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="max-w-md mx-auto my-12 bg-gradient-to-b from-[#151f3c] to-[#0c1224] rounded-3xl border border-indigo-500/30 shadow-2xl shadow-indigo-950/40 p-8 space-y-6 relative overflow-hidden text-slate-100"
                >
                  {/* Decorative ambient light behind the lock */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                  <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-400/20 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner relative z-10">
                    <Lock className="w-8 h-8" />
                  </div>

                  <div className="text-center space-y-2 relative z-10">
                    <h2 className="font-display font-extrabold text-xl text-white tracking-tight">Portal de Seguridad Administrativa</h2>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Se requiere autorización para ingresar a la sección <span className="text-indigo-300 font-semibold uppercase">{activeTab === "drive" ? "Martin Sistema (Drive)" : activeTab === "usuarios" ? "Gestión de Usuarios" : "Configuración Avanzada"}</span>.
                    </p>
                  </div>

                  <div className="p-4 bg-indigo-950/40 rounded-2xl border border-indigo-500/10 space-y-1.5 text-center relative z-10">
                    <span className="text-[9px] font-bold text-indigo-400 uppercase font-mono tracking-wider block">Escudo de Protección Digital</span>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Esta barrera protege la integridad de los archivos de Excel/Sheets en Google Drive, las credenciales de la API de Gemini y la gestión de permisos del personal.
                    </p>
                  </div>

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (adminPasscode.trim() === adminSecretKey) {
                        setAdminUnlocked(true);
                        sessionStorage.setItem("admin_session_unlocked", "true");
                        setAdminPasscodeError(null);
                        setAdminPasscode("");
                      } else {
                        setAdminPasscodeError("Clave de seguridad incorrecta. Verificá con el administrador principal.");
                      }
                    }} 
                    className="space-y-4 relative z-10"
                  >
                    <div>
                      <label className="block text-[10px] font-bold text-indigo-300 uppercase tracking-wider mb-2 font-mono text-center">
                        Ingresá la Clave de Seguridad
                      </label>
                      <input
                        type="password"
                        required
                        value={adminPasscode}
                        onChange={(e) => {
                          setAdminPasscode(e.target.value);
                          if (adminPasscodeError) setAdminPasscodeError(null);
                        }}
                        placeholder="••••"
                        className="w-full text-center px-4 py-3 border border-indigo-500/20 rounded-xl text-lg font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent tracking-widest placeholder:text-slate-600 bg-[#090d1a] text-white transition-all shadow-inner"
                      />
                    </div>

                    {adminPasscodeError && (
                      <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-xs text-rose-300 font-medium text-center">
                        ⚠️ {adminPasscodeError}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg hover:shadow-indigo-600/20 cursor-pointer flex items-center justify-center gap-2 border border-indigo-500/20 font-sans uppercase tracking-wider"
                    >
                      <Lock className="w-4 h-4 text-white" />
                      <span>Desbloquear Sección Administrativa</span>
                    </button>
                  </form>
                </motion.div>
              )}

              {activeTab === "gmail" && (
                <motion.div
                  key="gmail-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                >
                  <GmailManager />
                </motion.div>
              )}

              {activeTab === "drive" && adminUnlocked && (
                <motion.div
                  key="drive-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h2 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      {user ? "Martin Sistema (Google Drive Conectado)" : "Martin Sistema (Almacén Central & Google Drive)"}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-normal">
                      {user 
                        ? `Conectado como ${user.displayName || user.email}. Martín está sincronizado con tu cuenta real de Google Drive. Los archivos creados se consolidan directamente en la carpeta "Martin Sistema".`
                        : "En esta sección podés explorar los archivos maestros que componen el inventario y arqueos del comercio, ejecutar la sincronización de Google Sheets (`actualizarArchivosDesdeDrive()`) y gestionar los documentos leídos por Martín IA."
                      }
                    </p>
                  </div>

                  <DriveManager googleToken={googleToken} />
                </motion.div>
              )}

              {activeTab === "usuarios" && adminUnlocked && (
                <motion.div
                  key="usuarios-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h2 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                      <UserSquare2 className="w-5 h-5 text-indigo-600" />
                      Gestión de Accesos y Usuarios
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-normal">
                      Controlá quién tiene permiso para ingresar a la plataforma con su cuenta de Google. Sólo los correos incluidos en esta lista tendrán acceso a los datos reales de facturación, arqueos de caja y Martín Sistema.
                    </p>
                  </div>

                  {user?.email?.toLowerCase().trim() === MASTER_ADMIN_EMAIL.toLowerCase().trim() || userRole === "owner" ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Left: Add Employee Role Form */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col space-y-4 h-fit">
                        <div>
                          <h3 className="font-display font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                            <UserPlus className="w-4 h-4 text-indigo-600" />
                            Delegar / Crear Nuevo Acceso
                          </h3>
                          <p className="text-[10px] text-slate-400 mt-0.5">Asigná permisos por sector o rol de depósito</p>
                        </div>

                        <form onSubmit={handleAddEmail} className="space-y-3.5">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase font-mono block mb-1">Nombre Completo del Colaborador</label>
                            <input
                              type="text"
                              required
                              value={newUserName}
                              onChange={(e) => setNewUserName(e.target.value)}
                              placeholder="Ej: Marta - Depósito"
                              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-400"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase font-mono block mb-1">Correo de Google (Gmail)</label>
                            <input
                              type="email"
                              required
                              value={newEmailToWhitelist}
                              onChange={(e) => setNewEmailToWhitelist(e.target.value)}
                              placeholder="colaborador@gmail.com"
                              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-400"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase font-mono block mb-1">Rol / Sector Asignado</label>
                            <select
                              value={newUserRole}
                              onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
                            >
                              <option value="deposito">Encargado de Depósito (Nivel 2)</option>
                              <option value="supervisor_golosinas">Supervisor Sector Golosinas (Nivel 3)</option>
                              <option value="supervisor_bebidas">Supervisor Sector Bebidas (Nivel 3)</option>
                              <option value="supervisor_elaborados">Supervisor Sector Elaborados (Nivel 3)</option>
                              <option value="owner">Co-Propietario / Administrador Total (Nivel 1)</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase font-mono block mb-1">Clave de Acceso (Passcode)</label>
                            <input
                              type="text"
                              required
                              value={newUserCode}
                              onChange={(e) => setNewUserCode(e.target.value)}
                              placeholder="Ej: DEP2026"
                              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono bg-slate-50 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-400"
                            />
                          </div>

                          {whitelistError && (
                            <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-[11px] text-rose-600 font-medium flex items-start gap-1.5 leading-normal">
                              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                              <span>{whitelistError}</span>
                            </div>
                          )}

                          {whitelistSuccess && (
                            <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-[11px] text-emerald-600 font-medium flex items-start gap-1.5 leading-normal">
                              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
                              <span>{whitelistSuccess}</span>
                            </div>
                          )}

                          <button
                            type="submit"
                            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/10 cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Otorgar Acceso / Guardar</span>
                          </button>
                        </form>
                      </div>

                      {/* Right: User roles table */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2 space-y-4">
                        <div>
                          <h3 className="font-display font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            Estructura de Permisos y Roles de Personal
                          </h3>
                          <p className="text-[10px] text-slate-400 mt-0.5">Cuentas delegadas y sus códigos de acceso rápido</p>
                        </div>

                        <div className="border border-slate-100 rounded-xl overflow-hidden">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                                <th className="p-3">Colaborador / Cuenta</th>
                                <th className="p-3">Rol / Sector</th>
                                <th className="p-3">Clave</th>
                                <th className="p-3 text-right">Acciones</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                              {/* Master Admin / Owner (Noemi) Row */}
                              <tr className="hover:bg-slate-50/30 bg-slate-50/10">
                                <td className="p-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold font-mono text-xs">
                                      N
                                    </div>
                                    <div>
                                      <span className="font-bold text-slate-800 block">Noemí Carvallo (Propietaria)</span>
                                      <span className="text-[9px] text-slate-400 font-mono">{MASTER_ADMIN_EMAIL}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3">
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 font-mono uppercase">
                                    Dueño Principal
                                  </span>
                                </td>
                                <td className="p-3 font-mono text-slate-400 text-xs">
                                  DUEÑO2026
                                </td>
                                <td className="p-3 text-right">
                                  <span className="text-[10px] text-slate-400 font-medium italic select-none">No Removible</span>
                                </td>
                              </tr>

                              {/* Whitelisted Users with full details */}
                              {usersList.map((usr) => {
                                const cleanEmail = usr.email.trim().toLowerCase();
                                if (cleanEmail === MASTER_ADMIN_EMAIL.toLowerCase().trim()) return null;
                                return (
                                  <tr key={cleanEmail} className="hover:bg-slate-50/30">
                                    <td className="p-3">
                                      <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold font-mono text-xs uppercase">
                                          {usr.name.charAt(0)}
                                        </div>
                                        <div>
                                          <span className="font-semibold text-slate-700 block">{usr.name}</span>
                                          <span className="text-[9.5px] text-slate-400 font-mono block leading-none">{usr.email}</span>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="p-3">
                                      {usr.role === "deposito" && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 border border-amber-100 text-amber-700 font-mono uppercase">
                                          📦 Depósito L2
                                        </span>
                                      )}
                                      {usr.role === "supervisor_golosinas" && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-pink-50 border border-pink-100 text-pink-700 font-mono uppercase">
                                          🍬 Golosinas L3
                                        </span>
                                      )}
                                      {usr.role === "supervisor_bebidas" && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 border border-blue-100 text-blue-700 font-mono uppercase">
                                          🥤 Bebidas L3
                                        </span>
                                      )}
                                      {usr.role === "supervisor_elaborados" && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-teal-50 border border-teal-100 text-teal-700 font-mono uppercase">
                                          🥪 Elaborados L3
                                        </span>
                                      )}
                                      {usr.role === "owner" && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-indigo-50 border border-indigo-100 text-indigo-700 font-mono uppercase">
                                          👑 Co-Admin L1
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-3 font-mono font-bold text-slate-700 text-xs">
                                      {usr.customCode || "SIN CLAVE"}
                                    </td>
                                    <td className="p-3 text-right">
                                      <button
                                        onClick={() => handleRemoveEmail(cleanEmail)}
                                        className="p-1.5 hover:bg-rose-50 border border-transparent hover:border-rose-100 text-slate-400 hover:text-rose-600 rounded-lg transition-all cursor-pointer"
                                        title={`Revocar acceso para ${usr.name}`}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}

                              {usersList.filter(u => u.email.trim().toLowerCase() !== MASTER_ADMIN_EMAIL.toLowerCase()).length === 0 && (
                                <tr>
                                  <td colSpan={4} className="p-6 text-center text-[11px] text-slate-400 font-medium">
                                    No hay otros colaboradores delegados con claves registradas actualmente.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50/50 p-8 rounded-2xl border border-slate-100 shadow-inner text-center max-w-md mx-auto space-y-4">
                      <div className="p-3.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-full w-fit mx-auto">
                        <Lock className="w-6 h-6 animate-pulse" />
                      </div>
                      <h3 className="font-display font-bold text-sm text-slate-800">Sección de Administración Limitada</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Tenés acceso a la plataforma de <strong>Smart Commerce</strong> como usuario colaborador autorizado, pero la edición de la lista de permisos está reservada exclusivamente para la administradora principal (<strong>Noemi</strong>).
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "ayuda" && (
                <motion.div
                  key="ayuda-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                >
                  <HelpCenter userEmail={user?.email} />
                </motion.div>
              )}

              {activeTab === "config" && adminUnlocked && (
                <motion.div
                  key="config-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                    <div>
                      <h2 className="font-display font-bold text-lg text-slate-800 tracking-tight">Configuración del Sistema</h2>
                      <p className="text-xs text-slate-400 mt-0.5">Asignación de créditos de Inteligencia Artificial (Gemini) y Multi-empresa</p>
                    </div>

                    <div className="p-4 bg-indigo-50 border border-indigo-100/50 rounded-xl flex items-start gap-3">
                      <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm shrink-0">
                        <Sparkles className="w-5 h-5 animate-pulse" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-indigo-900">¿Cómo funciona el consumo de créditos de Gemini en otros dispositivos?</h4>
                        <p className="text-[11px] text-indigo-700 leading-relaxed">
                          Por defecto, todas las consultas que hacés con Martín consumen los créditos generales del servidor de la aplicación (la cuenta asociada a Noemi).
                          Para evitar que otros comercios o usuarios consuman tus créditos personales, **cada dispositivo o mini-empresa puede configurar su propia clave API de Gemini aquí mismo**. 
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Tu Clave de API de Gemini (Opcional)</label>
                        <input
                          type="password"
                          value={customApiKey}
                          onChange={(e) => setCustomApiKey(e.target.value)}
                          placeholder="AIzaSy..."
                          className="w-full max-w-xl px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                        />
                        <p className="text-[10px] text-slate-400 mt-2 leading-normal">
                          Podés conseguir tu propia clave de forma **100% gratuita** ingresando a <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-indigo-600 font-semibold underline">Google AI Studio</a> con cualquier cuenta de Google. Una vez guardada, Martín enviará las consultas de este dispositivo usando esa clave, consumiendo la cuota propia del dispositivo o de la cuenta correspondiente.
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            localStorage.setItem("user_gemini_api_key", customApiKey);
                            setApiKeySuccess("¡Clave guardada con éxito! Este dispositivo ya está configurado para consumir tus créditos asignados.");
                            setTimeout(() => setApiKeySuccess(null), 5000);
                          }}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/15 cursor-pointer"
                        >
                          Guardar Clave
                        </button>
                        {localStorage.getItem("user_gemini_api_key") && (
                          <button
                            onClick={() => {
                              localStorage.removeItem("user_gemini_api_key");
                              setCustomApiKey("");
                              setApiKeySuccess("Se eliminó la clave. Este dispositivo volverá a consumir los créditos compartidos del sistema.");
                              setTimeout(() => setApiKeySuccess(null), 5000);
                            }}
                            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 text-xs font-bold rounded-xl transition-all cursor-pointer"
                          >
                            Eliminar Clave
                          </button>
                        )}
                      </div>

                      {apiKeySuccess && (
                        <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-xs font-medium">
                          {apiKeySuccess}
                        </div>
                      )}
                    </div>

                    <hr className="border-slate-100" />

                    <div className="space-y-3">
                      <h3 className="font-display font-bold text-xs text-slate-800 uppercase tracking-wider">Estructura Multi-empresa (Mini-empresas)</h3>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Dado que la plataforma trabaja de forma integrada con <strong>Google Drive</strong> y <strong>Google Sheets</strong>, cuando cada mini-empresa o usuario colaborador inicie sesión con su propia cuenta de Google, la aplicación automáticamente leerá y escribirá los datos de su propio Google Drive (en la carpeta <strong>"Martin Sistema"</strong>). Esto garantiza una separación física y segura de la información entre empresas sin que se mezclen sus datos.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                          <h4 className="text-xs font-bold text-slate-700">Privacidad Absoluta</h4>
                          <p className="text-[10px] text-slate-400 leading-normal">Los datos de una empresa son inaccesibles para otras cuentas porque se alojan directamente en el espacio de almacenamiento de Google del propio usuario.</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                          <h4 className="text-xs font-bold text-slate-700">Sin Gastos Centralizados</h4>
                          <p className="text-[10px] text-slate-400 leading-normal">Al configurar claves de API individuales por sucursal o comercio, evitás los costos de procesamiento concentrados en una única cuenta.</p>
                        </div>
                      </div>
                    </div>

                    <hr className="border-slate-100" />

                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
                          <Lock className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-xs text-slate-800 uppercase tracking-wider">Clave Secreta de Administración (PIN)</h3>
                          <p className="text-[10px] text-slate-400 mt-0.5">Define la clave con la que proteges la configuración y archivos sensibles</p>
                        </div>
                      </div>
                      
                      <p className="text-[11px] text-slate-500 leading-relaxed max-w-2xl">
                        Esta clave protege tus archivos de Google Drive, tu API Key privada y tu panel de permisos de usuarios por si tu cuenta de Google queda abierta en un dispositivo ajeno. 
                      </p>
                      
                      <div className="flex flex-col sm:flex-row gap-3 items-end max-w-xl">
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">Clave de Seguridad Actual/Nueva</label>
                          <input
                            type="text"
                            value={tempAdminSecretKey}
                            onChange={(e) => setTempAdminSecretKey(e.target.value)}
                            placeholder="••••"
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:border-indigo-500 focus:outline-none placeholder:text-slate-400 font-mono"
                          />
                        </div>
                        <button
                          onClick={() => {
                            if (!tempAdminSecretKey.trim()) return;
                            localStorage.setItem("admin_secret_key", tempAdminSecretKey.trim());
                            setAdminSecretKey(tempAdminSecretKey.trim());
                            alert(`¡Clave de administración actualizada con éxito! A partir de ahora, la clave secreta requerida es "${tempAdminSecretKey.trim()}".`);
                          }}
                          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-rose-600/15 cursor-pointer whitespace-nowrap"
                        >
                          Actualizar PIN / Clave
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Panel de Limpieza Profunda y Mantenimiento de Base de Datos */}
                  <DatabaseCleanManager googleToken={googleToken} />
                </motion.div>
              )}

              {activeTab === "chat_martin" && (
                <motion.div
                  key="chat-martin-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="w-full h-full flex-1 bg-slate-50 md:bg-white rounded-none md:rounded-2xl border-none md:border border-slate-100 shadow-none md:shadow-sm overflow-hidden flex flex-col min-h-0"
                >
                  <div className="flex-1 p-0 md:p-3 flex flex-col overflow-hidden h-full min-h-0">
                    <MartinChat 
                      googleToken={googleToken} 
                      isFullPage={true} 
                      onBack={() => setActiveTab("inicio")} 
                      userRole={userRole}
                      userDisplayName={accessCodeUser?.name || user?.displayName || user?.email?.split("@")[0] || (isOperarioUser ? "Operario de Local" : "Noemí Carvallo")}
                    />
                  </div>
                </motion.div>
              )}

              {activeTab === "inventario_whatsapp" && (
                <motion.div
                  key="inventario-whatsapp-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="w-full bg-slate-50 md:bg-white rounded-none md:rounded-2xl border-none md:border border-slate-100 shadow-none md:shadow-sm flex flex-col p-0 md:p-6"
                >
                  <WhatsAppVoiceInventory 
                    userDisplayName={accessCodeUser?.name || user?.displayName || user?.email?.split("@")[0] || "Empleado/a"} 
                  />
                </motion.div>
              )}

              {activeTab === "venta_privada" && (
                <motion.div
                  key="venta-privada-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="w-full bg-slate-50 md:bg-white rounded-none md:rounded-2xl border-none md:border border-slate-100 shadow-none md:shadow-sm flex flex-col p-0 md:p-6"
                >
                  <VoiceDemoModule customApiKey={customApiKey} />
                </motion.div>
              )}

              {activeTab === "alertas_llamadas" && (
                <motion.div
                  key="alertas-llamadas-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="w-full bg-slate-50 md:bg-white rounded-none md:rounded-2xl border-none md:border border-slate-100 shadow-none md:shadow-sm flex flex-col p-0 md:p-6"
                >
                  <MartinCallAlertsModule 
                    userDisplayName={accessCodeUser?.name || user?.displayName || user?.email?.split("@")[0] || "Noemí Carvallo"}
                    googleToken={googleToken}
                    onOpenChatWithMartin={(prompt) => {
                      setActiveTab("chat_martin");
                    }}
                  />
                </motion.div>
              )}

              {activeTab === "notificaciones_push" && (
                <motion.div
                  key="notificaciones-push-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="w-full bg-slate-50 md:bg-white rounded-none md:rounded-2xl border-none md:border border-slate-100 shadow-none md:shadow-sm flex flex-col p-0 md:p-6"
                >
                  <PushNotificationManager 
                    userDisplayName={accessCodeUser?.name || user?.displayName || user?.email?.split("@")[0] || "Noemí Carvallo"}
                    onNavigateToTab={(tab) => setActiveTab(tab)}
                  />
                </motion.div>
              )}

              {/* Other tabs support graceful empty/instructions states */}
              {!["inicio", "chat_martin", "inventario_whatsapp", "drive", "usuarios", "ayuda", "config", "resumen", "ventas", "rentabilidad", "stock", "logistica", "compras", "caja", "clientes", "reportes", "alertas", "venta_privada", "alertas_llamadas", "notificaciones_push"].includes(activeTab) && (
                <motion.div
                  key="fallback-tab"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-8 text-center bg-white rounded-2xl border border-slate-100 shadow-sm max-w-xl mx-auto my-12 flex flex-col items-center space-y-4"
                >
                  <div className="p-4 bg-indigo-50 text-indigo-600 rounded-full">
                    <Bot className="w-10 h-10 animate-bounce" />
                  </div>
                  <h3 className="font-display font-bold text-base text-slate-800 capitalize">
                    Módulo de {activeTab}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                    Las métricas de este módulo están consolidadas en el panel de **Inicio** y son leídas por el analista Martín en su reporte. Podés simular y subir nuevos reportes de este tipo en la pestaña de <strong className="text-indigo-600">Martin Sistema (Drive)</strong>.
                  </p>
                  <button
                    onClick={() => setActiveTab("inicio")}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-all shadow-md cursor-pointer"
                  >
                    Regresar al Inicio
                  </button>
                </motion.div>
              )}

              {/* Comprehensive Simulated Interactive Dashboard Tabs */}
              {["resumen", "ventas", "rentabilidad", "stock", "logistica", "infraestructura", "compras", "caja", "clientes", "reportes", "alertas"].includes(activeTab) && (
                <motion.div
                  key="dashboard-subtabs"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                >
                  <DashboardTabs 
                    activeTab={activeTab} 
                    setActiveTab={setActiveTab} 
                    userRole={userRole}
                    userDisplayName={accessCodeUser?.name || user?.displayName || user?.email || "Noemí Carvallo"}
                  />
                </motion.div>
              )}
            </AnimatePresence>

          </main>

          {/* Right Column: Collapsible Martín AI Chat assistant panel */}
          <AnimatePresence>
            {showAIChat && activeTab !== "chat_martin" && (
              <motion.aside
                id="ai-assistant-aside"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 440, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="hidden xl:flex w-[440px] border-l border-slate-150 h-full flex-col shrink-0 bg-slate-50"
              >
                <div className="h-full p-2 flex flex-col">
                  <MartinChat 
                    googleToken={googleToken} 
                    isFullPage={true} 
                    onBack={() => setShowAIChat(false)} 
                    userRole={userRole}
                    userDisplayName={accessCodeUser?.name || user?.displayName || user?.email?.split("@")[0] || (isOperarioUser ? "Operario de Local" : "Noemí Carvallo")}
                  />
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Dynamic Event Reminders Modal */}
          <AnimatePresence>
            {showRemindersModal && calendarReminders.length > 0 && (
              <div id="noemi-reminders-modal" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="bg-[#0b132a] border border-indigo-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden"
                >
                  {/* Background gradient glow */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-rose-500/5 rounded-full blur-3xl -z-10" />

                  <div className="flex items-center gap-2.5 pb-4 border-b border-indigo-500/20">
                    <div className="p-2 bg-indigo-600/15 rounded-xl border border-indigo-500/30 text-indigo-400">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white font-sans leading-tight">Agenda de Noemí</h4>
                      <p className="text-[10px] text-indigo-300 font-mono">Alertas de Compromisos</p>
                    </div>
                    <button 
                      onClick={() => {
                        setShowRemindersModal(false);
                        sessionStorage.setItem("reminders_dismissed", "true");
                      }}
                      className="absolute top-5 right-5 p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                      title="Cerrar recordatorios"
                    >
                      <X className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>

                  <div className="my-4 space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      ¡Hola Noemí! Martín consolidó tu agenda de control. Aquí tenés los recordatorios importantes:
                    </p>

                    <div className="space-y-2.5">
                      {calendarReminders.map((rem: any) => {
                        let cardBorder = "border-slate-800 bg-slate-950/40";
                        let badgeColor = "bg-slate-800 text-slate-400";
                        let prefixText = "";
                        let emoji = "📌";

                        if (rem.isToday) {
                          prefixText = "Hoy tenés agendado:";
                          if (rem.type === "cumpleaños") {
                            cardBorder = "border-rose-500/30 bg-rose-950/20 text-rose-100";
                            badgeColor = "bg-rose-500 text-white";
                            emoji = "🎂 ¡Cumpleaños!";
                          } else if (rem.type === "medico") {
                            cardBorder = "border-sky-500/30 bg-sky-950/20 text-sky-100";
                            badgeColor = "bg-sky-500 text-white";
                            emoji = "🩺 Cita Médica";
                          } else if (rem.type === "empresario") {
                            cardBorder = "border-emerald-500/30 bg-emerald-950/20 text-emerald-100";
                            badgeColor = "bg-emerald-500 text-white";
                            emoji = "💼 Negocios";
                          } else {
                            cardBorder = "border-indigo-500/30 bg-indigo-950/20 text-indigo-100";
                            badgeColor = "bg-indigo-500 text-white";
                            emoji = "📌 Recordatorio";
                          }
                        } else {
                          prefixText = "Recuerda que mañana tenés agendado:";
                          cardBorder = "border-amber-500/20 bg-amber-950/10 text-amber-100";
                          badgeColor = "bg-amber-600/30 text-amber-200 border border-amber-500/20";
                          
                          if (rem.type === "cumpleaños") emoji = "🎂 Cumpleaños";
                          else if (rem.type === "medico") emoji = "🩺 Cita Médica";
                          else if (rem.type === "empresario") emoji = "💼 Negocios";
                          else emoji = "📌 Recordatorio";
                        }

                        return (
                          <div key={rem.id} className={`p-3.5 border rounded-xl space-y-1.5 transition-all text-left ${cardBorder}`}>
                            <div className="flex items-center justify-between">
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${badgeColor}`}>
                                {rem.isToday ? "HOY" : "MAÑANA"}
                              </span>
                              <span className="text-[9.5px] font-semibold text-indigo-300 font-mono flex items-center gap-1">
                                {emoji}
                              </span>
                            </div>
                            <h5 className="text-[12px] font-bold leading-snug">
                              {rem.title}
                            </h5>
                            {rem.description && (
                              <p className="text-[10px] text-slate-400 leading-normal font-sans">
                                {rem.description}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => {
                        setShowRemindersModal(false);
                        sessionStorage.setItem("reminders_dismissed", "true");
                      }}
                      className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
                    >
                      Entendido, gracias Martín
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
