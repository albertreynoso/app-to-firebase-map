import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
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
import { Calendar as CalendarIcon, Clock, Search, UserPlus, Loader2, AlertCircle } from "lucide-react";
import { format, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

// Importar servicios de Firebase
import {
    createPatient,
    createAppointment,
    getAllPatients,
    findPatientByDNI,
    getAllAppointments
} from "@/services/appointmentService";
import { Patient } from "@/types/appointment";


// ==================== FUNCIÓN PARA CAPITALIZAR NOMBRES ====================
const capitalizeWords = (text: string): string => {
    if (!text) return "";

    return text
        .trim()
        .split(" ")
        .filter(word => word.length > 0)
        .map(word => {
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(" ");
};

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

// 📋 SCHEMA DE VALIDACIÓN
const appointmentFormSchema = z.object({
    date: z.date({
        required_error: "La fecha es requerida",
    }),
    time: z.string().min(1, "La hora es requerida"),
    patientId: z.string().optional(),
    patientName: z.string().min(1, "El nombre del paciente es requerido"),
    isNewPatient: z.boolean().default(false),
    newPatientDni: z.string().optional(),
    newPatientPhone: z.string().optional(),
    newPatientEmail: z.string().email("Email inválido").optional().or(z.literal("")),
    consultation: z.string().min(1, "Debe seleccionar un tipo de consulta"),
    duration: z.string().min(1, "Debe seleccionar una duración"),
    notes: z.string().optional(),
}).refine((data) => {
    if (data.isNewPatient) {
        return data.newPatientDni && data.newPatientDni.length >= 8 &&
            data.newPatientPhone && data.newPatientPhone.length >= 9;
    }
    return true;
}, {
    message: "DNI (8 dígitos) y teléfono (9 dígitos) son requeridos para nuevos pacientes",
    path: ["newPatientDni"],
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

interface AppointmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedDate?: Date;
    selectedTime?: string;
    onSuccess?: () => void;
}

export default function AppointmentDialog({
    open,
    onOpenChange,
    selectedDate,
    selectedTime,
    onSuccess,
}: AppointmentDialogProps) {
    // Estados
    const [searchPatient, setSearchPatient] = useState("");
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingPatients, setLoadingPatients] = useState(false);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [validacion, setValidacion] = useState<{ disponible: boolean; mensaje: string }>({
        disponible: true,
        mensaje: ''
    });

    // Form setup
    const form = useForm<AppointmentFormValues>({
        resolver: zodResolver(appointmentFormSchema),
        defaultValues: {
            date: selectedDate || new Date(),
            time: selectedTime || "",
            patientId: "",
            patientName: "",
            isNewPatient: false,
            newPatientDni: "",
            newPatientPhone: "",
            newPatientEmail: "",
            consultation: "",
            duration: "30",
            notes: "",
        },
    });

    useEffect(() => {
        if (open) {
            form.setValue("date", selectedDate || new Date());
            form.setValue("time", selectedTime || "");
        }
    }, [open, selectedDate, selectedTime, form]);

    // Watch para modo nuevo paciente
    const isNewPatient = form.watch("isNewPatient");
    const watchedDate = form.watch("date");
    const watchedTime = form.watch("time");

    // ==================== CARGAR PACIENTES Y CITAS ====================
    useEffect(() => {
        if (open) {
            loadPatients();
            loadAppointments();
        }
    }, [open]);

    const loadPatients = async () => {
        setLoadingPatients(true);
        try {
            const patientsData = await getAllPatients();
            setPatients(patientsData || []);
        } catch (error) {
            console.error("Error al cargar pacientes:", error);
            setPatients([]);
            toast({
                title: "⚠️ Advertencia",
                description: "No se pudieron cargar los pacientes.",
                variant: "destructive",
            });
        } finally {
            setLoadingPatients(false);
        }
    };

    const loadAppointments = async () => {
        try {
            const appointmentsData = await getAllAppointments();
            setAppointments(appointmentsData || []);
        } catch (error) {
            console.error("Error al cargar citas:", error);
            setAppointments([]);
        }
    };

    // ==================== FUNCIÓN DE VALIDACIÓN DE DISPONIBILIDAD ====================
    const validarDisponibilidadHorario = (fecha: Date, hora: string): { disponible: boolean; mensaje: string } => {
        if (!fecha || !hora || !appointments || appointments.length === 0) {
            return { disponible: true, mensaje: '' };
        }

        try {
            // Calcular el inicio del intervalo en minutos desde medianoche
            const horaInicio = (parseInt(hora.split(':')[0]) * 60) + parseInt(hora.split(':')[1] || '0');
            const horaFin = horaInicio + 30; // Intervalo de 30 minutos

            // Filtrar todas las citas del día seleccionado
            const citasDelDia = appointments.filter(apt => {
                try {
                    // Verificar si fecha existe y tiene el método toDate
                    if (!apt.fecha) return false;
                    
                    let fechaCita: Date;
                    if (typeof apt.fecha.toDate === 'function') {
                        fechaCita = apt.fecha.toDate();
                    } else if (apt.fecha instanceof Date) {
                        fechaCita = apt.fecha;
                    } else {
                        return false;
                    }
                    
                    return isSameDay(fechaCita, fecha);
                } catch (error) {
                    console.error("Error procesando fecha de cita:", error);
                    return false;
                }
            });

            console.log(`Citas del día encontradas: ${citasDelDia.length}`, citasDelDia);

            // Contar cuántas citas están activas en este intervalo de 30 minutos
            const citasEnIntervalo = citasDelDia.filter(apt => {
                try {
                    if (!apt.hora || !apt.duracion) return false;
                    
                    const aptInicio = (parseInt(apt.hora.split(':')[0]) * 60) + parseInt(apt.hora.split(':')[1] || '0');
                    const aptFin = aptInicio + parseInt(apt.duracion);

                    // La cita se superpone con el intervalo si:
                    // - Empieza antes de que termine el intervalo Y
                    // - Termina después de que empiece el intervalo
                    const seSuperpone = aptInicio < horaFin && aptFin > horaInicio;
                    
                    if (seSuperpone) {
                        console.log(`Cita superpuesta: ${apt.hora} - ${apt.duracion} min`);
                    }
                    
                    return seSuperpone;
                } catch (error) {
                    console.error("Error procesando cita:", error);
                    return false;
                }
            });

            console.log(`Citas en intervalo ${hora}: ${citasEnIntervalo.length}`);

            if (citasEnIntervalo.length >= 3) {
                return {
                    disponible: false,
                    mensaje: 'No hay disponibilidad en este horario. Ya hay 3 citas programadas para este intervalo.'
                };
            }

            return { disponible: true, mensaje: '' };
        } catch (error) {
            console.error("Error en validación:", error);
            return { disponible: true, mensaje: '' };
        }
    };

    // ==================== VALIDAR CUANDO CAMBIE FECHA U HORA ====================
    useEffect(() => {
        if (watchedDate && watchedTime) {
            const resultado = validarDisponibilidadHorario(watchedDate, watchedTime);
            setValidacion(resultado);
        } else {
            setValidacion({ disponible: true, mensaje: '' });
        }
    }, [watchedDate, watchedTime, appointments]);

    // Filtrado de pacientes
    const filteredPatients = patients.filter(p => {
        const fullName = `${p.nombre} ${p.apellido_paterno} ${p.apellido_materno}`.toLowerCase();
        return fullName.includes(searchPatient.toLowerCase()) ||
            p.dni_cliente.includes(searchPatient);
    });

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

    // ==================== SEPARAR NOMBRE COMPLETO ====================
    const separateFullName = (fullName: string) => {
        const capitalizedName = capitalizeWords(fullName);
        const parts = capitalizedName.split(" ");

        if (parts.length === 1) {
            return { nombre: parts[0], apellido_paterno: "", apellido_materno: "" };
        } else if (parts.length === 2) {
            return { nombre: parts[0], apellido_paterno: parts[1], apellido_materno: "" };
        } else if (parts.length === 3) {
            return { nombre: parts[0], apellido_paterno: parts[1], apellido_materno: parts[2] };
        } else {
            const apellido_materno = parts.pop() || "";
            const apellido_paterno = parts.pop() || "";
            const nombre = parts.join(" ");
            return { nombre, apellido_paterno, apellido_materno };
        }
    };

    // ==================== HANDLER DE SUBMIT ====================
    const onSubmit = async (data: AppointmentFormValues) => {
        // Validar disponibilidad antes de crear
        if (!validacion.disponible) {
            toast({
                title: "⚠️ Horario no disponible",
                description: validacion.mensaje,
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            let patientId = data.patientId;

            // ========== SI ES NUEVO PACIENTE, CREARLO ==========
            if (data.isNewPatient) {
                // Verificar si el DNI ya existe
                const existingPatient = await findPatientByDNI(data.newPatientDni!);

                if (existingPatient) {
                    toast({
                        title: "⚠️ Paciente ya existe",
                        description: "Ya existe un paciente con ese DNI. Se usará el existente.",
                    });
                    patientId = existingPatient.id!;
                } else {
                    // Separar el nombre completo
                    const { nombre, apellido_paterno, apellido_materno } = separateFullName(data.patientName);

                    // Crear nuevo paciente con datos básicos
                    const newPatientData: Omit<Patient, "id" | "fecha_creacion"> = {
                        nombre,
                        apellido_paterno,
                        apellido_materno,
                        dni_cliente: data.newPatientDni!,
                        celular: data.newPatientPhone!,
                        email: data.newPatientEmail || "",
                        // Campos opcionales con valores por defecto vacíos
                        edad: undefined,
                        sexo: "",
                        direccion: "",
                        distrito_direccion: "",
                        estado_civil: "",
                        telefono_fijo: "",
                        ocupacion: "",
                        lugar_procedencia: "",
                        fecha_nacimiento: undefined,
                    };

                    patientId = await createPatient(newPatientData);

                    toast({
                        title: "✅ Paciente creado",
                        description: `Paciente ${data.patientName} creado exitosamente.`,
                    });
                }
            }

            // ========== VERIFICAR QUE TENEMOS UN PACIENTE ID ==========
            if (!patientId) {
                throw new Error("No se pudo obtener el ID del paciente");
            }

            const capitalizedPatientName = capitalizeWords(data.patientName);

            // ========== CREAR LA CITA ==========
            const appointmentData = {
                fecha: data.date,
                hora: data.time,
                paciente_id: patientId,
                paciente_nombre: capitalizedPatientName,
                tipo_consulta: data.consultation,
                duracion: data.duration,
                notas_observaciones: data.notes || "",
                estado: "pendiente" as const,
            };

            await createAppointment(appointmentData);

            toast({
                title: "✅ Cita creada exitosamente",
                description: `Cita para ${capitalizedPatientName} agendada el ${format(data.date, "PPP", { locale: es })} a las ${data.time}.`,
            });

            // Reset y cerrar
            form.reset();
            setSearchPatient("");
            onOpenChange(false);
            onSuccess?.();

        } catch (error: any) {
            console.error("Error completo:", error);
            toast({
                title: "❌ Error",
                description: error.message || "No se pudo crear la cita. Intenta nuevamente.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-semibold">Nueva Cita</DialogTitle>
                    <DialogDescription className="sr-only">
                        Formulario para crear una nueva cita médica
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* 1️⃣ FECHA Y HORA */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Campo de Fecha */}
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

                            {/* Campo de Hora */}
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
                                        
                                        {/* MENSAJE DE ERROR DE DISPONIBILIDAD */}
                                        {!validacion.disponible && (
                                            <div className="mt-2 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md p-3 flex items-start gap-2">
                                                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                                <span>{validacion.mensaje}</span>
                                            </div>
                                        )}
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* 2️⃣ SELECTOR DE PACIENTE */}
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="patientName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Paciente *</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    placeholder="Buscar paciente por nombre o DNI..."
                                                    className="pl-10"
                                                    value={searchPatient}
                                                    onChange={(e) => {
                                                        setSearchPatient(e.target.value);
                                                        form.setValue("isNewPatient", false);
                                                        form.setValue("patientName", "");
                                                    }}
                                                    disabled={loadingPatients}
                                                />
                                                {loadingPatients && (
                                                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                                                )}
                                            </div>
                                        </FormControl>

                                        {/* Lista de resultados */}
                                        {searchPatient && !loadingPatients && (
                                            <div className="mt-2 border rounded-md max-h-[200px] overflow-y-auto bg-card">
                                                {filteredPatients.length > 0 ? (
                                                    <div className="p-1">
                                                        {filteredPatients.map((patient) => (
                                                            <button
                                                                key={patient.id}
                                                                type="button"
                                                                onClick={() => {
                                                                    const capitalizedName = capitalizeWords(
                                                                        `${patient.nombre} ${patient.apellido_paterno} ${patient.apellido_materno}`
                                                                    );
                                                                    form.setValue("patientId", patient.id!);
                                                                    form.setValue("patientName", capitalizedName);
                                                                    form.setValue("isNewPatient", false);
                                                                    setSearchPatient(capitalizedName);
                                                                }}
                                                                className="w-full text-left px-3 py-2 hover:bg-accent rounded-md transition-colors"
                                                            >
                                                                <div className="font-medium">
                                                                    {capitalizeWords(`${patient.nombre} ${patient.apellido_paterno} ${patient.apellido_materno}`)}
                                                                </div>
                                                                <div className="text-sm text-muted-foreground">
                                                                    DNI: {patient.dni_cliente}
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="p-4 text-center">
                                                        <p className="text-sm text-muted-foreground mb-3">
                                                            No se encontró paciente con ese nombre o DNI
                                                        </p>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                form.setValue("isNewPatient", true);
                                                                form.setValue("patientName", searchPatient);
                                                            }}
                                                        >
                                                            <UserPlus className="h-4 w-4 mr-2" />
                                                            Crear nuevo paciente "{searchPatient}"
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Campos condicionales para nuevo paciente */}
                            {isNewPatient && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                                    <div className="col-span-2">
                                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                                            📝 Completar datos del nuevo paciente
                                        </p>
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="newPatientDni"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>DNI *</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="12345678"
                                                        maxLength={8}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="newPatientPhone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Teléfono *</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="+51 999 888 777"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}
                        </div>

                        {/* 3️⃣ TIPO DE CONSULTA */}
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

                        {/* 4️⃣ DURACIÓN */}
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

                        {/* 5️⃣ NOTAS Y OBSERVACIONES */}
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notas y Observaciones</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Escribe aquí cualquier información adicional sobre la cita..."
                                            className="min-h-[100px] resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* BOTONES */}
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    onOpenChange(false);
                                    form.reset();
                                    setSearchPatient("");
                                }}
                                disabled={loading}
                            >
                                Cancelar
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={loading || !validacion.disponible}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creando...
                                    </>
                                ) : (
                                    "Crear Cita"
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}