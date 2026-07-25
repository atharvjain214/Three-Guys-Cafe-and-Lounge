import * as React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/stores/auth-context";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function Settings() {
  const { user, signOut } = useAuth();
  const [prefs, setPrefs] = React.useState({ email_orders: true, email_reservations: true, email_promotions: false, push_orders: true, push_reservations: true, push_promotions: false });

  React.useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("notification_preferences").select("*").eq("user_id", user.id).maybeSingle();
      if (data) setPrefs(data as typeof prefs);
    })();
  }, [user]);

  const updatePref = async (key: string, value: boolean) => {
    setPrefs((p) => ({ ...p, [key]: value }));
    if (user) {
      await supabase.from("notification_preferences").upsert({ user_id: user.id, [key]: value });
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure? This action cannot be undone.")) return;
    toast.info("Please contact support to delete your account.");
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Settings</h1>
      <p className="mt-1 text-muted-foreground">Manage your preferences and account.</p>

      <Card className="mt-6 p-6">
        <h2 className="font-display text-lg font-semibold">Notification Preferences</h2>
        <div className="mt-4 space-y-4">
          {[
            { key: "email_orders", label: "Email - Order Updates" },
            { key: "email_reservations", label: "Email - Reservation Updates" },
            { key: "email_promotions", label: "Email - Promotions & Offers" },
            { key: "push_orders", label: "Push - Order Updates" },
            { key: "push_reservations", label: "Push - Reservation Updates" },
            { key: "push_promotions", label: "Push - Promotions & Offers" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <Label htmlFor={item.key}>{item.label}</Label>
              <Switch id={item.key} checked={prefs[item.key as keyof typeof prefs]} onCheckedChange={(v) => updatePref(item.key, v)} />
            </div>
          ))}
        </div>
      </Card>

      <Card className="mt-6 p-6">
        <h2 className="font-display text-lg font-semibold">Account</h2>
        <div className="mt-4 space-y-3">
          <Button variant="outline" onClick={() => signOut()}>Sign Out</Button>
          <br />
          <Button variant="destructive" onClick={handleDeleteAccount}>Delete Account</Button>
        </div>
      </Card>
    </div>
  );
}
