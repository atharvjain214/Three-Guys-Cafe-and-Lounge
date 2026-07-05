import * as React from "react";
import { Award, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/stores/auth-context";
import { supabase } from "@/lib/supabase";
import type { LoyaltyEntry } from "@/types";

const tiers = [
  { name: "Bronze", min: 0, max: 500, color: "from-amber-700 to-amber-900" },
  { name: "Silver", min: 500, max: 2000, color: "from-gray-400 to-gray-600" },
  { name: "Gold", min: 2000, max: 5000, color: "from-yellow-400 to-yellow-600" },
  { name: "Platinum", min: 5000, max: Infinity, color: "from-purple-400 to-purple-600" },
];

export default function Loyalty() {
  const { user } = useAuth();
  const [entries, setEntries] = React.useState<LoyaltyEntry[]>([]);
  const [totalPoints, setTotalPoints] = React.useState(0);

  React.useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("loyalty_ledger").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      const ledger = data as LoyaltyEntry[] ?? [];
      setEntries(ledger);
      setTotalPoints(ledger.reduce((sum, e) => sum + (e.type === "earned" ? e.points : -e.points), 0));
    })();
  }, [user]);

  const currentTier = tiers.find((t) => totalPoints >= t.min && totalPoints < t.max) ?? tiers[0];
  const nextTier = tiers[tiers.indexOf(currentTier) + 1];
  const progress = nextTier ? ((totalPoints - currentTier.min) / (currentTier.max - currentTier.min)) * 100 : 100;

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Loyalty Program</h1>
      <p className="mt-1 text-muted-foreground">Earn points with every order and unlock rewards.</p>

      <Card className="mt-6 overflow-hidden">
        <div className={`bg-gradient-to-r ${currentTier.color} p-6 text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Current Tier</p>
              <p className="font-display text-3xl font-bold">{currentTier.name}</p>
            </div>
            <Award className="h-12 w-12 opacity-80" />
          </div>
          <div className="mt-4">
            <p className="text-4xl font-bold">{totalPoints.toLocaleString()}</p>
            <p className="text-sm opacity-80">Total Points</p>
          </div>
        </div>
        {nextTier && (
          <div className="p-6">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress to {nextTier.name}</span>
              <span className="font-medium">{nextTier.min - totalPoints} points to go</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </Card>

      <div className="mt-8">
        <h2 className="mb-4 font-display text-xl font-semibold">Points History</h2>
        {entries.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">No points earned yet. Place an order to start earning!</Card>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => (
              <Card key={entry.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className={`h-5 w-5 ${entry.type === "earned" ? "text-success" : "text-destructive"}`} />
                  <div>
                    <p className="text-sm font-medium">{entry.description}</p>
                    <p className="text-xs text-muted-foreground">{new Date(entry.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`font-semibold ${entry.type === "earned" ? "text-success" : "text-destructive"}`}>
                  {entry.type === "earned" ? "+" : "-"}{entry.points}
                </span>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
