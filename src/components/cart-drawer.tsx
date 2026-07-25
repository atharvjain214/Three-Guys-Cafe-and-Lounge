import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/stores/cart-store";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const TAX_RATE = 0.05;
const DELIVERY_FEE = 40;

export function CartDrawer() {
  const { items, isOpen, setOpen, removeItem, updateQuantity, getSubtotal, getTax, getDeliveryFee, getTotal, couponCode, couponDiscount, setCoupon } = useCartStore();
  const [couponInput, setCouponInput] = React.useState("");
  const [applying, setApplying] = React.useState(false);

  const subtotal = getSubtotal();
  const tax = getTax(TAX_RATE);
  const deliveryFee = getDeliveryFee(DELIVERY_FEE);
  const total = getTotal(TAX_RATE, DELIVERY_FEE);

  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    setApplying(true);
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", couponInput.trim().toUpperCase())
        .eq("is_active", true)
        .maybeSingle();

      if (error || !data) {
        toast.error("Invalid coupon code");
        setApplying(false);
        return;
      }

      if (data.min_order_amount && subtotal < data.min_order_amount) {
        toast.error(`Minimum order of ₹${data.min_order_amount} required`);
        setApplying(false);
        return;
      }

      let discount = 0;
      if (data.discount_type === "percentage") {
        discount = Math.round((subtotal * data.discount_value) / 100);
        if (data.max_discount_amount) discount = Math.min(discount, data.max_discount_amount);
      } else if (data.discount_type === "fixed_amount") {
        discount = data.discount_value;
      } else if (data.discount_type === "free_delivery") {
        discount = DELIVERY_FEE;
      }

      setCoupon(data.code, discount);
      toast.success(`Coupon applied: ${data.code}`);
    } catch {
      toast.error("Failed to apply coupon");
    }
    setApplying(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-lg">
        <SheetTitle className="sr-only">Shopping Cart</SheetTitle>
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-accent" />
            <h2 className="font-display text-lg font-semibold">Your Cart</h2>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">{items.length}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close cart">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-center text-muted-foreground">Your cart is empty</p>
            <Button asChild onClick={() => setOpen(false)}>
              <Link to="/menu">Browse Menu</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4">
              <AnimatePresence>
                {items.map((item) => {
                  const unitPrice = item.price + item.variant_price_adjustment + item.addons.reduce((s, a) => s + a.price * a.quantity, 0);
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 flex gap-3 rounded-xl border p-3"
                    >
                      {item.image_url && (
                        <img src={item.image_url} alt={item.name} className="h-16 w-16 rounded-lg object-cover" loading="lazy" />
                      )}
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-sm font-semibold">{item.name}</h4>
                            {item.variant_name && <p className="text-xs text-muted-foreground">{item.variant_name}</p>}
                            {item.addons.length > 0 && (
                              <p className="text-xs text-muted-foreground">
                                {item.addons.map((a) => a.name).join(", ")}
                              </p>
                            )}
                          </div>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeItem(item.id)} aria-label="Remove item">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label="Decrease quantity">
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="Increase quantity">
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <span className="text-sm font-semibold">₹{(unitPrice * item.quantity).toFixed(0)}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            <div className="border-t pt-4">
              {/* Coupon */}
              <div className="mb-4 flex gap-2">
                <Input
                  placeholder="Coupon code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" onClick={applyCoupon} disabled={applying}>
                  Apply
                </Button>
              </div>

              {couponCode && (
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-success">Coupon: {couponCode}</span>
                  <span className="text-success">-₹{couponDiscount.toFixed(0)}</span>
                </div>
              )}

              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{subtotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (5%)</span>
                  <span>₹{tax.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span>{deliveryFee === 0 ? "Free" : `₹${deliveryFee.toFixed(0)}`}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Discount</span>
                    <span>-₹{couponDiscount.toFixed(0)}</span>
                  </div>
                )}
              </div>
              <Separator className="my-3" />
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span>₹{total.toFixed(0)}</span>
              </div>
              <Button asChild className="mt-4 w-full" size="lg" onClick={() => setOpen(false)}>
                <Link to="/checkout">Checkout</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
