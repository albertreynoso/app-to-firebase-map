import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Employee, EMPLOYEE_TYPES } from "@/types/employee";

const employeeFormSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  apellido_paterno: z.string().min(1, "El apellido paterno es requerido"),
  apellido_materno: z.string().min(1, "El apellido materno es requerido"),
  dni_empleado: z.string().min(8, "El DNI debe tener al menos 8 dígitos"),
  edad: z.string().optional(),
  fecha_nacimiento: z.string().min(1, "La fecha de nacimiento es requerida"),
  genero: z.enum(["Masculino", "Femenino", "Otro", ""]).optional(),
  numero_telefonico: z.string().min(1, "El número telefónico es requerido"),
  direccion: z.string().optional(),
  tipo_empleado_id: z.string().min(1, "El tipo de empleado es requerido"),
  fecha_contratacion: z.string().min(1, "La fecha de contratación es requerida"),
  salario: z.number().min(0, "El salario debe ser mayor a 0"),
  activo: z.boolean().default(true),
});

type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

interface EmployeeEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  onSuccess?: () => void;
}

export default function EmployeeEditDialog({
  open,
  onOpenChange,
  employee,
  onSuccess,
}: EmployeeEditDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      nombre: "",
      apellido_paterno: "",
      apellido_materno: "",
      dni_empleado: "",
      edad: "",
      fecha_nacimiento: "",
      genero: "",
      numero_telefonico: "",
      direccion: "",
      tipo_empleado_id: "",
      fecha_contratacion: "",
      salario: 0,
      activo: true,
    },
  });

  useEffect(() => {
    if (employee && open) {
      form.reset({
        nombre: employee.nombre || "",
        apellido_paterno: employee.apellido_paterno || "",
        apellido_materno: employee.apellido_materno || "",
        dni_empleado: employee.dni_empleado || "",
        edad: employee.edad || "",
        fecha_nacimiento: employee.fecha_nacimiento || "",
        genero: employee.genero || "",
        numero_telefonico: employee.numero_telefonico || "",
        direccion: employee.direccion || "",
        tipo_empleado_id: employee.tipo_empleado_id || "",
        fecha_contratacion: employee.fecha_contratacion || "",
        salario: employee.salario || 0,
        activo: employee.activo ?? true,
      });
    }
  }, [employee, open, form]);

  const calculateAge = (birthDate: string): string => {
    if (!birthDate) return "";
    const [day, month, year] = birthDate.split("/").map(Number);
    const birth = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age.toString();
  };

  const onSubmit = async (data: EmployeeFormValues) => {
    if (!employee?.id) {
      toast({
        title: "❌ Error",
        description: "No se puede actualizar el empleado sin ID.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const updatedData = {
        nombre: data.nombre,
        apellido_paterno: data.apellido_paterno,
        apellido_materno: data.apellido_materno,
        dni_empleado: data.dni_empleado,
        edad: data.edad || calculateAge(data.fecha_nacimiento),
        fecha_nacimiento: data.fecha_nacimiento,
        genero: data.genero || "",
        numero_telefonico: data.numero_telefonico,
        direccion: data.direccion || "",
        tipo_empleado_id: data.tipo_empleado_id,
        fecha_contratacion: data.fecha_contratacion,
        salario: data.salario,
        activo: data.activo,
      };

      const employeeRef = doc(db, "personal", employee.id);
      await updateDoc(employeeRef, updatedData);

      toast({
        title: "✅ Empleado actualizado",
        description: `${data.nombre} ${data.apellido_paterno} ha sido actualizado exitosamente.`,
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error al actualizar empleado:", error);
      toast({
        title: "❌ Error",
        description: "No se pudo actualizar el empleado. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Empleado</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Información Personal */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Información Personal</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombres *</FormLabel>
                      <FormControl>
                        <Input placeholder="Juan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="apellido_paterno"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apellido Paterno *</FormLabel>
                      <FormControl>
                        <Input placeholder="Pérez" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="apellido_materno"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apellido Materno *</FormLabel>
                      <FormControl>
                        <Input placeholder="López" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dni_empleado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DNI *</FormLabel>
                      <FormControl>
                        <Input placeholder="73249876" maxLength={8} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="genero"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Género</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Masculino">Masculino</SelectItem>
                          <SelectItem value="Femenino">Femenino</SelectItem>
                          <SelectItem value="Otro">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fecha_nacimiento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Nacimiento * (DD/MM/AAAA)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="12/09/1990"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            const age = calculateAge(e.target.value);
                            if (age) {
                              form.setValue("edad", age);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="edad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Edad</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Calculada automáticamente"
                          {...field}
                          readOnly
                          className="bg-muted cursor-not-allowed"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Información de Contacto */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Información de Contacto</h3>
              
              <FormField
                control={form.control}
                name="numero_telefonico"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número Telefónico *</FormLabel>
                    <FormControl>
                      <Input placeholder="987654321" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="direccion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Input placeholder="Av. Principal 123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Información Laboral */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Información Laboral</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tipo_empleado_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Empleado *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {EMPLOYEE_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fecha_contratacion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Contratación * (DD/MM/AAAA)</FormLabel>
                      <FormControl>
                        <Input placeholder="16/10/2025" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="salario"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salario (S/) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="5000"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="activo"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Empleado Activo</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Indica si el empleado está actualmente trabajando
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  "Actualizar Empleado"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}