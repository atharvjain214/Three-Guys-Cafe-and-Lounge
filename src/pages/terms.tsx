import { Badge } from "@/components/ui/badge";

export default function Terms() {
  return (
    <div className="pt-20">
      <section className="border-b bg-card/30 py-12">
        <div className="container mx-auto px-4 md:px-6">
          <Badge variant="outline" className="mb-4">Legal</Badge>
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">Terms of Service</h1>
          <p className="mt-4 text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
        </div>
      </section>
      <section className="py-12">
        <div className="container mx-auto max-w-3xl px-4 md:px-6">
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold">1. Acceptance of Terms</h2>
              <p className="mt-2 text-muted-foreground">By accessing or using Three Guys Cafe And Lounge's website and services, you agree to be bound by these Terms of Service. If you do not agree, please discontinue use.</p>
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold">2. Orders & Payments</h2>
              <p className="mt-2 text-muted-foreground">All orders are subject to availability. Prices are in Indian Rupees (INR) and include applicable taxes. We reserve the right to refuse or cancel any order. Payment must be received before order processing.</p>
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold">3. Reservations</h2>
              <p className="mt-2 text-muted-foreground">Table reservations are subject to availability. We hold tables for 15 minutes past the reservation time. Groups of 8 or more may require a deposit.</p>
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold">4. Delivery</h2>
              <p className="mt-2 text-muted-foreground">Delivery is available within a 5km radius. Minimum order ₹150. Delivery fees apply. Estimated delivery times are approximate and may vary during peak hours.</p>
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold">5. Cancellations & Refunds</h2>
              <p className="mt-2 text-muted-foreground">Orders can be cancelled before preparation begins. Refunds are processed within 5-7 business days. Food items cannot be returned once delivered due to hygiene standards.</p>
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold">6. Loyalty Program</h2>
              <p className="mt-2 text-muted-foreground">Loyalty points have no cash value and are non-transferable. Points expire 12 months after earning. We reserve the right to modify or discontinue the program at any time.</p>
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold">7. Contact</h2>
              <p className="mt-2 text-muted-foreground">For questions about these terms, contact us at hello@threeguyscafe.in.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
