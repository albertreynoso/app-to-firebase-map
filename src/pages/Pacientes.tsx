import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Mail, Phone, Calendar, FileText, Filter, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PatientDetailDialog from "@/components/PatientDetail";
import PatientDialog from "@/components/PatientDialog";

export default function Pacientes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [isNewPatientDialogOpen, setIsNewPatientDialogOpen] = useState(false);
  const [selectePatient, setSelectedPatient] = useState<typeof patients[0] | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage, setPatientsPerPage] = useState(5); // Puedes hacer esto configurable

  const patients = [
    {
      id: 1,
      name: "María García Ruiz",
      age: 34,
      email: "maria.garcia@email.com",
      phone: "+34 612 111 222",
      lastVisit: "2025-10-20",
      nextAppointment: "2025-11-05",
      status: "active",
      treatments: 3,
    },
    {
      id: 2,
      name: "Juan Pérez López",
      age: 45,
      email: "juan.perez@email.com",
      phone: "+34 623 222 333",
      lastVisit: "2025-10-22",
      nextAppointment: "2025-11-10",
      status: "active",
      treatments: 2,
    },
    {
      id: 3,
      name: "Ana López Martín",
      age: 28,
      email: "ana.lopez@email.com",
      phone: "+34 634 333 444",
      lastVisit: "2025-10-18",
      nextAppointment: null,
      status: "pending",
      treatments: 5,
    },
    {
      id: 4,
      name: "Carlos Ruiz Sánchez",
      age: 52,
      email: "carlos.ruiz@email.com",
      phone: "+34 645 444 555",
      lastVisit: "2025-10-15",
      nextAppointment: "2025-11-01",
      status: "active",
      treatments: 1,
    },
    {
      id: 5,
      name: "Laura Torres Díaz",
      age: 39,
      email: "laura.torres@email.com",
      phone: "+34 656 555 666",
      lastVisit: "2025-10-23",
      nextAppointment: "2025-11-08",
      status: "active",
      treatments: 4,
    },
    {
      id: 6,
      name: "Miguel Fernández Gil",
      age: 61,
      email: "miguel.fernandez@email.com",
      phone: "+34 667 666 777",
      lastVisit: "2025-10-19",
      nextAppointment: "2025-11-12",
      status: "active",
      treatments: 6,
    },
  ];

  // Función para filtrar pacientes
  const filteredPatients = patients.filter((patient) => {
    // Filtro de búsqueda
    const searchMatch =
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm);

    // Filtro por fecha - CORREGIDO
    const dateMatch = (() => {
      if (dateFilter === "all") return true;

      const today = new Date();
      const lastVisitDate = new Date(patient.lastVisit);

      // Calcular diferencia en días - FORMA CORRECTA
      const diffTime = today.getTime() - lastVisitDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      switch (dateFilter) {
        case "lastWeek": return diffDays <= 7;
        case "lastMonth": return diffDays <= 30;
        case "last3Months": return diffDays <= 90;
        case "noAppointment": return !patient.nextAppointment;
        default: return true;
      }
    })();

    return searchMatch && dateMatch;
  });

  const clearFilters = () => {
    setDateFilter("all");
    setSearchTerm("");
    setCurrentPage(1); // Resetear a primera página
  };


  // Contar filtros activos
  const activeFiltersCount = [
    dateFilter !== "all",
    searchTerm !== ""
  ].filter(Boolean).length;

  const handleViewPatient = (patient: typeof patients[0]) => {
    setSelectedPatient(patient);
    setIsDetailDialogOpen(true);
  }

  // Lógica de paginación
  const totalPatients = filteredPatients.length;
  const totalPages = Math.ceil(totalPatients / patientsPerPage);

  // Calcular índices para los pacientes de la página actual
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);

  // Función para cambiar de página
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Función para ir a la página siguiente
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Función para ir a la página anterior
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Pacientes</h1>
          <p className="text-muted-foreground">Gestiona las fichas médicas de tus pacientes</p>
        </div>
        <Button className="bg-primary hover:bg-primary-hover text-primary-foreground" onClick={() => setIsNewPatientDialogOpen(true)}>
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
              placeholder="Buscar pacientes por nombre, email o teléfono..."
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
                  <label className="text-sm font-medium">Filtro por Fecha</label>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las fechas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las fechas</SelectItem>
                      <SelectItem value="lastWeek">Última visita: Última semana</SelectItem>
                      <SelectItem value="lastMonth">Última visita: Último mes</SelectItem>
                      <SelectItem value="last3Months">Última visita: Últimos 3 meses</SelectItem>
                      <SelectItem value="noAppointment">Sin próxima cita</SelectItem>
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
            <p className="text-2xl font-bold text-foreground mt-1">248</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Activos Este Mes</p>
            <p className="text-2xl font-bold text-success mt-1">156</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Nuevos Este Mes</p>
            <p className="text-2xl font-bold text-secondary mt-1">23</p>
          </CardContent>
        </Card>
      </div>

      {/* Patient List */}
      <div className="grid gap-4">
        {currentPatients.map((patient) => (
          <Card key={patient.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              {/* ... (mantener todo el contenido existente de la tarjeta del paciente) ... */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-primary">
                      {patient.name.split(" ")[0][0]}
                      {patient.name.split(" ")[1][0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground text-lg">{patient.name}</h3>
                      <Badge variant={patient.status === "active" ? "default" : "secondary"}>
                        {patient.status === "active" ? "Activo" : "Pendiente"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{patient.age} años</p>
                    <div className="flex flex-wrap gap-4 mt-3">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{patient.email}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{patient.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Última visita</p>
                        <p className="font-medium text-foreground">{patient.lastVisit}</p>
                      </div>
                    </div>
                    {patient.nextAppointment && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Próxima cita</p>
                          <p className="font-medium text-primary">{patient.nextAppointment}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Tratamientos</p>
                      <p className="font-bold text-foreground">{patient.treatments}</p>
                    </div>
                  </div>

                  <Link to={`/pacientes/${patient.id}`}>
                    <Button variant="outline" size="sm">
                      Detalle
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Componente de Paginación */}
      {totalPages > 1 && (
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
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => paginate(page)}
                  className="w-8 h-8 p-0"
                >
                  {page}
                </Button>
              ))}
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

          {/* Selector de pacientes por página (opcional) */}
          <div className="flex items-center gap-2 text-sm">
            <span>Pacientes por página:</span>
            <Select
              value={patientsPerPage.toString()}
              onValueChange={(value) => {
                setPatientsPerPage(Number(value));
                setCurrentPage(1); // Resetear a primera página al cambiar el tamaño
              }}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <PatientDialog open={isNewPatientDialogOpen} onOpenChange={setIsNewPatientDialogOpen} />
{/*       <PatientDetailDialog patient={selectePatient} open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen} />
 */}
    </div>
  );
}
