import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/stores/auth-context";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const schema = z.object({
  full_name: z.string().min(2),
  phone: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const { register, handleSubmit, setValue } = useForm<FormData>({ resolver: zodResolver(schema) });

  React.useEffect(() => {
    if (user) {
      setValue("full_name", (user.user_metadata?.full_name as string) ?? "");
      setValue("phone", (user.user_metadata?.phone as string) ?? "");
    }
  }, [user, setValue]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ data: { full_name: data.full_name, phone: data.phone } });
    setLoading(false);
    if (error) toast.error("Failed to update profile");
    else toast.success("Profile updated");
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Profile</h1>
      <p className="mt-1 text-muted-foreground">Manage your personal information.</p>
      <Card className="mt-6 max-w-lg p-6">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-warm text-2xl font-semibold text-primary-foreground">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium">{user?.email}</p>
            <p className="text-sm text-muted-foreground">Member since {new Date(user?.created_at ?? "").toLocaleDateString()}</p>
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="full_name">Full Name</Label>
            <Input id="full_name" className="mt-1.5" {...register("full_name")} />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" className="mt-1.5" {...register("phone")} />
          </div>
          <div>
            <Label>Email</Label>
            <Input className="mt-1.5" value={user?.email ?? ""} disabled />
          </div>
          <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
        </form>
      </Card>
    </div>
  );
}
