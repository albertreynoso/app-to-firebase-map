import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon, Clock, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

// 📋 TIPOS DE CONSULTA
const CONSULTATION_TYPES = [
    "Evaluación general",
    "Evaluación ortodoncia",
    "Implantes",
    "Odontopediatría",
    "Rehabilitación",
    "Evaluación estética",
] as const;

// ⏱️ DURACIONES DISPONIBLES
const DURATIONS = [
    { value: "30", label: "30 minutos" },
    { value: "45", label: "45 minutos" },
    { value: "60", label: "1 hora" },
    { value: "90", label: "1.5 horas" },
    { value: "120", label: "2 horas" },
];

// 📋 ESTADOS DE CITA
const APPOINTMENT_STATUSES = [
    { value: "pending", label: "Pendiente" },
    { value: "confirmed", label: "Confirmada" },
    { value: "completed", label: "Completada" },
    { value: "cancelled", label: "Cancelada" },
];

// 📋 SCHEMA DE VALIDACIÓN
const editAppointmentSchema = z.object({
    date: z.date({
        required_error: "La fecha es requerida",
    }),
    time: z.string().min(1, "La hora es requerida"),
    consultation: z.string().min(1, "Debe seleccionar un tipo de consulta"),
    duration: z.string().min(1, "Debe seleccionar una duración"),
    status: z.string().min(1, "Debe seleccionar un estado"),
    notes: z.string().optional(),
});

type EditAppointmentFormValues = z.infer<typeof editAppointmentSchema>;

interface AppointmentEditDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    appointment: {
        id: string;
        date: Date;
        time: string;
        patient: string;
        treatment: string;
        duration: string;
        status: string;
        notes?: string;
    } | null;
    onSuccess?: () => void;
}

export default function AppointmentEditDialog({
    open,
    onOpenChange,
    appointment,
    onSuccess,
}: AppointmentEditDialogProps) {
    const [loading, setLoading] = useState(false);

    // Form setup
    const form = useForm<EditAppointmentFormValues>({
        resolver: zodResolver(editAppointmentSchema),
        defaultValues: {
            date: new Date(),
            time: "",
            consultation: "",
            duration: "30",
            status: "pending",
            notes: "",
        },
    });

    // Actualizar formulario cuando cambie la cita
    useEffect(() => {
        if (open && appointment) {
            // Extraer el valor numérico de la duración
            const durationMatch = appointment.duration.match(/\d+/);
            const durationValue = durationMatch ? durationMatch[0] : "30";

            form.reset({
                date: appointment.date,
                time: appointment.time,
                consultation: appointment.treatment,
                duration: durationValue,
                status: appointment.status,
                notes: appointment.notes || "",
            });
        }
    }, [open, appointment, form]);

    // FUNCIÓN PARA GENERAR HORAS (7 AM - 8 PM)
    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 7; hour <= 20; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const timeValue = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                const displayHour = hour > 12 ? hour - 12 : hour;
                const period = hour >= 12 ? 'PM' : 'AM';
                const displayTime = `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
                slots.push({ value: timeValue, label: displayTime });
            }
        }
        return slots;
    };

    const timeSlots = generateTimeSlots();

    // Handler de submit
    const onSubmit = async (data: EditAppointmentFormValues) => {
        if (!appointment) return;

        setLoading(true);
        
        try {
            // Aquí irá la lógica para actualizar la cita en Firebase
            console.log("Actualizar cita:", { id: appointment.id, ...data });

            // TODO: Llamar al servicio de Firebase para actualizar
            // await updateAppointment(appointment.id, data);

            toast({
                title: "✅ Cita actualizada",
                description: `La cita ha sido actualizada exitosamente.`,
            });

            onOpenChange(false);
            onSuccess?.();

        } catch (error: any) {
            console.error("Error al actualizar:", error);
            toast({
                title: "❌ Error",
                description: error.message || "No se pudo actualizar la cita.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    if (!appointment) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-semibold">
                        Editar Cita - {appointment.patient}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Información del Paciente (Solo lectura) */}
                        <div className="p-4 bg-muted/50 rounded-lg border">
                            <p className="text-sm font-medium text-muted-foreground mb-1">Paciente</p>
                            <p className="text-lg font-semibold">{appointment.patient}</p>
                        </div>

                        {/* Fecha y Hora */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fecha de la Cita *</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "PPP", { locale: es })
                                                        ) : (
                                                            <span>Selecciona una fecha</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                                    initialFocus
                                                    locale={es}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="time"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Hora *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <Clock className="mr-2 h-4 w-4" />
                                                    <SelectValue placeholder="Selecciona una hora" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="max-h-[300px]">
                                                {timeSlots.map((slot) => (
                                                    <SelectItem key={slot.value} value={slot.value}>
                                                        {slot.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Tipo de Consulta */}
                        <FormField
                            control={form.control}
                            name="consultation"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo de Consulta *</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona el tipo de consulta" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {CONSULTATION_TYPES.map((type) => (
                                                <SelectItem key={type} value={type}>
                                                    {type}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Duración y Estado */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="duration"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Duración *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona la duración" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {DURATIONS.map((duration) => (
                                                    <SelectItem key={duration.value} value={duration.value}>
                                                        {duration.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Estado *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona el estado" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {APPOINTMENT_STATUSES.map((status) => (
                                                    <SelectItem key={status.value} value={status.value}>
                                                        {status.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Notas */}
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notas y Observaciones</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Escribe aquí cualquier información adicional..."
                                            className="min-h-[100px] resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Botones */}
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={loading}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    "Guardar Cambios"
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}