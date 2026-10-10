import React from "react";
import {
  Calendar,
  Send,
  PhoneCall,
  Trash2
} from "lucide-react";
import { AppointmentSchedule } from "../types";

interface MartinAppointmentsSectionProps {
  appointments: AppointmentSchedule[];
  handleStartOutgoingCall: (phone?: string, name?: string) => void;
  setActiveSection: (section: "prospeccion" | "marcador" | "citas" | "auditorias") => void;
  onDeleteAppointment?: (id: string) => void;
}

export const MartinAppointmentsSection: React.FC<MartinAppointmentsSectionProps> = ({
  appointments,
  handleStartOutgoingCall,
  setActiveSection,
  onDeleteAppointment
}) => {
  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-md space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              Agenda de Citas Comerciales Agendadas por Martín
            </h2>
            <p className="text-xs text-slate-500">
              Reuniones de 10 a 15 minutos pactadas con dueños y encargados de tiendas e-commerce.
            </p>
          </div>
        </div>
        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-mono font-bold rounded-full">
          {appointments.length} Citas Pendientes
        </span>
      </div>

      {appointments.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
          <p className="text-sm font-extrabold text-slate-700">No hay reuniones agendadas aún.</p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Andá a la pestaña de "Prospección Web" y tocá "Agendar" en cualquiera de las tiendas e-commerce para fijar día y hora cuando un cliente confirme.
          </p>
          <button
            type="button"
            onClick={() => setActiveSection("prospeccion")}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-all"
          >
            Ir a Prospección Web E-Commerce
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {appointments.map((apt) => (
            <div
              key={apt.id}
              className="p-5 bg-gradient-to-br from-slate-50 to-indigo-50/40 rounded-3xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-indigo-600 text-white rounded-xl text-xs font-bold font-mono">
                    {apt.date}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      Confirmada
                    </span>
                    {onDeleteAppointment && (
                      <button
                        type="button"
                        onClick={() => onDeleteAppointment(apt.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar cita"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-extrabold text-slate-900">{apt.prospectName}</h4>
                  <p className="text-xs font-mono text-slate-600 font-bold">{apt.phone}</p>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-1 text-xs">
                  <p className="text-slate-500 font-semibold">
                    <strong className="text-slate-800">Servicio:</strong> {apt.service}
                  </p>
                  <p className="text-slate-600">
                    <strong className="text-slate-800">Notas:</strong> {apt.notes}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const clean = apt.phone.replace(/[^0-9]/g, "");
                    const text = encodeURIComponent(`Hola ${apt.prospectName}, te recuerdo la reunión programada con Martín de Logística X para el día ${apt.date}.`);
                    window.open(`https://api.whatsapp.com/send?phone=${clean}&text=${text}`, "_blank");
                  }}
                  className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Recordar por WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleStartOutgoingCall(apt.phone, apt.prospectName)}
                  className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow transition-all cursor-pointer"
                  title="Llamar a la Cita"
                >
                  <PhoneCall className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
