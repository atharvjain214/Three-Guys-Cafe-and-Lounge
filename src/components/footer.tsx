import { Link } from "react-router-dom";
import { Share2, MapPin, Phone, Clock } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const footerLinks = {
  Explore: [
    { to: "/menu", label: "Menu" },
    { to: "/gallery", label: "Gallery" },
    { to: "/events", label: "Events" },
    { to: "/about", label: "About Us" },
  ],
  Visit: [
    { to: "/reservation", label: "Reserve a Table" },
    { to: "/contact", label: "Contact" },
    { to: "/faq", label: "FAQ" },
    { to: "/search", label: "Search" },
  ],
  Legal: [
    { to: "/privacy", label: "Privacy Policy" },
    { to: "/terms", label: "Terms of Service" },
  ],
};

export function Footer() {
  return (
    <footer className="relative mt-20 border-t bg-card/50">
      <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-gold text-primary-foreground">
                <span className="font-display text-xl font-bold">3</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display text-lg font-semibold">Three Guys</span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Cafe & Lounge</span>
              </div>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Premium coffee, soulful food, and unforgettable moments. Crafted with passion in the heart of Bengaluru.
            </p>
            <div className="mt-6 flex gap-3">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex h-10 w-10 items-center justify-center rounded-full border transition-colors hover:border-accent hover:text-accent">
                <Share2 className="h-4 w-4" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex h-10 w-10 items-center justify-center rounded-full border transition-colors hover:border-accent hover:text-accent">
                <Share2 className="h-4 w-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="flex h-10 w-10 items-center justify-center rounded-full border transition-colors hover:border-accent hover:text-accent">
                <Share2 className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-sm text-muted-foreground transition-colors hover:text-accent">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-10" />

        {/* Contact info */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
            <div>
              <p className="text-sm font-medium">Visit Us</p>
              <p className="text-sm text-muted-foreground">42 Brigade Road, Bengaluru, Karnataka 560025</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
            <div>
              <p className="text-sm font-medium">Open Daily</p>
              <p className="text-sm text-muted-foreground">8:00 AM — 11:00 PM</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
            <div>
              <p className="text-sm font-medium">Call Us</p>
              <p className="text-sm text-muted-foreground">+91 80 4567 8900</p>
            </div>
          </div>
        </div>

        <Separator className="my-10" />

        {/* Newsletter */}
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div>
            <h3 className="font-display text-lg font-semibold">Stay in the loop</h3>
            <p className="text-sm text-muted-foreground">Get updates on events, offers, and new menu items.</p>
          </div>
          <form className="flex w-full max-w-md gap-2" onSubmit={(e) => e.preventDefault()}>
            <Input type="email" placeholder="Enter your email" aria-label="Email for newsletter" />
            <Button type="submit">Subscribe</Button>
          </form>
        </div>

        <Separator className="my-10" />

        <div className="flex flex-col items-center justify-between gap-2 text-sm text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} Three Guys Cafe And Lounge. All rights reserved.</p>
          <p>Crafted with passion in Bengaluru.</p>
        </div>
      </div>
    </footer>
  );
}
