import * as React from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FoodCard } from "@/components/food-card";
import { supabase } from "@/lib/supabase";
import type { MenuItem, Category } from "@/types";
import { cn } from "@/lib/utils";

export default function Menu() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = React.useState<MenuItem[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [sortBy, setSortBy] = React.useState("featured");
  const [filterVeg, setFilterVeg] = React.useState(false);
  const [filterSpicy, setFilterSpicy] = React.useState(false);
  const activeCategory = searchParams.get("category") || "all";

  React.useEffect(() => {
    (async () => {
      const [itemsRes, catRes] = await Promise.all([
        supabase.from("menu_items").select("*, category:categories(*)").eq("is_available", true).order("sort_order"),
        supabase.from("categories").select("*").eq("is_active", true).order("sort_order"),
      ]);
      setItems(itemsRes.data as MenuItem[] ?? []);
      setCategories(catRes.data as Category[] ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = React.useMemo(() => {
    let result = items;
    if (activeCategory !== "all") {
      result = result.filter((i) => i.category?.slug === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) => i.name.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q) || i.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (filterVeg) result = result.filter((i) => i.is_vegetarian);
    if (filterSpicy) result = result.filter((i) => i.is_spicy);

    switch (sortBy) {
      case "price-low": result = [...result].sort((a, b) => a.price - b.price); break;
      case "price-high": result = [...result].sort((a, b) => b.price - a.price); break;
      case "rating": result = [...result].sort((a, b) => b.rating - a.rating); break;
      case "name": result = [...result].sort((a, b) => a.name.localeCompare(b.name)); break;
      default: result = [...result].sort((a, b) => Number(b.is_featured) - Number(a.is_featured));
    }
    return result;
  }, [items, activeCategory, search, sortBy, filterVeg, filterSpicy]);

  const setCategory = (slug: string) => {
    if (slug === "all") setSearchParams({});
    else setSearchParams({ category: slug });
  };

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="border-b bg-card/30 py-12">
        <div className="container mx-auto px-4 md:px-6">
          <Badge variant="outline" className="mb-4">Our Menu</Badge>
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">Explore Our Menu</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            From single-origin coffee to chef-crafted mains and house-made desserts — every item is made with intention.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-16 z-30 border-b bg-background/80 backdrop-blur-md md:top-20">
        <div className="container mx-auto px-4 py-4 md:px-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search dishes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2" aria-label="Clear search">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant={filterVeg ? "default" : "outline"} size="sm" onClick={() => setFilterVeg(!filterVeg)}>
                Veg Only
              </Button>
              <Button variant={filterSpicy ? "default" : "outline"} size="sm" onClick={() => setFilterSpicy(!filterSpicy)}>
                Spicy
              </Button>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Top Rated</SelectItem>
                  <SelectItem value="name">Name: A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category tabs */}
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setCategory("all")}
              className={cn(
                "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                activeCategory === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.slug)}
                className={cn(
                  "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  activeCategory === cat.slug ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-80 animate-pulse rounded-2xl bg-muted" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Search className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 font-display text-xl font-semibold">No dishes found</h3>
              <p className="mt-2 text-muted-foreground">Try adjusting your filters or search.</p>
              <Button className="mt-4" onClick={() => { setSearch(""); setFilterVeg(false); setFilterSpicy(false); setCategory("all"); }}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <p className="mb-6 text-sm text-muted-foreground">{filtered.length} dishes</p>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((item, i) => (
                  <FoodCard key={item.id} item={item} index={i} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
