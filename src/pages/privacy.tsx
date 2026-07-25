import { Badge } from "@/components/ui/badge";

export default function Privacy() {
  return (
    <div className="pt-20">
      <section className="border-b bg-card/30 py-12">
        <div className="container mx-auto px-4 md:px-6">
          <Badge variant="outline" className="mb-4">Legal</Badge>
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">Privacy Policy</h1>
          <p className="mt-4 text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
        </div>
      </section>
      <section className="py-12">
        <div className="container mx-auto max-w-3xl px-4 md:px-6">
          <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold">1. Introduction</h2>
              <p className="mt-2 text-muted-foreground">Three Guys Cafe And Lounge ("we", "us", "our") respects your privacy and is committed to protecting your personal data. This policy explains how we collect, use, and safeguard your information.</p>
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold">2. Information We Collect</h2>
              <p className="mt-2 text-muted-foreground">We collect information you provide directly: name, email, phone number, delivery address, and order history. We also collect usage data such as device information, IP address, and browsing behavior on our website.</p>
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold">3. How We Use Your Information</h2>
              <p className="mt-2 text-muted-foreground">Your information is used to process orders, manage reservations, send notifications, improve our services, and send promotional communications (with your consent).</p>
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold">4. Data Security</h2>
              <p className="mt-2 text-muted-foreground">We implement industry-standard security measures including encryption, secure servers, and access controls to protect your data. All payment information is processed through PCI-compliant gateways.</p>
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold">5. Your Rights</h2>
              <p className="mt-2 text-muted-foreground">You have the right to access, correct, or delete your personal data. You can also opt out of marketing communications at any time. To exercise these rights, contact us at hello@threeguyscafe.in.</p>
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold">6. Contact</h2>
              <p className="mt-2 text-muted-foreground">For privacy-related questions, email us at hello@threeguyscafe.in or call +91 80 4567 8900.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
