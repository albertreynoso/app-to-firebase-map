import { useParams, Link } from "react-router-dom";
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
  Pill,
  Activity,
  Image,
  Edit,
  ArrowLeft,
  DollarSign, Calendar, Clock, CheckCircle, AlertTriangle, Plus 
} from "lucide-react";
import EditPatientDialog from "./PatientDetailEdit"; // Ajusta la ruta

export default function PacienteDetalle() {
  const { id } = useParams();
  const [patient, setPatient] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    // Simulación de fetch, cámbialo por tu fuente real (Firebase u otra)
    const mockData = {
      id,
      name: "María",
      lastName: "García Ruiz",
      age: 34,
      email: "maria.garcia@email.com",
      phone: "+34 612 111 222",
      address: "Av. Principal 456, Lima, Perú",
      dni: "73249876",
      gender: "femenino",
      birthDate: new Date(1990, 5, 15), // Añadir fecha de nacimiento
      status: "active",
      bloodType: "O+",
      allergies: "Penicilina, Látex",
      medications: "Ibuprofeno 400mg (ocasional)",
      medicalHistory: "Hipertensión controlada, Sin cirugías previas",
      dentalHistory: [
        {
          date: "2025-10-20",
          procedure: "Limpieza dental profesional",
          dentist: "Dr. Carlos Mendoza",
          notes: "Estado general bueno, sin caries detectadas",
        },
      ],
      upcomingTreatments: [
        { date: "2025-11-05", procedure: "Control de ortodoncia", dentist: "Dra. Ana Silva" },
      ],
      images: [
        { id: 1, type: "Radiografía panorámica", date: "2025-10-20" },
        { id: 2, type: "Foto frontal", date: "2025-09-15" },
      ],
      // Añadir en el mockData, después de "images"
      financialData: {
        totalPending: 1250.00,
        totalPaid: 850.00,
        budgets: [
          {
            id: 1,
            treatment: "Ortodoncia completa",
            description: "Tratamiento de ortodoncia por 24 meses",
            amount: 3000.00,
            paid: 1200.00,
            pending: 1800.00,
            status: "in-progress",
            proposedDate: "2025-10-15",
            approvedDate: "2025-10-20"
          },
          {
            id: 2,
            treatment: "Limpieza dental",
            description: "Limpieza profesional y fluorización",
            amount: 150.00,
            paid: 150.00,
            pending: 0.00,
            status: "completed",
            proposedDate: "2025-09-10",
            approvedDate: "2025-09-15"
          }
        ],
        payments: [
          {
            id: 1,
            date: "2025-10-25",
            amount: 500.00,
            method: "Transferencia",
            concept: "Abono ortodoncia",
            status: "completed"
          },
          {
            id: 2,
            date: "2025-11-05",
            amount: 300.00,
            method: "Efectivo",
            concept: "Cuota mensual",
            status: "pending"
          },
          {
            id: 3,
            date: "2025-09-20",
            amount: 150.00,
            method: "Tarjeta",
            concept: "Limpieza dental",
            status: "completed"
          }
        ],
        paymentReminders: [
          {
            id: 1,
            dueDate: "2025-11-05",
            amount: 300.00,
            treatment: "Cuota ortodoncia",
            status: "pending",
            sent: true
          },
          {
            id: 2,
            dueDate: "2025-12-05",
            amount: 300.00,
            treatment: "Cuota ortodoncia",
            status: "upcoming",
            sent: false
          }
        ]
      }
    };


    setPatient(mockData);
  }, [id]);

  const handleEditSuccess = () => {
    // Aquí puedes recargar los datos del paciente si es necesario
    console.log("Paciente actualizado, recargar datos...");
    // Por ejemplo, podrías volver a hacer el fetch de datos
  };

  if (!patient) return <p className="p-6 text-muted-foreground">Cargando datos...</p>;

  // Añadir este componente antes del return principal
  const FinancialTab = () => (
    <div className="space-y-6">
      {/* Resumen Financiero */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Pendiente</span>
            </div>
            <p className="text-2xl font-bold text-orange-600 mt-2">
              S/ {patient.financialData.totalPending.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Pagado</span>
            </div>
            <p className="text-2xl font-bold text-green-600 mt-2">
              S/ {patient.financialData.totalPaid.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Total</span>
            </div>
            <p className="text-2xl font-bold text-blue-600 mt-2">
              S/ {(patient.financialData.totalPending + patient.financialData.totalPaid).toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Presupuestos y Tratamientos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Presupuestos y Tratamientos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {patient.financialData.budgets.map((budget) => (
              <div key={budget.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{budget.treatment}</p>
                    <p className="text-sm text-muted-foreground">{budget.description}</p>
                  </div>
                  <Badge variant={
                    budget.status === 'completed' ? 'default' :
                      budget.status === 'in-progress' ? 'secondary' : 'outline'
                  }>
                    {budget.status === 'completed' ? 'Completado' : 'En progreso'}
                  </Badge>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total:</span>
                    <span className="font-medium">S/ {budget.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Pagado:</span>
                    <span className="text-green-600 font-medium">S/ {budget.paid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Pendiente:</span>
                    <span className="text-orange-600 font-medium">S/ {budget.pending.toFixed(2)}</span>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" size="sm">Editar</Button>
                  <Button size="sm">Registrar Pago</Button>
                </div>
              </div>
            ))}
            <Button className="w-full" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Presupuesto
            </Button>
          </CardContent>
        </Card>

        {/* Historial de Transacciones y Recordatorios */}
        <div className="space-y-6">
          {/* Historial de Transacciones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Historial de Transacciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {patient.financialData.payments.map((payment) => (
                <div key={payment.id} className="flex justify-between items-center border-b pb-3">
                  <div>
                    <p className="font-medium">{payment.concept}</p>
                    <p className="text-sm text-muted-foreground">
                      {payment.date} • {payment.method}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">S/ {payment.amount.toFixed(2)}</p>
                    <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                      {payment.status === 'completed' ? 'Completado' : 'Pendiente'}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recordatorios de Pago */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Recordatorios de Pago
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {patient.financialData.paymentReminders.map((reminder) => (
                <div key={reminder.id} className="flex justify-between items-center border rounded-lg p-3">
                  <div>
                    <p className="font-medium">{reminder.treatment}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Vence: {reminder.dueDate}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">S/ {reminder.amount.toFixed(2)}</p>
                    <Badge variant={
                      reminder.status === 'pending' ? 'destructive' : 'secondary'
                    }>
                      {reminder.status === 'pending' ? 'Pendiente' : 'Próximo'}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-start justify-start  gap-4">
        <Link to="/pacientes">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" /> Volver
          </Button>
        </Link>
      </div>

      <div className=" p-6 lg:p-8">
        {/* Encabezado con botón de regreso */}
        <div className="flex items-center justify-between pb-5">
          <div className="flex items-start justify-start  gap-4">
            <div>
              <h1 className="text-2xl font-semibold">{patient.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={patient.status === "active" ? "default" : "secondary"}>
                  {patient.status === "active" ? "Activo" : "Pendiente"}
                </Badge>
                <span className="text-sm text-muted-foreground">{patient.age} años</span>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditDialogOpen(true)}
          >
            <Edit className="h-4 w-4 mr-2" /> Editar
          </Button>
        </div>

        <Separator />

        {/* Tabs */}
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="dental">Historial Dental</TabsTrigger>
            <TabsTrigger value="treatments">Tratamientos</TabsTrigger>
            <TabsTrigger value="financial">Financiero</TabsTrigger>
            <TabsTrigger value="images">Imágenes</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Información de Contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{patient.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{patient.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{patient.address}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Información Médica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Activity className="h-4 w-4 text-muted-foreground inline mr-2" />
                  <span className="text-sm font-medium">Grupo Sanguíneo:</span> {patient.bloodType}
                </div>
                <div>
                  <AlertCircle className="h-4 w-4 text-destructive inline mr-2" />
                  <span className="text-sm font-medium">Alergias:</span> {patient.allergies}
                </div>
                <div>
                  <Pill className="h-4 w-4 text-muted-foreground inline mr-2" />
                  <span className="text-sm font-medium">Medicamentos:</span> {patient.medications}
                </div>
                <div>
                  <FileText className="h-4 w-4 text-muted-foreground inline mr-2" />
                  <span className="text-sm font-medium">Historial Médico:</span>{" "}
                  {patient.medicalHistory}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dental" className="space-y-4">
            {patient.dentalHistory.map((record, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div>
                    <p className="text-sm text-muted-foreground">{record.date}</p>
                    <p className="font-semibold">{record.procedure}</p>
                    <p className="text-sm text-muted-foreground">Dentista: {record.dentist}</p>
                    <p className="text-sm mt-2">{record.notes}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="treatments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Próximos Tratamientos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {patient.upcomingTreatments.map((t, i) => (
                  <div key={i} className="flex justify-between items-center border rounded-lg p-3">
                    <div>
                      <p className="font-medium">{t.procedure}</p>
                      <p className="text-sm text-muted-foreground">{t.dentist}</p>
                    </div>
                    <Badge variant="outline">{t.date}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financial" className="space-y-4">
            <FinancialTab />
          </TabsContent>

          <TabsContent value="images" className="grid grid-cols-2 gap-4">
            {patient.images.map((img) => (
              <Card key={img.id}>
                <div className="aspect-video bg-muted flex items-center justify-center">
                  <Image className="h-10 w-10 text-muted-foreground" />
                </div>
                <CardContent className="p-3">
                  <p className="text-sm font-medium">{img.type}</p>
                  <p className="text-xs text-muted-foreground">{img.date}</p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
      <EditPatientDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        patient={patient}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}
