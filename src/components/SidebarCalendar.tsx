import React, { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Calendar, 
  Clock, 
  User, 
  Briefcase, 
  HeartPulse, 
  Bell, 
  X
} from "lucide-react";
import { CalendarEvent } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface SidebarCalendarProps {
  onEventsUpdated?: () => void;
}

export default function SidebarCalendar({ onEventsUpdated }: SidebarCalendarProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 6, 12)); // July 12, 2026
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 6, 12));
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showEventCreator, setShowEventCreator] = useState<boolean>(false);
  
  // Form states
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<"cumpleaños" | "medico" | "empresario" | "otro">("empresario");
  const [newDesc, setNewDesc] = useState("");

  // Load events
  useEffect(() => {
    const stored = localStorage.getItem("noemi_calendar_events");
    if (stored) {
      setEvents(JSON.parse(stored));
    } else {
      setEvents([]);
    }
  }, []);

  const saveEvents = (updated: CalendarEvent[]) => {
    localStorage.setItem("noemi_calendar_events", JSON.stringify(updated));
    setEvents(updated);
    // Dispatch custom event to notify App.tsx to check for popups immediately
    window.dispatchEvent(new CustomEvent("calendar-events-updated"));
    if (onEventsUpdated) onEventsUpdated();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Helper calculations for calendar grid
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday, 1 is Monday...
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Convert month to name
  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const handleDayClick = (dayNum: number) => {
    setSelectedDate(new Date(year, month, dayNum));
    setShowEventCreator(false);
  };

  const formattedSelectedDate = `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${selectedDate.getDate().toString().padStart(2, "0")}`;

  const selectedDayEvents = events.filter(e => e.date === formattedSelectedDate);

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newEvent: CalendarEvent = {
      id: `event-${Date.now()}`,
      date: formattedSelectedDate,
      title: newTitle.trim(),
      type: newType,
      description: newDesc.trim() || undefined
    };

    const updated = [...events, newEvent];
    saveEvents(updated);

    // Reset Form
    setNewTitle("");
    setNewDesc("");
    setNewType("empresario");
    setShowEventCreator(false);
  };

  const handleDeleteEvent = (id: string) => {
    const updated = events.filter(e => e.id !== id);
    saveEvents(updated);
  };

  // Check if a specific date string has events
  const getDayEventDots = (dayNum: number) => {
    const dateStr = `${year}-${(month + 1).toString().padStart(2, "0")}-${dayNum.toString().padStart(2, "0")}`;
    const dayEvents = events.filter(e => e.date === dateStr);
    
    return dayEvents.map((e, idx) => {
      let color = "bg-slate-400";
      if (e.type === "cumpleaños") color = "bg-rose-400";
      if (e.type === "medico") color = "bg-sky-400";
      if (e.type === "empresario") color = "bg-emerald-400";
      if (e.type === "otro") color = "bg-amber-400";
      
      return (
        <span 
          key={idx} 
          className={`w-1.5 h-1.5 rounded-full ${color}`} 
          title={`${e.type.toUpperCase()}: ${e.title}`}
        />
      );
    });
  };

  // Grid list of blanks & days
  const calendarCells = [];
  // Adjusted offset for Monday-first calendar representation
  // in JS, getDay() returns 0 for Sunday, 1 for Monday.
  const offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  for (let i = 0; i < offset; i++) {
    calendarCells.push(<div key={`blank-${i}`} className="h-7 w-7" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
    const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;

    calendarCells.push(
      <button
        key={`day-${day}`}
        onClick={() => handleDayClick(day)}
        className={`h-7 w-7 rounded-lg text-[11px] font-semibold flex flex-col items-center justify-center transition-all relative ${
          isSelected 
            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" 
            : isToday 
              ? "bg-slate-800 border border-indigo-500/40 text-indigo-400" 
              : "hover:bg-slate-800/40 text-slate-300"
        }`}
      >
        <span>{day}</span>
        {/* Event dots container */}
        <div className="absolute bottom-0.5 flex gap-0.5 justify-center w-full">
          {getDayEventDots(day).slice(0, 3)}
        </div>
      </button>
    );
  }

  return (
    <div className="px-3 py-4 border-t border-[#1e293b]/40 bg-[#070d1e] flex flex-col gap-3">
      {/* Mini Calendar Header */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 font-sans">
          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
          Calendario Noemí
        </span>
        <div className="flex items-center gap-1.5">
          <button 
            onClick={handlePrevMonth}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10.5px] font-bold text-white font-mono min-w-[70px] text-center">
            {monthNames[month]} '{year.toString().substring(2)}
          </span>
          <button 
            onClick={handleNextMonth}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Week Header */}
      <div className="grid grid-cols-7 text-center text-[9px] font-bold text-slate-500 font-mono uppercase">
        <span>Lu</span><span>Ma</span><span>Mi</span><span>Ju</span><span>Vi</span><span>Sá</span><span>Do</span>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-y-1 justify-items-center">
        {calendarCells}
      </div>

      {/* Events detail list for selected date */}
      <div className="mt-1 bg-[#0d1527] border border-[#1e293b]/30 p-2.5 rounded-xl space-y-2">
        <div className="flex items-center justify-between border-b border-[#1e293b]/40 pb-1.5">
          <span className="text-[10px] font-bold text-indigo-300 font-mono">
            {selectedDate.toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
          </span>
          <button
            onClick={() => setShowEventCreator(!showEventCreator)}
            className="text-[9px] font-bold px-1.5 py-0.5 bg-indigo-950 text-indigo-300 border border-indigo-500/20 rounded hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-0.5"
          >
            <Plus className="w-2.5 h-2.5" />
            <span>Agregar</span>
          </button>
        </div>

        {/* Inline Event Creator */}
        {showEventCreator && (
          <form onSubmit={handleAddEvent} className="space-y-2 pt-1 border-b border-[#1e293b]/30 pb-2.5">
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Ej: Cita Dr. Perez"
              className="w-full px-2 py-1 bg-slate-900 border border-[#1e293b] text-[10.5px] text-white rounded focus:outline-none focus:border-indigo-500"
            />
            
            <div className="flex gap-1">
              {(["cumpleaños", "medico", "empresario", "otro"] as const).map(type => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setNewType(type)}
                  className={`flex-1 py-0.5 text-[8.5px] font-bold rounded capitalize border transition-all ${
                    newType === type 
                      ? "bg-indigo-600 border-indigo-500 text-white" 
                      : "bg-slate-900 border-[#1e293b] text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {type === "cumpleaños" ? "🎂" : type === "medico" ? "🩺" : type === "empresario" ? "💼" : "📌"}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Descripción (opcional)"
              className="w-full px-2 py-1 bg-slate-900 border border-[#1e293b] text-[10px] text-slate-400 rounded focus:outline-none focus:border-indigo-500"
            />

            <div className="flex gap-1.5 justify-end">
              <button
                type="button"
                onClick={() => setShowEventCreator(false)}
                className="px-2 py-0.5 text-[9px] font-bold text-slate-400 bg-transparent hover:text-slate-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-2.5 py-0.5 text-[9px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-all"
              >
                Guardar
              </button>
            </div>
          </form>
        )}

        {/* Selected Day Events List */}
        <div className="space-y-1.5 max-h-28 overflow-y-auto pr-0.5">
          {selectedDayEvents.length === 0 ? (
            <p className="text-[10px] text-slate-500 italic py-1">No hay eventos guardados.</p>
          ) : (
            selectedDayEvents.map(event => {
              let badgeColor = "border-slate-500 bg-slate-950 text-slate-400";
              let typeEmoji = "📌";
              
              if (event.type === "cumpleaños") {
                badgeColor = "border-rose-500/20 bg-rose-950/20 text-rose-300";
                typeEmoji = "🎂";
              } else if (event.type === "medico") {
                badgeColor = "border-sky-500/20 bg-sky-950/20 text-sky-300";
                typeEmoji = "🩺";
              } else if (event.type === "empresario") {
                badgeColor = "border-emerald-500/20 bg-emerald-950/20 text-emerald-300";
                typeEmoji = "💼";
              }
              
              return (
                <div key={event.id} className={`p-1.5 border rounded-lg flex items-start justify-between gap-1.5 transition-all hover:bg-slate-900/30 ${badgeColor}`}>
                  <div className="min-w-0">
                    <h5 className="text-[10px] font-bold leading-tight truncate flex items-center gap-1">
                      <span>{typeEmoji}</span>
                      <span className="truncate">{event.title}</span>
                    </h5>
                    {event.description && (
                      <p className="text-[9px] text-slate-400 leading-normal mt-0.5 break-words font-sans">
                        {event.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 rounded hover:bg-rose-500/10 transition-colors shrink-0"
                    title="Eliminar evento"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
