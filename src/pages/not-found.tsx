import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center pt-20">
      <div className="container mx-auto px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-[120px] font-bold leading-none text-gradient-gold md:text-[180px]">404</h1>
          <h2 className="mt-4 font-display text-2xl font-bold md:text-3xl">Page Not Found</h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            The page you're looking for doesn't exist or has been moved. Let's get you back on track.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild><Link to="/"><Home className="mr-2 h-4 w-4" /> Back Home</Link></Button>
            <Button variant="outline" asChild><Link to="/menu"><Search className="mr-2 h-4 w-4" /> Browse Menu</Link></Button>
            <Button variant="ghost" asChild><Link to="/contact"><ArrowLeft className="mr-2 h-4 w-4" /> Contact Us</Link></Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
