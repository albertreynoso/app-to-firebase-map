import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

export default function Calendario() {
  const [currentDate] = useState(new Date());

  const appointments = [
    { time: "09:00", patient: "María García", dentist: "Dr. Rodríguez", treatment: "Limpieza dental", duration: "30 min", status: "confirmed" },
    { time: "09:30", patient: "Pedro Martínez", dentist: "Dra. Martínez", treatment: "Revisión", duration: "20 min", status: "confirmed" },
    { time: "10:30", patient: "Juan Pérez", dentist: "Dra. Martínez", treatment: "Extracción", duration: "45 min", status: "confirmed" },
    { time: "11:30", patient: "Carmen López", dentist: "Dr. Rodríguez", treatment: "Implante", duration: "60 min", status: "pending" },
    { time: "14:00", patient: "Ana López", dentist: "Dr. Rodríguez", treatment: "Ortodoncia", duration: "40 min", status: "confirmed" },
    { time: "15:00", patient: "Luis Fernández", dentist: "Dra. Sánchez", treatment: "Blanqueamiento", duration: "45 min", status: "confirmed" },
    { time: "16:00", patient: "Carlos Ruiz", dentist: "Dra. Sánchez", treatment: "Endodoncia", duration: "90 min", status: "confirmed" },
    { time: "17:30", patient: "Elena Torres", dentist: "Dra. Martínez", treatment: "Consulta", duration: "30 min", status: "pending" },
  ];

  const dentists = [
    { name: "Dr. Rodríguez", color: "bg-primary" },
    { name: "Dra. Martínez", color: "bg-secondary" },
    { name: "Dra. Sánchez", color: "bg-success" },
  ];

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Calendario</h1>
          <p className="text-muted-foreground">Gestiona las citas de tu consultorio</p>
        </div>
        <Button className="bg-primary hover:bg-primary-hover text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Cita
        </Button>
      </div>

      {/* Date Navigation */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground capitalize">
                {formatDate(currentDate)}
              </h2>
            </div>
            <Button variant="outline" size="icon">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dentist Legend */}
      <div className="flex flex-wrap gap-4">
        {dentists.map((dentist) => (
          <div key={dentist.name} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded ${dentist.color}`}></div>
            <span className="text-sm text-muted-foreground">{dentist.name}</span>
          </div>
        ))}
      </div>

      {/* Appointments Timeline */}
      <div className="grid gap-4">
        {appointments.map((apt, index) => {
          const dentist = dentists.find((d) => d.name === apt.dentist);
          return (
            <Card
              key={index}
              className="overflow-hidden hover:shadow-lg transition-shadow border-l-4"
              style={{ borderLeftColor: dentist ? `hsl(var(--${dentist.color.split("-")[1]}))` : undefined }}
            >
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-center min-w-[80px]">
                      <p className="text-xs text-muted-foreground mb-1">Hora</p>
                      <p className="text-2xl font-bold text-primary">{apt.time}</p>
                      <p className="text-xs text-muted-foreground mt-1">{apt.duration}</p>
                    </div>
                    <div className="w-px h-16 bg-border"></div>
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-foreground">{apt.patient}</h3>
                      <Badge variant={apt.status === "confirmed" ? "default" : "secondary"}>
                        {apt.status === "confirmed" ? "Confirmada" : "Pendiente"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{apt.treatment}</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${dentist?.color}`}></div>
                      <p className="text-sm font-medium text-muted-foreground">{apt.dentist}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                    <Button variant="outline" size="sm">
                      Completar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen del Día</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-primary/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Total de Citas</p>
              <p className="text-3xl font-bold text-primary mt-1">{appointments.length}</p>
            </div>
            <div className="p-4 bg-success/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Confirmadas</p>
              <p className="text-3xl font-bold text-success mt-1">
                {appointments.filter((a) => a.status === "confirmed").length}
              </p>
            </div>
            <div className="p-4 bg-warning/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Pendientes</p>
              <p className="text-3xl font-bold text-warning mt-1">
                {appointments.filter((a) => a.status === "pending").length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
