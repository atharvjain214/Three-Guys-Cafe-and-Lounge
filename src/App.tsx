import * as React from "react";
import { BrowserRouter, Routes, Route, useLocation, Outlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AuthProvider } from "@/stores/auth-context";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";
import { Toaster } from "@/components/ui/sonner";

const Home = React.lazy(() => import("@/pages/home"));
const Menu = React.lazy(() => import("@/pages/menu"));
const FoodDetail = React.lazy(() => import("@/pages/food-detail"));
const Gallery = React.lazy(() => import("@/pages/gallery"));
const Events = React.lazy(() => import("@/pages/events"));
const About = React.lazy(() => import("@/pages/about"));
const Contact = React.lazy(() => import("@/pages/contact"));
const Reservation = React.lazy(() => import("@/pages/reservation"));
const Faq = React.lazy(() => import("@/pages/faq"));
const Privacy = React.lazy(() => import("@/pages/privacy"));
const Terms = React.lazy(() => import("@/pages/terms"));
const NotFound = React.lazy(() => import("@/pages/not-found"));
const Search = React.lazy(() => import("@/pages/search"));
const SignIn = React.lazy(() => import("@/pages/auth/sign-in"));
const AccountLayout = React.lazy(() => import("@/pages/account/layout"));
const Dashboard = React.lazy(() => import("@/pages/account/dashboard"));
const Profile = React.lazy(() => import("@/pages/account/profile"));
const Orders = React.lazy(() => import("@/pages/account/orders"));
const Reservations = React.lazy(() => import("@/pages/account/reservations"));
const Wishlist = React.lazy(() => import("@/pages/account/wishlist"));
const Loyalty = React.lazy(() => import("@/pages/account/loyalty"));
const Settings = React.lazy(() => import("@/pages/account/settings"));
const Checkout = React.lazy(() => import("@/pages/checkout"));
const OrderTracking = React.lazy(() => import("@/pages/order-tracking"));
const AdminLayout = React.lazy(() => import("@/pages/admin/layout"));
const AdminDashboard = React.lazy(() => import("@/pages/admin/dashboard"));
const AdminOrders = React.lazy(() => import("@/pages/admin/orders"));
const AdminReservations = React.lazy(() => import("@/pages/admin/reservations"));
const AdminMenu = React.lazy(() => import("@/pages/admin/menu"));
const AdminInventory = React.lazy(() => import("@/pages/admin/inventory"));
const AdminCustomers = React.lazy(() => import("@/pages/admin/customers"));
const AdminCoupons = React.lazy(() => import("@/pages/admin/coupons"));
const AdminGallery = React.lazy(() => import("@/pages/admin/gallery"));
const AdminCMS = React.lazy(() => import("@/pages/admin/cms"));
const AdminSettings = React.lazy(() => import("@/pages/admin/settings"));

function PageWrapper() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <Outlet />
      </motion.main>
    </AnimatePresence>
  );
}

function PublicLayout() {
  return (
    <>
      <Navbar />
      <PageWrapper />
      <Footer />
      <CartDrawer />
    </>
  );
}

function LoadingFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-accent" />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <React.Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/menu/:slug" element={<FoodDetail />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/events" element={<Events />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/reservation" element={<Reservation />} />
              <Route path="/faq" element={<Faq />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/search" element={<Search />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-tracking/:orderNumber" element={<OrderTracking />} />
              <Route path="/auth/sign-in" element={<SignIn />} />
              <Route path="/account" element={<AccountLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="profile" element={<Profile />} />
                <Route path="orders" element={<Orders />} />
                <Route path="reservations" element={<Reservations />} />
                <Route path="wishlist" element={<Wishlist />} />
                <Route path="loyalty" element={<Loyalty />} />
                <Route path="settings" element={<Settings />} />
              </Route>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="reservations" element={<AdminReservations />} />
                <Route path="menu" element={<AdminMenu />} />
                <Route path="inventory" element={<AdminInventory />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="coupons" element={<AdminCoupons />} />
                <Route path="gallery" element={<AdminGallery />} />
                <Route path="cms" element={<AdminCMS />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </React.Suspense>
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
