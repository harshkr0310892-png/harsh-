import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag, ArrowLeft, Minus, Plus, Crown, ChevronLeft, ChevronRight } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { VariantSelector } from "@/components/products/VariantSelector";

interface SelectedVariant {
  id: string;
  price: number;
  stock_quantity: number;
  is_available: boolean;
  attribute_name: string;
  value_name: string;
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<SelectedVariant | null>(null);
  const addItem = useCartStore((state) => state.addItem);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const handleVariantChange = (variant: any, attributeName: string, valueName: string) => {
    if (variant) {
      setSelectedVariant({
        id: variant.id,
        price: variant.price,
        stock_quantity: variant.stock_quantity,
        is_available: variant.is_available,
        attribute_name: attributeName,
        value_name: valueName,
      });
    } else {
      setSelectedVariant(null);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    const displayImage = (product.images && product.images.length > 0) ? product.images[0] : product.image_url;
    const finalPrice = selectedVariant ? selectedVariant.price : Number(product.price);
    
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: finalPrice,
        discount_percentage: selectedVariant ? 0 : (product.discount_percentage || 0),
        image_url: displayImage,
        variant_info: selectedVariant ? {
          variant_id: selectedVariant.id,
          attribute_name: selectedVariant.attribute_name,
          attribute_value: selectedVariant.value_name,
        } : undefined,
      });
    }
    toast.success(`Added ${quantity} ${product.name}${selectedVariant ? ` (${selectedVariant.value_name})` : ''} to cart!`);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 gap-12">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="space-y-6">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product || error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <Crown className="w-20 h-20 text-primary/30 mx-auto mb-4" />
          <h1 className="font-display text-3xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">The product you're looking for doesn't exist.</p>
          <Link to="/products">
            <Button variant="royal">Browse Products</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const actualPrice = selectedVariant ? selectedVariant.price : Number(product.price);
  const discountedPrice = selectedVariant ? actualPrice : actualPrice * (1 - (product.discount_percentage || 0) / 100);
  const isSoldOut = selectedVariant 
    ? (!selectedVariant.is_available || selectedVariant.stock_quantity === 0)
    : product.stock_status === 'sold_out';
  const isLowStock = selectedVariant 
    ? (selectedVariant.stock_quantity > 0 && selectedVariant.stock_quantity <= 5)
    : product.stock_status === 'low_stock';
  const stockQuantity = selectedVariant ? selectedVariant.stock_quantity : (product.stock_quantity || 0);
  
  // Get all images - combine images array with legacy image_url
  const allImages = product.images && product.images.length > 0 
    ? product.images 
    : (product.image_url ? [product.image_url] : []);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const getStockDisplay = () => {
    if (isSoldOut) return "Out of Stock";
    if (isLowStock && stockQuantity > 0) return `Only ${stockQuantity} left!`;
    if (stockQuantity > 0) return `${stockQuantity} in stock`;
    return "In Stock";
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Back Button */}
        <Link 
          to="/products" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Collection
        </Link>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4 animate-fade-in">
            {/* Main Image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-card border border-border/50">
              {allImages.length > 0 ? (
                <>
                  <img 
                    src={allImages[currentImageIndex]} 
                    alt={`${product.name} - Image ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Navigation Arrows */}
                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-secondary">
                  <Crown className="w-32 h-32 text-muted-foreground/20" />
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {(product.discount_percentage || 0) > 0 && (
                  <span className="px-4 py-2 rounded-full text-sm font-bold gradient-gold text-primary-foreground">
                    -{product.discount_percentage}% OFF
                  </span>
                )}
                {isSoldOut && (
                  <span className="px-4 py-2 rounded-full text-sm font-bold bg-destructive text-destructive-foreground">
                    Sold Out
                  </span>
                )}
                {isLowStock && !isSoldOut && (
                  <span className="px-4 py-2 rounded-full text-sm font-bold bg-yellow-500 text-yellow-950">
                    Low Stock
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={cn(
                      "w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all",
                      currentImageIndex === index 
                        ? "border-primary ring-2 ring-primary/20" 
                        : "border-transparent hover:border-border"
                    )}
                  >
                    <img 
                      src={img} 
                      alt={`${product.name} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col animate-fade-in stagger-2">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-center gap-4 mb-6">
              {selectedVariant ? (
                <span className="font-display text-3xl font-bold text-primary">
                  ₹{selectedVariant.price.toFixed(2)}
                </span>
              ) : (product.discount_percentage || 0) > 0 ? (
                <>
                  <span className="font-display text-3xl font-bold text-primary">
                    ₹{discountedPrice.toFixed(2)}
                  </span>
                  <span className="text-xl text-muted-foreground line-through">
                    ₹{Number(product.price).toFixed(2)}
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-500/10 text-green-600 dark:text-green-400">
                    Save ₹{(Number(product.price) - discountedPrice).toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="font-display text-3xl font-bold text-primary">
                  ₹{Number(product.price).toFixed(2)}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2 mb-6">
              <div className={cn(
                "w-3 h-3 rounded-full",
                isSoldOut ? "bg-destructive" : isLowStock ? "bg-yellow-500" : "bg-green-500"
              )} />
              <span className={cn(
                "text-sm font-medium",
                isSoldOut ? "text-destructive" : isLowStock ? "text-yellow-600 dark:text-yellow-400" : "text-green-600 dark:text-green-400"
              )}>
                {getStockDisplay()}
              </span>
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Variant Selector */}
            <div className="mb-6">
              <VariantSelector 
                productId={product.id}
                basePrice={Number(product.price)}
                onVariantChange={handleVariantChange}
              />
            </div>

            {/* Quantity Selector */}
            {!isSoldOut && (
              <div className="flex items-center gap-4 mb-8">
                <span className="text-sm font-medium text-foreground">Quantity:</span>
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-muted transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-6 py-3 font-display text-lg font-semibold">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(stockQuantity || 99, quantity + 1))}
                    className="p-3 hover:bg-muted transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {stockQuantity > 0 && (
                  <span className="text-sm text-muted-foreground">
                    (Max: {stockQuantity})
                  </span>
                )}
              </div>
            )}

            {/* Add to Cart Button */}
            <Button
              variant="royal"
              size="xl"
              className="w-full"
              onClick={handleAddToCart}
              disabled={isSoldOut}
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              {isSoldOut ? 'Out of Stock' : 'Add to Cart'}
            </Button>

            {/* Features */}
            <div className="mt-10 pt-8 border-t border-border/50">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Crown className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm">Premium Quality</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm">Secure Checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
