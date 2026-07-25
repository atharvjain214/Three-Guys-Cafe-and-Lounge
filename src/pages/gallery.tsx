import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import type { GalleryItem } from "@/types";
import { cn } from "@/lib/utils";

export default function Gallery() {
  const [items, setItems] = React.useState<GalleryItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [category, setCategory] = React.useState("all");
  const [lightbox, setLightbox] = React.useState<number | null>(null);

  React.useEffect(() => {
    (async () => {
      const { data } = await supabase.from("gallery").select("*").eq("is_published", true).order("sort_order");
      setItems(data as GalleryItem[] ?? []);
      setLoading(false);
    })();
  }, []);

  const categories = ["all", ...Array.from(new Set(items.map((i) => i.category)))];
  const filtered = category === "all" ? items : items.filter((i) => i.category === category);

  const closeLightbox = () => setLightbox(null);
  const nextImage = () => setLightbox((prev) => prev === null ? null : (prev + 1) % filtered.length);
  const prevImage = () => setLightbox((prev) => prev === null ? null : (prev - 1 + filtered.length) % filtered.length);

  React.useEffect(() => {
    if (lightbox === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, filtered.length]);

  return (
    <div className="pt-20">
      <section className="border-b bg-card/30 py-12">
        <div className="container mx-auto px-4 md:px-6">
          <Badge variant="outline" className="mb-4">Gallery</Badge>
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">Moments at Three Guys</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">A visual journey through our cafe, our food, and our community.</p>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={cn(
                  "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors",
                  category === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => <div key={i} className="aspect-square animate-pulse rounded-xl bg-muted" />)}
            </div>
          ) : (
            <div className="columns-2 gap-3 md:columns-3 lg:columns-4 [&>*]:mb-3">
              {filtered.map((item, i) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => setLightbox(i)}
                  className="block w-full break-inside-avoid"
                >
                  <div className="group relative overflow-hidden rounded-xl">
                    <img src={item.image_url} alt={item.title} loading="lazy" className="w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-espresso/80 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="text-left text-white">
                        <h3 className="font-display text-sm font-semibold">{item.title}</h3>
                        {item.description && <p className="text-xs text-white/70">{item.description}</p>}
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && filtered[lightbox] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-espresso/90 backdrop-blur-md"
            onClick={closeLightbox}
          >
            <Button variant="ghost" size="icon" className="absolute right-4 top-4 text-white" onClick={closeLightbox} aria-label="Close">
              <X className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="icon" className="absolute left-4 text-white" onClick={(e) => { e.stopPropagation(); prevImage(); }} aria-label="Previous">
              <ChevronLeft className="h-8 w-8" />
            </Button>
            <motion.img
              key={filtered[lightbox].id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              src={filtered[lightbox].image_url}
              alt={filtered[lightbox].title}
              className="max-h-[85vh] max-w-[90vw] rounded-2xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <Button variant="ghost" size="icon" className="absolute right-4 text-white" onClick={(e) => { e.stopPropagation(); nextImage(); }} aria-label="Next">
              <ChevronRight className="h-8 w-8" />
            </Button>
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center text-white">
              <h3 className="font-display text-lg font-semibold">{filtered[lightbox].title}</h3>
              {filtered[lightbox].description && <p className="text-sm text-white/70">{filtered[lightbox].description}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
