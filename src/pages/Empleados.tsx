import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Mail, Phone, UserCheck } from "lucide-react";

export default function Empleados() {
  const [searchTerm, setSearchTerm] = useState("");

  const employees = [
    {
      id: 1,
      name: "Dr. Carlos Rodríguez",
      role: "Dentista",
      specialty: "Odontología General",
      email: "carlos.rodriguez@dentalpro.com",
      phone: "+34 612 345 678",
      status: "active",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop",
    },
    {
      id: 2,
      name: "Dra. Ana Martínez",
      role: "Dentista",
      specialty: "Ortodoncia",
      email: "ana.martinez@dentalpro.com",
      phone: "+34 623 456 789",
      status: "active",
      image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=150&h=150&fit=crop",
    },
    {
      id: 3,
      name: "Dra. Laura Sánchez",
      role: "Dentista",
      specialty: "Endodoncia",
      email: "laura.sanchez@dentalpro.com",
      phone: "+34 634 567 890",
      status: "active",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop",
    },
    {
      id: 4,
      name: "María González",
      role: "Asistente",
      specialty: "Asistencia Dental",
      email: "maria.gonzalez@dentalpro.com",
      phone: "+34 645 678 901",
      status: "active",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop",
    },
    {
      id: 5,
      name: "Pedro López",
      role: "Recepcionista",
      specialty: "Atención al Cliente",
      email: "pedro.lopez@dentalpro.com",
      phone: "+34 656 789 012",
      status: "active",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    },
  ];

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Empleados</h1>
          <p className="text-muted-foreground">Gestiona tu equipo de trabajo</p>
        </div>
        <Button className="bg-primary hover:bg-primary-hover text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Empleado
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Buscar empleados por nombre, rol o especialidad..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Employee Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredEmployees.map((employee) => (
          <Card key={employee.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <img
                  src={employee.image}
                  alt={employee.name}
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/10"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-lg truncate">{employee.name}</h3>
                  <Badge variant="secondary" className="mt-1">
                    {employee.role}
                  </Badge>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{employee.specialty}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground truncate">{employee.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{employee.phone}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                <span className="text-xs text-success font-medium flex items-center gap-1">
                  <span className="w-2 h-2 bg-success rounded-full"></span>
                  Activo
                </span>
                <Button variant="outline" size="sm">
                  Ver Perfil
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
