import * as React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const faqs = [
  { category: "Reservations", q: "How do I make a reservation?", a: "You can reserve a table through our online reservation page, by calling us at +91 80 4567 8900, or by visiting us in person. We recommend booking in advance for weekends and special events." },
  { category: "Reservations", q: "Can I modify or cancel my reservation?", a: "Yes, you can modify or cancel your reservation up to 2 hours before your scheduled time. Simply log into your account or call us." },
  { category: "Reservations", q: "Do you accept walk-ins?", a: "We do accept walk-ins, but tables are subject to availability. We recommend reservations for parties of 4 or more, especially during peak hours." },
  { category: "Orders", q: "Do you offer delivery?", a: "Yes, we offer delivery within a 5km radius of our cafe. The minimum order for delivery is ₹150, and a delivery fee of ₹40 applies. You can also use the code FREEDEL for free delivery on select orders." },
  { category: "Orders", q: "Can I order for pickup?", a: "Absolutely! Place your order online and select pickup. We'll have it ready for you at the specified time. Most orders are ready within 15-20 minutes." },
  { category: "Orders", q: "How can I track my order?", a: "Once your order is confirmed, you'll receive a tracking link via email and SMS. You can also track your order in real-time from your account dashboard." },
  { category: "Payments", q: "What payment methods do you accept?", a: "We accept UPI, all major credit and debit cards, net banking, popular digital wallets, and cash for in-store purchases." },
  { category: "Payments", q: "Do you offer any discounts?", a: "Yes! We regularly run promotions and offer coupon codes. Check our promotions page or sign up for our newsletter to stay updated. New customers get 10% off with code WELCOME10." },
  { category: "Loyalty", q: "How does the loyalty program work?", a: "You earn 1 point for every rupee spent. Points can be redeemed for discounts on future orders. The more you dine with us, the more you earn!" },
  { category: "Events", q: "Can I book the venue for a private event?", a: "Yes, we have a private dining area that can accommodate up to 12 guests. Contact us at events@threeguyscafe.in for bookings and custom menus." },
  { category: "General", q: "Are you open on holidays?", a: "We are open 365 days a year! Holiday hours may vary, so please check our website or call ahead for specific holiday timings." },
  { category: "General", q: "Is parking available?", a: "Yes, we have valet parking available during peak hours, and there is a public parking lot adjacent to our building." },
];

export default function Faq() {
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState("all");

  const categories = ["all", ...Array.from(new Set(faqs.map((f) => f.category)))];
  const filtered = faqs.filter((f) => {
    const matchCat = category === "all" || f.category === category;
    const matchSearch = !search || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="pt-20">
      <section className="border-b bg-card/30 py-12">
        <div className="container mx-auto px-4 md:px-6">
          <Badge variant="outline" className="mb-4">FAQ</Badge>
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">Frequently Asked Questions</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">Find answers to common questions about reservations, orders, payments, and more.</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-3xl">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search questions..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>

            <div className="mb-6 flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${category === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
                >
                  {cat === "all" ? "All" : cat}
                </button>
              ))}
            </div>

            <Accordion type="single" collapsible className="space-y-3">
              {filtered.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="rounded-xl border px-4">
                  <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {filtered.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">No questions match your search.</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
