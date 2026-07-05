import * as React from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X, ShoppingBag, Heart, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { useAuth } from "@/stores/auth-context";
import { ModeToggle } from "@/components/mode-toggle";
import { cn } from "@/lib/utils";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu" },
  { to: "/gallery", label: "Gallery" },
  { to: "/events", label: "Events" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const location = useLocation();
  const itemCount = useCartStore((s) => s.getItemCount());
  const setOpen = useCartStore((s) => s.setOpen);
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const { user } = useAuth();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "glass shadow-soft" : "bg-transparent"
      )}
    >
      <nav className="container mx-auto flex h-16 items-center justify-between px-4 md:h-20 md:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2" aria-label="Three Guys Cafe And Lounge home">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-gold text-primary-foreground shadow-glow">
            <span className="font-display text-lg font-bold">3</span>
          </div>
          <div className="hidden flex-col leading-none sm:flex">
            <span className="font-display text-base font-semibold tracking-tight">Three Guys</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Cafe & Lounge</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  "relative rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:text-accent",
                  isActive ? "text-accent" : "text-foreground/80"
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 md:gap-2">
          <Button variant="ghost" size="icon" asChild className="hidden md:inline-flex" aria-label="Search">
            <Link to="/search">
              <Search className="h-5 w-5" />
            </Link>
          </Button>

          <Button variant="ghost" size="icon" asChild className="hidden md:inline-flex relative" aria-label="Wishlist">
            <Link to="/account/wishlist">
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
                  {wishlistCount}
                </span>
              )}
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(true)}
            className="relative"
            aria-label="Cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {itemCount}
              </span>
            )}
          </Button>

          <ModeToggle />

          {user ? (
            <Button variant="ghost" size="icon" asChild aria-label="Account">
              <Link to="/account">
                <User className="h-5 w-5" />
              </Link>
            </Button>
          ) : (
            <Button variant="default" size="sm" asChild className="hidden md:inline-flex">
              <Link to="/auth/sign-in">Sign In</Link>
            </Button>
          )}

          <Button variant="default" size="sm" asChild className="hidden md:inline-flex">
            <Link to="/reservation">Reserve</Link>
          </Button>

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b pb-4">
                  <span className="font-display text-lg font-semibold">Menu</span>
                  <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} aria-label="Close">
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <nav className="flex flex-col gap-1 py-4">
                  {navLinks.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      className={({ isActive }) =>
                        cn(
                          "rounded-lg px-4 py-3 text-base font-medium transition-colors hover:bg-muted",
                          isActive ? "bg-muted text-accent" : "text-foreground"
                        )
                      }
                    >
                      {link.label}
                    </NavLink>
                  ))}
                  <NavLink to="/reservation" className="rounded-lg px-4 py-3 text-base font-medium transition-colors hover:bg-muted">
                    Reserve a Table
                  </NavLink>
                  <NavLink to="/search" className="rounded-lg px-4 py-3 text-base font-medium transition-colors hover:bg-muted">
                    Search
                  </NavLink>
                  {user ? (
                    <NavLink to="/account" className="rounded-lg px-4 py-3 text-base font-medium transition-colors hover:bg-muted">
                      My Account
                    </NavLink>
                  ) : (
                    <NavLink to="/auth/sign-in" className="rounded-lg px-4 py-3 text-base font-medium transition-colors hover:bg-muted">
                      Sign In
                    </NavLink>
                  )}
                </nav>
                <div className="mt-auto border-t pt-4">
                  <Button asChild className="w-full">
                    <Link to="/reservation">Book a Table</Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </motion.header>
  );
}
