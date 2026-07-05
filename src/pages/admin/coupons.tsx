import * as React from "react";
import { motion } from "framer-motion";
import { TicketPercent, Plus, Pencil, Trash2, Tag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const emptyCoupon = { code: "", description: "", discount_type: "percentage", discount_value: "", min_order_amount: "0", is_active: true, usage_limit: "", valid_until: "" };
const emptyPromo = { title: "", description: "", badge: "", is_active: true, is_featured: false, starts_at: "", ends_at: "" };

export default function AdminCoupons() {
  const [coupons, setCoupons] = React.useState<any[]>([]);
  const [promotions, setPromotions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [couponDialog, setCouponDialog] = React.useState(false);
  const [promoDialog, setPromoDialog] = React.useState(false);
  const [couponForm, setCouponForm] = React.useState<Record<string, any>>(emptyCoupon);
  const [promoForm, setPromoForm] = React.useState<Record<string, any>>(emptyPromo);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    const [cRes, pRes] = await Promise.all([
      supabase.from("coupons").select("*").order("created_at", { ascending: false }),
      supabase.from("promotions").select("*").order("created_at", { ascending: false }),
    ]);
    setCoupons(cRes.data ?? []);
    setPromotions(pRes.data ?? []);
    setLoading(false);
  }, []);

  React.useEffect(() => { fetchData(); }, [fetchData]);

  const saveCoupon = async () => {
    if (!couponForm.code?.trim()) { toast.error("Coupon code is required"); return; }
    const payload = {
      code: couponForm.code.toUpperCase(),
      description: couponForm.description || null,
      discount_type: couponForm.discount_type,
      discount_value: Number(couponForm.discount_value) || 0,
      min_order_amount: Number(couponForm.min_order_amount) || 0,
      is_active: couponForm.is_active,
      usage_limit: couponForm.usage_limit ? Number(couponForm.usage_limit) : null,
      valid_until: couponForm.valid_until || null,
    };
    if (couponForm.id) {
      const { error } = await supabase.from("coupons").update(payload).eq("id", couponForm.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Coupon updated");
    } else {
      const { error } = await supabase.from("coupons").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Coupon created");
    }
    setCouponDialog(false);
    fetchData();
  };

  const savePromo = async () => {
    if (!promoForm.title?.trim()) { toast.error("Title is required"); return; }
    const payload = {
      title: promoForm.title,
      description: promoForm.description || null,
      badge: promoForm.badge || null,
      is_active: promoForm.is_active,
      is_featured: promoForm.is_featured,
      starts_at: promoForm.starts_at ? new Date(promoForm.starts_at).toISOString() : new Date().toISOString(),
      ends_at: promoForm.ends_at ? new Date(promoForm.ends_at).toISOString() : null,
    };
    if (promoForm.id) {
      const { error } = await supabase.from("promotions").update(payload).eq("id", promoForm.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Promotion updated");
    } else {
      const { error } = await supabase.from("promotions").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Promotion created");
    }
    setPromoDialog(false);
    fetchData();
  };

  const deleteCoupon = async (id: string) => {
    const { error } = await supabase.from("coupons").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Coupon deleted");
    fetchData();
  };

  const deletePromo = async (id: string) => {
    const { error } = await supabase.from("promotions").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Promotion deleted");
    fetchData();
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Coupons & Promotions</h1>
      <p className="mt-1 text-muted-foreground">Manage discount coupons and promotional banners.</p>

      <Tabs defaultValue="coupons" className="mt-6">
        <TabsList>
          <TabsTrigger value="coupons"><TicketPercent className="mr-2 h-4 w-4" /> Coupons</TabsTrigger>
          <TabsTrigger value="promotions"><Tag className="mr-2 h-4 w-4" /> Promotions</TabsTrigger>
        </TabsList>

        <TabsContent value="coupons" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { setCouponForm(emptyCoupon); setCouponDialog(true); }}><Plus className="mr-2 h-4 w-4" /> Add Coupon</Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              [...Array(3)].map((_, i) => <Card key={i} className="h-32 animate-pulse" />)
            ) : coupons.length === 0 ? (
              <Card className="col-span-full p-12 text-center text-muted-foreground">No coupons yet</Card>
            ) : (
              coupons.map((c, i) => (
                <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <Card className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-display text-lg font-bold tracking-wider">{c.code}</h3>
                        <p className="text-sm text-muted-foreground">{c.description ?? "No description"}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setCouponForm(c); setCouponDialog(true); }}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteCoupon(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant="outline" className="capitalize">{c.discount_type.replace(/_/g, " ")}</Badge>
                      <Badge variant="outline">{c.discount_type === "percentage" ? `${c.discount_value}%` : `₹${c.discount_value}`}</Badge>
                      {c.is_active ? <Badge className="bg-green-500/10 text-green-600">Active</Badge> : <Badge className="bg-red-500/10 text-red-600">Inactive</Badge>}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">Used {c.usage_count} times{c.usage_limit ? ` / ${c.usage_limit}` : ""}</p>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="promotions" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { setPromoForm(emptyPromo); setPromoDialog(true); }}><Plus className="mr-2 h-4 w-4" /> Add Promotion</Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              [...Array(3)].map((_, i) => <Card key={i} className="h-32 animate-pulse" />)
            ) : promotions.length === 0 ? (
              <Card className="col-span-full p-12 text-center text-muted-foreground">No promotions yet</Card>
            ) : (
              promotions.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <Card className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium">{p.title}</h3>
                        <p className="text-sm text-muted-foreground">{p.description ?? "No description"}</p>
                        {p.badge && <Badge className="mt-2 bg-accent/10 text-accent">{p.badge}</Badge>}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setPromoForm(p); setPromoDialog(true); }}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => deletePromo(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      {p.is_active ? <Badge className="bg-green-500/10 text-green-600">Active</Badge> : <Badge className="bg-red-500/10 text-red-600">Inactive</Badge>}
                      {p.is_featured && <Badge className="bg-accent/10 text-accent">Featured</Badge>}
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={couponDialog} onOpenChange={setCouponDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{couponForm.id ? "Edit Coupon" : "Add Coupon"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="code">Code</Label>
              <Input id="code" value={couponForm.code ?? ""} onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} placeholder="SAVE20" />
            </div>
            <div>
              <Label htmlFor="desc">Description</Label>
              <Input id="desc" value={couponForm.description ?? ""} onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Discount Type</Label>
                <Select value={couponForm.discount_type} onValueChange={(v) => setCouponForm({ ...couponForm, discount_type: v })}>
                  <SelectTrigger id="type"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                    <SelectItem value="free_delivery">Free Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="value">Discount Value</Label>
                <Input id="value" type="number" value={couponForm.discount_value ?? ""} onChange={(e) => setCouponForm({ ...couponForm, discount_value: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="min">Min Order (₹)</Label>
                <Input id="min" type="number" value={couponForm.min_order_amount ?? ""} onChange={(e) => setCouponForm({ ...couponForm, min_order_amount: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="limit">Usage Limit</Label>
                <Input id="limit" type="number" value={couponForm.usage_limit ?? ""} onChange={(e) => setCouponForm({ ...couponForm, usage_limit: e.target.value })} placeholder="Unlimited" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={couponForm.is_active} onCheckedChange={(v) => setCouponForm({ ...couponForm, is_active: v })} />
              <span className="text-sm">Active</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCouponDialog(false)}>Cancel</Button>
            <Button onClick={saveCoupon}>{couponForm.id ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={promoDialog} onOpenChange={setPromoDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{promoForm.id ? "Edit Promotion" : "Add Promotion"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="ptitle">Title</Label>
              <Input id="ptitle" value={promoForm.title ?? ""} onChange={(e) => setPromoForm({ ...promoForm, title: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="pdesc">Description</Label>
              <Input id="pdesc" value={promoForm.description ?? ""} onChange={(e) => setPromoForm({ ...promoForm, description: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="badge">Badge Text</Label>
              <Input id="badge" value={promoForm.badge ?? ""} onChange={(e) => setPromoForm({ ...promoForm, badge: e.target.value })} placeholder="Limited Time" />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={promoForm.is_active} onCheckedChange={(v) => setPromoForm({ ...promoForm, is_active: v })} />
                <span className="text-sm">Active</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={promoForm.is_featured} onCheckedChange={(v) => setPromoForm({ ...promoForm, is_featured: v })} />
                <span className="text-sm">Featured</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPromoDialog(false)}>Cancel</Button>
            <Button onClick={savePromo}>{promoForm.id ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
