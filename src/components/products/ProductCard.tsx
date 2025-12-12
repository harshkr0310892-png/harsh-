import { Link } from "react-router-dom";
import { ShoppingBag, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  discount_percentage: number;
  image_url: string | null;
  images?: string[] | null;
  stock_status: string;
  stock_quantity?: number | null;
  index?: number;
  cash_on_delivery?: boolean;
}

export function ProductCard({ 
  id, 
  name, 
  price, 
  discount_percentage, 
  image_url,
  images,
  stock_status,
  stock_quantity,
  index = 0 
}: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const discountedPrice = price * (1 - discount_percentage / 100);
  const isSoldOut = stock_status === 'sold_out';
  const isLowStock = stock_status === 'low_stock';
  const displayImage = (images && images.length > 0) ? images[0] : image_url;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isSoldOut) return;
    
    addItem({
      id,
      name,
      price,
      discount_percentage,
      image_url: displayImage,
      cash_on_delivery: cash_on_delivery,
    });
    toast.success(`${name} added to cart!`);
  };

  const getStockDisplay = () => {
    if (isSoldOut) return "Out of Stock";
    if (isLowStock && stock_quantity) return `Only ${stock_quantity} left`;
    if (stock_quantity && stock_quantity > 0) return `${stock_quantity} in stock`;
    return "In Stock";
  };

  return (
    <div 
      className={cn(
        "group relative bg-card rounded-xl overflow-hidden border border-border/50",
        "transition-all duration-500 hover:border-primary/50 hover:royal-shadow-lg",
        "opacity-0 animate-fade-in",
        `stagger-${(index % 5) + 1}`
      )}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        {displayImage ? (
          <img 
            src={displayImage} 
            alt={name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-secondary">
            <span className="font-display text-4xl text-muted-foreground/30">R</span>
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {discount_percentage > 0 && (
            <span className="px-3 py-1 rounded-full text-xs font-bold gradient-gold text-primary-foreground">
              -{discount_percentage}%
            </span>
          )}
          {isSoldOut && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-destructive text-destructive-foreground">
              Sold Out
            </span>
          )}
          {isLowStock && !isSoldOut && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-500 text-yellow-950">
              Low Stock
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className={cn(
          "absolute bottom-3 right-3 flex gap-2",
          "transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100",
          "transition-all duration-300"
        )}>
          <Link to={`/product/${id}`}>
            <Button size="icon" variant="secondary" className="rounded-full">
              <Eye className="w-4 h-4" />
            </Button>
          </Link>
          <Button 
            size="icon" 
            variant="royal" 
            className="rounded-full"
            onClick={handleAddToCart}
            disabled={isSoldOut}
          >
            <ShoppingBag className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <Link to={`/product/${id}`} className="block p-4">
        <h3 className="font-display text-lg font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {name}
        </h3>
        
        <div className="mt-2 flex items-center gap-3">
          {discount_percentage > 0 ? (
            <>
              <span className="font-display text-xl font-bold text-primary">
                ₹{discountedPrice.toFixed(2)}
              </span>
              <span className="text-sm text-muted-foreground line-through">
                ₹{price.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="font-display text-xl font-bold text-primary">
              ₹{price.toFixed(2)}
            </span>
          )}
        </div>

        {/* Stock indicator */}
        <div className="mt-3 flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            isSoldOut ? "bg-destructive" : isLowStock ? "bg-yellow-500" : "bg-green-500"
          )} />
          <span className={cn(
            "text-xs",
            isSoldOut ? "text-destructive" : isLowStock ? "text-yellow-600 dark:text-yellow-400" : "text-green-600 dark:text-green-400"
          )}>
            {getStockDisplay()}
          </span>
        </div>
      </Link>
    </div>
  );
}
