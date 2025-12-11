import { Link } from "react-router-dom";
import { ShoppingBag, Crown, Search, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Header() {
  const itemCount = useCartStore((state) => state.getItemCount());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <Crown className="w-8 h-8 text-primary transition-transform duration-300 group-hover:scale-110" />
              <div className="absolute inset-0 animate-pulse-gold opacity-0 group-hover:opacity-100" />
            </div>
            <span className="font-display text-2xl font-bold gradient-gold-text">
              Royal Store
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              to="/" 
              className="font-display text-foreground/80 hover:text-primary transition-colors duration-300 relative group"
            >
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
            </Link>
            <Link 
              to="/products" 
              className="font-display text-foreground/80 hover:text-primary transition-colors duration-300 relative group"
            >
              Collection
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
            </Link>
            <Link 
              to="/track-order" 
              className="font-display text-foreground/80 hover:text-primary transition-colors duration-300 relative group"
            >
              Track Order
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            
            <Link to="/cart" className="relative group">
              <Button variant="royalOutline" size="icon" className="relative">
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full gradient-gold text-primary-foreground text-xs font-bold flex items-center justify-center animate-fade-in-scale">
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Mobile Menu Toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={cn(
          "md:hidden overflow-hidden transition-all duration-300",
          mobileMenuOpen ? "max-h-64 pb-6" : "max-h-0"
        )}>
          <nav className="flex flex-col gap-4">
            <Link 
              to="/" 
              className="font-display text-lg text-foreground/80 hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/products" 
              className="font-display text-lg text-foreground/80 hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Collection
            </Link>
            <Link 
              to="/track-order" 
              className="font-display text-lg text-foreground/80 hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Track Order
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
