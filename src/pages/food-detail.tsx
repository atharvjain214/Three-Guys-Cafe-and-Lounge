import * as React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Plus, Minus, Star, Clock, Leaf, Flame, Wheat, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FoodCard } from "@/components/food-card";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { useAuth } from "@/stores/auth-context";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { MenuItem, MenuVariant, MenuAddon, MenuItemAddon, Review } from "@/types";

export default function FoodDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = React.useState<MenuItem | null>(null);
  const [variants, setVariants] = React.useState<MenuVariant[]>([]);
  const [addons, setAddons] = React.useState<MenuItemAddon[]>([]);
  const [related, setRelated] = React.useState<MenuItem[]>([]);
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [quantity, setQuantity] = React.useState(1);
  const [selectedVariant, setSelectedVariant] = React.useState<MenuVariant | null>(null);
  const [selectedAddons, setSelectedAddons] = React.useState<MenuAddon[]>([]);
  const [notes, setNotes] = React.useState("");

  const addItem = useCartStore((s) => s.addItem);
  const wishlist = useWishlistStore();
  const { user } = useAuth();

  React.useEffect(() => {
    (async () => {
      if (!slug) return;
      const { data: itemData } = await supabase
        .from("menu_items")
        .select("*, category:categories(*)")
        .eq("slug", slug)
        .maybeSingle();

      if (!itemData) { setLoading(false); return; }
      setItem(itemData as MenuItem);

      const [variantsRes, addonsRes, relatedRes, reviewsRes] = await Promise.all([
        supabase.from("menu_variants").select("*").eq("menu_item_id", itemData.id).eq("is_available", true).order("sort_order"),
        supabase.from("menu_item_addons").select("*, menu_addon:menu_addons(*)").eq("menu_item_id", itemData.id),
        supabase.from("menu_items").select("*, category:categories(*)").eq("category_id", itemData.category_id).neq("id", itemData.id).eq("is_available", true).limit(4),
        supabase.from("reviews").select("*").eq("menu_item_id", itemData.id).eq("is_published", true).order("created_at", { ascending: false }).limit(5),
      ]);

      setVariants(variantsRes.data as MenuVariant[] ?? []);
      setAddons(addonsRes.data as MenuItemAddon[] ?? []);
      setRelated(relatedRes.data as MenuItem[] ?? []);
      setReviews(reviewsRes.data as Review[] ?? []);
      if (variantsRes.data && variantsRes.data.length > 0) {
        setSelectedVariant(variantsRes.data[0] as MenuVariant);
      }
      setLoading(false);
    })();
  }, [slug]);

  const unitPrice = (item?.price ?? 0) + (selectedVariant?.price_adjustment ?? 0) + selectedAddons.reduce((s, a) => s + a.price, 0);
  const totalPrice = unitPrice * quantity;

  const toggleAddon = (addon: MenuAddon) => {
    setSelectedAddons((prev) =>
      prev.some((a) => a.id === addon.id) ? prev.filter((a) => a.id !== addon.id) : [...prev, addon]
    );
  };

  const handleAddToCart = () => {
    if (!item) return;
    addItem(item, quantity, selectedVariant, selectedAddons, notes);
    toast.success(`${item.name} added to cart`);
    navigate("/menu");
  };

  const handleWishlist = async () => {
    if (!item) return;
    if (!user) { toast.info("Sign in to save items"); return; }
    if (wishlist.has(item.id)) {
      wishlist.remove(item.id);
      await supabase.from("wishlist").delete().eq("user_id", user.id).eq("menu_item_id", item.id);
    } else {
      wishlist.toggle(item.id);
      await supabase.from("wishlist").insert({ user_id: user.id, menu_item_id: item.id });
      toast.success("Added to wishlist");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center pt-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-accent" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center pt-20">
        <h1 className="font-display text-3xl font-bold">Dish not found</h1>
        <Button asChild className="mt-4"><Link to="/menu">Back to Menu</Link></Button>
      </div>
    );
  }

  return (
    <div className="pt-20">
      <div className="container mx-auto px-4 py-8 md:px-6">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link to="/menu"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Menu</Link>
        </Button>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative aspect-square overflow-hidden rounded-3xl shadow-float"
          >
            {item.image_url ? (
              <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-warm">
                <span className="font-display text-9xl text-primary-foreground/30">{item.name.charAt(0)}</span>
              </div>
            )}
            {item.is_featured && (
              <Badge className="absolute left-4 top-4 bg-gradient-gold text-primary-foreground border-0">Featured</Badge>
            )}
          </motion.div>

          {/* Details */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl font-bold md:text-4xl">{item.name}</h1>
                {item.category && <p className="mt-1 text-sm text-muted-foreground">{item.category.name}</p>}
              </div>
              <Button variant="outline" size="icon" onClick={handleWishlist} aria-label="Toggle wishlist">
                <Heart className={cn("h-5 w-5", wishlist.has(item.id) && "fill-accent text-accent")} />
              </Button>
            </div>

            {item.rating > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={cn("h-4 w-4", i < Math.round(item.rating) ? "fill-accent text-accent" : "text-muted")} />
                  ))}
                </div>
                <span className="text-sm font-medium">{item.rating.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">({item.review_count} reviews)</span>
              </div>
            )}

            {item.long_description && <p className="mt-4 text-muted-foreground">{item.long_description}</p>}
            {item.description && !item.long_description && <p className="mt-4 text-muted-foreground">{item.description}</p>}

            {/* Dietary */}
            <div className="mt-4 flex flex-wrap gap-3">
              {item.is_vegetarian && <span className="flex items-center gap-1 text-sm text-success"><Leaf className="h-4 w-4" /> Vegetarian</span>}
              {item.is_vegan && <span className="flex items-center gap-1 text-sm text-success"><Leaf className="h-4 w-4" /> Vegan</span>}
              {item.is_spicy && <span className="flex items-center gap-1 text-sm text-warning"><Flame className="h-4 w-4" /> Spicy</span>}
              {item.is_gluten_free && <span className="flex items-center gap-1 text-sm text-info"><Wheat className="h-4 w-4" /> Gluten Free</span>}
              <span className="flex items-center gap-1 text-sm text-muted-foreground"><Clock className="h-4 w-4" /> {item.prep_time_minutes} min</span>
              {item.calories && <span className="text-sm text-muted-foreground">{item.calories} cal</span>}
            </div>

            {/* Variants */}
            {variants.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-3 font-semibold">Choose Size</h3>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={cn(
                        "flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition-all",
                        selectedVariant?.id === v.id ? "border-accent bg-accent/10 text-accent" : "hover:border-accent/50"
                      )}
                    >
                      <span className="font-medium">{v.name}</span>
                      {v.price_adjustment !== 0 && (
                        <span className="text-muted-foreground">{v.price_adjustment > 0 ? "+" : ""}₹{v.price_adjustment}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Addons */}
            {addons.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-3 font-semibold">Add Extras</h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {addons.map((a) => a.menu_addon && (
                    <button
                      key={a.id}
                      onClick={() => toggleAddon(a.menu_addon!)}
                      className={cn(
                        "flex items-center justify-between rounded-xl border px-4 py-2.5 text-sm transition-all",
                        selectedAddons.some((sa) => sa.id === a.menu_addon!.id) ? "border-accent bg-accent/10" : "hover:border-accent/50"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <span className={cn("flex h-4 w-4 items-center justify-center rounded border", selectedAddons.some((sa) => sa.id === a.menu_addon!.id) && "border-accent bg-accent text-accent-foreground")}>
                          {selectedAddons.some((sa) => sa.id === a.menu_addon!.id) && <Check className="h-3 w-3" />}
                        </span>
                        {a.menu_addon!.name}
                      </span>
                      {a.menu_addon!.price > 0 && <span className="text-muted-foreground">+₹{a.menu_addon!.price}</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="mt-6">
              <h3 className="mb-2 font-semibold">Special Instructions</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requests..."
                className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm"
                rows={2}
              />
            </div>

            <Separator className="my-6" />

            {/* Quantity + Add */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity">
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-10 text-center text-lg font-semibold">{quantity}</span>
                <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button size="lg" className="flex-1" onClick={handleAddToCart}>
                Add to Cart — ₹{totalPrice.toFixed(0)}
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="mb-6 font-display text-2xl font-bold">You Might Also Like</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((r, i) => <FoodCard key={r.id} item={r} index={i} />)}
            </div>
          </div>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <div className="mt-20">
            <h2 className="mb-6 font-display text-2xl font-bold">Customer Reviews</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {reviews.map((review) => (
                <Card key={review.id} className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-warm text-primary-foreground font-semibold">
                      ?
                    </div>
                    <div>
                      <div className="flex">
                        {[...Array(review.rating)].map((_, j) => <Star key={j} className="h-3.5 w-3.5 fill-accent text-accent" />)}
                      </div>
                      {review.is_verified && <Badge variant="outline" className="mt-1 text-xs">Verified</Badge>}
                    </div>
                  </div>
                  {review.title && <h4 className="mt-3 font-semibold">{review.title}</h4>}
                  {review.body && <p className="mt-1 text-sm text-muted-foreground">{review.body}</p>}
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
