import * as React from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FoodCard } from "@/components/food-card";
import { useAuth } from "@/stores/auth-context";
import { useWishlistStore } from "@/stores/wishlist-store";
import { supabase } from "@/lib/supabase";
import type { MenuItem } from "@/types";

export default function Wishlist() {
  const { user } = useAuth();
  const wishlist = useWishlistStore();
  const [items, setItems] = React.useState<MenuItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      const ids = user ? await (async () => {
        const { data } = await supabase.from("wishlist").select("menu_item_id").eq("user_id", user.id);
        return (data ?? []).map((w) => w.menu_item_id);
      })() : wishlist.items;

      if (ids.length === 0) { setItems([]); setLoading(false); return; }
      const { data } = await supabase.from("menu_items").select("*, category:categories(*)").in("id", ids);
      setItems(data as MenuItem[] ?? []);
      setLoading(false);
    })();
  }, [user, wishlist.items]);

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-accent" /></div>;

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">My Wishlist</h1>
      <p className="mt-1 text-muted-foreground">Your saved favorite dishes.</p>
      {items.length === 0 ? (
        <Card className="mt-6 p-12 text-center">
          <Heart className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 font-display text-xl font-semibold">No saved items</h3>
          <p className="mt-2 text-muted-foreground">Tap the heart icon on any dish to save it here.</p>
          <Button asChild className="mt-4"><Link to="/menu">Browse Menu</Link></Button>
        </Card>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => <FoodCard key={item.id} item={item} index={i} />)}
        </div>
      )}
    </div>
  );
}
