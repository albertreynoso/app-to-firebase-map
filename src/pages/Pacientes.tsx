import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Mail, Phone, Calendar, FileText, Filter, X, AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PatientDetailDialog from "@/components/PatientDetail";
import PatientDialog from "@/components/PatientDialog";
import { collection, getDocs, query, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Patient } from "@/types/appointment";

// Interfaz extendida para incluir datos calculados
interface PatientWithStats extends Patient {
  fullName: string;
  age: number | null;
  initials: string;
}

export default function Pacientes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [isNewPatientDialogOpen, setIsNewPatientDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientWithStats | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage, setPatientsPerPage] = useState(10);
  
  // Estados para Firebase
  const [patients, setPatients] = useState<PatientWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  

  // Función para obtener pacientes de Firebase
  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const patientsRef = collection(db, "pacientes");
      const q = query(patientsRef, orderBy("fecha_creacion", "desc"));
      const querySnapshot = await getDocs(q);
      
      const patientsData: PatientWithStats[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        
        // Convertir Timestamps a Date
        const fechaNacimiento = data.fecha_nacimiento?.toDate();
        const fechaCreacion = data.fecha_creacion?.toDate() || new Date();
        
        const fullName = `${data.nombre} ${data.apellido_paterno} ${data.apellido_materno}`.trim();
        const age = data.edad || calculateAge(fechaNacimiento);
        
        // Generar iniciales
        const initials = `${data.nombre?.[0] || ''}${data.apellido_paterno?.[0] || ''}`.toUpperCase();
        
        return {
          id: doc.id,
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
          // Campos calculados
          fullName,
          age,
          initials
        };
      });
      
      setPatients(patientsData);
    } catch (err) {
      console.error("Error al obtener pacientes:", err);
      setError("Error al cargar los pacientes. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // Cargar pacientes al montar el componente
  useEffect(() => {
    fetchPatients();
  }, []);

  // Recargar cuando se cierre el diálogo de nuevo paciente
  useEffect(() => {
    if (!isNewPatientDialogOpen) {
      fetchPatients();
    }
  }, [isNewPatientDialogOpen]);

  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateFilter]);

  // Calcular estadísticas
  const totalPacientes = patients.length;
  const pacientesUltimoMes = patients.filter(p => {
    const diffTime = new Date().getTime() - p.fecha_creacion.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  }).length;

  // Función para calcular edad desde fecha de nacimiento
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

  // Función para filtrar pacientes
  const filteredPatients = patients.filter((patient) => {
    // Filtro de búsqueda
    const searchMatch =
      patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.celular.includes(searchTerm) ||
      patient.dni_cliente.includes(searchTerm);

    // Filtro por fecha de creación
    const dateMatch = (() => {
      if (dateFilter === "all") return true;

      const today = new Date();
      const creationDate = patient.fecha_creacion;

      const diffTime = today.getTime() - creationDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      switch (dateFilter) {
        case "lastWeek": return diffDays <= 7;
        case "lastMonth": return diffDays <= 30;
        case "last3Months": return diffDays <= 90;
        default: return true;
      }
    })();

    return searchMatch && dateMatch;
  });

  const clearFilters = () => {
    setDateFilter("all");
    setSearchTerm("");
    setCurrentPage(1);
  };

  const activeFiltersCount = [
    dateFilter !== "all",
    searchTerm !== ""
  ].filter(Boolean).length;

  const handleViewPatient = (patient: PatientWithStats) => {
    setSelectedPatient(patient);
    setIsDetailDialogOpen(true);
  };

  // Lógica de paginación
  const totalPatients = filteredPatients.length;
  const totalPages = Math.ceil(totalPatients / patientsPerPage);

  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };


  // Resetear a la primera página cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Pacientes</h1>
          <p className="text-muted-foreground">Gestiona las fichas médicas de tus pacientes</p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary-hover text-primary-foreground" 
          onClick={() => setIsNewPatientDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Paciente
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, DNI, email o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* Filtros Expandibles */}
        {showFilters && (
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium">Filtro por Fecha de Registro</label>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las fechas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las fechas</SelectItem>
                      <SelectItem value="lastWeek">Registrados: Última semana</SelectItem>
                      <SelectItem value="lastMonth">Registrados: Último mes</SelectItem>
                      <SelectItem value="last3Months">Registrados: Últimos 3 meses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="outline"
                  onClick={clearFilters}
                  disabled={activeFiltersCount === 0}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Limpiar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Pacientes</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {loading ? "..." : totalPacientes}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Nuevos Ingresos del Mes</p>
            <p className="text-2xl font-bold text-success mt-1">
              {loading ? "..." : pacientesUltimoMes}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Resultados de Búsqueda</p>
            <p className="text-2xl font-bold text-secondary mt-1">
              {loading ? "..." : filteredPatients.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Cargando pacientes...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-semibold text-destructive">Error al cargar pacientes</p>
                <p className="text-sm text-muted-foreground mt-1">{error}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchPatients}
                className="ml-auto"
              >
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && patients.length === 0 && (
        <Card>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <FileText className="h-12 w-12 text-muted-foreground" />
              <div>
                <p className="font-semibold text-foreground">No hay pacientes registrados</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Comienza agregando tu primer paciente
                </p>
              </div>
              <Button onClick={() => setIsNewPatientDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Paciente
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results State */}
      {!loading && !error && patients.length > 0 && filteredPatients.length === 0 && (
        <Card>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <Search className="h-12 w-12 text-muted-foreground" />
              <div>
                <p className="font-semibold text-foreground">No se encontraron resultados</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Intenta ajustar los filtros de búsqueda
                </p>
              </div>
              <Button variant="outline" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Patient List */}
      {!loading && !error && currentPatients.length > 0 && (
        <div className="grid gap-4">
          {currentPatients.map((patient) => (
            <Card key={patient.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl font-bold text-primary">
                        {patient.initials}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground text-lg">
                          {patient.fullName}
                        </h3>
                        <Badge variant="default">
                          {patient.sexo || "N/A"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-muted-foreground">
                          {patient.age ? `${patient.age} años` : "Edad no registrada"}
                        </p>
                        <span className="text-muted-foreground">•</span>
                        <p className="text-sm text-muted-foreground">
                          DNI: {patient.dni_cliente || "No registrado"}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-4 mt-3">
                        {patient.email && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            <span>{patient.email}</span>
                          </div>
                        )}
                        {patient.celular && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            <span>{patient.celular}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Fecha de registro</p>
                          <p className="font-medium text-foreground">
                            {patient.fecha_creacion.toLocaleDateString('es-PE')}
                          </p>
                        </div>
                      </div>
                      {patient.ocupacion && (
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Ocupación</p>
                            <p className="font-medium text-foreground">{patient.ocupacion}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <Link to={`/pacientes/${patient.id}`}>
                      <Button variant="outline" size="sm">
                        Ver Detalle
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Componente de Paginación */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
          <div className="text-sm text-muted-foreground">
            Mostrando {indexOfFirstPatient + 1}-{Math.min(indexOfLastPatient, totalPatients)} de {totalPatients} pacientes
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Números de página */}
            <div className="flex gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }
                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => paginate(pageNumber)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNumber}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={nextPage}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Selector de pacientes por página */}
          <div className="flex items-center gap-2 text-sm">
            <span>Por página:</span>
            <Select
              value={patientsPerPage.toString()}
              onValueChange={(value) => {
                setPatientsPerPage(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Diálogos */}
      <PatientDialog 
        open={isNewPatientDialogOpen} 
        onOpenChange={setIsNewPatientDialogOpen} 
      />
      
      {/* Descomenta cuando PatientDetailDialog esté listo para usar datos de Firebase */}
      {/* <PatientDetailDialog 
        patient={selectedPatient} 
        open={isDetailDialogOpen} 
        onOpenChange={setIsDetailDialogOpen} 
      /> */}
    </div>
  );
}