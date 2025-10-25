import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, TrendingUp, DollarSign, CreditCard, FileText } from "lucide-react";
import { useState } from "react";

export default function Pagos() {
  const [searchTerm, setSearchTerm] = useState("");

  const payments = [
    {
      id: 1,
      date: "2025-10-25",
      patient: "María García",
      treatment: "Limpieza dental",
      amount: 150,
      paid: 150,
      status: "completed",
      method: "Tarjeta",
    },
    {
      id: 2,
      date: "2025-10-25",
      patient: "Juan Pérez",
      treatment: "Extracción",
      amount: 300,
      paid: 300,
      status: "completed",
      method: "Efectivo",
    },
    {
      id: 3,
      date: "2025-10-24",
      patient: "Laura Torres",
      treatment: "Implante dental",
      amount: 2000,
      paid: 500,
      status: "partial",
      method: "Transferencia",
    },
    {
      id: 4,
      date: "2025-10-24",
      patient: "Carlos Ruiz",
      treatment: "Endodoncia",
      amount: 450,
      paid: 0,
      status: "pending",
      method: "-",
    },
    {
      id: 5,
      date: "2025-10-23",
      patient: "Ana López",
      treatment: "Ortodoncia (mensual)",
      amount: 200,
      paid: 200,
      status: "completed",
      method: "Tarjeta",
    },
    {
      id: 6,
      date: "2025-10-23",
      patient: "Pedro Martínez",
      treatment: "Blanqueamiento",
      amount: 350,
      paid: 350,
      status: "completed",
      method: "Efectivo",
    },
  ];

  const filteredPayments = payments.filter(
    (payment) =>
      payment.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.treatment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalIncome = payments.reduce((sum, p) => sum + p.paid, 0);
  const pendingAmount = payments
    .filter((p) => p.status !== "completed")
    .reduce((sum, p) => sum + (p.amount - p.paid), 0);
  const completedPayments = payments.filter((p) => p.status === "completed").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Pagos</h1>
          <p className="text-muted-foreground">Gestión financiera del consultorio</p>
        </div>
        <Button className="bg-primary hover:bg-primary-hover text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" />
          Registrar Pago
        </Button>
      </div>

      {/* Financial Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-2">Ingresos Totales</p>
                <p className="text-3xl font-bold text-foreground">${totalIncome.toLocaleString()}</p>
                <p className="text-sm text-success mt-2">↑ +12% vs mes anterior</p>
              </div>
              <div className="bg-primary p-3 rounded-xl">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-2">Por Cobrar</p>
                <p className="text-3xl font-bold text-foreground">${pendingAmount.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {payments.filter((p) => p.status !== "completed").length} pendientes
                </p>
              </div>
              <div className="bg-warning p-3 rounded-xl">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-2">Pagos Completados</p>
                <p className="text-3xl font-bold text-foreground">{completedPayments}</p>
                <p className="text-sm text-muted-foreground mt-2">Este mes</p>
              </div>
              <div className="bg-success p-3 rounded-xl">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Buscar por paciente o tratamiento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Payments List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Historial de Pagos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPayments.map((payment) => (
              <div
                key={payment.id}
                className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="font-semibold text-foreground">{payment.patient}</h3>
                    <Badge
                      variant={
                        payment.status === "completed"
                          ? "default"
                          : payment.status === "partial"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {payment.status === "completed"
                        ? "Pagado"
                        : payment.status === "partial"
                        ? "Parcial"
                        : "Pendiente"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{payment.treatment}</p>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm">
                    <span className="text-muted-foreground">Fecha: {payment.date}</span>
                    <span className="text-muted-foreground">Método: {payment.method}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground mb-1">Monto Total</p>
                    <p className="text-xl font-bold text-foreground">${payment.amount}</p>
                    {payment.status === "partial" && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Pagado: ${payment.paid} | Resta: ${payment.amount - payment.paid}
                      </p>
                    )}
                    {payment.status === "pending" && (
                      <p className="text-xs text-destructive mt-1">Sin pagos registrados</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Ver
                    </Button>
                    {payment.status !== "completed" && (
                      <Button size="sm" className="bg-primary hover:bg-primary-hover">
                        Pagar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Ingresos Mensuales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
            <p className="text-muted-foreground">Gráfico de ingresos mensuales (próximamente)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
