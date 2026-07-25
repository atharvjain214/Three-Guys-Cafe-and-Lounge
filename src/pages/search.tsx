import * as React from "react";
import { Link } from "react-router-dom";
import { Search as SearchIcon, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FoodCard } from "@/components/food-card";
import { supabase } from "@/lib/supabase";
import type { MenuItem } from "@/types";

export default function Search() {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<MenuItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [searched, setSearched] = React.useState(false);

  const search = React.useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setSearched(false); return; }
    setLoading(true);
    setSearched(true);
    const { data } = await supabase
      .from("menu_items")
      .select("*, category:categories(*)")
      .eq("is_available", true)
      .or(`name.ilike.%${q}%,description.ilike.%${q}%`)
      .limit(20);
    setResults(data as MenuItem[] ?? []);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  return (
    <div className="pt-20">
      <section className="border-b bg-card/30 py-12">
        <div className="container mx-auto px-4 md:px-6">
          <Badge variant="outline" className="mb-4">Search</Badge>
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">Search Our Menu</h1>
          <div className="relative mt-6 max-w-xl">
            <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="Search for dishes, coffee, desserts..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-12 pl-11 text-base"
            />
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6">
          {!searched ? (
            <div className="py-20 text-center">
              <SearchIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 font-display text-xl font-semibold">Start typing to search</h3>
              <p className="mt-2 text-muted-foreground">Find your favorite dishes, coffee, and desserts.</p>
            </div>
          ) : loading ? (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-accent" />
            </div>
          ) : results.length === 0 ? (
            <div className="py-20 text-center">
              <h3 className="font-display text-xl font-semibold">No results found</h3>
              <p className="mt-2 text-muted-foreground">Try a different search term.</p>
              <Button asChild className="mt-4"><Link to="/menu">Browse Full Menu <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
            </div>
          ) : (
            <>
              <p className="mb-6 text-sm text-muted-foreground">{results.length} results for "{query}"</p>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {results.map((item, i) => <FoodCard key={item.id} item={item} index={i} />)}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
