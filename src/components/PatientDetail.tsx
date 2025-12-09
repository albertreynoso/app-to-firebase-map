import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Mail,
  Phone,
  MapPin,
  FileText,
  AlertCircle,
  Activity,
  Edit,
  ArrowLeft,
  DollarSign,
  Calendar,
  Clock,
  Plus,
  Loader2,
  User,
  Briefcase,
  Heart,
  Home,
  Stethoscope,
} from "lucide-react";
import EditPatientDialog from "./PatientDetailEdit";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Patient } from "@/types/appointment";
import { getAppointmentsByPatientId } from "@/services/appointmentService";
import TreatmentDialog from "./TreatmentDialog";

interface PatientWithStats extends Patient {
  fullName: string;
  age: number | null;
  initials: string;
}

interface Treatment {
  id: string;
  tratamiento: string;
  diagnostico: string;
  cantidad_citas_planificadas: number;
  presupuesto: any[];
  total_presupuesto: number;
  paciente_id: string;
  paciente_nombre: string;
  creador_id: string;
  creador_nombre: string;
  citas: string[];
  estado: string;
  fecha_creacion: any;
  fecha_ultima_actualizacion: any;
}

export default function PacienteDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<PatientWithStats | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loadingTreatments, setLoadingTreatments] = useState(true);
  const [isTreatmentDialogOpen, setIsTreatmentDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"consultas" | "tratamientos">("consultas");

  const calculateAge = (fechaNacimiento: Date | undefined): number | null => {
    if (!fechaNacimiento) return null;
    const today = new Date();
    const birthDate = fechaNacimiento instanceof Date ? fechaNacimiento : new Date(fechaNacimiento);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const fetchPatient = async () => {
    if (!id) {
      setError("ID de paciente no válido");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const patientRef = doc(db, "pacientes", id);
      const patientSnap = await getDoc(patientRef);

      if (!patientSnap.exists()) {
        setError("Paciente no encontrado");
        setLoading(false);
        return;
      }

      const data = patientSnap.data();
      const fechaNacimiento = data.fecha_nacimiento?.toDate();
      const fechaCreacion = data.fecha_creacion?.toDate() || new Date();
      const fullName = `${data.nombre || ""} ${data.apellido_paterno || ""} ${data.apellido_materno || ""}`.trim();
      const age = data.edad || calculateAge(fechaNacimiento);
      const initials = `${data.nombre?.[0] || ""}${data.apellido_paterno?.[0] || ""}`.toUpperCase();

      const patientData: PatientWithStats = {
        id: patientSnap.id,
        nombre: data.nombre || "",
        apellido_paterno: data.apellido_paterno || "",
        apellido_materno: data.apellido_materno || "",
        dni_cliente: data.dni_cliente || "",
        celular: data.celular || "",
        telefono_fijo: data.telefono_fijo || "",
        email: data.email || "",
        fecha_nacimiento: fechaNacimiento,
        edad: age,
        sexo: data.sexo || "",
        estado_civil: data.estado_civil || "",
        direccion: data.direccion || "",
        distrito_direccion: data.distrito_direccion || "",
        lugar_procedencia: data.lugar_procedencia || "",
        ocupacion: data.ocupacion || "",
        fecha_creacion: fechaCreacion,
        fullName,
        age,
        initials,
      };

      setPatient(patientData);
    } catch (err) {
      console.error("Error al obtener paciente:", err);
      setError("Error al cargar los datos del paciente");
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    if (!id) return;
    try {
      setLoadingAppointments(true);
      const appointmentsData = await getAppointmentsByPatientId(id);
      const processedAppointments = appointmentsData.map((apt: any) => ({
        ...apt,
        fecha: apt.fecha?.toDate ? apt.fecha.toDate() : new Date(apt.fecha),
        fecha_creacion: apt.fecha_creacion?.toDate ? apt.fecha_creacion.toDate() : new Date(apt.fecha_creacion),
      }));
      setAppointments(processedAppointments);
    } catch (error) {
      console.error("Error al cargar citas:", error);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const fetchTreatments = async () => {
    if (!id) return;
    try {
      setLoadingTreatments(true);
      const treatmentsRef = collection(db, "tratamientos");
      const q = query(treatmentsRef, where("paciente_id", "==", id));
      const querySnapshot = await getDocs(q);

      const treatmentsData: Treatment[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        treatmentsData.push({
          id: doc.id,
          tratamiento: data.tratamiento || "",
          diagnostico: data.diagnostico || "",
          cantidad_citas_planificadas: data.cantidad_citas_planificadas || 0,
          presupuesto: data.presupuesto || [],
          total_presupuesto: data.total_presupuesto || 0,
          paciente_id: data.paciente_id || "",
          paciente_nombre: data.paciente_nombre || "",
          creador_id: data.creador_id || "",
          creador_nombre: data.creador_nombre || "",
          citas: data.citas || [],
          estado: data.estado || "activo",
          fecha_creacion: data.fecha_creacion?.toDate ? data.fecha_creacion.toDate() : new Date(),
          fecha_ultima_actualizacion: data.fecha_ultima_actualizacion?.toDate ? data.fecha_ultima_actualizacion.toDate() : new Date(),
        });
      });

      treatmentsData.sort((a, b) => b.fecha_creacion.getTime() - a.fecha_creacion.getTime());
      setTreatments(treatmentsData);
    } catch (error) {
      console.error("Error al cargar tratamientos:", error);
    } finally {
      setLoadingTreatments(false);
    }
  };

  useEffect(() => {
    fetchPatient();
    if (id) {
      fetchAppointments();
      fetchTreatments();
    }
  }, [id]);

  const handleEditSuccess = () => {
    fetchPatient();
  };

  const handleTreatmentSuccess = () => {
    fetchTreatments();
  };

  const getStatusBadge = (estado: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
      confirmada: { label: "Confirmada", variant: "default" },
      pendiente: { label: "Pendiente", variant: "secondary" },
      completada: { label: "Completada", variant: "outline" },
      cancelada: { label: "Cancelada", variant: "destructive" },
      reprogramada: { label: "Reprogramada", variant: "secondary" },
    };
    const config = statusConfig[estado] || { label: estado, variant: "outline" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTreatmentStatusBadge = (estado: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
      activo: { label: "Activo", variant: "default" },
      completado: { label: "Completado", variant: "outline" },
      cancelado: { label: "Cancelado", variant: "destructive" },
      pausado: { label: "Pausado", variant: "secondary" },
    };
    const config = statusConfig[estado] || { label: estado, variant: "outline" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(amount);
  };

  const getConsultas = () => {
    const citasEnTratamientos = new Set(treatments.flatMap(t => t.citas || []));
    return appointments.filter(apt => !citasEnTratamientos.has(apt.id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando información del paciente...</p>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-semibold text-destructive">Error</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {error || "No se pudo cargar la información del paciente"}
                </p>
              </div>
              <div className="ml-auto flex gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate("/pacientes")}>
                  Volver a Pacientes
                </Button>
                <Button size="sm" onClick={fetchPatient}>
                  Reintentar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const FinancialTab = () => (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <DollarSign className="h-12 w-12 text-muted-foreground" />
            <div>
              <p className="font-semibold text-foreground">Información financiera</p>
              <p className="text-sm text-muted-foreground mt-1">
                Esta sección estará disponible próximamente
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const TreatmentsTab = () => {
    const consultas = getConsultas();

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant={viewMode === "consultas" ? "default" : "outline"}
              onClick={() => setViewMode("consultas")}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Consultas ({consultas.length})
            </Button>
            <Button
              variant={viewMode === "tratamientos" ? "default" : "outline"}
              onClick={() => setViewMode("tratamientos")}
            >
              <Stethoscope className="h-4 w-4 mr-2" />
              Tratamientos ({treatments.length})
            </Button>
          </div>
          <Button size="sm" onClick={() => setIsTreatmentDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Tratamiento
          </Button>
        </div>

        {viewMode === "consultas" && (
          <>
            {loadingAppointments ? (
              <Card>
                <CardContent className="p-12">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Cargando consultas...</p>
                  </div>
                </CardContent>
              </Card>
            ) : consultas.length === 0 ? (
              <Card>
                <CardContent className="p-12">
                  <div className="flex flex-col items-center justify-center gap-4 text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground" />
                    <div>
                      <p className="font-semibold text-foreground">
                        No hay consultas individuales
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Las consultas que no estén asociadas a un tratamiento aparecerán aquí
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {consultas.map((appointment) => (
                  <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        <div className="flex-shrink-0">
                          <div className="bg-primary/10 rounded-lg p-4 text-center min-w-[100px]">
                            <div className="text-2xl font-bold text-primary">
                              {new Date(appointment.fecha).getDate()}
                            </div>
                            <div className="text-xs text-muted-foreground uppercase">
                              {new Date(appointment.fecha).toLocaleDateString('es-PE', {
                                month: 'short',
                                year: 'numeric'
                              })}
                            </div>
                            <div className="flex items-center justify-center gap-1 mt-2">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm font-medium">{appointment.hora}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex-grow space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                            <div>
                              <h3 className="font-semibold text-lg text-foreground">
                                {appointment.tipo_consulta}
                              </h3>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                {getStatusBadge(appointment.estado)}
                                <span className="text-xs text-muted-foreground">
                                  • Duración: {appointment.duracion} min
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            {appointment.atendido_por && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <User className="h-4 w-4" />
                                <span>Atendido por: {appointment.atendido_por}</span>
                              </div>
                            )}
                            {appointment.duracion_real && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>Duración real: {appointment.duracion_real} min</span>
                              </div>
                            )}
                            {appointment.hora_inicio_atencion && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Activity className="h-4 w-4" />
                                <span>
                                  Atención: {appointment.hora_inicio_atencion}
                                  {appointment.hora_fin_atencion && ` - ${appointment.hora_fin_atencion}`}
                                </span>
                              </div>
                            )}
                          </div>
                          {appointment.notas_observaciones && (
                            <div className="bg-muted/50 rounded-lg p-3 mt-2">
                              <div className="flex items-start gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-1">
                                    Notas:
                                  </p>
                                  <p className="text-sm text-foreground">
                                    {appointment.notas_observaciones}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {viewMode === "tratamientos" && (
          <>
            {loadingTreatments ? (
              <Card>
                <CardContent className="p-12">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Cargando tratamientos...</p>
                  </div>
                </CardContent>
              </Card>
            ) : treatments.length === 0 ? (
              <Card>
                <CardContent className="p-12">
                  <div className="flex flex-col items-center justify-center gap-4 text-center">
                    <Stethoscope className="h-12 w-12 text-muted-foreground" />
                    <div>
                      <p className="font-semibold text-foreground">
                        No hay tratamientos registrados
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Los planes de tratamiento del paciente aparecerán aquí
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {treatments.map((treatment) => (
                  <Card key={treatment.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="border-b bg-muted/30">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <Stethoscope className="h-5 w-5 text-primary" />
                            <CardTitle className="text-xl">
                              {treatment.tratamiento}
                            </CardTitle>
                            {getTreatmentStatusBadge(treatment.estado)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Creado el {treatment.fecha_creacion.toLocaleDateString('es-PE', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Presupuesto Total</p>
                            <p className="text-2xl font-bold text-primary">
                              {formatCurrency(treatment.total_presupuesto)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-6 space-y-6">
                      <div>
                        <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                          Diagnóstico
                        </h4>
                        <p className="text-sm text-foreground bg-muted/30 p-3 rounded-lg">
                          {treatment.diagnostico}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="bg-muted/30 p-4 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Citas Planificadas</p>
                          <p className="text-2xl font-bold text-foreground">
                            {treatment.cantidad_citas_planificadas}
                          </p>
                        </div>
                        <div className="bg-muted/30 p-4 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Citas Realizadas</p>
                          <p className="text-2xl font-bold text-green-600">
                            {treatment.citas?.length || 0}
                          </p>
                        </div>
                        <div className="bg-muted/30 p-4 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Pendientes</p>
                          <p className="text-2xl font-bold text-yellow-600">
                            {treatment.cantidad_citas_planificadas - (treatment.citas?.length || 0)}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-muted-foreground mb-3">
                          Presupuesto Detallado
                        </h4>
                        <div className="border rounded-lg overflow-hidden">
                          <div className="bg-muted/50 px-4 py-2 grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground">
                            <div className="col-span-1">Cant.</div>
                            <div className="col-span-7">Descripción</div>
                            <div className="col-span-2 text-right">P. Unit.</div>
                            <div className="col-span-2 text-right">Total</div>
                          </div>
                          {treatment.presupuesto.map((item, idx) => (
                            <div key={idx}>
                              <div className="px-4 py-3 grid grid-cols-12 gap-2 border-t items-center">
                                <div className="col-span-1 font-medium">{item.cantidad}</div>
                                <div className="col-span-7 text-sm">{item.descripcion}</div>
                                <div className="col-span-2 text-right text-sm">
                                  {item.subitems && item.subitems.length > 0 
                                    ? "-" 
                                    : formatCurrency(item.precio_unitario)
                                  }
                                </div>
                                <div className="col-span-2 text-right font-medium">
                                  {formatCurrency(
                                    item.subitems && item.subitems.length > 0
                                      ? item.subitems.reduce((sum: number, sub: any) => 
                                          sum + (sub.cantidad * sub.precio_unitario), 0)
                                      : item.cantidad * item.precio_unitario
                                  )}
                                </div>
                              </div>
                              {item.subitems && item.subitems.length > 0 && (
                                item.subitems.map((subitem: any, subIdx: number) => (
                                  <div 
                                    key={subIdx} 
                                    className="px-4 py-2 grid grid-cols-12 gap-2 bg-muted/20 border-t items-center"
                                  >
                                    <div className="col-span-1 text-sm text-muted-foreground pl-4">
                                      {subitem.cantidad}
                                    </div>
                                    <div className="col-span-7 text-sm text-muted-foreground flex items-center gap-2">
                                      <span className="text-muted-foreground">↳</span>
                                      {subitem.descripcion}
                                    </div>
                                    <div className="col-span-2 text-right text-sm text-muted-foreground">
                                      {formatCurrency(subitem.precio_unitario)}
                                    </div>
                                    <div className="col-span-2 text-right text-sm font-medium text-muted-foreground">
                                      {formatCurrency(subitem.cantidad * subitem.precio_unitario)}
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {treatment.citas && treatment.citas.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-muted-foreground mb-3">
                            Citas Relacionadas ({treatment.citas.length})
                          </h4>
                          <div className="space-y-2">
                            {treatment.citas.map((citaId, idx) => {
                              const cita = appointments.find(apt => apt.id === citaId);
                              if (!cita) return null;
                              
                              return (
                                <div 
                                  key={citaId}
                                  className="bg-muted/30 p-3 rounded-lg flex items-center justify-between"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="bg-primary/10 rounded px-2 py-1">
                                      <span className="text-xs font-medium text-primary">
                                        Cita {idx + 1}
                                      </span>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">
                                        {new Date(cita.fecha).toLocaleDateString('es-PE', {
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric'
                                        })}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {cita.hora} • {cita.tipo_consulta}
                                      </p>
                                    </div>
                                  </div>
                                  {getStatusBadge(cita.estado)}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {(viewMode === "consultas" && consultas.length > 0) || 
         (viewMode === "tratamientos" && treatments.length > 0) ? (
          <Card className="bg-muted/30">
            <CardContent className="p-6">
              {viewMode === "consultas" ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-foreground">{consultas.length}</p>
                    <p className="text-xs text-muted-foreground">Total consultas</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">
                      {consultas.filter(a => a.estado === "pendiente").length}
                    </p>
                    <p className="text-xs text-muted-foreground">Pendientes</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {consultas.filter(a => a.estado === "completada").length}
                    </p>
                    <p className="text-xs text-muted-foreground">Completadas</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      {consultas.filter(a => a.estado === "confirmada").length}
                    </p>
                    <p className="text-xs text-muted-foreground">Confirmadas</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-foreground">{treatments.length}</p>
                    <p className="text-xs text-muted-foreground">Total tratamientos</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {treatments.filter(t => t.estado === "activo").length}
                    </p>
                    <p className="text-xs text-muted-foreground">Activos</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      {treatments.filter(t => t.estado === "completado").length}
                    </p>
                    <p className="text-xs text-muted-foreground">Completados</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(treatments.reduce((sum, t) => sum + t.total_presupuesto, 0))}
                    </p>
                    <p className="text-xs text-muted-foreground">Presupuesto total</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : null}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/pacientes">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Pacientes
          </Button>
        </Link>
      </div>

      <div className="p-6 lg:p-8 bg-background rounded-lg border">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 pb-6">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-primary">
                {patient.initials}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {patient.fullName}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <Badge variant="default" className="text-sm">
                  {patient.sexo || "No especificado"}
                </Badge>
                {patient.age && (
                  <span className="text-sm text-muted-foreground">
                    {patient.age} años
                  </span>
                )}
                <span className="text-sm text-muted-foreground">
                  DNI: {patient.dni_cliente}
                </span>
              </div>
              {patient.ocupacion && (
                <div className="flex items-center gap-2 mt-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {patient.ocupacion}
                  </span>
                </div>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditDialogOpen(true)}
            className="md:ml-auto"
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar Información
          </Button>
        </div>

        <Separator className="my-6" />

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="general">Información General</TabsTrigger>
            <TabsTrigger value="treatments">Tratamientos</TabsTrigger>
            <TabsTrigger value="financial">Financiero</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Información de Contacto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {patient.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="text-sm font-medium">{patient.email}</p>
                      </div>
                    </div>
                  )}
                  {patient.celular && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Celular</p>
                        <p className="text-sm font-medium">{patient.celular}</p>
                      </div>
                    </div>
                  )}
                  {patient.telefono_fijo && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Teléfono Fijo</p>
                        <p className="text-sm font-medium">{patient.telefono_fijo}</p>
                      </div>
                    </div>
                  )}
                  {!patient.email && !patient.celular && !patient.telefono_fijo && (
                    <p className="text-sm text-muted-foreground">
                      No hay información de contacto registrada
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Dirección
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {patient.direccion && (
                    <div className="flex items-start gap-3">
                      <Home className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Dirección</p>
                        <p className="text-sm font-medium">{patient.direccion}</p>
                        {patient.distrito_direccion && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {patient.distrito_direccion}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  {patient.lugar_procedencia && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Lugar de Procedencia</p>
                        <p className="text-sm font-medium">{patient.lugar_procedencia}</p>
                      </div>
                    </div>
                  )}
                  {!patient.direccion && !patient.lugar_procedencia && (
                    <p className="text-sm text-muted-foreground">
                      No hay información de dirección registrada
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Datos Personales
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {patient.fecha_nacimiento && (
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Fecha de Nacimiento</p>
                        <p className="text-sm font-medium">
                          {patient.fecha_nacimiento.toLocaleDateString('es-PE', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                  {patient.estado_civil && (
                    <div className="flex items-start gap-3">
                      <Heart className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Estado Civil</p>
                        <p className="text-sm font-medium">{patient.estado_civil}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Fecha de Registro</p>
                      <p className="text-sm font-medium">
                        {patient.fecha_creacion.toLocaleDateString('es-PE', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Información Adicional
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">DNI</p>
                      <p className="text-sm font-medium">{patient.dni_cliente}</p>
                    </div>
                    {patient.edad && (
                      <div>
                        <p className="text-xs text-muted-foreground">Edad</p>
                        <p className="text-sm font-medium">{patient.edad} años</p>
                      </div>
                    )}
                    {patient.sexo && (
                      <div>
                        <p className="text-xs text-muted-foreground">Sexo</p>
                        <p className="text-sm font-medium">{patient.sexo}</p>
                      </div>
                    )}
                    {patient.ocupacion && (
                      <div>
                        <p className="text-xs text-muted-foreground">Ocupación</p>
                        <p className="text-sm font-medium">{patient.ocupacion}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="treatments">
            <TreatmentsTab />
          </TabsContent>

          <TabsContent value="financial">
            <FinancialTab />
          </TabsContent>
        </Tabs>
      </div>

      <EditPatientDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        patient={patient}
        onSuccess={handleEditSuccess}
      />

      <TreatmentDialog
        open={isTreatmentDialogOpen}
        onOpenChange={setIsTreatmentDialogOpen}
        patientId={patient.id!}
        patientName={patient.fullName}
        onSuccess={handleTreatmentSuccess}
      />
    </div>
  );
}