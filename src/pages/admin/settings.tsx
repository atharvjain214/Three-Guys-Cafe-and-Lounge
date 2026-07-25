import * as React from "react";
import { Settings, Save, Store } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function AdminSettings() {
  const [settings, setSettings] = React.useState<Record<string, any>>({});
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("system_settings").select("key, value");
      if (error) { toast.error(error.message); setLoading(false); return; }
      const map: Record<string, any> = {};
      (data ?? []).forEach((s: any) => { map[s.key] = s.value; });
      setSettings(map);
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    const entries = Object.entries(settings);
    for (const [key, value] of entries) {
      const { error } = await supabase.from("system_settings").upsert({ key, value }, { onConflict: "key" });
      if (error) { toast.error(error.message); setSaving(false); return; }
    }
    toast.success("Settings saved");
    setSaving(false);
  };

  const update = (key: string, field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: { ...(typeof prev[key] === "object" && prev[key] !== null ? prev[key] : {}), [field]: value },
    }));
  };

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-accent" /></div>;

  const restaurant = settings.restaurant ?? {};
  const tax = settings.tax ?? {};
  const delivery = settings.delivery ?? {};

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Settings</h1>
          <p className="mt-1 text-muted-foreground">Configure restaurant and business settings.</p>
        </div>
        <Button onClick={save} disabled={saving}><Save className="mr-2 h-4 w-4" /> {saving ? "Saving..." : "Save Changes"}</Button>
      </div>

      <Tabs defaultValue="restaurant" className="mt-6">
        <TabsList>
          <TabsTrigger value="restaurant"><Store className="mr-2 h-4 w-4" /> Restaurant</TabsTrigger>
          <TabsTrigger value="tax"><Settings className="mr-2 h-4 w-4" /> Tax & Fees</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
        </TabsList>

        <TabsContent value="restaurant">
          <Card className="p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="rname">Restaurant Name</Label>
                <Input id="rname" value={restaurant.name ?? ""} onChange={(e) => update("restaurant", "name", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="rphone">Phone</Label>
                <Input id="rphone" value={restaurant.phone ?? ""} onChange={(e) => update("restaurant", "phone", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="remail">Email</Label>
                <Input id="remail" type="email" value={restaurant.email ?? ""} onChange={(e) => update("restaurant", "email", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="rcurrency">Currency</Label>
                <Input id="rcurrency" value={restaurant.currency ?? "INR"} onChange={(e) => update("restaurant", "currency", e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="raddr">Address</Label>
                <Textarea id="raddr" value={restaurant.address ?? ""} onChange={(e) => update("restaurant", "address", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="rhours">Opening Hours</Label>
                <Input id="rhours" value={restaurant.opening_hours ?? "08:00 - 23:00"} onChange={(e) => update("restaurant", "opening_hours", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="rmin">Min Order (₹)</Label>
                <Input id="rmin" type="number" value={restaurant.min_order ?? "0"} onChange={(e) => update("restaurant", "min_order", Number(e.target.value))} />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="tax">
          <Card className="p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="taxrate">Tax Rate (%)</Label>
                <Input id="taxrate" type="number" step="0.01" value={tax.rate ?? "5"} onChange={(e) => update("tax", "rate", Number(e.target.value))} />
              </div>
              <div>
                <Label htmlFor="taxname">Tax Name</Label>
                <Input id="taxname" value={tax.name ?? "GST"} onChange={(e) => update("tax", "name", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="sfee">Service Charge (%)</Label>
                <Input id="sfee" type="number" step="0.01" value={tax.service_charge ?? "0"} onChange={(e) => update("tax", "service_charge", Number(e.target.value))} />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="delivery">
          <Card className="p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="dfee">Delivery Fee (₹)</Label>
                <Input id="dfee" type="number" value={delivery.fee ?? "40"} onChange={(e) => update("delivery", "fee", Number(e.target.value))} />
              </div>
              <div>
                <Label htmlFor="dfree">Free Delivery Above (₹)</Label>
                <Input id="dfree" type="number" value={delivery.free_above ?? "500"} onChange={(e) => update("delivery", "free_above", Number(e.target.value))} />
              </div>
              <div>
                <Label htmlFor="dmin">Min Delivery Order (₹)</Label>
                <Input id="dmin" type="number" value={delivery.min_order ?? "200"} onChange={(e) => update("delivery", "min_order", Number(e.target.value))} />
              </div>
              <div>
                <Label htmlFor="dradius">Delivery Radius (km)</Label>
                <Input id="dradius" type="number" value={delivery.radius ?? "10"} onChange={(e) => update("delivery", "radius", Number(e.target.value))} />
              </div>
              <div>
                <Label htmlFor="dtime">Estimated Delivery Time (min)</Label>
                <Input id="dtime" type="number" value={delivery.estimated_time ?? "45"} onChange={(e) => update("delivery", "estimated_time", Number(e.target.value))} />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
