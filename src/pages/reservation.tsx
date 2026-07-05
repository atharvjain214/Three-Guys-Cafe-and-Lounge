import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Users, Clock, Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const schema = z.object({
  guest_name: z.string().min(2, "Name is required"),
  guest_email: z.string().email("Valid email required"),
  guest_phone: z.string().min(10, "Valid phone required"),
  party_size: z.number().min(1).max(20),
  reservation_date: z.string(),
  reservation_time: z.string(),
  occasion: z.string().optional(),
  special_requests: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30",
];

export default function Reservation() {
  const [step, setStep] = React.useState(1);
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [partySize, setPartySize] = React.useState(2);
  const [timeSlot, setTimeSlot] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    if (!date || !timeSlot) { toast.error("Please select date and time"); return; }
    setSubmitting(true);
    try {
      const { error } = await api.createReservation({
        guest_name: data.guest_name,
        guest_email: data.guest_email,
        guest_phone: data.guest_phone,
        party_size: partySize,
        reservation_date: date.toISOString().split("T")[0],
        reservation_time: timeSlot,
        occasion: data.occasion || undefined,
        special_requests: data.special_requests || undefined,
      });
      if (error) throw new Error(error);
      setSuccess(true);
      toast.success("Reservation request submitted!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit reservation. Please try again.");
    }
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-20">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success/20">
            <Check className="h-10 w-10 text-success" />
          </div>
          <h1 className="mt-6 font-display text-3xl font-bold">Reservation Requested!</h1>
          <p className="mt-4 text-muted-foreground">We've received your reservation request. You'll receive a confirmation email shortly.</p>
          <Button asChild className="mt-8"><a href="/">Back Home</a></Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-20">
      <section className="border-b bg-card/30 py-12">
        <div className="container mx-auto px-4 md:px-6">
          <Badge variant="outline" className="mb-4">Reservation</Badge>
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">Reserve Your Table</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">Book your spot at Three Guys Cafe And Lounge. We can't wait to host you.</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-2xl">
            {/* Steps */}
            <div className="mb-8 flex items-center justify-center gap-2">
              {[1, 2, 3].map((s) => (
                <React.Fragment key={s}>
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-colors", step >= s ? "bg-gradient-gold text-primary-foreground" : "bg-muted text-muted-foreground")}>
                    {step > s ? <Check className="h-4 w-4" /> : s}
                  </div>
                  {s < 3 && <div className={cn("h-1 w-16 rounded-full", step > s ? "bg-accent" : "bg-muted")} />}
                </React.Fragment>
              ))}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl border p-6 md:p-8">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h2 className="mb-4 font-display text-xl font-semibold">Choose Date & Party Size</h2>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium">Select Date</label>
                        <div className="flex justify-center rounded-xl border p-2">
                          <CalendarComponent
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                            className="rounded-md"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium">Party Size</label>
                        <div className="grid grid-cols-5 gap-2">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => setPartySize(n)}
                              className={cn("flex h-12 items-center justify-center rounded-xl border text-sm font-medium transition-all", partySize === n ? "border-accent bg-accent/10 text-accent" : "hover:border-accent/50")}
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                        <div className="mt-6">
                          <label className="mb-2 block text-sm font-medium">Select Time</label>
                          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                            {timeSlots.map((slot) => (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => setTimeSlot(slot)}
                                className={cn("rounded-lg border px-2 py-2 text-sm transition-all", timeSlot === slot ? "border-accent bg-accent/10 text-accent" : "hover:border-accent/50")}
                              >
                                {slot}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button type="button" className="mt-6 w-full" disabled={!date || !timeSlot} onClick={() => setStep(2)}>
                      Continue <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h2 className="mb-4 font-display text-xl font-semibold">Your Details</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium">Full Name</label>
                        <Input {...register("guest_name")} aria-invalid={!!errors.guest_name} />
                        {errors.guest_name && <p className="mt-1 text-xs text-destructive">{errors.guest_name.message}</p>}
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-sm font-medium">Email</label>
                          <Input type="email" {...register("guest_email")} aria-invalid={!!errors.guest_email} />
                          {errors.guest_email && <p className="mt-1 text-xs text-destructive">{errors.guest_email.message}</p>}
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium">Phone</label>
                          <Input {...register("guest_phone")} aria-invalid={!!errors.guest_phone} />
                          {errors.guest_phone && <p className="mt-1 text-xs text-destructive">{errors.guest_phone.message}</p>}
                        </div>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium">Occasion (optional)</label>
                        <Input {...register("occasion")} placeholder="Birthday, anniversary, etc." />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium">Special Requests (optional)</label>
                        <Input {...register("special_requests")} placeholder="Window seat, high chair, etc." />
                      </div>
                    </div>
                    <div className="mt-6 flex gap-3">
                      <Button type="button" variant="outline" onClick={() => setStep(1)}>Back</Button>
                      <Button type="button" className="flex-1" onClick={() => setStep(3)}>Review <ChevronRight className="ml-2 h-4 w-4" /></Button>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h2 className="mb-4 font-display text-xl font-semibold">Review & Confirm</h2>
                    <div className="space-y-3 rounded-xl border p-4">
                      <div className="flex items-center gap-3"><Calendar className="h-5 w-5 text-accent" /> <span className="text-sm">{date?.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</span></div>
                      <div className="flex items-center gap-3"><Clock className="h-5 w-5 text-accent" /> <span className="text-sm">{timeSlot}</span></div>
                      <div className="flex items-center gap-3"><Users className="h-5 w-5 text-accent" /> <span className="text-sm">{partySize} {partySize === 1 ? "guest" : "guests"}</span></div>
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">Please confirm your reservation details above. You'll receive a confirmation email once approved.</p>
                    <div className="mt-6 flex gap-3">
                      <Button type="button" variant="outline" onClick={() => setStep(2)}>Back</Button>
                      <Button type="submit" className="flex-1" disabled={submitting}>
                        {submitting ? "Submitting..." : "Confirm Reservation"}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
