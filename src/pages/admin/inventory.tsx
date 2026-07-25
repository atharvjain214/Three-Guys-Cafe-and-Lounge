import * as React from "react";
import { motion } from "framer-motion";
import { Package, Plus, Pencil, Trash2, Search, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function AdminInventory() {
  const [ingredients, setIngredients] = React.useState<any[]>([]);
  const [suppliers, setSuppliers] = React.useState<any[]>([]);
  const [inventory, setInventory] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogType, setDialogType] = React.useState<"ingredient" | "supplier">("ingredient");
  const [form, setForm] = React.useState<Record<string, any>>({});

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    const [ingRes, supRes, invRes] = await Promise.all([
      supabase.from("ingredients").select("id, name, unit, cost_per_unit, supplier_id, supplier:suppliers(name), is_active").order("name"),
      supabase.from("suppliers").select("id, name, contact_person, email, phone, is_active").order("name"),
      supabase.from("inventory").select("id, quantity_on_hand, reorder_level, ingredient:ingredients(name, unit), branch:branches(name)").order("updated_at", { ascending: false }),
    ]);
    setIngredients(ingRes.data ?? []);
    setSuppliers(supRes.data ?? []);
    setInventory(invRes.data ?? []);
    setLoading(false);
  }, []);

  React.useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = (type: "ingredient" | "supplier") => {
    setDialogType(type);
    setForm(type === "ingredient" ? { name: "", unit: "kg", cost_per_unit: "0", is_active: true } : { name: "", contact_person: "", email: "", phone: "", is_active: true });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.name?.trim()) { toast.error("Name is required"); return; }
    const table = dialogType === "ingredient" ? "ingredients" : "suppliers";
    const payload: Record<string, any> = dialogType === "ingredient"
      ? { name: form.name, unit: form.unit, cost_per_unit: Number(form.cost_per_unit) || 0, is_active: form.is_active }
      : { name: form.name, contact_person: form.contact_person || null, email: form.email || null, phone: form.phone || null, is_active: form.is_active };

    if (form.id) {
      const { error } = await supabase.from(table).update(payload).eq("id", form.id);
      if (error) { toast.error(error.message); return; }
      toast.success(`${dialogType} updated`);
    } else {
      const { error } = await supabase.from(table).insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success(`${dialogType} created`);
    }
    setDialogOpen(false);
    fetchData();
  };

  const deleteItem = async (id: string, type: "ingredient" | "supplier") => {
    const table = type === "ingredient" ? "ingredients" : "suppliers";
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(`${type} deleted`);
    fetchData();
  };

  const filteredIngredients = ingredients.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));
  const filteredSuppliers = suppliers.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Inventory</h1>
      <p className="mt-1 text-muted-foreground">Manage ingredients, suppliers, and stock levels.</p>

      <Tabs defaultValue="ingredients" className="mt-6">
        <TabsList>
          <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="stock">Stock Levels</TabsTrigger>
        </TabsList>

        <TabsContent value="ingredients" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search ingredients..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Button onClick={() => openAdd("ingredient")}><Plus className="mr-2 h-4 w-4" /> Add Ingredient</Button>
          </div>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Unit</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Cost/Unit</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Supplier</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
                  ) : filteredIngredients.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground"><Package className="mx-auto mb-2 h-8 w-8 opacity-50" />No ingredients found</td></tr>
                  ) : (
                    filteredIngredients.map((ing, i) => (
                      <motion.tr key={ing.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="px-4 py-3 text-sm font-medium">{ing.name}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{ing.unit}</td>
                        <td className="px-4 py-3 text-sm">₹{Number(ing.cost_per_unit).toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{ing.supplier?.name ?? "—"}</td>
                        <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs ${ing.is_active ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}>{ing.is_active ? "Active" : "Inactive"}</span></td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => { setDialogType("ingredient"); setForm(ing); setDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteItem(ing.id, "ingredient")}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => openAdd("supplier")}><Plus className="mr-2 h-4 w-4" /> Add Supplier</Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              [...Array(3)].map((_, i) => <Card key={i} className="h-32 animate-pulse" />)
            ) : filteredSuppliers.length === 0 ? (
              <Card className="col-span-full p-12 text-center text-muted-foreground">No suppliers found</Card>
            ) : (
              filteredSuppliers.map((sup, i) => (
                <motion.div key={sup.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <Card className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{sup.name}</h3>
                        {sup.contact_person && <p className="text-sm text-muted-foreground">{sup.contact_person}</p>}
                        {sup.email && <p className="text-sm text-muted-foreground">{sup.email}</p>}
                        {sup.phone && <p className="text-sm text-muted-foreground">{sup.phone}</p>}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setDialogType("supplier"); setForm(sup); setDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteItem(sup.id, "supplier")}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </div>
                    <span className={`mt-2 inline-block rounded-full px-2 py-1 text-xs ${sup.is_active ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}>{sup.is_active ? "Active" : "Inactive"}</span>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="stock" className="space-y-4">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">Ingredient</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">On Hand</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Reorder Level</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
                  ) : inventory.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No inventory records</td></tr>
                  ) : (
                    inventory.map((inv, i) => {
                      const low = Number(inv.quantity_on_hand) <= Number(inv.reorder_level);
                      return (
                        <motion.tr key={inv.id ?? i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="px-4 py-3 text-sm font-medium">{inv.ingredient?.name ?? "—"}</td>
                          <td className="px-4 py-3 text-sm">{inv.quantity_on_hand} {inv.ingredient?.unit}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{inv.reorder_level}</td>
                          <td className="px-4 py-3">
                            {low ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-1 text-xs text-red-600"><AlertTriangle className="h-3 w-3" /> Low Stock</span>
                            ) : (
                              <span className="rounded-full bg-green-500/10 px-2 py-1 text-xs text-green-600">In Stock</span>
                            )}
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{form.id ? `Edit ${dialogType}` : `Add ${dialogType}`}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            {dialogType === "ingredient" ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Input id="unit" value={form.unit ?? ""} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="kg, g, L, pcs" />
                </div>
                <div>
                  <Label htmlFor="cost">Cost per Unit (₹)</Label>
                  <Input id="cost" type="number" value={form.cost_per_unit ?? ""} onChange={(e) => setForm({ ...form, cost_per_unit: e.target.value })} />
                </div>
              </div>
            ) : (
              <>
                <div>
                  <Label htmlFor="contact">Contact Person</Label>
                  <Input id="contact" value={form.contact_person ?? ""} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
              </>
            )}
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
