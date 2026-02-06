import { useState } from "react";
import GoogleCalendarView from "@/components/GoogleCalendarView";
import AppointmentDialog from "@/components/AppointmentDialog";
import { useAppointments } from "@/hooks/useAppointments";
import { Loader2 } from "lucide-react";
import AppointmentDetailsDialog from "@/components/AppointmentDetailsDialog";
import AppointmentEditDialog from "@/components/AppointmentEditDialog";
import { getAppointmentColor } from "@/types/appointment";
import AppointmentRescheduleDialog from "@/components/AppointmentRescheduleDialog";

// Interfaz para las citas que usa GoogleCalendarView
interface CalendarAppointment {
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

// Función helper para normalizar estado a inglés
const normalizeStatusToEnglish = (estado: string): "confirmed" | "pending" | "completed" | "cancelled" | "reprogramada" => {
  const statusMap: Record<string, "confirmed" | "pending" | "completed" | "cancelled" | "reprogramada"> = {
    'confirmada': 'confirmed',
    'confirmed': 'confirmed',
    'pendiente': 'pending',
    'pending': 'pending',
    'completada': 'completed',
    'completed': 'completed',
    'cancelada': 'cancelled',
    'cancelled': 'cancelled',
    'reprogramada': 'reprogramada', // Mantener como está
  };
  return statusMap[estado.toLowerCase()] || 'pending';
};

export default function Calendario() {
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date | null; time: string }>({
    date: null,
    time: ""
  });

  // Cargar citas desde Firebase
  const { appointments, loading, refetch } = useAppointments();
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<CalendarAppointment | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false); // ← NUEVO
  // Convertir las citas de Firebase al formato que espera GoogleCalendarView
  const formattedAppointments: CalendarAppointment[] = appointments.map(apt => ({
    id: apt.id || "",
    time: apt.hora,
    patient: apt.paciente_nombre,
    patientId: apt.paciente_id,
    dentist: apt.atendido_por || "Por asignar",
    dentistId: "D001",
    treatment: apt.tipo_consulta,
    duration: `${apt.duracion} min`,
    status: normalizeStatusToEnglish(apt.estado),
    date: apt.fecha,
    notes: apt.notas_observaciones,
    color: getAppointmentColor(apt.estado),
  }));

  // Manejo de clic en slot del calendario
  const handleSlotClick = (date: Date, time: string) => {
    setSelectedSlot({ date, time });
    setShowAppointmentModal(true);
  };

  // Manejo de clic en cita existente
  const handleAppointmentClick = (appointment: CalendarAppointment) => {
    console.log("📋 Cita seleccionada:", appointment);
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  // Callback cuando se crea una cita exitosamente
  const handleAppointmentSuccess = () => {
    refetch(); // Recargar las citas
  };

  // Manejo de edición de cita
  const handleEditAppointment = () => {
    setShowDetailsModal(false);
    setShowEditModal(true);
  };

  // Manejo de reprogramación de cita
  const handleRescheduleAppointment = () => {
    setShowDetailsModal(false);
    setShowRescheduleModal(true);
  };

  // Callback cuando se actualiza/cancela una cita
  const handleDetailsSuccess = async () => {
    console.log("🔄 handleDetailsSuccess: Iniciando recarga...");

    // Recargar las citas PRIMERO
    try {
      const updatedAppointments = await refetch();
      console.log("✅ handleDetailsSuccess: Citas recargadas exitosamente");

      // Si hay una cita seleccionada, buscar la versión actualizada
      if (selectedAppointment?.id && updatedAppointments) {
        const updatedAppointment = updatedAppointments.find(
          apt => apt.id === selectedAppointment.id
        );

        if (updatedAppointment) {
          // Convertir al formato CalendarAppointment con datos FRESCOS
          const refreshedAppointment: CalendarAppointment = {
            id: updatedAppointment.id || "",
            time: updatedAppointment.hora,
            patient: updatedAppointment.paciente_nombre,
            patientId: updatedAppointment.paciente_id,
            dentist: updatedAppointment.atendido_por || "Por asignar",
            dentistId: "D001",
            treatment: updatedAppointment.tipo_consulta,
            duration: `${updatedAppointment.duracion} min`, // ⚠️ DURACIÓN ACTUALIZADA
            status: normalizeStatusToEnglish(updatedAppointment.estado),
            date: updatedAppointment.fecha,
            notes: updatedAppointment.notas_observaciones,
            color: getAppointmentColor(updatedAppointment.estado),
          };

          setSelectedAppointment(refreshedAppointment);
          console.log("✅ Cita actualizada con nueva duración:", refreshedAppointment.duration);
        } else {
          // Si la cita ya no existe (fue eliminada), limpiar selección
          setSelectedAppointment(null);
          setShowDetailsModal(false);
        }
      }
    } catch (error) {
      console.error("❌ Error al recargar citas:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Cargando citas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col -m-6 lg:-m-8">
      {/* Vista de Calendario tipo Google Calendar */}
      <div className="flex-1 min-h-0">
        <GoogleCalendarView
          appointments={formattedAppointments}
          onSlotClick={handleSlotClick}
          onNewAppointment={() => {
            setSelectedSlot({ date: new Date(), time: "09:00" });
            setShowAppointmentModal(true);
          }}
          onAppointmentClick={handleAppointmentClick}
        />
      </div>

      {/* Modal de Nueva Cita */}
      <AppointmentDialog
        open={showAppointmentModal}
        onOpenChange={setShowAppointmentModal}
        selectedDate={selectedSlot.date || undefined}
        selectedTime={selectedSlot.time}
        onSuccess={handleAppointmentSuccess}
      />

      {/* Modal de Detalles de Cita */}
      <AppointmentDetailsDialog
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
        appointment={selectedAppointment}
        onEdit={handleEditAppointment}
        onReschedule={handleRescheduleAppointment}
        onSuccess={handleDetailsSuccess}
      />

      {/* Modal de Edición de Cita */}
      <AppointmentEditDialog
        open={showEditModal}
        onOpenChange={setShowEditModal}
        appointment={selectedAppointment}
        onSuccess={() => {
          refetch();
          setShowEditModal(false);
          setSelectedAppointment(null);
        }}
      />


      {/* Modal de Reprogramación de Cita */}
      <AppointmentRescheduleDialog
        open={showRescheduleModal}
        onOpenChange={setShowRescheduleModal}
        appointment={selectedAppointment}
        onSuccess={() => {
          refetch();
          setShowRescheduleModal(false);
          setSelectedAppointment(null);
        }}
      />
    </div>
  );
}