import { useState } from "react";
import GoogleCalendarView from "@/components/GoogleCalendarView";
import AppointmentDialog from "@/components/AppointmentDialog";
import { useAppointments } from "@/hooks/useAppointments";
import { Loader2 } from "lucide-react";
import AppointmentDetailsDialog from "@/components/AppointmentDetailsDialog";
import AppointmentEditDialog from "@/components/AppointmentEditDialog";

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
  status: "confirmed" | "pending" | "completed";
  date: Date;
  notes?: string;
  color: string;
}

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

  // Convertir las citas de Firebase al formato que espera GoogleCalendarView
  const formattedAppointments: CalendarAppointment[] = appointments.map(apt => ({
    id: apt.id || "",
    time: apt.hora,
    patient: apt.paciente_nombre,
    patientId: apt.paciente_id,
    dentist: "Dr. Asignado", // Puedes agregar este campo a la base de datos
    dentistId: "D001", // Puedes agregar este campo a la base de datos
    treatment: apt.tipo_consulta,
    duration: `${apt.duracion} min`,
    status: apt.estado === "confirmada" ? "confirmed" :
      apt.estado === "completada" ? "completed" : "pending",
    date: apt.fecha,
    notes: apt.notas_observaciones,
    color: apt.estado === "confirmada" ? "#3B82F6" :
      apt.estado === "completada" ? "#10B981" : "#F59E0B",
  }));

  // Manejo de clic en slot del calendario
  const handleSlotClick = (date: Date, time: string) => {
    setSelectedSlot({ date, time });
    setShowAppointmentModal(true);
  };
  // Agrega esta función después de handleSlotClick o donde prefieras
const handleAppointmentClick = (appointment: CalendarAppointment) => {
  setSelectedAppointment(appointment);
  setShowDetailsModal(true);
};

  // Callback cuando se crea una cita exitosamente
  const handleAppointmentSuccess = () => {
    refetch(); // Recargar las citas
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

  // Manejo de clic en cita existente
  const handleEditAppointment = () => {
    setShowDetailsModal(false);
    setShowEditModal(true);
  };

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

      {/* Modal de Citas con integración Firebase */}
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
        onCancel={() => {
          console.log("Cancelar cita:", selectedAppointment);
        }}
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
    </div>
  );
}