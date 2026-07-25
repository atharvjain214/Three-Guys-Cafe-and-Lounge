import * as React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Coffee, Utensils, Calendar, Star, Quote, MapPin, Clock, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AnimatedSection, AnimatedCounter, ParallaxLayer } from "@/components/animated";
import { FoodCard } from "@/components/food-card";
import { supabase } from "@/lib/supabase";
import type { MenuItem, Category, GalleryItem, EventItem } from "@/types";
import { fadeUp, staggerContainer, slideInLeft, slideInRight } from "@/lib/motion";

const HeroScene = React.lazy(() => import("@/components/hero-scene").then((m) => ({ default: m.HeroScene })));

const stats = [
  { value: 50000, suffix: "+", label: "Cups Served" },
  { value: 25, suffix: "+", label: "Signature Dishes" },
  { value: 4.9, suffix: "", label: "Average Rating", decimals: true },
  { value: 8, suffix: " yrs", label: "Of Passion" },
];

const reviews = [
  { name: "Aarav Sharma", text: "The best cafe in Bengaluru. The signature latte is absolute perfection, and the ambiance is unmatched.", rating: 5, role: "Regular Customer" },
  { name: "Priya Patel", text: "Beautiful interior, incredible food, and the staff treat you like family. The butter chicken risotto is a must-try!", rating: 5, role: "Food Blogger" },
  { name: "Rohan Mehta", text: "Three Guys has become my go-to spot. The coffee is consistently excellent and the events are always a great time.", rating: 5, role: "Coffee Enthusiast" },
];

