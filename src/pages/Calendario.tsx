import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import GoogleCalendarView from "@/components/GoogleCalendarView";
import { User, Stethoscope, Clock, Plus } from "lucide-react";

interface Appointment {
  id: string;
  time: string;
  patient: string;
  patientId: string;
  dentist: string;
  dentistId: string;
  treatment: string;
  duration: string;
  status: "confirmed" | "pending" | "completed";
  date: Date;
  notes?: string;
  color: string;
}

interface Dentist {
  id: string;
  name: string;
  color: string;
  specialty: string;
}

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export default function Calendario() {
  // Datos iniciales
  const initialAppointments: Appointment[] = [
    { 
      id: "1", time: "09:00", patient: "María García", patientId: "P001",
      dentist: "Dr. Rodríguez", dentistId: "D001", treatment: "Limpieza dental", 
      duration: "30 min", status: "confirmed", date: new Date(), color: "#3B82F6"
    },
    { 
      id: "2", time: "09:30", patient: "Pedro Martínez", patientId: "P002",
      dentist: "Dra. Martínez", dentistId: "D002", treatment: "Revisión", 
      duration: "20 min", status: "confirmed", date: new Date(), color: "#10B981"
    },
    { 
      id: "3", time: "10:30", patient: "Juan Pérez", patientId: "P003",
      dentist: "Dra. Martínez", dentistId: "D002", treatment: "Extracción", 
      duration: "45 min", status: "confirmed", date: new Date(), color: "#10B981"
    },
    { 
      id: "4", time: "11:30", patient: "Carmen López", patientId: "P004",
      dentist: "Dr. Rodríguez", dentistId: "D001", treatment: "Implante", 
      duration: "60 min", status: "pending", date: new Date(), color: "#F59E0B"
    },
    { 
      id: "5", time: "14:00", patient: "Ana López", patientId: "P005",
      dentist: "Dr. Rodríguez", dentistId: "D001", treatment: "Ortodoncia", 
      duration: "40 min", status: "confirmed", date: new Date(), color: "#3B82F6"
    },
    { 
      id: "6", time: "15:00", patient: "Luis Fernández", patientId: "P006",
      dentist: "Dra. Sánchez", dentistId: "D003", treatment: "Blanqueamiento", 
      duration: "45 min", status: "confirmed", date: new Date(), color: "#8B5CF6"
    },
    { 
      id: "7", time: "16:00", patient: "Carlos Ruiz", patientId: "P007",
      dentist: "Dra. Sánchez", dentistId: "D003", treatment: "Endodoncia", 
      duration: "90 min", status: "confirmed", date: new Date(), color: "#8B5CF6"
    },
    { 
      id: "8", time: "17:30", patient: "Elena Torres", patientId: "P008",
      dentist: "Dra. Martínez", dentistId: "D002", treatment: "Consulta", 
      duration: "30 min", status: "pending", date: new Date(), color: "#F59E0B"
    },
  ];

  const dentists: Dentist[] = [
    { id: "D001", name: "Dr. Rodríguez", color: "#3B82F6", specialty: "Ortodoncia" },
    { id: "D002", name: "Dra. Martínez", color: "#10B981", specialty: "Cirugía" },
    { id: "D003", name: "Dra. Sánchez", color: "#8B5CF6", specialty: "Estética" },
  ];

  const patients: Patient[] = [
    { id: "P001", name: "María García", email: "maria@email.com", phone: "+51 912 345 678" },
    { id: "P002", name: "Pedro Martínez", email: "pedro@email.com", phone: "+51 923 456 789" },
    { id: "P003", name: "Juan Pérez", email: "juan@email.com", phone: "+51 934 567 890" },
    { id: "P004", name: "Carmen López", email: "carmen@email.com", phone: "+51 945 678 901" },
    { id: "P005", name: "Ana López", email: "ana@email.com", phone: "+51 956 789 012" },
    { id: "P006", name: "Luis Fernández", email: "luis@email.com", phone: "+51 967 890 123" },
    { id: "P007", name: "Carlos Ruiz", email: "carlos@email.com", phone: "+51 978 901 234" },
    { id: "P008", name: "Elena Torres", email: "elena@email.com", phone: "+51 989 012 345" },
  ];

  const treatments = [
    "Limpieza dental", "Revisión general", "Extracción", "Implante dental",
    "Ortodoncia", "Blanqueamiento", "Endodoncia", "Consulta", "Cirugía oral", "Radiografía"
  ];

  // Estados
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date | null; time: string }>({ date: null, time: "" });
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDentist, setSelectedDentist] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [newAppointment, setNewAppointment] = useState({
    patient: "", patientId: "", dentist: "", dentistId: "", treatment: "",
    duration: "30", notes: "", status: "pending" as "confirmed" | "pending" | "completed"
  });

  // Manejo de citas
  const handleSlotClick = (date: Date, time: string) => {
    setSelectedSlot({ date, time });
    setNewAppointment({
      patient: "", 
      patientId: "", 
      dentist: "", 
      dentistId: "", 
      treatment: "",
      duration: "30", 
      notes: "", 
      status: "pending"
    });
    setShowAppointmentModal(true);
  };

  const handleCreateAppointment = () => {
    if (!selectedSlot.date) return;

    const selectedDentistObj = dentists.find(d => d.id === newAppointment.dentistId);
    const selectedPatient = patients.find(p => p.id === newAppointment.patientId);
    
    const newApt: Appointment = {
      id: Date.now().toString(),
      time: selectedSlot.time,
      patient: selectedPatient?.name || newAppointment.patient,
      patientId: newAppointment.patientId,
      dentist: selectedDentistObj?.name || newAppointment.dentist,
      dentistId: newAppointment.dentistId,
      treatment: newAppointment.treatment,
      duration: `${newAppointment.duration} min`,
      status: newAppointment.status,
      date: selectedSlot.date,
      notes: newAppointment.notes,
      color: selectedDentistObj?.color || "#6B7280"
    };

    setAppointments(prev => [...prev, newApt]);
    setShowAppointmentModal(false);
    resetForm();
  };

  const resetForm = () => {
    setNewAppointment({
      patient: "", 
      patientId: "", 
      dentist: "", 
      dentistId: "", 
      treatment: "",
      duration: "30", 
      notes: "", 
      status: "pending"
    });
  };

  // Filtros
  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apt.treatment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDentist = selectedDentist === "all" || apt.dentistId === selectedDentist;
    const matchesStatus = selectedStatus === "all" || apt.status === selectedStatus;
    
    return matchesSearch && matchesDentist && matchesStatus;
  });

  return (
    <div className="space-y-6 p-6 h-screen flex flex-col">
      {/* Vista de Calendario tipo Google Calendar */}
      <div className="flex-1 overflow-hidden">
        <GoogleCalendarView 
          appointments={filteredAppointments}
          onSlotClick={handleSlotClick}
          onNewAppointment={() => {
            setSelectedSlot({ date: new Date(), time: "09:00" });
            setShowAppointmentModal(true);
          }}
        />
      </div>

      {/* Modal de Nueva Cita */}
      <Dialog open={showAppointmentModal} onOpenChange={setShowAppointmentModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva Cita Dental</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Información de la cita seleccionada */}
            {selectedSlot.date && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-foreground">Detalles del Horario</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedSlot.date.toLocaleDateString('es-ES', { 
                          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                        })} a las {selectedSlot.time}
                      </p>
                    </div>
                    <Badge variant="outline">{selectedSlot.time}</Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Columna izquierda */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="patient" className="flex items-center gap-2">
                    <User className="h-4 w-4" /> Paciente *
                  </Label>
                  <Select 
                    value={newAppointment.patientId} 
                    onValueChange={(value) => {
                      const patient = patients.find(p => p.id === value);
                      setNewAppointment({
                        ...newAppointment, 
                        patientId: value, 
                        patient: patient?.name || ""
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dentist" className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4" /> Dentista *
                  </Label>
                  <Select 
                    value={newAppointment.dentistId} 
                    onValueChange={(value) => {
                      const dentist = dentists.find(d => d.id === value);
                      setNewAppointment({
                        ...newAppointment, 
                        dentistId: value, 
                        dentist: dentist?.name || ""
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar dentista" />
                    </SelectTrigger>
                    <SelectContent>
                      {dentists.map((dentist) => (
                        <SelectItem key={dentist.id} value={dentist.id}>
                          {dentist.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Columna derecha */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="treatment">Tratamiento *</Label>
                  <Select 
                    value={newAppointment.treatment} 
                    onValueChange={(value) => setNewAppointment({...newAppointment, treatment: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tratamiento" />
                    </SelectTrigger>
                    <SelectContent>
                      {treatments.map((treatment) => (
                        <SelectItem key={treatment} value={treatment}>
                          {treatment}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duración *</Label>
                    <Select 
                      value={newAppointment.duration} 
                      onValueChange={(value) => setNewAppointment({...newAppointment, duration: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Duración" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutos</SelectItem>
                        <SelectItem value="45">45 minutos</SelectItem>
                        <SelectItem value="60">60 minutos</SelectItem>
                        <SelectItem value="90">90 minutos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Estado</Label>
                    <Select 
                      value={newAppointment.status} 
                      onValueChange={(value: "confirmed" | "pending" | "completed") => 
                        setNewAppointment({...newAppointment, status: value})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendiente</SelectItem>
                        <SelectItem value="confirmed">Confirmada</SelectItem>
                        <SelectItem value="completed">Completada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Notas */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notas y Observaciones</Label>
              <Textarea
                id="notes"
                placeholder="Notas adicionales sobre la cita..."
                value={newAppointment.notes}
                onChange={(e) => setNewAppointment({...newAppointment, notes: e.target.value})}
                rows={3}
              />
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowAppointmentModal(false)}>
                Cancelar
              </Button>
              <Button 
                className="flex-1" 
                onClick={handleCreateAppointment}
                disabled={!newAppointment.patientId || !newAppointment.dentistId || !newAppointment.treatment}
              >
                <Plus className="h-4 w-4 mr-2" /> Crear Cita
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
