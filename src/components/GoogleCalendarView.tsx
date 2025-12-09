// src/components/GoogleCalendarView.tsx
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

  // Verificar si es hoy
  const isToday = (date: Date) => isSameDay(date, new Date());

  // Obtener citas para un slot específico
  const getAppointmentsForSlot = (date: Date, time: string): Appointment[] => {
    // Extraer la hora del slot (ej: "14:00" -> 14)
    const slotHour = parseInt(time.split(':')[0]);

    return appointments.filter(apt => {
      if (!isSameDay(apt.date, date)) return false;

      // Extraer la hora de la cita (ej: "14:30" -> 14)
      const aptHour = parseInt(apt.time.split(':')[0]);

      // La cita pertenece a este slot si su hora coincide
      return aptHour === slotHour;
    });
  };

  // Calcular altura del evento basado en duración real
  const getEventHeight = (duration: string): number => {
    const minutes = parseInt(duration);
    // Cada hora tiene 144px, entonces cada minuto = 144/60 = 2.4px
    return (minutes / 60) * 144;
  };

  // Función para ordenar y posicionar citas por duración (superpuestas de izquierda a derecha)
  const getAppointmentLayout = (appointments: Appointment[], allDayAppointments: Appointment[], currentSlotTime: string) => {
    if (appointments.length === 0) return [];

    // Definir tipo para citas con información de posición
    type AppointmentWithPosition = {
      appointment: Appointment;
      topPosition: number;
      bottomPosition: number;
      height: number;
      minutes: number;
      duration: number;
    };

    // Calcular posición vertical real de cada cita basada en sus minutos
    const appointmentsWithPosition: AppointmentWithPosition[] = appointments.map(apt => {
      const minutes = parseInt(apt.time.split(':')[1] || '0');
      const duration = parseInt(apt.duration);
      const topPosition = minutes * 2.4;
      const height = getEventHeight(apt.duration);
      const bottomPosition = topPosition + height;

      return {
        appointment: apt,
        topPosition,
        bottomPosition,
        height,
        minutes,
        duration
      };
    });

    // Ordenar por minuto de inicio, luego por duración (menor primero)
    const sorted = [...appointmentsWithPosition].sort((a, b) => {
      if (a.minutes !== b.minutes) {
        return a.minutes - b.minutes;
      }
      return a.duration - b.duration;
    });

    const result: any[] = [];

    // Procesar cada cita individualmente
    sorted.forEach((currentItem, currentIndex) => {

      // PASO 1: Identificar todas las citas que empiezan al mismo minuto Y a la misma hora
      const citasMismoMinuto = sorted.filter(item =>
        item.minutes === currentItem.minutes &&
        item.appointment.time.split(':')[0] === currentItem.appointment.time.split(':')[0]
      );
      const esCitaMismoMinuto = citasMismoMinuto.length > 1;

      let finalWidth: number;
      let finalOffsetLeft: number;
      let finalZIndex: number;
      let isTopMost: boolean;

      if (esCitaMismoMinuto) {
        // LÓGICA: Citas que empiezan al mismo tiempo
        const indexEnGrupo = citasMismoMinuto.findIndex(item => item === currentItem);
        const totalEnGrupo = citasMismoMinuto.length;

        // IMPORTANTE: Verificar si hay otras citas (de otros horarios) superpuestas
        const allDayWithPosition = allDayAppointments.map(apt => {
          const minutes = parseInt(apt.time.split(':')[1] || '0');
          const duration = parseInt(apt.duration);
          return {
            appointment: apt,
            minutes,
            duration
          };
        });

        const citasSuperpuestas = allDayWithPosition.filter((otherItem) => {
          // No comparar consigo misma ni con las del mismo grupo
          if (otherItem.appointment.id === currentItem.appointment.id) return false;
          const esMismoGrupo = citasMismoMinuto.some(c => c.appointment.id === otherItem.appointment.id);
          if (esMismoGrupo) return false;

          // Calcular superposición temporal REAL
          const currentStartMinutes = (parseInt(currentItem.appointment.time.split(':')[0]) * 60) + currentItem.minutes;
          const currentEndMinutes = currentStartMinutes + currentItem.duration;

          const otherStartMinutes = (parseInt(otherItem.appointment.time.split(':')[0]) * 60) + otherItem.minutes;
          const otherEndMinutes = otherStartMinutes + otherItem.duration;

          // Hay superposición REAL si:
          // La otra cita empieza ANTES de que termine esta cita
          // Y la otra cita termina DESPUÉS de que empieza esta cita
          const haySuperposicion = otherStartMinutes < currentEndMinutes && otherEndMinutes > currentStartMinutes;

          return haySuperposicion;
        });

        // Verificar si hay citas externas que se superponen con TODAS las citas del grupo
        const citasExternasQueAfectanATodas = allDayWithPosition.filter((otherItem) => {
          if (otherItem.appointment.id === currentItem.appointment.id) return false;
          const esMismoGrupo = citasMismoMinuto.some(c => c.appointment.id === otherItem.appointment.id);
          if (esMismoGrupo) return false;

          // Verificar si esta cita externa se superpone con TODAS las citas del grupo
          const seSuperponConTodas = citasMismoMinuto.every((citaGrupo) => {
            const grupoStartMinutes = (parseInt(citaGrupo.appointment.time.split(':')[0]) * 60) + citaGrupo.minutes;
            const grupoEndMinutes = grupoStartMinutes + citaGrupo.duration;

            const otherStartMinutes = (parseInt(otherItem.appointment.time.split(':')[0]) * 60) + otherItem.minutes;
            const otherEndMinutes = otherStartMinutes + otherItem.duration;

            return otherStartMinutes < grupoEndMinutes && otherEndMinutes > grupoStartMinutes;
          });

          return seSuperponConTodas;
        });

        const totalCitasAfectadas = citasExternasQueAfectanATodas.length;
        const totalCitas = totalEnGrupo + totalCitasAfectadas;

        // Calcular ancho basado en el total
        if (totalCitas === 1) {
          finalWidth = 90;
          finalOffsetLeft = 0;
        } else if (totalCitas === 2) {
          finalWidth = 75;
          finalOffsetLeft = indexEnGrupo * 25;
        } else {
          // 3 o más citas superpuestas
          finalWidth = 60;
          finalOffsetLeft = indexEnGrupo * 25;
        }

        // Z-index basado en tiempo relativo (valores bajos: 1-30)
        const absoluteStartMinutes = (parseInt(currentItem.appointment.time.split(':')[0]) * 60) + currentItem.minutes;
        // Normalizar a rango 1-30
        finalZIndex = Math.floor((absoluteStartMinutes - 420) / 30) + 1 - indexEnGrupo;
        isTopMost = indexEnGrupo === 0;
      } else {
        // NUEVA LÓGICA: Cita que empieza en un momento diferente

        // Contar cuántas citas anteriores están todavía en proceso
        // Contar cuántas citas anteriores están todavía en proceso
        // Procesar TODAS las citas del día, no solo las del slot actual
        const allDayWithPosition = allDayAppointments.map(apt => {
          const minutes = parseInt(apt.time.split(':')[1] || '0');
          const duration = parseInt(apt.duration);
          return {
            appointment: apt,
            minutes,
            duration
          };
        });

        const citasEnProceso = allDayWithPosition.filter((otherItem) => {
          // No comparar consigo misma
          if (otherItem.appointment.id === currentItem.appointment.id) return false;

          // Calcular tiempo de inicio y fin en minutos totales desde medianoche
          const currentStartMinutes = (parseInt(currentItem.appointment.time.split(':')[0]) * 60) + currentItem.minutes;

          const otherStartMinutes = (parseInt(otherItem.appointment.time.split(':')[0]) * 60) + otherItem.minutes;
          const otherEndMinutes = otherStartMinutes + otherItem.duration;

          // La cita está en proceso si:
          // 1. Empieza antes que currentItem
          // 2. Termina después de que empieza currentItem
          return otherStartMinutes < currentStartMinutes && otherEndMinutes > currentStartMinutes;
        });

        const numEnProceso = citasEnProceso.length;

        // Asignar ancho según cantidad de citas en proceso
        // Las citas nuevas SIEMPRE empiezan desde la izquierda (offsetLeft = 0)
        if (numEnProceso === 0) {
          finalWidth = 90;
          finalOffsetLeft = 0;
        } else if (numEnProceso === 1) {
          finalWidth = 75;
          finalOffsetLeft = 0;
        } else {
          finalWidth = 60;
          finalOffsetLeft = 0;
        }

        // Z-index basado en tiempo relativo (valores bajos: 1-30)
        const absoluteStartMinutes = (parseInt(currentItem.appointment.time.split(':')[0]) * 60) + currentItem.minutes;
        // Normalizar a rango 1-30
        finalZIndex = Math.floor((absoluteStartMinutes - 420) / 30) + 1;

        // Mostrar info si no hay otra cita posterior que se superponga
        const hayCitaPosterior = sorted.some((otherItem, otherIndex) => {
          if (otherIndex <= currentIndex) return false;

          const seSuperponen = !(currentItem.bottomPosition <= otherItem.topPosition ||
            otherItem.bottomPosition <= currentItem.topPosition);

          return seSuperponen;
        });

        isTopMost = !hayCitaPosterior;
      }

      result.push({
        appointment: currentItem.appointment,
        height: currentItem.height,
        offsetLeft: finalOffsetLeft,
        offsetTop: 0,
        width: finalWidth,
        zIndex: finalZIndex,
        isTopMost: isTopMost
      });
    });

    return result;
  };

  // Función para calcular la posición vertical de múltiples citas
  const getAppointmentPosition = (appointments: Appointment[], index: number): { top: number; height: number } => {
    const slotHeight = 144; // Nueva altura del slot
    const spacing = 4; // Espaciado entre citas
    const appointmentCount = appointments.length;

    if (appointmentCount === 1) {
      return {
        top: spacing,
        height: Math.min(getEventHeight(appointments[0].duration), slotHeight - spacing * 2)
      };
    }

    // Dividir el espacio disponible entre todas las citas
    const availableHeight = slotHeight - (spacing * (appointmentCount + 1));
    const heightPerAppointment = availableHeight / appointmentCount;

    return {
      top: spacing + (index * (heightPerAppointment + spacing)),
      height: Math.min(heightPerAppointment, getEventHeight(appointments[index].duration))
    };
  };

  // Función para obtener nombre y primer apellido
  const getShortName = (fullName: string): string => {
    if (!fullName) return "";

    const parts = fullName.trim().split(" ");
    if (parts.length === 1) return parts[0];
    if (parts.length === 2) return `${parts[0]} ${parts[1]}`;

    // Si tiene más de dos palabras, tomar el primer nombre y primer apellido
    // Asumiendo que el último es apellido materno
    const firstName = parts[0];
    const lastName = parts[1]; // Primer apellido (apellido paterno)

    return `${firstName} ${lastName}`;
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
                style={{ height: '144px' }}
              >
                <div className="text-right pr-4 pt-1 text-xs text-muted-foreground border-r">
                  {hour.label}
                </div>

                {weekDays.map((day, dayIndex) => {
                  const slotAppointments = getAppointmentsForSlot(day, hour.time);
                  // Obtener TODAS las citas del día para verificar citas en proceso
                  const allDayAppointments = appointments.filter(apt => isSameDay(apt.date, day));
                  const layout = getAppointmentLayout(slotAppointments, allDayAppointments, hour.time);

                  return (
                    <div
                      key={dayIndex}
                      className="border-r last:border-r-0 relative hover:bg-accent/50 cursor-pointer transition-colors overflow-visible"
                      onClick={() => onSlotClick(day, hour.time)}
                    >
                      {layout.map(({ appointment: apt, height, offsetLeft, offsetTop, width, zIndex, isTopMost }) => (
                        <div
                          key={apt.id}
                          className="absolute rounded-md shadow-lg overflow-hidden cursor-pointer hover:shadow-xl hover:brightness-110 transition-all group"
                          style={{
                            top: `${4 + offsetTop + (parseInt(apt.time.split(':')[1] || '0') * 2.4)}px`, // Posición según minutos
                            left: `${4 + offsetLeft}px`,
                            width: `${width}%`,
                            height: `${height}px`,
                            backgroundColor: apt.color,
                            zIndex: zIndex,
                            border: '2px solid rgba(255, 255, 255, 0.3)',
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAppointmentClick(apt);
                          }}
                        >
                          {/* Contenido visible solo en la cita superior (la más corta) */}
                          {isTopMost ? (
                            <div className="h-full flex flex-col justify-start p-[8px]">
                              <div className="text-left w-full">
                                <div className="text-white text-sm font-semibold leading-tight drop-shadow-md">
                                  {apt.patient.split(" ").slice(0, 2).join(" ")}
                                </div>
                                <div className="text-white/95 text-xs truncate mt-1 drop-shadow-sm">
                                  {apt.treatment}
                                </div>
                              </div>
                            </div>
                          ) : (
                            // Sin texto para citas ocultas - completamente vacío
                            <div className="h-full" />
                          )}

                          {/* Badge de duración solo visible al hacer hover */}
                          {!isTopMost && (
                            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[9px] px-2 py-1 rounded-full font-medium opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm shadow-sm uppercase">
                              ver
                            </div>
                          )}
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