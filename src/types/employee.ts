// src/types/employee.ts
export interface Employee {
  id?: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  dni_empleado: string;
  edad?: string;
  fecha_nacimiento?: string;
  genero?: "Masculino" | "Femenino" | "Otro" | "";
  numero_telefonico: string;
  direccion?: string;
  tipo_empleado_id: "Administrativo" | "Dentista" | "Asistente" | "Recepcionista" | "Higienista" | "";
  fecha_contratacion: string;
  salario: number;
  activo: boolean;
  fecha_creacion?: Date;
}

export interface EmployeeWithStats extends Employee {
  fullName: string;
  initials: string;
}

// Función helper para mapear tipo de empleado a rol en español
export const getRoleFromType = (tipoEmpleado: string): string => {
  const roleMap: Record<string, string> = {
    "Administrativo": "Administrativo",
    "Dentista": "Dentista",
    "Asistente": "Asistente Dental",
    "Recepcionista": "Recepcionista",
    "Higienista": "Higienista Dental"
  };
  return roleMap[tipoEmpleado] || tipoEmpleado;
};

// Configuración de tipos de empleado
export const EMPLOYEE_TYPES = [
  { value: "Dentista", label: "Dentista" },
  { value: "Asistente", label: "Asistente Dental" },
  { value: "Recepcionista", label: "Recepcionista" },
  { value: "Higienista", label: "Higienista Dental" },
  { value: "Administrativo", label: "Administrativo" },
] as const;