import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Mail, Phone, UserCheck, MapPin, Calendar, IdCard } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase.config"; // Ajusta la ruta según tu configuración de Firebase

export default function Empleados() {
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Función para obtener empleados de Firestore
  const fetchEmployees = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "personal"));
      const employeesData = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        employeesData.push({
          id: doc.id,
          ...data
        });
      });
      
      setEmployees(employeesData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Función para mapear tipo_empleado_id a roles en español
  const getRoleFromType = (tipoEmpleado) => {
    const roleMap = {
      "Administrativo": "Administrativo",
      "Dentista": "Dentista",
      "Asistente": "Asistente Dental",
      "Recepcionista": "Recepcionista",
      "Higienista": "Higienista Dental"
    };
    return roleMap[tipoEmpleado] || tipoEmpleado;
  };

  // Función para generar imagen de perfil basada en género y nombre
  const getProfileImage = (employee) => {
    // Puedes usar un servicio como DiceBear o mantener imágenes locales
    const gender = employee.genero?.toLowerCase() || "neutral";
    const name = employee.nombre || "User";
    
    // Imágenes de placeholder basadas en género (puedes cambiar estas URLs)
    const maleImage = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face";
    const femaleImage = "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face";
    const neutralImage = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face";
    
    return gender.includes("femenino") ? femaleImage : 
           gender.includes("masculino") ? maleImage : neutralImage;
  };

  // Filtrar empleados basado en la búsqueda
  const filteredEmployees = employees.filter((emp) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      emp.nombre?.toLowerCase().includes(searchLower) ||
      emp.apellido_paterno?.toLowerCase().includes(searchLower) ||
      emp.apellido_materno?.toLowerCase().includes(searchLower) ||
      emp.dni_empleado?.includes(searchTerm) ||
      emp.tipo_empleado_id?.toLowerCase().includes(searchLower) ||
      emp.numero_telefonico?.includes(searchTerm)
    );
  });

  // Formatear nombre completo
  const getFullName = (employee) => {
    return `${employee.nombre || ''} ${employee.apellido_paterno || ''} ${employee.apellido_materno || ''}`.trim();
  };

  // Formatear salario
  const formatSalary = (salary) => {
    return `S/ ${Number(salary).toLocaleString('es-PE')}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando empleados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Empleados</h1>
          <p className="text-muted-foreground">
            {filteredEmployees.length} {filteredEmployees.length === 1 ? 'empleado' : 'empleados'} encontrados
          </p>
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
          placeholder="Buscar empleados por nombre, DNI, teléfono o cargo..."
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
                  src={getProfileImage(employee)}
                  alt={getFullName(employee)}
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/10"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-lg truncate">
                    {getFullName(employee)}
                  </h3>
                  <Badge variant="secondary" className="mt-1">
                    {getRoleFromType(employee.tipo_empleado_id)}
                  </Badge>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <IdCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">DNI: {employee.dni_empleado}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {employee.edad} años • {employee.genero}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{employee.numero_telefonico}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground truncate">{employee.direccion}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Contratado: {employee.fecha_contratacion}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-xs text-success font-medium flex items-center gap-1">
                    <span className="w-2 h-2 bg-success rounded-full"></span>
                    {employee.active ? "Activo" : "Inactivo"}
                  </span>
                  <span className="text-sm font-semibold text-foreground mt-1">
                    {formatSalary(employee.salario)}
                  </span>
                </div>
                <Button variant="outline" size="sm">
                  Ver Perfil
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEmployees.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No se encontraron empleados</p>
        </div>
      )}
    </div>
  );
}