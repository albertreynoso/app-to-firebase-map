import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  User,
  FileText,
  Timer,
  XCircle,
  UserCheck,
  PlayCircle,
  StopCircle,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { updateAppointment, cancelAppointment } from "@/services/appointmentService";

// Configuración de estados
const APPOINTMENT_STATUS_CONFIG = {
  confirmada: {
    label: "Confirmada",
    color: "bg-green-500",
    textColor: "text-green-700",
    bgLight: "bg-green-50",
    borderColor: "border-green-200",
  },
  pendiente: {
    label: "Pendiente",
    color: "bg-yellow-500",
    textColor: "text-yellow-700",
    bgLight: "bg-yellow-50",
    borderColor: "border-yellow-200",
  },
  completada: {
    label: "Completada",
    color: "bg-gray-500",
    textColor: "text-gray-700",
    bgLight: "bg-gray-50",
    borderColor: "border-gray-200",
  },
  cancelada: {
    label: "Cancelada",
    color: "bg-red-500",
    textColor: "text-red-700",
    bgLight: "bg-red-50",
    borderColor: "border-red-200",
  },
  reprogramada: {
    label: "Reprogramada",
    color: "bg-orange-500",
    textColor: "text-orange-700",
    bgLight: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  confirmed: {
    label: "Confirmada",
    color: "bg-green-500",
    textColor: "text-green-700",
    bgLight: "bg-green-50",
    borderColor: "border-green-200",
  },
  pending: {
    label: "Pendiente",
    color: "bg-yellow-500",
    textColor: "text-yellow-700",
    bgLight: "bg-yellow-50",
    borderColor: "border-yellow-200",
  },
  completed: {
    label: "Completada",
    color: "bg-gray-500",
    textColor: "text-gray-700",
    bgLight: "bg-gray-50",
    borderColor: "border-gray-200",
  },
  cancelled: {
    label: "Cancelada",
    color: "bg-red-500",
    textColor: "text-red-700",
    bgLight: "bg-red-50",
    borderColor: "border-red-200",
  },
} as const;

interface AppointmentDetails {
  id: string;
  time: string;
  patient: string;
  patientId: string;
  dentist?: string;
  dentistId?: string;
  treatment: string;
  duration: string;
  status: string; // Acepta tanto español como inglés
  date: Date;
  notes?: string;
  color?: string;
  atendido_por?: string;
  duracion_real?: string;
  hora_inicio_atencion?: string;
  hora_fin_atencion?: string;
}

interface AppointmentDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: AppointmentDetails | null;
  onEdit?: () => void;
  onSuccess?: () => void;
}

