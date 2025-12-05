import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Settings,
  HelpCircle,
  Plus,
  Calendar as CalendarIcon
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
  status: "confirmed" | "pending" | "completed";
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

export default function GoogleCalendarView({
  appointments,
  onSlotClick,
  onNewAppointment,
  onAppointmentClick
}: GoogleCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState("week");

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
  const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Cambia de 0 a 1
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

  // Verificar si es hoy
  const isToday = (date: Date) => isSameDay(date, new Date());

  // Obtener citas para un slot específico
  const getAppointmentsForSlot = (date: Date, time: string): Appointment[] => {
    return appointments.filter(apt =>
      isSameDay(apt.date, date) && apt.time === time
    );
  };

  // Calcular altura del evento
  const getEventHeight = (duration: string): number => {
    const minutes = parseInt(duration);
    return (minutes / 60) * 48;
  };

  // Obtener color por estado
  const getStatusColor = (status: string): string => {
    const colors = {
      confirmed: 'bg-blue-500',
      pending: 'bg-amber-500',
      completed: 'bg-green-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Barra superior de navegación */}
      <div className="flex items-center justify-between px-6 py-4 bg-card border-b">
        <div className="flex items-center gap-4">
          <CalendarIcon className="h-6 w-6 text-primary" />

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPreviousWeek}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNextWeek}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          <h2 className="text-xl font-medium text-foreground capitalize">
            {getDateRange()}
          </h2>
        </div>

        <div className="flex items-center gap-2">

          <Button
            className="ml-2"
            onClick={onNewAppointment}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Cita
          </Button>
        </div>
      </div>

      {/* Vista semanal del calendario */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-full h-full">
          {/* Cabecera de días */}
          <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b sticky top-0 z-30 bg-background">
            <div className="p-4 text-xs font-medium text-muted-foreground text-right pr-4 border-r">
              GMT-05
            </div>
            {weekDays.map((day, index) => {
              const dayName = format(day, "EEE", { locale: es }).toUpperCase();
              const dayNumber = format(day, "d");
              const todayClass = isToday(day) ? "text-primary" : "text-foreground";

              return (
                <div
                  key={index}
                  className="p-4 text-center border-r last:border-r-0"
                >
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

          {/* Grid de horas y días */}
          <div className="relative">
            {hours.map((hour, hourIndex) => (
              <div
                key={hourIndex}
                className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-border/50"
                style={{ minHeight: '48px' }}
              >
                <div className="text-right pr-4 pt-1 text-xs text-muted-foreground border-r">
                  {hour.label}
                </div>

                {weekDays.map((day, dayIndex) => {
                  const slotAppointments = getAppointmentsForSlot(day, hour.time);

                  return (
                    <div
                      key={dayIndex}
                      className="border-r last:border-r-0 relative hover:bg-accent/50 cursor-pointer transition-colors"
                      onClick={() => onSlotClick(day, hour.time)}
                    >
                      {slotAppointments.map((apt, aptIndex) => (
                        <div
                          key={apt.id}
                          className={`absolute left-1 right-1 ${getStatusColor(apt.status)} rounded-md shadow-md p-2 overflow-hidden z-10 cursor-pointer hover:opacity-90 transition-opacity`}
                          style={{
                            top: '2px',
                            height: `${Math.min(getEventHeight(apt.duration), 46)}px`,
                            marginLeft: `${aptIndex * 4}px`
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAppointmentClick(apt);
                          }}
                        >
                          <div className="text-white text-xs font-medium truncate">
                            {apt.patient}
                          </div>
                          <div className="text-white/90 text-[10px] truncate">
                            {apt.treatment}
                          </div>
                          <div className="text-white/80 text-[10px]">
                            {hour.time}
                          </div>
                        </div>
                      ))}
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