// src/hooks/useAppointments.ts
import { useState, useEffect } from "react";
import { getAllAppointments, getAppointmentsByDate } from "@/services/appointmentService";
import { Appointment } from "@/types/appointment";

export const useAppointments = (filterByDate?: Date) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAppointments = async () => {
    console.log("🔄 useAppointments: Cargando citas...");
    setLoading(true);
    setError(null);
    
    try {
      let data: Appointment[];
      
      if (filterByDate) {
        console.log("📅 Filtrando por fecha:", filterByDate);
        data = await getAppointmentsByDate(filterByDate);
      } else {
        console.log("📋 Obteniendo todas las citas");
        data = await getAllAppointments();
      }
      
      console.log("✅ Citas cargadas:", data.length);
      setAppointments(data);
      return data; // Retornar los datos
    } catch (err: any) {
      console.error("❌ Error al cargar citas:", err);
      setError(err.message || "Error al cargar las citas");
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [filterByDate]);

  // Función refetch mejorada que retorna Promise
  const refetch = async () => {
    console.log("🔄 Refetch llamado");
    return await loadAppointments();
  };

  return {
    appointments,
    loading,
    error,
    refetch,
  };
};