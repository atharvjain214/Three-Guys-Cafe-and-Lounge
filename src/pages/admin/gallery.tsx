import * as React from "react";
import { motion } from "framer-motion";
import { Image as ImageIcon, Plus, Trash2, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const emptyForm = { title: "", description: "", image_url: "", category: "general", is_featured: false, is_published: true };

export default function AdminGallery() {
  const [items, setItems] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [form, setForm] = React.useState<Record<string, any>>(emptyForm);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("gallery").select("*").order("created_at", { ascending: false });
    if (error) { toast.error(error.message); setLoading(false); return; }
    setItems(data ?? []);
    setLoading(false);
  }, []);

  React.useEffect(() => { fetchData(); }, [fetchData]);

  const save = async () => {
    if (!form.title?.trim() || !form.image_url?.trim()) { toast.error("Title and image URL are required"); return; }
    const payload = {
      title: form.title,
      description: form.description || null,
      image_url: form.image_url,
      category: form.category || "general",
      is_featured: form.is_featured,
      is_published: form.is_published,
    };
    if (form.id) {
      const { error } = await supabase.from("gallery").update(payload).eq("id", form.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Gallery item updated");
    } else {
      const { error } = await supabase.from("gallery").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Gallery item created");
    }
    setDialogOpen(false);
    fetchData();
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase.from("gallery").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Item deleted");
    fetchData();
  };

  const togglePublished = async (item: any) => {
    const { error } = await supabase.from("gallery").update({ is_published: !item.is_published }).eq("id", item.id);
    if (error) { toast.error(error.message); return; }
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_published: !i.is_published } : i)));
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Gallery</h1>
          <p className="mt-1 text-muted-foreground">Manage restaurant photo gallery.</p>
        </div>
        <Button onClick={() => { setForm(emptyForm); setDialogOpen(true); }}><Plus className="mr-2 h-4 w-4" /> Add Image</Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          [...Array(8)].map((_, i) => <Card key={i} className="h-48 animate-pulse" />)
        ) : items.length === 0 ? (
          <Card className="col-span-full p-12 text-center text-muted-foreground"><ImageIcon className="mx-auto mb-2 h-8 w-8 opacity-50" />No gallery items</Card>
        ) : (
          items.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}>
              <Card className="group overflow-hidden">
                <div className="relative aspect-square overflow-hidden bg-muted">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center"><ImageIcon className="h-8 w-8 text-muted-foreground" /></div>
                  )}
                  {item.is_featured && <div className="absolute right-2 top-2"><Badge className="bg-accent/90 text-accent-foreground"><Star className="mr-1 h-3 w-3" /> Featured</Badge></div>}
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button variant="ghost" size="icon" className="bg-card/80" onClick={() => { setForm(item); setDialogOpen(true); }}><Plus className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="bg-card/80" onClick={() => deleteItem(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.category}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">{item.is_published ? "Published" : "Hidden"}</Badge>
                    <Switch checked={item.is_published} onCheckedChange={() => togglePublished(item)} />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{form.id ? "Edit Gallery Item" : "Add Gallery Item"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="gtitle">Title</Label>
              <Input id="gtitle" value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="gdesc">Description</Label>
              <Input id="gdesc" value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="gimg">Image URL</Label>
              <Input id="gimg" value={form.image_url ?? ""} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
            </div>
            <div>
              <Label htmlFor="gcat">Category</Label>
              <Input id="gcat" value={form.category ?? ""} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="interior, food, events" />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={form.is_featured} onCheckedChange={(v) => setForm({ ...form, is_featured: v })} />
                <span className="text-sm">Featured</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} />
                <span className="text-sm">Published</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save}>{form.id ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
