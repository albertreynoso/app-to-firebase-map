import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Mail, Phone, Calendar, FileText } from "lucide-react";

export default function Pacientes() {
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Pacientes</h1>
          <p className="text-muted-foreground">Gestiona las fichas médicas de tus pacientes</p>
        </div>
        <Button className="bg-primary hover:bg-primary-hover text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Paciente
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Buscar pacientes por nombre, email o teléfono..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
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
        {filteredPatients.map((patient) => (
          <Card key={patient.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
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

                  <Button variant="outline" size="sm" className="whitespace-nowrap">
                    Ver Ficha
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
