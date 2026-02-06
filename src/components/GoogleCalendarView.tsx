// src/components/GoogleCalendarView.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  User,
  Stethoscope,
} from "lucide-react";
import { format, addWeeks, subWeeks, startOfWeek, addDays, isSameDay } from "date-fns";
import { es } from "date-fns/locale";

interface Appointment {
  id: string;
  time: string;
  patient: string;
  patientId: string;
  dentist: string;
  dentistId: string;
  treatment: string;
  duration: string;
  status: "confirmed" | "pending" | "completed" | "cancelled" | "reprogramed" | "confirmada" | "pendiente" | "completada" | "cancelada" | "reprogramada";
  date: Date;
  notes?: string;
  color: string;
}

interface GoogleCalendarViewProps {
  appointments: Appointment[];
  onSlotClick: (date: Date, time: string) => void;
  onNewAppointment: () => void;
  onAppointmentClick: (appointment: Appointment) => void;
}

// ══════════ COLORES POR ESTADO ══════════
const STATUS_COLORS: Record<string, string> = {
  // Español
  pendiente: "rgb(245, 158, 11)",   // Ámbar/Naranja (color principal)
  confirmada: "#10B981",             // Verde
  completada: "#6B7280",             // Gris
  cancelada: "#EF4444",              // Rojo (no se muestra en calendario, pero por si acaso)
  reprogramada: "#F97316",           // Naranja
  // Inglés
  pending: "rgb(245, 158, 11)",
  confirmed: "#10B981",
  completed: "#6B7280",
  cancelled: "#EF4444",
  reprogramed: "#F97316",
};

// Color por defecto (pendiente)
const DEFAULT_COLOR = "rgb(245, 158, 11)";

// Obtener color según estado de la cita
const getStatusColor = (status: string): string => {
  return STATUS_COLORS[status.toLowerCase()] || DEFAULT_COLOR;
};

// Mapeo de estado a label en español
const STATUS_LABELS: Record<string, string> = {
  confirmed: "Confirmada",
  pending: "Pendiente",
  completed: "Completada",
  cancelled: "Cancelada",
  reprogramed: "Reprogramada",
  confirmada: "Confirmada",
  pendiente: "Pendiente",
  completada: "Completada",
  cancelada: "Cancelada",
  reprogramada: "Reprogramada",
};

