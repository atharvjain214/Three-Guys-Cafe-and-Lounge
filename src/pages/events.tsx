import * as React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import type { EventItem } from "@/types";

export default function Events() {
  const [events, setEvents] = React.useState<EventItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      const { data } = await supabase.from("events").select("*").eq("is_published", true).gte("event_date", new Date().toISOString()).order("event_date");
      setEvents(data as EventItem[] ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="pt-20">
      <section className="border-b bg-card/30 py-12">
        <div className="container mx-auto px-4 md:px-6">
          <Badge variant="outline" className="mb-4">Events</Badge>
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">What's Happening</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">Join us for live music, workshops, and special dining experiences.</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2">
              {[...Array(4)].map((_, i) => <div key={i} className="h-64 animate-pulse rounded-2xl bg-muted" />)}
            </div>
          ) : events.length === 0 ? (
            <div className="py-20 text-center">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 font-display text-xl font-semibold">No upcoming events</h3>
              <p className="mt-2 text-muted-foreground">Check back soon for exciting new events.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {events.map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="group overflow-hidden transition-all hover:shadow-float">
                    <div className="relative aspect-video overflow-hidden">
                      {event.image_url && (
                        <img src={event.image_url} alt={event.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-espresso/80 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                        <div>
                          <Badge className="bg-gradient-gold text-primary-foreground border-0">
                            {new Date(event.event_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </Badge>
                        </div>
                        {event.price > 0 && (
                          <Badge variant="secondary">₹{event.price}</Badge>
                        )}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-display text-xl font-semibold">{event.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                      <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {new Date(event.event_date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span>
                        <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {event.location}</span>
                        {event.capacity && (
                          <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> {event.booked_count}/{event.capacity}</span>
                        )}
                      </div>
                      <Button asChild className="mt-4 w-full">
                        <Link to="/contact">Book Spot <ArrowRight className="ml-2 h-4 w-4" /></Link>
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
