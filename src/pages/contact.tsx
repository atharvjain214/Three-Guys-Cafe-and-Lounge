import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  subject: z.string().min(2, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormData = z.infer<typeof schema>;

export default function Contact() {
  const [submitting, setSubmitting] = React.useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (_data: FormData) => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Message sent! We'll get back to you soon.");
    reset();
    setSubmitting(false);
  };

  return (
    <div className="pt-20">
      <section className="border-b bg-card/30 py-12">
        <div className="container mx-auto px-4 md:px-6">
          <Badge variant="outline" className="mb-4">Contact</Badge>
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">Get in Touch</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">We'd love to hear from you. Reach out for reservations, events, feedback, or just to say hello.</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Info */}
            <div className="space-y-6">
              {[
                { icon: MapPin, title: "Visit Us", lines: ["42 Brigade Road", "Bengaluru, Karnataka 560025"] },
                { icon: Phone, title: "Call Us", lines: ["+91 80 4567 8900", "Mon-Sun, 8 AM - 11 PM"] },
                { icon: Mail, title: "Email Us", lines: ["hello@threeguyscafe.in", "events@threeguyscafe.in"] },
                { icon: Clock, title: "Opening Hours", lines: ["Monday - Sunday", "8:00 AM - 11:00 PM"] },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 rounded-2xl border p-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-warm text-primary-foreground">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    {item.lines.map((line, j) => <p key={j} className="text-sm text-muted-foreground">{line}</p>)}
                  </div>
                </div>
              ))}
            </div>

            {/* Form */}
            <div className="rounded-2xl border p-6 md:p-8">
              <h2 className="font-display text-2xl font-bold">Send a Message</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="mb-1.5 block text-sm font-medium">Name</label>
                    <Input id="name" {...register("name")} aria-invalid={!!errors.name} />
                    {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="email" className="mb-1.5 block text-sm font-medium">Email</label>
                    <Input id="email" type="email" {...register("email")} aria-invalid={!!errors.email} />
                    {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="phone" className="mb-1.5 block text-sm font-medium">Phone (optional)</label>
                    <Input id="phone" {...register("phone")} />
                  </div>
                  <div>
                    <label htmlFor="subject" className="mb-1.5 block text-sm font-medium">Subject</label>
                    <Input id="subject" {...register("subject")} aria-invalid={!!errors.subject} />
                    {errors.subject && <p className="mt-1 text-xs text-destructive">{errors.subject.message}</p>}
                  </div>
                </div>
                <div>
                  <label htmlFor="message" className="mb-1.5 block text-sm font-medium">Message</label>
                  <Textarea id="message" rows={5} {...register("message")} aria-invalid={!!errors.message} />
                  {errors.message && <p className="mt-1 text-xs text-destructive">{errors.message.message}</p>}
                </div>
                <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                  {submitting ? "Sending..." : <>Send Message <Send className="ml-2 h-4 w-4" /></>}
                </Button>
              </form>
            </div>
          </div>

          {/* Map */}
          <div className="mt-8 overflow-hidden rounded-2xl border">
            <iframe
              title="Three Guys Cafe Location"
              src="https://www.openstreetmap.org/export/embed.html?bbox=77.7499%2C12.9698%2C77.7599%2C12.9798&layer=mapnik&marker=12.9698%2C77.7499"
              className="h-[400px] w-full"
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
