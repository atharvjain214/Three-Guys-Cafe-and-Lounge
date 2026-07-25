import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, CreditCard, Wallet, Banknote, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/stores/cart-store";
import { useAuth } from "@/stores/auth-context";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const TAX_RATE = 0.05;
const DELIVERY_FEE = 40;

const paymentMethods = [
  { id: "upi", label: "UPI", icon: Smartphone },
  { id: "card", label: "Credit / Debit Card", icon: CreditCard },
  { id: "netbanking", label: "Net Banking", icon: Banknote },
  { id: "wallet", label: "Wallet", icon: Wallet },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, getSubtotal, getTax, getDeliveryFee, getTotal, couponDiscount, clearCart } = useCartStore();
  const [orderType, setOrderType] = React.useState<"pickup" | "delivery">("pickup");
  const [paymentMethod, setPaymentMethod] = React.useState("upi");
  const [contactPhone, setContactPhone] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [placing, setPlacing] = React.useState(false);

  const subtotal = getSubtotal();
  const tax = getTax(TAX_RATE);
  const deliveryFee = orderType === "delivery" ? getDeliveryFee(DELIVERY_FEE) : 0;
  const total = orderType === "delivery" ? getTotal(TAX_RATE, DELIVERY_FEE) : subtotal + tax - couponDiscount;

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center pt-20 text-center">
        <h1 className="font-display text-3xl font-bold">Your cart is empty</h1>
        <Button asChild className="mt-4"><Link to="/menu">Browse Menu</Link></Button>
      </div>
    );
  }

  const placeOrder = async () => {
    if (!user) { toast.info("Please sign in to place an order"); navigate("/auth/sign-in"); return; }
    if (orderType === "delivery" && !address.trim()) { toast.error("Please enter delivery address"); return; }
    if (!contactPhone.trim()) { toast.error("Please enter contact phone"); return; }

    setPlacing(true);
    try {
      const { data, error } = await api.createOrder({
        order_type: orderType,
        subtotal,
        tax_amount: tax,
        discount_amount: couponDiscount,
        delivery_fee: deliveryFee,
        total,
        contact_phone: contactPhone,
        contact_email: user.email ?? undefined,
        payment_method: paymentMethod,
        delivery_address: orderType === "delivery" ? { address } : null,
        items: items.map((item) => ({
          menu_item_id: item.menu_item_id,
          name: item.name,
          image_url: item.image_url,
          price: item.price,
          quantity: item.quantity,
          variant_name: item.variant_name,
          variant_price_adjustment: item.variant_price_adjustment,
          addons: item.addons,
          notes: item.notes,
        })),
      });

      if (error) throw new Error(error);
      if (!data) throw new Error("No order data returned");

      clearCart();
      toast.success("Order placed successfully!");
      navigate(`/order-tracking/${data.order_number}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to place order. Please try again.");
    }
    setPlacing(false);
  };

  return (
    <div className="pt-20">
      <div className="container mx-auto px-4 py-8 md:px-6">
        <h1 className="font-display text-3xl font-bold">Checkout</h1>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Left: Form */}
          <div className="space-y-6">
            {/* Order Type */}
            <Card className="p-6">
              <h2 className="mb-4 font-semibold">Order Type</h2>
              <div className="grid grid-cols-2 gap-3">
                {(["pickup", "delivery"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setOrderType(type)}
                    className={cn("rounded-xl border p-4 text-left transition-all", orderType === type ? "border-accent bg-accent/10" : "hover:border-accent/50")}
                  >
                    <span className="font-medium capitalize">{type}</span>
                    <p className="text-sm text-muted-foreground">{type === "pickup" ? "Ready in 15-20 min" : "30-45 min delivery"}</p>
                  </button>
                ))}
              </div>
            </Card>

            {/* Contact */}
            <Card className="p-6">
              <h2 className="mb-4 font-semibold">Contact Details</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" className="mt-1.5" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+91 98765 43210" />
                </div>
                {orderType === "delivery" && (
                  <div>
                    <Label htmlFor="address">Delivery Address</Label>
                    <textarea id="address" className="mt-1.5 w-full rounded-xl border bg-background px-4 py-2.5 text-sm" rows={3} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full delivery address" />
                  </div>
                )}
              </div>
            </Card>

            {/* Payment */}
            <Card className="p-6">
              <h2 className="mb-4 font-semibold">Payment Method</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={cn("flex items-center gap-3 rounded-xl border p-4 transition-all", paymentMethod === method.id ? "border-accent bg-accent/10" : "hover:border-accent/50")}
                  >
                    <method.icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{method.label}</span>
                    {paymentMethod === method.id && <Check className="ml-auto h-4 w-4 text-accent" />}
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Right: Summary */}
          <div>
            <Card className="sticky top-24 p-6">
              <h2 className="mb-4 font-semibold">Order Summary</h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.quantity}x {item.name}</span>
                    <span>₹{((item.price + item.variant_price_adjustment) * item.quantity).toFixed(0)}</span>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{subtotal.toFixed(0)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tax (5%)</span><span>₹{tax.toFixed(0)}</span></div>
                {orderType === "delivery" && <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>{deliveryFee === 0 ? "Free" : `₹${deliveryFee.toFixed(0)}`}</span></div>}
                {couponDiscount > 0 && <div className="flex justify-between text-success"><span>Discount</span><span>-₹{couponDiscount.toFixed(0)}</span></div>}
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between text-lg font-bold"><span>Total</span><span>₹{total.toFixed(0)}</span></div>
              <Button className="mt-6 w-full" size="lg" onClick={placeOrder} disabled={placing}>
                {placing ? "Placing Order..." : `Place Order — ₹${total.toFixed(0)}`}
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
