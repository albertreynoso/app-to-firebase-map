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
  Calendar,
  Clock,
  User,
  FileText,
  Timer,
  XCircle,
  Phone,
  CalendarClock,
  Edit,
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
  },
  pendiente: {
    label: "Pendiente",
    color: "bg-yellow-500",
  },
  completada: {
    label: "Completada",
    color: "bg-gray-500",
  },
  cancelada: {
    label: "Cancelada",
    color: "bg-red-500",
  },
  reprogramada: {
    label: "Reprogramada",
    color: "bg-orange-500",
  },
  confirmed: {
    label: "Confirmada",
    color: "bg-green-500",
  },
  pending: {
    label: "Pendiente",
    color: "bg-yellow-500",
  },
  completed: {
    label: "Completada",
    color: "bg-gray-500",
  },
  cancelled: {
    label: "Cancelada",
    color: "bg-red-500",
  },
  reprogramed: {
    label: "Reprogramada",
    color: "bg-orange-500",
  },
} as const;

interface AppointmentDetails {
  id: string;
  time: string;
  patient: string;
  patientId: string;
  patientPhone?: string;
  treatment: string;
  duration: string;
  status: string;
  date: Date;
}

interface AppointmentDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: AppointmentDetails | null;
  onEdit?: () => void;
  onReschedule?: () => void;
  onSuccess?: () => void;
}

