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
  ocupacion?: string;
  lugar_procedencia?: string;
  fecha_creacion: Date;
  fecha_nacimiento?: Date;
}

export interface Appointment {
  id?: string;
  fecha: Date;
  hora: string;
  paciente_id: string;
  paciente_nombre: string;
  tipo_consulta: string;
  duracion: string;
  notas_observaciones?: string;
  estado: "confirmada" | "pendiente" | "completada" | "cancelada";
  fecha_creacion: Date;
}