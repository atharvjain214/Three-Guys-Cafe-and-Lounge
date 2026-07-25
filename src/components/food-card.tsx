import * as React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Plus, Star, Clock, Leaf, Flame, Wheat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { useAuth } from "@/stores/auth-context";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { MenuItem } from "@/types";

interface FoodCardProps {
  item: MenuItem;
  index?: number;
}

export function FoodCard({ item, index = 0 }: FoodCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const wishlist = useWishlistStore();
  const { user } = useAuth();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(item, 1);
    toast.success(`${item.name} added to cart`);
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.info("Sign in to save items to your wishlist");
      return;
    }
    const exists = wishlist.has(item.id);
    if (exists) {
      wishlist.remove(item.id);
      if (user) {
        await supabase.from("wishlist").delete().eq("user_id", user.id).eq("menu_item_id", item.id);
      }
    } else {
      wishlist.toggle(item.id);
      if (user) {
        await supabase.from("wishlist").insert({ user_id: user.id, menu_item_id: item.id });
      }
      toast.success("Added to wishlist");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      className="group relative"
    >
      <Link to={`/menu/${item.slug}`} className="block">
        <div className="overflow-hidden rounded-2xl border bg-card shadow-soft transition-all duration-300 group-hover:shadow-float">
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-warm">
                <span className="font-display text-4xl text-primary-foreground/50">{item.name.charAt(0)}</span>
              </div>
            )}

            {/* Top badges */}
            <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
              {item.is_featured && (
                <Badge className="bg-gradient-gold text-primary-foreground border-0">Featured</Badge>
              )}
              {item.compare_at_price && (
                <Badge variant="destructive" className="border-0">
                  ₹{(item.compare_at_price - item.price).toFixed(0)} off
                </Badge>
              )}
            </div>

            {/* Wishlist */}
            <button
              onClick={handleWishlist}
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full glass shadow-soft transition-colors hover:text-accent"
              aria-label="Toggle wishlist"
            >
              <Heart className={cn("h-4 w-4", wishlist.has(item.id) && "fill-accent text-accent")} />
            </button>

            {/* Rating */}
            {item.rating > 0 && (
              <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full glass px-2 py-1 text-xs font-medium shadow-soft">
                <Star className="h-3 w-3 fill-accent text-accent" />
                {item.rating.toFixed(1)}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="mb-1 flex items-start justify-between gap-2">
              <h3 className="font-display text-base font-semibold leading-tight">{item.name}</h3>
            </div>
            <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>

            {/* Dietary */}
            <div className="mb-3 flex flex-wrap gap-2">
              {item.is_vegetarian && (
                <span className="flex items-center gap-1 text-xs text-success" title="Vegetarian">
                  <Leaf className="h-3 w-3" /> Veg
                </span>
              )}
              {item.is_vegan && (
                <span className="flex items-center gap-1 text-xs text-success" title="Vegan">
                  <Leaf className="h-3 w-3" /> Vegan
                </span>
              )}
              {item.is_spicy && (
                <span className="flex items-center gap-1 text-xs text-warning" title="Spicy">
                  <Flame className="h-3 w-3" /> Spicy
                </span>
              )}
              {item.is_gluten_free && (
                <span className="flex items-center gap-1 text-xs text-info" title="Gluten Free">
                  <Wheat className="h-3 w-3" /> GF
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" /> {item.prep_time_minutes}m
              </span>
            </div>

            {/* Price + Add */}
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-lg font-bold">₹{item.price.toFixed(0)}</span>
                {item.compare_at_price && (
                  <span className="text-sm text-muted-foreground line-through">₹{item.compare_at_price.toFixed(0)}</span>
                )}
              </div>
              <Button size="sm" onClick={handleAddToCart} className="gap-1">
                <Plus className="h-4 w-4" /> Add
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
