import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, TrendingUp, DollarSign, CreditCard, FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import { useEffect } from "react";
import { collection, query, getDocs, orderBy, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import PaymentDialog from "@/components/PaymentDialog";

export default function Pagos() {
  const [searchTerm, setSearchTerm] = useState("");

  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [pagos, setPagos] = useState<any[]>([]);
  const [loadingPagos, setLoadingPagos] = useState(true);

  const fetchPagos = async () => {
    try {
      setLoadingPagos(true);
      const pagosRef = collection(db, "pagos");
      const q = query(pagosRef, orderBy("fecha", "desc"));
      const querySnapshot = await getDocs(q);

      const pagosData: any[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        pagosData.push({
          id: doc.id,
          monto: data.monto || 0,
          metodo_pago: data.metodo_pago || "",
          fecha: data.fecha?.toDate ? data.fecha.toDate() : new Date(),
          concepto: data.concepto || "",
          tipo: data.tipo || "consulta",
          referencia_id: data.referencia_id || "",
          referencia_nombre: data.referencia_nombre || "",
          paciente_id: data.paciente_id || "",
          paciente_nombre: data.paciente_nombre || "",
          creado_por: data.creado_por || "",
          notas: data.notas || "",
        });
      });

      setPagos(pagosData);
    } catch (error) {
      console.error("Error al cargar pagos:", error);
    } finally {
      setLoadingPagos(false);
    }
  };

  useEffect(() => {
    fetchPagos();
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const pagosHoy = pagos.filter(p => {
    const fechaPago = new Date(p.fecha);
    fechaPago.setHours(0, 0, 0, 0);
    return fechaPago.getTime() === today.getTime();
  });

  const pagosMes = pagos.filter(p => {
    const fechaPago = new Date(p.fecha);
    return fechaPago.getMonth() === today.getMonth() &&
      fechaPago.getFullYear() === today.getFullYear();
  });

  const totalIngresosMes = pagosMes.reduce((sum, p) => sum + p.monto, 0);
  const totalIngresosHoy = pagosHoy.reduce((sum, p) => sum + p.monto, 0);
  const cantidadPagosHoy = pagosHoy.length;

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

  const filteredPayments = pagos.filter(
    (pago) =>
      pago.paciente_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pago.concepto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pago.referencia_nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(amount);
  };

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
        <Button
          className="bg-primary hover:bg-primary-hover text-primary-foreground"
          onClick={() => setIsPaymentDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Registrar Pago
        </Button>
      </div>

      {/* Financial Stats - Reemplazar esta sección */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-2">Ingresos Totales del Mes</p>
                <p className="text-3xl font-bold text-foreground">{formatCurrency(totalIngresosMes)}</p>
                <p className="text-sm text-muted-foreground mt-2">{pagosMes.length} pagos registrados</p>
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
                <p className="text-sm text-muted-foreground font-medium mb-2">Ingresos Totales de Hoy</p>
                <p className="text-3xl font-bold text-foreground">{formatCurrency(totalIngresosHoy)}</p>
                <p className="text-sm text-muted-foreground mt-2">{pagosHoy.length} pagos hoy</p>
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
                <p className="text-sm text-muted-foreground font-medium mb-2">Pagos Completados Hoy</p>
                <p className="text-3xl font-bold text-foreground">{cantidadPagosHoy}</p>
                <p className="text-sm text-success mt-2">Registros del día</p>
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
        {/* Payments List - Reemplazar el contenido del CardContent */}
        <CardContent>
          {loadingPagos ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Cargando pagos...</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
              <FileText className="h-12 w-12 text-muted-foreground" />
              <div>
                <p className="font-semibold text-foreground">No hay pagos registrados</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchTerm ? "No se encontraron resultados para tu búsqueda" : "Los pagos aparecerán aquí"}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPayments.map((pago) => (
                <div
                  key={pago.id}
                  className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-semibold text-foreground">{pago.paciente_nombre}</h3>
                      <Badge variant="default" className="bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                        Completado
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground font-medium">{pago.concepto}</p>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm">
                      <span className="text-muted-foreground">
                        Fecha: {pago.fecha.toLocaleDateString('es-PE', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit'
                        })}
                      </span>
                      <span className="text-muted-foreground">Método: {pago.metodo_pago}</span>
                      {pago.tipo && (
                        <Badge variant="outline" className="text-xs">
                          {pago.tipo === "consulta" ? "Consulta" : "Tratamiento"}
                        </Badge>
                      )}
                    </div>
                    {pago.notas && (
                      <p className="text-xs text-muted-foreground mt-2 italic">
                        Nota: {pago.notas}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">Monto Pagado</p>
                      <p className="text-xl font-bold text-green-600">{formatCurrency(pago.monto)}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Ver Detalles
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      {/* Payment Dialog */}
      <PaymentDialog
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        onSuccess={() => {
          fetchPagos();
        }}
      />
    </div>
  );
}
