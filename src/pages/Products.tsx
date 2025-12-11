import { Layout } from "@/components/layout/Layout";
import { ProductCard } from "@/components/products/ProductCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Crown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type FilterType = 'all' | 'in_stock' | 'on_sale';

interface Category {
  id: string;
  name: string;
}

export default function Products() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as Category[];
    },
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const filteredProducts = products?.filter((product) => {
    // Category filter
    if (selectedCategory !== 'all' && product.category_id !== selectedCategory) {
      return false;
    }
    // Stock/Sale filter
    if (filter === 'in_stock') return product.stock_status === 'in_stock';
    if (filter === 'on_sale') return (product.discount_percentage || 0) > 0;
    return true;
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Our <span className="gradient-gold-text">Collection</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore our curated selection of premium products, crafted with excellence and designed for royalty.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          <Button
            variant={selectedCategory === 'all' ? 'royal' : 'royalOutline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            All Categories
          </Button>
          {categories?.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'royal' : 'royalOutline'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* Stock/Sale Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All Products
          </Button>
          <Button
            variant={filter === 'in_stock' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('in_stock')}
          >
            In Stock
          </Button>
          <Button
            variant={filter === 'on_sale' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('on_sale')}
          >
            On Sale
          </Button>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-square rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredProducts && filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={Number(product.price)}
                discount_percentage={product.discount_percentage || 0}
                image_url={product.image_url}
                stock_status={product.stock_status}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-card rounded-xl border border-border/50">
            <Crown className="w-20 h-20 text-primary/30 mx-auto mb-4" />
            <h3 className="font-display text-2xl font-semibold text-muted-foreground mb-2">
              No products found
            </h3>
            <p className="text-muted-foreground">
              {filter !== 'all' || selectedCategory !== 'all'
                ? 'Try adjusting your filters or check back later.' 
                : 'Check back soon for our royal collection!'}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}