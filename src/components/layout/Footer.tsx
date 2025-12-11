import { Crown } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Crown className="w-6 h-6 text-primary" />
              <span className="font-display text-xl font-bold gradient-gold-text">
                Royal Store
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              Experience luxury shopping with our curated collection of premium products.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-4">
            <h4 className="font-display text-lg font-semibold text-foreground">Quick Links</h4>
            <div className="flex flex-col gap-2">
              <Link to="/products" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Shop Collection
              </Link>
              <Link to="/cart" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                View Cart
              </Link>
              <Link to="/track-order" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Track Your Order
              </Link>
              <Link to="/faq" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                FAQs
              </Link>
              <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Privacy Policy
              </Link>
            </div>
          </div>

          {/* Admin Access */}
          <div className="flex flex-col gap-4">
            <h4 className="font-display text-lg font-semibold text-foreground">Administration</h4>
            <div className="flex flex-col gap-2">
              <Link to="/admin" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Admin Portal
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/50 text-center">
          <p className="text-muted-foreground text-sm">
            © 2024 Royal Store. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
