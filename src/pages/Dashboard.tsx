import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, UserCircle, DollarSign, Clock, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const todayAppointments = [
    { time: "09:00", patient: "María García", dentist: "Dr. Rodríguez", treatment: "Limpieza dental" },
    { time: "10:30", patient: "Juan Pérez", dentist: "Dra. Martínez", treatment: "Extracción" },
    { time: "14:00", patient: "Ana López", dentist: "Dr. Rodríguez", treatment: "Ortodoncia" },
    { time: "16:00", patient: "Carlos Ruiz", dentist: "Dra. Sánchez", treatment: "Endodoncia" },
  ];

  const recentPayments = [
    { patient: "María García", amount: "$150", date: "Hoy", status: "completed" },
    { patient: "Juan Pérez", amount: "$300", date: "Hoy", status: "completed" },
    { patient: "Laura Torres", amount: "$200", date: "Ayer", status: "pending" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Visión general de tu consultorio</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Citas Hoy"
          value="12"
          icon={Calendar}
          trend={{ value: "+2 desde ayer", positive: true }}
          iconColor="bg-primary"
        />
        <StatCard
          title="Total Pacientes"
          value="248"
          icon={UserCircle}
          trend={{ value: "+12 este mes", positive: true }}
          iconColor="bg-secondary"
        />
        <StatCard
          title="Empleados Activos"
          value="8"
          icon={Users}
          iconColor="bg-success"
        />
        <StatCard
          title="Ingresos Hoy"
          value="$2,450"
          icon={DollarSign}
          trend={{ value: "+18% vs ayer", positive: true }}
          iconColor="bg-warning"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Citas de Hoy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayAppointments.map((apt, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className="w-16 text-center">
                      <p className="text-xs text-muted-foreground">Hora</p>
                      <p className="text-sm font-semibold text-primary">{apt.time}</p>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{apt.patient}</p>
                    <p className="text-sm text-muted-foreground">{apt.dentist}</p>
                    <p className="text-xs text-muted-foreground mt-1">{apt.treatment}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              Pagos Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPayments.map((payment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{payment.patient}</p>
                    <p className="text-sm text-muted-foreground">{payment.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-foreground">{payment.amount}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        payment.status === "completed"
                          ? "bg-success/10 text-success"
                          : "bg-warning/10 text-warning"
                      }`}
                    >
                      {payment.status === "completed" ? "Completado" : "Pendiente"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Estadísticas del Mes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Citas Completadas</p>
              <p className="text-2xl font-bold text-foreground">187</p>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: "75%" }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Ingresos del Mes</p>
              <p className="text-2xl font-bold text-foreground">$45,230</p>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-success h-2 rounded-full" style={{ width: "82%" }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Nuevos Pacientes</p>
              <p className="text-2xl font-bold text-foreground">23</p>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-secondary h-2 rounded-full" style={{ width: "68%" }}></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
