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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const patientFormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  lastName: z.string().min(1, "Los apellidos son requeridos"),
  dni: z.string().min(1, "El DNI es requerido"),
  age: z.number().min(0, "La edad debe ser mayor a 0"),
  birthDate: z.date({
    required_error: "La fecha de nacimiento es requerida",
  }),
  gender: z.string().min(1, "El género es requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(1, "El teléfono es requerido"),
  address: z.string().optional(),
  allergies: z.string().optional(),
  medications: z.string().optional(),
  medicalHistory: z.string().optional(),
});

type PatientFormValues = z.infer<typeof patientFormSchema>;

interface Patient {
  id: number;
  name: string;
  lastName: string;
  dni: string;
  age: number;
  birthDate: Date;
  gender: string;
  email: string;
  phone: string;
  address?: string;
  allergies?: string;
  medications?: string;
  medicalHistory?: string;
}

interface EditPatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient | null;
  onSuccess?: () => void;
}

export default function EditPatientDialog({
  open,
  onOpenChange,
  patient,
  onSuccess,
}: EditPatientDialogProps) {
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      name: "",
      lastName: "",
      dni: "",
      birthDate: undefined,
      age: 0,
      gender: "",
      email: "",
      phone: "",
      address: "",
      allergies: "",
      medications: "",
      medicalHistory: "",
    },
  });

  // Cargar datos del paciente cuando se abre el modal
  useEffect(() => {
    if (patient && open) {
      form.reset({
        name: patient.name,
        lastName: patient.lastName,
        dni: patient.dni,
        birthDate: patient.birthDate,
        age: patient.age,
        gender: patient.gender,
        email: patient.email,
        phone: patient.phone,
        address: patient.address || "",
        allergies: patient.allergies || "",
        medications: patient.medications || "",
        medicalHistory: patient.medicalHistory || "",
      });
    }
  }, [patient, open, form]);

  const onSubmit = (data: PatientFormValues) => {
    console.log("Paciente editado:", data);
    toast({
      title: "Paciente actualizado",
      description: `${data.name} ${data.lastName} ha sido actualizado exitosamente.`,
    });
    form.reset();
    onOpenChange(false);
    onSuccess?.();
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  // Función para calcular edad
  const calculateAge = (date: Date) => {
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < date.getDate())
    ) {
      age--;
    }
    return age;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Paciente</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Campo de Nombres */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombres *</FormLabel>
                    <FormControl>
                      <Input placeholder="Juan Francisco" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Campo de Apellidos */}
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellidos *</FormLabel>
                    <FormControl>
                      <Input placeholder="Pérez López" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Campo de DNI */}
              <FormField
                control={form.control}
                name="dni"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DNI *</FormLabel>
                    <FormControl>
                      <Input placeholder="73249876" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Campo de Teléfono */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono *</FormLabel>
                    <FormControl>
                      <Input placeholder="+51 924 111 222" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Campo de Fecha de Nacimiento */}
              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => {
                  const currentYear = new Date().getFullYear();
                  const [displayDate, setDisplayDate] = useState(
                    field.value || new Date(currentYear, 0)
                  );

                  // Cuando se selecciona una nueva fecha:
                  const handleSelect = (date?: Date) => {
                    field.onChange(date);
                    if (date) {
                      const newAge = calculateAge(date);
                      form.setValue("age", newAge);
                    }
                  };

                  return (
                    <FormItem>
                      <FormLabel>Fecha de Nacimiento *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: es })
                              ) : (
                                <span>Selecciona una fecha</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>

                        <PopoverContent className="w-auto p-3" align="start">
                          <div className="flex justify-between mb-2">
                            <select
                              className="border rounded-md px-2 py-1"
                              value={displayDate.getMonth()}
                              onChange={(e) =>
                                setDisplayDate(
                                  new Date(
                                    displayDate.getFullYear(),
                                    parseInt(e.target.value)
                                  )
                                )
                              }
                            >
                              {Array.from({ length: 12 }, (_, i) => (
                                <option key={i} value={i}>
                                  {format(new Date(0, i), "MMMM", { locale: es })}
                                </option>
                              ))}
                            </select>

                            <select
                              className="border rounded-md px-2 py-1"
                              value={displayDate.getFullYear()}
                              onChange={(e) =>
                                setDisplayDate(
                                  new Date(parseInt(e.target.value), displayDate.getMonth())
                                )
                              }
                            >
                              {Array.from({ length: 125 }, (_, i) => currentYear - i).map(
                                (y) => (
                                  <option key={y} value={y}>
                                    {y}
                                  </option>
                                )
                              )}
                            </select>
                          </div>

                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={handleSelect}
                            month={displayDate}
                            onMonthChange={setDisplayDate}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              {/* Campo de Edad */}
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Edad *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="34"
                        {...field}
                        readOnly
                        className="bg-muted cursor-not-allowed"
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Campo de Género */}
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Género *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un género" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="femenino">Femenino</SelectItem>
                        <SelectItem value="masculino">Masculino</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Campo de Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="juan@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Campo de Dirección */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <Input placeholder="Calle Principal 123, Lima" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo de Alergias */}
            <FormField
              control={form.control}
              name="allergies"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alergias</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ej: Penicilina, látex, anestesia local..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo de Medicamentos */}
            <FormField
              control={form.control}
              name="medications"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medicamentos Actuales</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ej: Ibuprofeno 400mg, Aspirina..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo de Historial Médico */}
            <FormField
              control={form.control}
              name="medicalHistory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Historial Médico</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enfermedades previas, cirugías, condiciones crónicas..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Botones de acción */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                Cancelar
              </Button>
              <Button type="submit">Actualizar Paciente</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}