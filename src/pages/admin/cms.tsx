import * as React from "react";
import { motion } from "framer-motion";
import { FileText, Plus, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const emptyPage = { title: "", slug: "", content: "{}", is_published: true };

export default function AdminCMS() {
  const [pages, setPages] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [form, setForm] = React.useState<Record<string, any>>(emptyPage);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("cms_pages").select("*").order("updated_at", { ascending: false });
    if (error) { toast.error(error.message); setLoading(false); return; }
    setPages(data ?? []);
    setLoading(false);
  }, []);

  React.useEffect(() => { fetchData(); }, [fetchData]);

  const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  const save = async () => {
    if (!form.title?.trim()) { toast.error("Title is required"); return; }
    let content;
    try { content = JSON.parse(form.content || "{}"); } catch { toast.error("Content must be valid JSON"); return; }
    const payload = { title: form.title, slug: form.slug || slugify(form.title), content, is_published: form.is_published };
    if (form.id) {
      const { error } = await supabase.from("cms_pages").update(payload).eq("id", form.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Page updated");
    } else {
      const { error } = await supabase.from("cms_pages").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Page created");
    }
    setDialogOpen(false);
    fetchData();
  };

  const deletePage = async (id: string) => {
    const { error } = await supabase.from("cms_pages").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Page deleted");
    fetchData();
  };

  const togglePublished = async (page: any) => {
    const { error } = await supabase.from("cms_pages").update({ is_published: !page.is_published }).eq("id", page.id);
    if (error) { toast.error(error.message); return; }
    setPages((prev) => prev.map((p) => (p.id === page.id ? { ...p, is_published: !p.is_published } : p)));
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">CMS</h1>
          <p className="mt-1 text-muted-foreground">Manage site content and pages.</p>
        </div>
        <Button onClick={() => { setForm(emptyPage); setDialogOpen(true); }}><Plus className="mr-2 h-4 w-4" /> Add Page</Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          [...Array(3)].map((_, i) => <Card key={i} className="h-32 animate-pulse" />)
        ) : pages.length === 0 ? (
          <Card className="col-span-full p-12 text-center text-muted-foreground"><FileText className="mx-auto mb-2 h-8 w-8 opacity-50" />No CMS pages</Card>
        ) : (
          pages.map((page, i) => (
            <motion.div key={page.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium">{page.title}</h3>
                    <p className="text-sm text-muted-foreground">/{page.slug}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Updated {new Date(page.updated_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => { setForm({ ...page, content: JSON.stringify(page.content, null, 2) }); setDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => deletePage(page.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <Badge variant="outline">{page.is_published ? "Published" : "Draft"}</Badge>
                  <Switch checked={page.is_published} onCheckedChange={() => togglePublished(page)} />
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{form.id ? "Edit Page" : "Add Page"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="ptitle">Title</Label>
              <Input id="ptitle" value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug || slugify(e.target.value) })} />
            </div>
            <div>
              <Label htmlFor="pslug">Slug</Label>
              <Input id="pslug" value={form.slug ?? ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="about-us" />
            </div>
            <div>
              <Label htmlFor="pcontent">Content (JSON)</Label>
              <Textarea id="pcontent" value={form.content ?? ""} onChange={(e) => setForm({ ...form, content: e.target.value })} className="font-mono text-xs" rows={8} placeholder='{"sections": []}' />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} />
              <span className="text-sm">Published</span>
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
