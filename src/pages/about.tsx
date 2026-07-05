import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Coffee, Heart, Award, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AnimatedSection, AnimatedCounter, ParallaxLayer } from "@/components/animated";
import { slideInLeft, slideInRight, fadeUp, staggerContainer } from "@/lib/motion";

const values = [
  { icon: Coffee, title: "Craft First", description: "Every cup and plate is made with intention, precision, and passion." },
  { icon: Leaf, title: "Sourced Responsibly", description: "We partner with ethical farms and local suppliers for the freshest ingredients." },
  { icon: Heart, title: "Community Driven", description: "Three Guys is more than a cafe — it's a gathering place for our community." },
  { icon: Award, title: "Uncompromising Quality", description: "We never cut corners. Only the best reaches your table." },
];

const timeline = [
  { year: "2017", title: "The Dream Begins", description: "Three friends with a shared passion for coffee start planning their dream cafe." },
  { year: "2018", title: "Doors Open", description: "Three Guys Cafe opens on Brigade Road with a single espresso machine and big dreams." },
  { year: "2020", title: "Growing Together", description: "Despite challenges, we expand our menu and build a loyal community of regulars." },
  { year: "2023", title: "The Lounge", description: "We unveil our new lounge space, transforming from a cafe into a full dining destination." },
  { year: "2025", title: "Looking Forward", description: "With new events, workshops, and an expanded menu, the journey continues." },
];

export default function About() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="relative py-20">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer(0.15)} className="max-w-3xl">
            <motion.div variants={fadeUp}>
              <Badge variant="outline" className="mb-4">Our Story</Badge>
            </motion.div>
            <motion.h1 variants={fadeUp} className="font-display text-5xl font-bold tracking-tight md:text-6xl">
              Three Friends.<br />
              <span className="text-gradient-gold">One Passion.</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-6 text-lg text-muted-foreground">
              What started as a conversation between three friends over a cup of coffee has become
              one of Bengaluru's most beloved dining destinations. This is our story.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Story with image */}
      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideInLeft}>
              <ParallaxLayer speed={0.15}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-float">
                  <img src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&q=80" alt="Three Guys Cafe" className="h-full w-full object-cover" loading="lazy" />
                </div>
              </ParallaxLayer>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideInRight}>
              <h2 className="font-display text-3xl font-bold md:text-4xl">From a Dream to a Destination</h2>
              <p className="mt-4 text-muted-foreground">
                In 2017, three friends — Arjun, Kabir, and Rohan — shared a vision: to create a space
                where great coffee, soulful food, and genuine community come together. They spent a year
                traveling, tasting, and learning from the best baristas and chefs across the country.
              </p>
              <p className="mt-4 text-muted-foreground">
                In 2018, they opened the doors of Three Guys Cafe on Brigade Road. What began with a
                single espresso machine and a small menu has grown into a full dining destination with
                a lounge, event space, and a menu that celebrates both local flavors and global techniques.
              </p>
              <p className="mt-4 text-muted-foreground">
                Today, we serve over 50,000 cups of coffee a year, host weekly events, and continue to
                pursue our founding passion: crafting unforgettable experiences, one cup and one plate at a time.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-card/30 py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { value: 50000, suffix: "+", label: "Cups Served" },
              { value: 25, suffix: "+", label: "Signature Dishes" },
              { value: 200, suffix: "+", label: "Events Hosted" },
              { value: 8, suffix: " yrs", label: "Of Passion" },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                <div className="font-display text-4xl font-bold text-gradient-gold md:text-5xl">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <AnimatedSection className="mb-12 text-center">
            <Badge variant="outline" className="mb-4">What We Believe</Badge>
            <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">Our Values</h2>
          </AnimatedSection>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="h-full p-6 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-warm text-primary-foreground">
                    <value.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold">{value.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{value.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-card/30 py-20">
        <div className="container mx-auto px-4 md:px-6">
          <AnimatedSection className="mb-12 text-center">
            <Badge variant="outline" className="mb-4">Our Journey</Badge>
            <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">The Three Guys Timeline</h2>
          </AnimatedSection>
          <div className="mx-auto max-w-3xl">
            {timeline.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative flex gap-6 pb-12 last:pb-0"
              >
                <div className="flex flex-col items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-gold text-primary-foreground font-display text-sm font-bold">
                    {item.year.slice(-2)}
                  </div>
                  {i < timeline.length - 1 && <div className="mt-2 h-full w-px bg-border" />}
                </div>
                <div className="flex-1 pt-1">
                  <span className="text-sm font-semibold text-accent">{item.year}</span>
                  <h3 className="font-display text-lg font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="rounded-3xl bg-gradient-warm p-8 text-center text-primary-foreground md:p-16">
            <h2 className="font-display text-3xl font-bold md:text-4xl">Come Visit Us</h2>
            <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">We'd love to welcome you to Three Guys Cafe And Lounge.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button size="lg" variant="secondary" asChild><Link to="/reservation">Reserve a Table</Link></Button>
              <Button size="lg" variant="outline" asChild className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"><Link to="/contact">Get in Touch</Link></Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
