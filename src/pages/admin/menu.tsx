import * as React from "react";
import { motion } from "framer-motion";
import { Utensils, Plus, Pencil, Trash2, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface MenuItemForm {
  id?: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  category_id: string;
  is_available: boolean;
  is_featured: boolean;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_spicy: boolean;
  is_gluten_free: boolean;
  prep_time_minutes: string;
  calories: string;
  image_url: string;
}

const emptyForm: MenuItemForm = {
  name: "", slug: "", description: "", price: "", category_id: "", is_available: true,
  is_featured: false, is_vegetarian: false, is_vegan: false, is_spicy: false,
  is_gluten_free: false, prep_time_minutes: "15", calories: "", image_url: "",
};

export default function AdminMenu() {
  const [items, setItems] = React.useState<any[]>([]);
  const [categories, setCategories] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<MenuItemForm>(emptyForm);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    const [itemsRes, catsRes] = await Promise.all([
      supabase.from("menu_items").select("id, name, slug, price, is_available, is_featured, is_vegetarian, category_id, category:categories(name)").order("name"),
      supabase.from("categories").select("id, name").order("name"),
    ]);
    if (itemsRes.error) toast.error(itemsRes.error.message);
    if (catsRes.error) toast.error(catsRes.error.message);
    setItems(itemsRes.data ?? []);
    setCategories(catsRes.data ?? []);
    setLoading(false);
  }, []);

  React.useEffect(() => { fetchData(); }, [fetchData]);

  const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  const openAdd = () => { setEditing({ ...emptyForm, slug: "" }); setDialogOpen(true); };
  const openEdit = (item: any) => {
    setEditing({
      id: item.id, name: item.name, slug: item.slug, description: item.description ?? "",
      price: String(item.price), category_id: item.category_id ?? "", is_available: item.is_available,
      is_featured: item.is_featured, is_vegetarian: item.is_vegetarian, is_vegan: item.is_vegan,
      is_spicy: item.is_spicy, is_gluten_free: item.is_gluten_free,
      prep_time_minutes: String(item.prep_time_minutes ?? 15), calories: item.calories ? String(item.calories) : "",
      image_url: item.image_url ?? "",
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!editing.name.trim() || !editing.price) { toast.error("Name and price are required"); return; }
    const payload = {
      name: editing.name,
      slug: editing.slug || slugify(editing.name),
      description: editing.description || null,
      price: Number(editing.price),
      category_id: editing.category_id || null,
      is_available: editing.is_available,
      is_featured: editing.is_featured,
      is_vegetarian: editing.is_vegetarian,
      is_vegan: editing.is_vegan,
      is_spicy: editing.is_spicy,
      is_gluten_free: editing.is_gluten_free,
      prep_time_minutes: Number(editing.prep_time_minutes) || 15,
      calories: editing.calories ? Number(editing.calories) : null,
      image_url: editing.image_url || null,
    };
    if (editing.id) {
      const { error } = await supabase.from("menu_items").update(payload).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Menu item updated");
    } else {
      const { error } = await supabase.from("menu_items").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Menu item created");
    }
    setDialogOpen(false);
    fetchData();
  };

  const toggleAvailable = async (item: any) => {
    const { error } = await supabase.from("menu_items").update({ is_available: !item.is_available }).eq("id", item.id);
    if (error) { toast.error(error.message); return; }
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_available: !i.is_available } : i)));
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Item deleted");
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const filtered = items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Menu Management</h1>
          <p className="mt-1 text-muted-foreground">Create, edit, and manage menu items.</p>
        </div>
        <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4" /> Add Item</Button>
      </div>

      <div className="relative mt-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search menu items..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 max-w-md" />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          [...Array(6)].map((_, i) => <Card key={i} className="h-48 animate-pulse" />)
        ) : filtered.length === 0 ? (
          <Card className="col-span-full p-12 text-center text-muted-foreground"><Utensils className="mx-auto mb-2 h-8 w-8 opacity-50" />No menu items found</Card>
        ) : (
          filtered.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.category?.name ?? "Uncategorized"}</p>
                    <p className="mt-1 font-display text-lg font-bold">₹{Number(item.price).toFixed(0)}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteItem(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {item.is_featured && <Badge className="bg-accent/10 text-accent">Featured</Badge>}
                  {item.is_vegetarian && <Badge variant="outline" className="text-green-600">Veg</Badge>}
                  {item.is_vegan && <Badge variant="outline" className="text-green-600">Vegan</Badge>}
                  {item.is_spicy && <Badge variant="outline" className="text-red-600">Spicy</Badge>}
                  {item.is_gluten_free && <Badge variant="outline">GF</Badge>}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{item.is_available ? "Available" : "Unavailable"}</span>
                  <Switch checked={item.is_available} onCheckedChange={() => toggleAvailable(item)} />
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing.id ? "Edit Menu Item" : "Add Menu Item"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value, slug: editing.slug || slugify(e.target.value) })} />
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="desc">Description</Label>
              <Textarea id="desc" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price (₹)</Label>
                <Input id="price" type="number" value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={editing.category_id} onValueChange={(v) => setEditing({ ...editing, category_id: v })}>
                  <SelectTrigger id="category"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="prep">Prep Time (min)</Label>
                <Input id="prep" type="number" value={editing.prep_time_minutes} onChange={(e) => setEditing({ ...editing, prep_time_minutes: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="cal">Calories</Label>
                <Input id="cal" type="number" value={editing.calories} onChange={(e) => setEditing({ ...editing, calories: e.target.value })} />
              </div>
            </div>
            <div>
              <Label htmlFor="img">Image URL</Label>
              <Input id="img" value={editing.image_url} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} placeholder="https://..." />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {([
                ["is_available", "Available"], ["is_featured", "Featured"], ["is_vegetarian", "Vegetarian"],
                ["is_vegan", "Vegan"], ["is_spicy", "Spicy"], ["is_gluten_free", "Gluten Free"],
              ] as const).map(([key, label]) => (
                <div key={key} className="flex items-center gap-2">
                  <Switch checked={editing[key]} onCheckedChange={(v) => setEditing({ ...editing, [key]: v })} />
                  <span className="text-sm">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing.id ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
