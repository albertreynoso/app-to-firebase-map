import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, FileText, Timer, XCircle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface AppointmentDetails {
    id: string;
    time: string;
    patient: string;
    patientId: string;
    dentist: string;
    treatment: string;
    duration: string;
    status: "confirmed" | "pending" | "completed";
    date: Date;
    notes?: string;
}

interface AppointmentDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    appointment: AppointmentDetails | null;
    onEdit?: () => void;
    onCancel?: () => void;
}

export default function AppointmentDetailsDialog({
    open,
    onOpenChange,
    appointment,
    onEdit,
    onCancel,
}: AppointmentDetailsDialogProps) {
    if (!appointment) return null;

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            confirmed: { label: "Confirmada", className: "bg-blue-500 hover:bg-blue-600" },
            pending: { label: "Pendiente", className: "bg-amber-500 hover:bg-amber-600" },
            completed: { label: "Completada", className: "bg-green-500 hover:bg-green-600" },
        };

        const config = statusConfig[status as keyof typeof statusConfig];
        return (
            <Badge className={`${config.className} text-white`}>
                {config.label}
            </Badge>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-semibold flex items-center justify-between">
                        <span>Detalles de la Cita</span>
                        {getStatusBadge(appointment.status)}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Fecha y Hora */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-start gap-2 p-3 border rounded-lg bg-muted/50">
                            <Calendar className="h-5 w-5 text-primary mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Fecha</p>
                                <p className="text-lg font-semibold">
                                    {format(appointment.date, "PPP", { locale: es })}
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

                    {/* Paciente */}
                    <div className="flex items-start gap-2 p-3 border rounded-lg">
                        <User className="h-5 w-5 text-primary mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-muted-foreground">Paciente</p>
                            <p className="text-lg font-semibold">{appointment.patient}</p>
                            <p className="text-sm text-muted-foreground">ID: {appointment.patientId}</p>
                        </div>
                    </div>

                    {/* Tipo de Consulta */}
                    <div className="flex items-start gap-2 p-3 border rounded-lg">
                        <FileText className="h-5 w-5 text-primary mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-muted-foreground">Tipo de Consulta</p>
                            <p className="text-lg font-semibold">{appointment.treatment}</p>
                        </div>
                    </div>

                    {/* Duración */}
                    <div className="flex items-start gap-2 p-3 border rounded-lg">
                        <Timer className="h-5 w-5 text-primary mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-muted-foreground">Duración</p>
                            <p className="text-lg font-semibold">{appointment.duration}</p>
                        </div>
                    </div>

                    {/* Notas */}
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

                {/* Botones de acción */}
                <div className="flex justify-end gap-3 pt-4 border-t">

                    {onCancel && appointment.status !== "completed" && (
                        <Button
                            variant="destructive"
                            onClick={onCancel}
                        >
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancelar Cita
                        </Button>
                    )}

                    {onEdit && appointment.status !== "completed" && (
                        <Button onClick={onEdit}>
                            Editar Cita
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}