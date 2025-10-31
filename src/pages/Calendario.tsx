import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  X,
  Search,
  Clock,
  User,
  Stethoscope,
  Download,
  CheckCircle
} from "lucide-react";

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
      duration: "30 min", status: "confirmed", date: new Date(), color: "#4CAF50"
    },
    { 
      id: "2", time: "09:30", patient: "Pedro Martínez", patientId: "P002",
      dentist: "Dra. Martínez", dentistId: "D002", treatment: "Revisión", 
      duration: "20 min", status: "confirmed", date: new Date(), color: "#4CAF50"
    },
    { 
      id: "3", time: "10:30", patient: "Juan Pérez", patientId: "P003",
      dentist: "Dra. Martínez", dentistId: "D002", treatment: "Extracción", 
      duration: "45 min", status: "confirmed", date: new Date(), color: "#4CAF50"
    },
    { 
      id: "4", time: "11:30", patient: "Carmen López", patientId: "P004",
      dentist: "Dr. Rodríguez", dentistId: "D001", treatment: "Implante", 
      duration: "60 min", status: "pending", date: new Date(), color: "#FF9800"
    },
    { 
      id: "5", time: "14:00", patient: "Ana López", patientId: "P005",
      dentist: "Dr. Rodríguez", dentistId: "D001", treatment: "Ortodoncia", 
      duration: "40 min", status: "confirmed", date: new Date(), color: "#4CAF50"
    },
    { 
      id: "6", time: "15:00", patient: "Luis Fernández", patientId: "P006",
      dentist: "Dra. Sánchez", dentistId: "D003", treatment: "Blanqueamiento", 
      duration: "45 min", status: "confirmed", date: new Date(), color: "#4CAF50"
    },
    { 
      id: "7", time: "16:00", patient: "Carlos Ruiz", patientId: "P007",
      dentist: "Dra. Sánchez", dentistId: "D003", treatment: "Endodoncia", 
      duration: "90 min", status: "confirmed", date: new Date(), color: "#4CAF50"
    },
    { 
      id: "8", time: "17:30", patient: "Elena Torres", patientId: "P008",
      dentist: "Dra. Martínez", dentistId: "D002", treatment: "Consulta", 
      duration: "30 min", status: "pending", date: new Date(), color: "#FF9800"
    },
  ];

  const dentists: Dentist[] = [
    { id: "D001", name: "Dr. Rodríguez", color: "bg-blue-500", specialty: "Ortodoncia" },
    { id: "D002", name: "Dra. Martínez", color: "bg-green-500", specialty: "Cirugía" },
    { id: "D003", name: "Dra. Sánchez", color: "bg-purple-500", specialty: "Estética" },
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
  const [currentDate, setCurrentDate] = useState(new Date());
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

  // Generar días de la semana
  const getWeekDays = (date: Date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay() + 1); // Comenzar en lunes
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // Generar slots horarios (8:00 AM - 8:00 PM)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 20; hour++) {
      const timeLabel = hour === 12 ? "12 PM" : 
                       hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
      slots.push({ time: `${hour.toString().padStart(2, '0')}:00`, label: timeLabel });
      if (hour !== 20) {
        slots.push({ time: `${hour.toString().padStart(2, '0')}:30`, label: "" });
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();
  const weekDays = getWeekDays(currentDate);

  // Utilidades de fecha
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-ES", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    }).format(date);
  };

  const formatDayHeader = (date: Date) => {
    return new Intl.DateTimeFormat("es-ES", { weekday: "short", day: "numeric", month: "short" }).format(date);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Navegación
  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

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

  // Filtros y utilidades
  const getAppointmentsForSlot = (date: Date, time: string): Appointment[] => {
    return appointments.filter(apt => 
      apt.date.toDateString() === date.toDateString() && apt.time === time
    );
  };

  const getDentistColor = (dentistId: string): string => {
    const dentist = dentists.find(d => d.id === dentistId);
    return dentist ? dentist.color : "bg-gray-400";
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apt.treatment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDentist = selectedDentist === "all" || apt.dentistId === selectedDentist;
    const matchesStatus = selectedStatus === "all" || apt.status === selectedStatus;
    
    return matchesSearch && matchesDentist && matchesStatus;
  });

  // Estadísticas
  const todaysAppointments = appointments.filter(apt => isToday(apt.date));
  const confirmedAppointments = appointments.filter(apt => apt.status === 'confirmed');
  const pendingAppointments = appointments.filter(apt => apt.status === 'pending');
  const completedAppointments = appointments.filter(apt => apt.status === 'completed');

  return (
    <div className="space-y-6 p-4">
      {/* Header Principal */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Calendario Dental</h1>
          <p className="text-muted-foreground">Gestiona las citas de tu consultorio dental</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={goToToday}>
            <CalendarIcon className="h-4 w-4 mr-2" />
            Hoy
          </Button>
          <Button 
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => {
              setSelectedSlot({ date: new Date(), time: "09:00" });
              setShowAppointmentModal(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Cita
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Citas Hoy</p>
                <p className="text-2xl font-bold text-foreground">{todaysAppointments.length}</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Confirmadas</p>
                <p className="text-2xl font-bold text-green-600">{confirmedAppointments.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-bold text-orange-600">{pendingAppointments.length}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completadas</p>
                <p className="text-2xl font-bold text-blue-600">{completedAppointments.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y Búsqueda */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-end">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Paciente o tratamiento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dentist">Dentista</Label>
                <Select value={selectedDentist} onValueChange={setSelectedDentist}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los dentistas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los dentistas</SelectItem>
                    {dentists.map((dentist) => (
                      <SelectItem key={dentist.id} value={dentist.id}>
                        {dentist.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="confirmed">Confirmadas</SelectItem>
                    <SelectItem value="pending">Pendientes</SelectItem>
                    <SelectItem value="completed">Completadas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendario Principal */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <CardContent className="p-0 flex flex-col">
          {/* Header del Calendario */}
          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <Button variant="outline" size="icon" onClick={() => navigateWeek(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground capitalize">
                  {formatDate(currentDate)}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                    Semana Actual
                  </Badge>
                </div>
              </div>
            </div>

            <Button variant="outline" size="icon" onClick={() => navigateWeek(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Grid del Calendario */}
          <div className="overflow-auto">
            <div className="min-w-[1200px]">
              {/* Header de Días */}
              <div className="grid grid-cols-8 border-b bg-gray-50 sticky top-0 z-10">
                <div className="p-4 border-r font-semibold text-gray-600 text-sm uppercase tracking-wide bg-gray-100">
                  HORA
                </div>
                {weekDays.map((day, index) => (
                  <div 
                    key={index} 
                    className={`p-4 text-center border-r last:border-r-0 ${
                      isToday(day) ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="font-bold text-foreground uppercase text-sm mb-1">
                      {formatDayHeader(day)}
                    </div>
                    {isToday(day) && (
                      <Badge variant="default" className="bg-blue-500 text-white text-xs px-2 py-1">
                        Hoy
                      </Badge>
                    )}
                  </div>
                ))}
              </div>

              {/* Slots Horarios */}
              {timeSlots.map((slot) => (
                <div key={slot.time} className="grid grid-cols-8 border-b last:border-b-0 hover:bg-gray-50 transition-colors group">
                  <div className="p-4 border-r text-sm text-gray-500 font-medium bg-gray-50 sticky left-0 z-5">
                    {slot.label || ""}
                  </div>
                  {weekDays.map((day, dayIndex) => {
                    const slotAppointments = getAppointmentsForSlot(day, slot.time);
                    const isCurrentDay = isToday(day);
                    
                    return (
                      <div
                        key={dayIndex}
                        className={`min-h-[80px] border-r last:border-r-0 p-2 cursor-pointer transition-all ${
                          isCurrentDay ? 'bg-blue-25' : 'bg-white'
                        } hover:bg-blue-50 relative group/slot`}
                        onClick={() => handleSlotClick(day, slot.time)}
                      >
                        {/* Slot vacío */}
                        {slotAppointments.length === 0 && (
                          <div className="absolute inset-2 border-2 border-dashed border-gray-300 rounded-lg opacity-0 group-hover/slot:opacity-100 transition-opacity flex items-center justify-center">
                            <Plus className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                        
                        {/* Citas existentes */}
                        {slotAppointments.map((apt) => (
                          <div
                            key={apt.id}
                            className={`p-3 rounded-lg text-white mb-2 shadow-sm border-l-4 ${
                              apt.status === 'pending' ? 'opacity-80' : ''
                            } cursor-pointer hover:shadow-md transition-shadow`}
                            style={{ 
                              backgroundColor: apt.color,
                              borderLeftColor: 'white'
                            }}
                            title={`${apt.patient} - ${apt.treatment} - ${apt.dentist}`}
                          >
                            <div className="font-semibold text-sm mb-1 truncate">{apt.patient}</div>
                            <div className="text-xs opacity-90 font-medium truncate">{apt.treatment}</div>
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-xs bg-black bg-opacity-20 px-2 py-1 rounded">
                                {apt.duration}
                              </span>
                              <Badge 
                                variant={apt.status === 'confirmed' ? 'default' : 
                                        apt.status === 'completed' ? 'secondary' : 'outline'} 
                                className="text-xs h-4"
                              >
                                {apt.status === 'confirmed' ? '✓' : 
                                 apt.status === 'completed' ? '✔' : '…'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leyenda de Dentistas */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <span className="text-sm font-medium text-muted-foreground">Leyenda:</span>
            {dentists.map((dentist) => (
              <div key={dentist.id} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${dentist.color}`}></div>
                <span className="text-sm text-muted-foreground">{dentist.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
                      <h4 className="font-semibold">Detalles del Horario</h4>
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
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${dentist.color}`}></div>
                            {dentist.name}
                          </div>
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
                className="flex-1 bg-primary hover:bg-primary/90" 
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