export default function AppointmentDetailsDialog({
  open,
  onOpenChange,
  appointment,
  onEdit,
  onReschedule,
  onSuccess,
}: AppointmentDetailsDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Reset estado cuando cambie la cita
  useEffect(() => {
    if (appointment && open) {
      const normalized = normalizeStatus(appointment.status);
      setSelectedStatus(normalized);
    }
  }, [appointment, open]);

  if (!appointment) return null;

  // Normalizar estado a español
  const normalizeStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      'confirmed': 'confirmada',
      'pending': 'pendiente', 
      'completed': 'completada',
      'cancelled': 'cancelada',
      'reprogramed': 'reprogramada',
      'confirmada': 'confirmada',
      'pendiente': 'pendiente',
      'completada': 'completada',
      'cancelada': 'cancelada',
      'reprogramada': 'reprogramada',
    };
    return statusMap[status.toLowerCase()] || 'pendiente';
  };

  const currentStatus = normalizeStatus(selectedStatus || appointment.status);
  const isRescheduled = currentStatus === "reprogramada";

  const handleStatusChange = async (newStatus: string) => {
    if (!appointment?.id) {
      console.error("❌ No hay ID de cita para actualizar");
      return;
    }

    // Si selecciona "cancelada", mostrar modal de confirmación
    if (newStatus === "cancelada") {
      setShowCancelDialog(true);
      return;
    }

    try {
      setUpdatingStatus(true);
      
      console.log("🔄 Cambiando estado de la cita:", {
        citaId: appointment.id,
        estadoAnterior: currentStatus,
        estadoNuevo: newStatus
      });

      await updateAppointment(appointment.id, {
        estado: newStatus as any,
      });

      console.log("✅ Estado actualizado en Firebase exitosamente");
      
      const statusLabel = APPOINTMENT_STATUS_CONFIG[newStatus as keyof typeof APPOINTMENT_STATUS_CONFIG]?.label || newStatus;
      
      toast({
        title: "✅ Estado actualizado",
        description: `La cita ha sido marcada como ${statusLabel.toLowerCase()}.`,
      });

      // Cerrar el modal inmediatamente
      onOpenChange(false);
      
      // Recargar el calendario
      if (onSuccess) {
        await onSuccess();
      }

    } catch (error: any) {
      console.error("❌ Error al actualizar estado:", error);
      
      toast({
        title: "❌ Error",
        description: error.message || "No se pudo actualizar el estado de la cita.",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleConfirmCancellation = async () => {
    try {
      setUpdatingStatus(true);
      
      await updateAppointment(appointment.id, {
        estado: "cancelada" as any,
      });

      toast({
        title: "✅ Cita cancelada",
        description: "La cita ha sido cancelada exitosamente.",
      });

      setShowCancelDialog(false);
      onOpenChange(false);
      
      if (onSuccess) {
        await onSuccess();
      }

    } catch (error: any) {
      console.error("❌ Error al cancelar cita:", error);
      
      toast({
        title: "❌ Error",
        description: "No se pudo cancelar la cita.",
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

  const appointmentDate = appointment.date instanceof Date ? appointment.date : new Date(appointment.date);

  // Determinar color del borde según estado
  const getBorderColor = () => {
    switch (currentStatus) {
      case "pendiente": return "#eab308";
      case "confirmada": return "#22c55e";
      case "completada": return "#6b7280";
      case "cancelada": return "#ef4444";
      case "reprogramada": return "#f97316";
      default: return "#6b7280";
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center justify-between gap-4 pb-4 border-b-2" 
                 style={{ borderColor: getBorderColor() }}>
              <DialogTitle className="text-xl font-semibold">
                Detalles de la Cita
              </DialogTitle>
              
              <div className="flex items-center gap-2">
                <Badge className={`${statusConfig.color} text-white pointer-events-none`}>
                  {statusConfig.label}
                </Badge>
                
                <button
                  onClick={() => onOpenChange(false)}
                  className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                >
                  <XCircle className="h-5 w-5" />
                  <span className="sr-only">Cerrar</span>
                </button>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Información de la cita */}
            <div className="space-y-3">
              {/* Fecha y Hora */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                  <Calendar className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">FECHA</p>
                    <p className="text-sm font-semibold">
                      {format(appointmentDate, "PPP", { locale: es })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                  <Clock className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">HORA</p>
                    <p className="text-sm font-semibold">{appointment.time}</p>
                  </div>
                </div>
              </div>

              {/* Nombre completo y Celular */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <User className="h-4 w-4 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">PACIENTE</p>
                    <p className="text-sm font-semibold truncate">{appointment.patient}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Phone className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">CELULAR</p>
                    <p className="text-sm font-semibold">
                      {appointment.patientPhone || "No registrado"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tipo de Consulta y Duración */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <FileText className="h-4 w-4 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">TIPO CONSULTA</p>
                    <p className="text-sm font-semibold truncate">{appointment.treatment}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Timer className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">DURACIÓN EST.</p>
                    <p className="text-sm font-semibold">{appointment.duration}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Selector de Estado - SOLO SI NO ESTÁ REPROGRAMADA */}
            {!isRescheduled && (
              <div className="space-y-2 pt-2">
                <label className="text-xs font-medium text-muted-foreground uppercase">
                  Cambiar Estado
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {/* Pendiente */}
                  <button
                    onClick={() => handleStatusChange("pendiente")}
                    disabled={updatingStatus}
                    className={`
                      flex items-center justify-center gap-2 px-3 py-2 rounded-md border transition-all
                      ${currentStatus === "pendiente" 
                        ? "bg-yellow-500/10 border-yellow-500" 
                        : "bg-gray-100 border-gray-300 hover:border-gray-400"
                      }
                    `}
                  >
                    <span className="h-2 w-2 rounded-full bg-yellow-500" />
                    <span className="text-sm font-medium text-yellow-600">
                      Pendiente
                    </span>
                  </button>

                  {/* Confirmada */}
                  <button
                    onClick={() => handleStatusChange("confirmada")}
                    disabled={updatingStatus}
                    className={`
                      flex items-center justify-center gap-2 px-3 py-2 rounded-md border transition-all
                      ${currentStatus === "confirmada" 
                        ? "bg-green-500/10 border-green-500" 
                        : "bg-gray-100 border-gray-300 hover:border-gray-400"
                      }
                    `}
                  >
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-sm font-medium text-green-600">
                      Confirmada
                    </span>
                  </button>

                  {/* Cancelada */}
                  <button
                    onClick={() => handleStatusChange("cancelada")}
                    disabled={updatingStatus}
                    className={`
                      flex items-center justify-center gap-2 px-3 py-2 rounded-md border transition-all
                      ${currentStatus === "cancelada" 
                        ? "bg-red-500/10 border-red-500" 
                        : "bg-gray-100 border-gray-300 hover:border-gray-400"
                      }
                    `}
                  >
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    <span className="text-sm font-medium text-red-600">
                      Cancelada
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex justify-between items-center pt-4 border-t">
            {/* Botón izquierdo */}
            {isRescheduled ? (
              // Si está reprogramada: mostrar "Cancelar Cita"
              <Button
                variant="destructive"
                onClick={() => setShowCancelDialog(true)}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancelar Cita
              </Button>
            ) : (
              // Si NO está reprogramada: mostrar "Eliminar Cita" (solo si no está completada ni cancelada)
              currentStatus !== "completada" && currentStatus !== "cancelada" && (
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Eliminar Cita
                </Button>
              )
            )}

            <div className="flex-1" />

            {/* Botones Editar y Reprogramar - Derecha */}
            <div className="flex gap-2">
              {onEdit && currentStatus !== "completada" && currentStatus !== "cancelada" && (
                <Button onClick={onEdit} variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              )}

              {/* Reprogramar - Solo si estado es pendiente Y NO está reprogramada */}
              {currentStatus === "pendiente" && !isRescheduled && onReschedule && (
                <Button
                  onClick={onReschedule}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                  <CalendarClock className="h-4 w-4 mr-2" />
                  Reprogramar
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmación para CANCELAR cita */}
      <ConfirmationDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        onConfirm={handleConfirmCancellation}
        title="¿Cancelar esta cita?"
        description={`¿Estás seguro de que deseas cancelar la cita de ${appointment.patient} programada para el ${format(appointmentDate, "PPP", { locale: es })} a las ${appointment.time}?`}
        confirmText="Sí, cancelar cita"
        cancelText="No, mantener cita"
        variant="destructive"
        loading={updatingStatus}
      />

      {/* Modal de confirmación para ELIMINAR cita */}
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