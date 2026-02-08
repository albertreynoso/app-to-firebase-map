// src/types/appointment.ts
export interface EstadoHistorial {
  estado: string;
  fecha: Date;
  realizado_por: string;
  tipo: "creacion" | "cambio_estado";
}

export interface Patient {
  id?: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  edad?: number;
  sexo?: "Masculino" | "Femenino" | "Otro" | "";
  direccion?: string;
  distrito_direccion?: string;
  dni_cliente: string;
  estado_civil?: "Soltero" | "Casado" | "Divorciado" | "Viudo" | "";
  telefono_fijo?: string;
  celular: string;
  email: string;
  ocupacion?: string;
  lugar_procedencia?: string;
  fecha_creacion: Date;
  fecha_nacimiento?: Date;
}

export interface Appointment {
  // Información básica
  id?: string;
  fecha: Date;
  hora: string;
  fecha_creacion: Date;

  // Información del paciente
  paciente_id: string;
  paciente_nombre: string;

  // Tipo de cita (IMPORTANTE)
  es_tratamiento: boolean;           // false = consulta, true = tratamiento
  tipo_consulta: string;             // "Evaluación general" o "Tratamiento: Ortodoncia"

  // Información de tratamiento (solo si es_tratamiento = true)
  tratamiento_id?: string;           // Opcional, solo para citas de tratamiento
  tratamiento_nombre?: string;       // Opcional, duplicado para queries rápidas

  // Duración y tiempo
  duracion: string;                  // "30", "60", "120" (en minutos)
  duracion_real?: string;            // Duración real después de completar
  hora_inicio_atencion?: string;     // Hora real de inicio
  hora_fin_atencion?: string;        // Hora real de fin

  // Personal
  atendido_por?: string;             // Nombre del profesional

  // Estado y pago
  estado: "pendiente" | "confirmada" | "completada" | "cancelada" | "reprogramada";
  costo?: number;                    // 0 para tratamientos, valor para consultas
  pagado?: boolean;

  // Notas
  notas_observaciones?: string;

  // Historial de cambios de estado
  historial_estados?: EstadoHistorial[];
}

// Función helper para obtener el color según el estado
export const getAppointmentColor = (estado: string): string => {
  const colorMap: Record<string, string> = {
    'confirmada': '#10B981', // Verde
    'confirmed': '#10B981',
    'pendiente': '#F59E0B', // Amarillo
    'pending': '#F59E0B',
    'completada': '#6B7280', // Gris
    'completed': '#6B7280',
    'cancelada': '#EF4444', // Rojo
    'cancelled': '#EF4444',
    'reprogramada': '#F97316', // Naranja
  };
  return colorMap[estado.toLowerCase()] || '#F59E0B';
};

// Configuración de estados con colores
export const APPOINTMENT_STATUS_CONFIG = {
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
} as const;