export default function AppointmentDetailsDialog({
  open,
  onOpenChange,
  appointment,
  onEdit,
  onSuccess,
}: AppointmentDetailsDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Reset estado cuando cambie la cita
  useEffect(() => {
    if (appointment && open) {
      const normalized = normalizeStatus(appointment.status);
      setSelectedStatus(normalized);
      console.log("🔄 Estado normalizado:", appointment.status, "->", normalized);
    }
  }, [appointment, open]);

  // Debug: ver qué datos llegan
  useEffect(() => {
    if (open && appointment) {
      console.log("📋 Datos de la cita:", appointment);
    }
  }, [open, appointment]);

  if (!appointment) {
    console.log("⚠️ No hay appointment data");
    return null;
  }

  // Normalizar estado a español
  const normalizeStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      'confirmed': 'confirmada',
      'pending': 'pendiente', 
      'completed': 'completada',
      'cancelled': 'cancelada',
      'confirmada': 'confirmada',
      'pendiente': 'pendiente',
      'completada': 'completada',
      'cancelada': 'cancelada',
      'reprogramada': 'reprogramada',
    };
    return statusMap[status.toLowerCase()] || 'pendiente';
  };

  const currentStatus = normalizeStatus(selectedStatus || appointment.status);

  const handleStatusChange = async (newStatus: string) => {
    if (!appointment?.id) {
      console.error("❌ No hay ID de cita para actualizar");
      return;
    }

    try {
      setUpdatingStatus(true);
      
      console.log("🔄 Cambiando estado de la cita:", {
        citaId: appointment.id,
        estadoAnterior: currentStatus,
        estadoNuevo: newStatus
      });

      // Actualizar en Firebase
      await updateAppointment(appointment.id, {
        estado: newStatus as any,
      });

      console.log("✅ Estado actualizado en Firebase exitosamente");
      
      const statusLabel = APPOINTMENT_STATUS_CONFIG[newStatus as keyof typeof APPOINTMENT_STATUS_CONFIG]?.label || newStatus;
      
      toast({
        title: "✅ Estado actualizado",
        description: `La cita ha sido marcada como ${statusLabel.toLowerCase()}.`,
      });

      // IMPORTANTE: Cerrar el modal y recargar
      console.log("🔄 Cerrando modal y recargando calendario...");
      onOpenChange(false); // Cerrar el modal
      
      if (onSuccess) {
        await onSuccess(); // Recargar el calendario
        console.log("✅ Calendario recargado");
      }

    } catch (error: any) {
      console.error("❌ Error completo al actualizar estado:", error);
      console.error("❌ Stack:", error.stack);
      
      toast({
        title: "❌ Error",
        description: error.message || "No se pudo actualizar el estado de la cita.",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDeleteAppointment = async () => {
    try {
      setDeleting(true);
      
      await cancelAppointment(appointment.id);
      
      toast({
        title: "✅ Cita eliminada",
        description: "La cita ha sido eliminada exitosamente.",
      });

      setShowDeleteDialog(false);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error al eliminar cita:", error);
      toast({
        title: "❌ Error",
        description: "No se pudo eliminar la cita.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const statusConfig = APPOINTMENT_STATUS_CONFIG[currentStatus as keyof typeof APPOINTMENT_STATUS_CONFIG] || APPOINTMENT_STATUS_CONFIG.pendiente;

  // Validar que date sea una fecha válida
  const appointmentDate = appointment.date instanceof Date ? appointment.date : new Date(appointment.date);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <DialogTitle className="text-2xl font-semibold">
                Detalles de la Cita
              </DialogTitle>
              
              <Select
                value={currentStatus}
                onValueChange={handleStatusChange}
                disabled={updatingStatus}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue>
                    <Badge className={`${statusConfig.color} text-white`}>
                      {statusConfig.label}
                    </Badge>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmada">
                    <Badge className="bg-green-500 text-white">Confirmada</Badge>
                  </SelectItem>
                  <SelectItem value="pendiente">
                    <Badge className="bg-yellow-500 text-white">Pendiente</Badge>
                  </SelectItem>
                  <SelectItem value="completada">
                    <Badge className="bg-gray-500 text-white">Completada</Badge>
                  </SelectItem>
                  <SelectItem value="cancelada">
                    <Badge className="bg-red-500 text-white">Cancelada</Badge>
                  </SelectItem>
                  <SelectItem value="reprogramada">
                    <Badge className="bg-orange-500 text-white">Reprogramada</Badge>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-start gap-3 p-4 border rounded-lg bg-muted/50">
                <Calendar className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fecha</p>
                  <p className="text-lg font-semibold">
                    {format(appointmentDate, "PPP", { locale: es })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 border rounded-lg bg-muted/50">
                <Clock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Hora</p>
                  <p className="text-lg font-semibold">{appointment.time}</p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <User className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Paciente</p>
                <p className="text-lg font-semibold">{appointment.patient}</p>
                <p className="text-sm text-muted-foreground">ID: {appointment.patientId}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-start gap-3 p-4 border rounded-lg">
                <FileText className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Tipo de Consulta</p>
                  <p className="text-base font-semibold">{appointment.treatment}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 border rounded-lg">
                <Timer className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Duración Estimada</p>
                  <p className="text-base font-semibold">{appointment.duration}</p>
                </div>
              </div>
            </div>

            <div className={`p-4 border rounded-lg ${statusConfig.bgLight} ${statusConfig.borderColor}`}>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Información de Atención
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Atendido por</p>
                  <p className="text-sm font-medium">
                    {appointment.atendido_por || "Sin asignar"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Duración Real</p>
                  <p className="text-sm font-medium">
                    {appointment.duracion_real || "Pendiente"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <PlayCircle className="h-3 w-3" />
                    Inicio de Atención
                  </p>
                  <p className="text-sm font-medium">
                    {appointment.hora_inicio_atencion || "Pendiente"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <StopCircle className="h-3 w-3" />
                    Fin de Atención
                  </p>
                  <p className="text-sm font-medium">
                    {appointment.hora_fin_atencion || "Pendiente"}
                  </p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mt-3 italic">
                * Esta información se editará una vez completada la atención
              </p>
            </div>

            {appointment.notes && (
              <div className="flex items-start gap-3 p-4 border rounded-lg bg-muted/30">
                <FileText className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Notas y Observaciones
                  </p>
                  <p className="text-sm whitespace-pre-wrap">{appointment.notes}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            {currentStatus !== "completada" && currentStatus !== "cancelada" && currentStatus !== "completed" && currentStatus !== "cancelled" && (
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Eliminar Cita
              </Button>
            )}

            <div className="flex-1" />

            {onEdit && currentStatus !== "completada" && currentStatus !== "cancelada" && currentStatus !== "completed" && currentStatus !== "cancelled" && (
              <Button onClick={onEdit}>
                Editar Cita
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteAppointment}
        title="¿Eliminar cita?"
        description={`¿Estás seguro de que deseas eliminar la cita de ${appointment.patient} programada para el ${format(appointmentDate, "PPP", { locale: es })} a las ${appointment.time}? Esta acción no se puede deshacer.`}
        confirmText="Sí, eliminar cita"
        cancelText="No, mantener cita"
        variant="destructive"
        loading={deleting}
      />
    </>
  );
}