// src/services/appointmentService.ts
import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where,
  Timestamp,
  serverTimestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Patient, Appointment } from "@/types/appointment";

// ==================== PACIENTES ====================

/**
 * Crear un nuevo paciente en Firebase
 */
export const createPatient = async (patientData: Omit<Patient, "id" | "fecha_creacion">): Promise<string> => {
  try {
    console.log("📝 Intentando crear paciente con datos:", patientData);

    // Preparar datos para Firebase
    const patientForFirebase = {
      nombre: patientData.nombre || "",
      apellido_paterno: patientData.apellido_paterno || "",
      apellido_materno: patientData.apellido_materno || "",
      dni_cliente: patientData.dni_cliente,
      celular: patientData.celular,
      edad: patientData.edad || null,
      sexo: patientData.sexo || "",
      direccion: patientData.direccion || "",
      distrito_direccion: patientData.distrito_direccion || "",
      estado_civil: patientData.estado_civil || "",
      telefono_fijo: patientData.telefono_fijo || "",
      ocupacion: patientData.ocupacion || "",
      lugar_procedencia: patientData.lugar_procedencia || "",
      fecha_creacion: serverTimestamp(),
      fecha_nacimiento: patientData.fecha_nacimiento 
        ? Timestamp.fromDate(patientData.fecha_nacimiento) 
        : null,
    };

    console.log("🔄 Datos preparados para Firebase:", patientForFirebase);

    const docRef = await addDoc(collection(db, "pacientes"), patientForFirebase);
    
    console.log("✅ Paciente creado exitosamente con ID:", docRef.id);
    return docRef.id;
  } catch (error: any) {
    console.error("❌ Error detallado al crear paciente:", error);
    console.error("❌ Código de error:", error.code);
    console.error("❌ Mensaje:", error.message);
    throw new Error(`Error al crear paciente: ${error.message}`);
  }
};

/**
 * Buscar paciente por DNI
 */
export const findPatientByDNI = async (dni: string): Promise<Patient | null> => {
  try {
    console.log("🔍 Buscando paciente con DNI:", dni);
    
    const q = query(collection(db, "pacientes"), where("dni_cliente", "==", dni));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      console.log("✅ Paciente encontrado:", doc.id);
      
      return { 
        id: doc.id, 
        ...data,
        fecha_creacion: data.fecha_creacion?.toDate() || new Date(),
        fecha_nacimiento: data.fecha_nacimiento?.toDate() || undefined,
      } as Patient;
    }
    
    console.log("ℹ️ No se encontró paciente con ese DNI");
    return null;
  } catch (error: any) {
    console.error("❌ Error al buscar paciente:", error);
    return null;
  }
};

/**
 * Obtener todos los pacientes
 */
export const getAllPatients = async (): Promise<Patient[]> => {
  try {
    console.log("📋 Obteniendo todos los pacientes...");
    
    const querySnapshot = await getDocs(collection(db, "pacientes"));
    
    const patients = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        fecha_creacion: data.fecha_creacion?.toDate() || new Date(),
        fecha_nacimiento: data.fecha_nacimiento?.toDate() || undefined,
      } as Patient;
    });
    
    console.log(`✅ Se obtuvieron ${patients.length} pacientes`);
    return patients;
  } catch (error: any) {
    console.error("❌ Error al obtener pacientes:", error);
    return [];
  }
};

/**
 * Obtener paciente por ID
 */
export const getPatientById = async (patientId: string): Promise<Patient | null> => {
  try {
    console.log("🔍 Buscando paciente con ID:", patientId);
    
    const docRef = doc(db, "pacientes", patientId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log("✅ Paciente encontrado");
      
      return { 
        id: docSnap.id, 
        ...data,
        fecha_creacion: data.fecha_creacion?.toDate() || new Date(),
        fecha_nacimiento: data.fecha_nacimiento?.toDate() || undefined,
      } as Patient;
    }
    
    console.log("ℹ️ No se encontró paciente con ese ID");
    return null;
  } catch (error: any) {
    console.error("❌ Error al obtener paciente:", error);
    return null;
  }
};

// ==================== CITAS ====================

/**
 * Crear una nueva cita en Firebase
 */
export const createAppointment = async (
  appointmentData: Omit<Appointment, "id" | "fecha_creacion">
): Promise<string> => {
  try {
    console.log("📝 Intentando crear cita con datos:", appointmentData);

    const appointmentForFirebase = {
      fecha: Timestamp.fromDate(appointmentData.fecha),
      hora: appointmentData.hora,
      paciente_id: appointmentData.paciente_id,
      paciente_nombre: appointmentData.paciente_nombre,
      tipo_consulta: appointmentData.tipo_consulta,
      duracion: appointmentData.duracion,
      notas_observaciones: appointmentData.notas_observaciones || "",
      estado: appointmentData.estado,
      fecha_creacion: serverTimestamp(),
    };

    console.log("🔄 Datos preparados para Firebase:", appointmentForFirebase);

    const docRef = await addDoc(collection(db, "citas"), appointmentForFirebase);
    
    console.log("✅ Cita creada exitosamente con ID:", docRef.id);
    return docRef.id;
  } catch (error: any) {
    console.error("❌ Error detallado al crear cita:", error);
    console.error("❌ Código de error:", error.code);
    console.error("❌ Mensaje:", error.message);
    throw new Error(`Error al crear cita: ${error.message}`);
  }
};

/**
 * Obtener todas las citas
 */
export const getAllAppointments = async (): Promise<Appointment[]> => {
  try {
    console.log("📋 Obteniendo todas las citas...");
    
    const querySnapshot = await getDocs(collection(db, "citas"));
    
    const appointments = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        fecha: data.fecha?.toDate() || new Date(),
        fecha_creacion: data.fecha_creacion?.toDate() || new Date(),
      } as Appointment;
    });
    
    console.log(`✅ Se obtuvieron ${appointments.length} citas`);
    return appointments;
  } catch (error: any) {
    console.error("❌ Error al obtener citas:", error);
    return [];
  }
};

/**
 * Obtener citas por paciente
 */
export const getAppointmentsByPatient = async (patientId: string): Promise<Appointment[]> => {
  try {
    console.log("🔍 Buscando citas del paciente:", patientId);
    
    const q = query(collection(db, "citas"), where("paciente_id", "==", patientId));
    const querySnapshot = await getDocs(q);
    
    const appointments = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        fecha: data.fecha?.toDate() || new Date(),
        fecha_creacion: data.fecha_creacion?.toDate() || new Date(),
      } as Appointment;
    });
    
    console.log(`✅ Se encontraron ${appointments.length} citas`);
    return appointments;
  } catch (error: any) {
    console.error("❌ Error al obtener citas del paciente:", error);
    return [];
  }
};

/**
 * Obtener citas por fecha
 */
export const getAppointmentsByDate = async (date: Date): Promise<Appointment[]> => {
  try {
    console.log("🔍 Buscando citas para la fecha:", date);
    
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const q = query(
      collection(db, "citas"),
      where("fecha", ">=", Timestamp.fromDate(startOfDay)),
      where("fecha", "<=", Timestamp.fromDate(endOfDay))
    );
    
    const querySnapshot = await getDocs(q);
    
    const appointments = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        fecha: data.fecha?.toDate() || new Date(),
        fecha_creacion: data.fecha_creacion?.toDate() || new Date(),
      } as Appointment;
    });
    
    console.log(`✅ Se encontraron ${appointments.length} citas para esa fecha`);
    return appointments;
  } catch (error: any) {
    console.error("❌ Error al obtener citas por fecha:", error);
    return [];
  }
};