export default function Home() {
  const [featuredItems, setFeaturedItems] = React.useState<MenuItem[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [galleryItems, setGalleryItems] = React.useState<GalleryItem[]>([]);
  const [events, setEvents] = React.useState<EventItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      const [itemsRes, catRes, galleryRes, eventsRes] = await Promise.all([
        supabase.from("menu_items").select("*, category:categories(*)").eq("is_featured", true).eq("is_available", true).order("rating", { ascending: false }).limit(6),
        supabase.from("categories").select("*").eq("is_active", true).order("sort_order"),
        supabase.from("gallery").select("*").eq("is_featured", true).eq("is_published", true).order("sort_order").limit(6),
        supabase.from("events").select("*").eq("is_published", true).gte("event_date", new Date().toISOString()).order("event_date").limit(3),
      ]);

      setFeaturedItems(itemsRes.data as MenuItem[] ?? []);
      setCategories(catRes.data as Category[] ?? []);
      setGalleryItems(galleryRes.data as GalleryItem[] ?? []);
      setEvents(eventsRes.data as EventItem[] ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative flex min-h-[100vh] items-center justify-center pt-16">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background/80" />
          <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-[120px]" />
        </div>

        <div className="container relative mx-auto px-4 md:px-6">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer(0.15)}
              className="flex flex-col items-start gap-6"
            >
              <motion.div variants={fadeUp}>
                <Badge className="bg-gradient-gold text-primary-foreground border-0">
                  <Coffee className="mr-1.5 h-3 w-3" /> Premium Coffee & Lounge
                </Badge>
              </motion.div>

              <motion.h1 variants={fadeUp} className="font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
                Where Every
                <span className="block text-gradient-gold">Sip Tells a Story</span>
              </motion.h1>

              <motion.p variants={fadeUp} className="max-w-lg text-lg text-muted-foreground">
                Experience artisan coffee, soulful food, and an immersive lounge atmosphere.
                Crafted with passion in the heart of Bengaluru.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
                <Button size="lg" asChild className="gap-2">
                  <Link to="/menu">
                    Explore Menu <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/reservation">Reserve a Table</Link>
                </Button>
              </motion.div>

              <motion.div variants={fadeUp} className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <span className="text-sm font-medium">4.9 / 5.0</span>
                </div>
                <div className="h-6 w-px bg-border" />
                <span className="text-sm text-muted-foreground">2,000+ reviews</span>
              </motion.div>
            </motion.div>

            {/* 3D Scene */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative h-[400px] lg:h-[500px]"
            >
              <React.Suspense
                fallback={
                  <div className="flex h-full items-center justify-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-2 border-muted border-t-accent" />
                  </div>
                }
              >
                <HeroScene />
              </React.Suspense>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-muted-foreground/30 p-1.5">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="h-2 w-1 rounded-full bg-accent"
            />
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="border-y bg-card/30 py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="font-display text-4xl font-bold text-gradient-gold md:text-5xl">
                  {stat.decimals ? (
                    <>{stat.value}</>
                  ) : (
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <AnimatedSection className="mb-12 text-center">
            <Badge variant="outline" className="mb-4">Explore</Badge>
            <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">Curated Categories</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              From single-origin coffee to chef-crafted mains, discover our carefully curated menu.
            </p>
          </AnimatedSection>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
              >
                <Link to={`/menu?category=${cat.slug}`}>
                  <Card className="group relative overflow-hidden p-6 transition-all hover:shadow-float">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-warm text-primary-foreground transition-transform group-hover:scale-110">
                        {cat.icon === "coffee" && <Coffee className="h-6 w-6" />}
                        {cat.icon === "tea" && <Coffee className="h-6 w-6" />}
                        {cat.icon === "breakfast" && <Utensils className="h-6 w-6" />}
                        {cat.icon === "main" && <Utensils className="h-6 w-6" />}
                        {cat.icon === "dessert" && <Utensils className="h-6 w-6" />}
                        {cat.icon === "beverage" && <Coffee className="h-6 w-6" />}
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-semibold">{cat.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">{cat.description}</p>
                      </div>
                      <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-accent" />
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Dishes */}
      <section className="bg-card/30 py-20">
        <div className="container mx-auto px-4 md:px-6">
          <AnimatedSection className="mb-12 flex items-end justify-between">
            <div>
              <Badge variant="outline" className="mb-4">Chef's Selection</Badge>
              <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">Featured Dishes</h2>
            </div>
            <Button variant="ghost" asChild className="hidden md:inline-flex">
              <Link to="/menu">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </AnimatedSection>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 animate-pulse rounded-2xl bg-muted" />
              ))}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredItems.map((item, i) => (
                <FoodCard key={item.id} item={item} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={slideInLeft}
            >
              <Badge variant="outline" className="mb-4">Our Story</Badge>
              <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
                Three Friends.<br />
                <span className="text-gradient-gold">One Passion.</span>
              </h2>
              <p className="mt-6 text-lg text-muted-foreground">
                Born from a shared love of great coffee and soulful food, Three Guys Cafe And Lounge
                began as a dream between three friends. Today, it's a destination where every cup
                tells a story and every meal creates a memory.
              </p>
              <p className="mt-4 text-muted-foreground">
                We source the finest beans, craft each dish with intention, and curate an atmosphere
                that feels like home — but better. Welcome to our lounge.
              </p>
              <Button asChild className="mt-8">
                <Link to="/about">Read Our Story <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={slideInRight}
              className="relative"
            >
              <ParallaxLayer speed={0.2}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-float">
                  <img
                    src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&q=80"
                    alt="Three Guys Cafe interior"
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-espresso/60 to-transparent" />
                </div>
              </ParallaxLayer>
              <div className="absolute -bottom-6 -left-6 hidden rounded-2xl glass-card p-4 shadow-float md:block">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-gold">
                    <Coffee className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-display text-2xl font-bold">8+ Years</p>
                    <p className="text-xs text-muted-foreground">of crafting experiences</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Gallery Preview */}
      <section className="bg-card/30 py-20">
        <div className="container mx-auto px-4 md:px-6">
          <AnimatedSection className="mb-12 text-center">
            <Badge variant="outline" className="mb-4">Gallery</Badge>
            <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">A Glimpse Inside</h2>
          </AnimatedSection>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {galleryItems.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={`relative overflow-hidden rounded-xl ${i === 0 || i === 3 ? "col-span-2 row-span-2" : ""}`}
              >
                <Link to="/gallery">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button variant="outline" asChild>
              <Link to="/gallery">View Full Gallery <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Events */}
      {events.length > 0 && (
        <section className="py-20">
          <div className="container mx-auto px-4 md:px-6">
            <AnimatedSection className="mb-12 flex items-end justify-between">
              <div>
                <Badge variant="outline" className="mb-4">What's On</Badge>
                <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">Upcoming Events</h2>
              </div>
              <Button variant="ghost" asChild className="hidden md:inline-flex">
                <Link to="/events">All Events <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </AnimatedSection>

            <div className="grid gap-6 md:grid-cols-3">
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
                      <div className="absolute bottom-3 left-3">
                        <Badge className="bg-gradient-gold text-primary-foreground border-0">
                          <Calendar className="mr-1.5 h-3 w-3" />
                          {new Date(event.event_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-display text-lg font-semibold">{event.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                      <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" /> {event.location}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Reviews */}
      <section className="bg-card/30 py-20">
        <div className="container mx-auto px-4 md:px-6">
          <AnimatedSection className="mb-12 text-center">
            <Badge variant="outline" className="mb-4">Testimonials</Badge>
            <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">Loved by Our Guests</h2>
          </AnimatedSection>

          <div className="grid gap-6 md:grid-cols-3">
            {reviews.map((review, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full p-6">
                  <Quote className="h-8 w-8 text-accent/30" />
                  <p className="mt-4 text-muted-foreground">{review.text}</p>
                  <div className="mt-4 flex">
                    {[...Array(review.rating)].map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-warm text-primary-foreground font-semibold">
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{review.name}</p>
                      <p className="text-xs text-muted-foreground">{review.role}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reservation CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-warm p-8 text-center text-primary-foreground md:p-16"
          >
            <div className="absolute inset-0 -z-10 opacity-20">
              <div className="absolute left-1/4 top-0 h-64 w-64 rounded-full bg-gold blur-3xl" />
              <div className="absolute right-1/4 bottom-0 h-64 w-64 rounded-full bg-copper blur-3xl" />
            </div>
            <Badge className="mb-4 bg-primary-foreground/20 text-primary-foreground border-0">Reserve Your Experience</Badge>
            <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
              Book Your Table at Three Guys
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
              Whether it's a quiet morning coffee or a celebration with friends,
              we have the perfect spot waiting for you.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/reservation">Reserve Now</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/contact">Get Directions</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-primary-foreground/70">
              <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> Open 8 AM — 11 PM</span>
              <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> 42 Brigade Road, Bengaluru</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Instagram Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <AnimatedSection className="mb-12 text-center">
            <Badge variant="outline" className="mb-4"><Share2 className="mr-1.5 h-3 w-3" /> Follow Us</Badge>
            <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">@threeguyscafe</h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Tag us in your moments and join our community of coffee lovers and food enthusiasts.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
            {galleryItems.slice(0, 6).map((item, i) => (
              <motion.a
                key={item.id}
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group relative aspect-square overflow-hidden rounded-xl"
              >
                <img src={item.image_url} alt={item.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 flex items-center justify-center bg-espresso/60 opacity-0 transition-opacity group-hover:opacity-100">
                  <Share2 className="h-6 w-6 text-white" />
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