export default function GoogleCalendarView({
  appointments,
  onSlotClick,
  onNewAppointment,
  onAppointmentClick
}: GoogleCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState("week");
  const [hoveredAppointmentId, setHoveredAppointmentId] = useState<string | null>(null);

  // ══════════ FILTRAR CITAS CANCELADAS ══════════
  // Las citas canceladas NO se muestran en el calendario
  const visibleAppointments = appointments.filter(apt => {
    const status = apt.status.toLowerCase();
    return status !== "cancelada" && status !== "cancelled";
  });

  // Generar horas de 7 AM a 8 PM
  const generateHours = () => {
    const hours = [];
    for (let i = 7; i <= 20; i++) {
      const period = i >= 12 ? 'PM' : 'AM';
      const displayHour = i > 12 ? i - 12 : i;
      hours.push({
        value: i,
        label: `${displayHour} ${period}`,
        time: `${i.toString().padStart(2, '0')}:00`
      });
    }
    return hours;
  };

  const hours = generateHours();

  // Obtener días de la semana
  const getWeekDays = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const weekDays = getWeekDays();

  // Formatear rango de fechas
  const getDateRange = () => {
    const start = weekDays[0];
    const end = weekDays[6];
    if (start.getMonth() === end.getMonth()) {
      return format(start, "MMMM yyyy", { locale: es });
    }
    return `${format(start, "MMM", { locale: es })} – ${format(end, "MMM yyyy", { locale: es })}`;
  };

  // Navegación
  const goToPreviousWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const goToNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const isToday = (date: Date) => isSameDay(date, new Date());

  // Obtener citas para un slot horario específico (max 4)
  const getAppointmentsForSlot = (date: Date, time: string): Appointment[] => {
    const slotHour = parseInt(time.split(':')[0]);
    const slotAppointments = visibleAppointments.filter(apt => {
      if (!isSameDay(apt.date, date)) return false;
      const aptHour = parseInt(apt.time.split(':')[0]);
      return aptHour === slotHour;
    });
    return slotAppointments
      .sort((a, b) => {
        const minA = parseInt(a.time.split(':')[1] || '0');
        const minB = parseInt(b.time.split(':')[1] || '0');
        return minA - minB;
      })
      .slice(0, 4);
  };

  // Calcular altura del evento basado en duración real
  // Cada hora = 144px → cada minuto = 2.4px
  const getEventHeight = (duration: string): number => {
    const minutes = parseInt(duration);
    return Math.max((minutes / 60) * 144, 18);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* ══════════ HEADER / TOOLBAR ══════════ */}
      <div className="flex-shrink-0 border-b bg-card px-4 py-3 lg:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday} className="font-medium">
              Hoy
            </Button>
            <div className="flex items-center">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToPreviousWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToNextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <h2 className="text-lg font-semibold capitalize text-foreground ml-2">
              {getDateRange()}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Select value={viewType} onValueChange={setViewType}>
              <SelectTrigger className="w-[130px] h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Semana</SelectItem>
                <SelectItem value="day">Día</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={onNewAppointment} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nueva Cita</span>
            </Button>
          </div>
        </div>

        {/* ══════════ LEYENDA DE ESTADOS ══════════ */}
        <div className="flex items-center gap-4 mt-2 pt-2 border-t border-border/50">
          {[
            { label: "Pendiente", color: "rgb(245, 158, 11)" },
            { label: "Confirmada", color: "#10B981" },
            { label: "Completada", color: "#6B7280" },
            { label: "Reprogramada", color: "#F97316" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[11px] text-muted-foreground font-medium">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════ CALENDAR GRID ══════════ */}
      <div className="flex-1 min-h-0 overflow-auto">
        <div className="min-w-[800px]">
          {/* Encabezado de días */}
          <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b bg-card sticky top-0 z-10">
            <div className="p-3 border-r" />
            {weekDays.map((day, index) => {
              const dayName = format(day, "EEE", { locale: es }).toUpperCase();
              const dayNumber = format(day, "d");
              const todayClass = isToday(day) ? "text-primary" : "text-foreground";

              return (
                <div key={index} className="p-4 text-center border-r last:border-r-0">
                  <div className="text-xs font-medium text-muted-foreground mb-1">
                    {dayName}
                  </div>
                  <div className={`text-2xl font-normal ${todayClass}`}>
                    {isToday(day) ? (
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground">
                        {dayNumber}
                      </span>
                    ) : (
                      dayNumber
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ══════════ FILAS DE HORAS ══════════ */}
          <div className="relative">
            {hours.map((hour, hourIndex) => (
              <div
                key={hourIndex}
                className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-border/50"
                style={{ height: '144px' }}
              >
                {/* Label de hora */}
                <div className="text-right pr-4 pt-1 text-xs text-muted-foreground border-r">
                  {hour.label}
                </div>

                {/* Celdas de cada día */}
                {weekDays.map((day, dayIndex) => {
                  const slotAppointments = getAppointmentsForSlot(day, hour.time);

                  return (
                    <div
                      key={dayIndex}
                      className="border-r last:border-r-0 relative hover:bg-accent/30 cursor-pointer transition-colors"
                      onClick={() => onSlotClick(day, hour.time)}
                    >
                      {/* ══════════ 4 COLUMNAS INVISIBLES ══════════ */}
                      <div className="absolute inset-0 flex">
                        {[0, 1, 2, 3].map((colIndex) => {
                          const apt = slotAppointments[colIndex] || null;
                          const isHovered = apt !== null && hoveredAppointmentId === apt.id;
                          const aptColor = apt ? getStatusColor(apt.status) : DEFAULT_COLOR;

                          return (
                            <div
                              key={colIndex}
                              className="relative"
                              style={{ width: '25%' }}
                            >
                              {apt && (
                                <div
                                  onMouseEnter={() => setHoveredAppointmentId(apt.id)}
                                  onMouseLeave={() => setHoveredAppointmentId(null)}
                                  className="absolute left-[2px] right-[2px]"
                                  style={{
                                    top: `${(parseInt(apt.time.split(':')[1] || '0') * 2.4) + 2}px`,
                                  }}
                                >
                                  {/* ══════ BLOQUE DE CITA — color según estado ══════ */}
                                  <div
                                    className="rounded-md cursor-pointer transition-all duration-200"
                                    style={{
                                      height: `${getEventHeight(apt.duration)}px`,
                                      backgroundColor: aptColor,
                                      opacity: isHovered ? 1 : 0.8,
                                      boxShadow: isHovered
                                        ? `0 6px 20px -4px ${aptColor}80`
                                        : `0 1px 3px ${aptColor}25`,
                                      transform: isHovered ? 'scaleX(1.08)' : 'scaleX(1)',
                                      zIndex: isHovered ? 40 : 1,
                                      position: 'relative',
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onAppointmentClick(apt);
                                    }}
                                  />

                                  {/* ══════ TOOLTIP EN HOVER ══════ */}
                                  {isHovered && (
                                    <div
                                      className="absolute z-50 pointer-events-none"
                                      style={{
                                        bottom: `${getEventHeight(apt.duration) + 8}px`,
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                      }}
                                    >
                                      <div
                                        className="bg-popover text-popover-foreground border border-border rounded-lg shadow-xl p-3 relative"
                                        style={{ width: '230px' }}
                                      >
                                        {/* Flecha inferior */}
                                        <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 bg-popover border-r border-b border-border" />

                                        {/* Nombre del paciente */}
                                        <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-border/60">
                                          <div
                                            className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                                            style={{ backgroundColor: `${aptColor}1A` }}
                                          >
                                            <User className="h-3.5 w-3.5" style={{ color: aptColor }} />
                                          </div>
                                          <p className="font-semibold text-sm text-foreground truncate leading-tight">
                                            {apt.patient}
                                          </p>
                                        </div>

                                        {/* Consulta / Tratamiento */}
                                        <div className="flex items-start gap-2 mb-2">
                                          <Stethoscope
                                            className="h-3.5 w-3.5 mt-0.5 flex-shrink-0"
                                            style={{ color: aptColor }}
                                          />
                                          <div className="min-w-0">
                                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold leading-tight">
                                              Consulta / Tratamiento
                                            </p>
                                            <p className="text-xs font-medium text-foreground truncate mt-0.5">
                                              {apt.treatment}
                                            </p>
                                          </div>
                                        </div>

                                        {/* Estado + Hora */}
                                        <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                          <div className="flex items-center gap-1.5">
                                            <div
                                              className="w-2 h-2 rounded-full"
                                              style={{ backgroundColor: aptColor }}
                                            />
                                            <span className="text-[11px] font-semibold" style={{ color: aptColor }}>
                                              {STATUS_LABELS[apt.status] || apt.status}
                                            </span>
                                          </div>
                                          <span className="text-[11px] text-muted-foreground font-medium">
                                            {apt.time} · {apt.duration}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}