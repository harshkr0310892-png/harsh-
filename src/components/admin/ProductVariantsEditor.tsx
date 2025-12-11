import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, Loader2 } from "lucide-react";

interface Attribute {
  id: string;
  name: string;
}

interface AttributeValue {
  id: string;
  attribute_id: string;
  value: string;
}

interface ProductVariant {
  id: string;
  product_id: string;
  attribute_value_id: string;
  price: number;
  stock_quantity: number;
  is_available: boolean;
}

interface ProductVariantsEditorProps {
  productId: string;
  basePrice: number;
}

export function ProductVariantsEditor({ productId, basePrice }: ProductVariantsEditorProps) {
  const queryClient = useQueryClient();
  const [newVariant, setNewVariant] = useState({
    attribute_id: '',
    attribute_value_id: '',
    price: basePrice.toString(),
    stock_quantity: '0',
    is_available: true,
  });

  // Fetch attributes
  const { data: attributes } = useQuery({
    queryKey: ['product-attributes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_attributes')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return data as Attribute[];
    },
  });

  // Fetch attribute values
  const { data: attributeValues } = useQuery({
    queryKey: ['product-attribute-values'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_attribute_values')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return data as AttributeValue[];
    },
  });

  // Fetch variants for this product
  const { data: variants, isLoading: variantsLoading } = useQuery({
    queryKey: ['product-variants', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId);
      if (error) throw error;
      return data as ProductVariant[];
    },
    enabled: !!productId,
  });

  // Add variant mutation
  const addVariantMutation = useMutation({
    mutationFn: async (data: typeof newVariant) => {
      const { error } = await supabase.from('product_variants').insert({
        product_id: productId,
        attribute_value_id: data.attribute_value_id,
        price: parseFloat(data.price),
        stock_quantity: parseInt(data.stock_quantity) || 0,
        is_available: data.is_available,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-variants', productId] });
      toast.success('Variant added!');
      setNewVariant({
        attribute_id: '',
        attribute_value_id: '',
        price: basePrice.toString(),
        stock_quantity: '0',
        is_available: true,
      });
    },
    onError: (error: any) => {
      if (error.message?.includes('duplicate')) {
        toast.error('This variant already exists for this product');
      } else {
        toast.error('Failed to add variant');
      }
    },
  });

  // Update variant mutation
  const updateVariantMutation = useMutation({
    mutationFn: async (data: { id: string; price?: number; stock_quantity?: number; is_available?: boolean }) => {
      const { id, ...updates } = data;
      const { error } = await supabase
        .from('product_variants')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-variants', productId] });
      toast.success('Variant updated!');
    },
    onError: () => toast.error('Failed to update variant'),
  });

  // Delete variant mutation
  const deleteVariantMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('product_variants').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-variants', productId] });
      toast.success('Variant deleted!');
    },
    onError: () => toast.error('Failed to delete variant'),
  });

  const getValuesForAttribute = (attributeId: string) => {
    return attributeValues?.filter(v => v.attribute_id === attributeId) || [];
  };

  const getAttributeName = (attributeValueId: string) => {
    const value = attributeValues?.find(v => v.id === attributeValueId);
    if (!value) return '';
    const attr = attributes?.find(a => a.id === value.attribute_id);
    return attr?.name || '';
  };

  const getValueName = (attributeValueId: string) => {
    const value = attributeValues?.find(v => v.id === attributeValueId);
    return value?.value || '';
  };

  if (!productId) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Save the product first to add variants
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-t border-border pt-6">
        <h3 className="font-semibold mb-4">Product Variants</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Add different sizes, colors, or other variants with custom prices and stock.
        </p>

        {/* Add New Variant Form */}
        <div className="bg-muted/30 rounded-lg p-4 space-y-4 mb-6">
          <h4 className="font-medium text-sm">Add New Variant</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Attribute</Label>
              <Select
                value={newVariant.attribute_id}
                onValueChange={(val) => setNewVariant({ ...newVariant, attribute_id: val, attribute_value_id: '' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select attribute" />
                </SelectTrigger>
                <SelectContent>
                  {attributes?.map(attr => (
                    <SelectItem key={attr.id} value={attr.id}>{attr.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Value</Label>
              <Select
                value={newVariant.attribute_value_id}
                onValueChange={(val) => setNewVariant({ ...newVariant, attribute_value_id: val })}
                disabled={!newVariant.attribute_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select value" />
                </SelectTrigger>
                <SelectContent>
                  {getValuesForAttribute(newVariant.attribute_id).map(val => (
                    <SelectItem key={val.id} value={val.id}>{val.value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Price (₹)</Label>
              <Input
                type="number"
                value={newVariant.price}
                onChange={(e) => setNewVariant({ ...newVariant, price: e.target.value })}
                placeholder="0"
              />
            </div>

            <div>
              <Label>Stock Quantity</Label>
              <Input
                type="number"
                value={newVariant.stock_quantity}
                onChange={(e) => setNewVariant({ ...newVariant, stock_quantity: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                checked={newVariant.is_available}
                onCheckedChange={(checked) => setNewVariant({ ...newVariant, is_available: checked })}
              />
              <Label>Available</Label>
            </div>
            <Button
              onClick={() => addVariantMutation.mutate(newVariant)}
              disabled={!newVariant.attribute_value_id || addVariantMutation.isPending}
              size="sm"
            >
              {addVariantMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Add Variant
            </Button>
          </div>
        </div>

        {/* Existing Variants List */}
        {variantsLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : variants && variants.length > 0 ? (
          <div className="space-y-3">
            {variants.map((variant) => (
              <div
                key={variant.id}
                className="flex items-center gap-4 p-3 bg-card rounded-lg border border-border/50"
              >
                <div className="flex-1">
                  <span className="font-medium">
                    {getAttributeName(variant.attribute_value_id)}: {getValueName(variant.attribute_value_id)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <Input
                      type="number"
                      value={variant.price}
                      onChange={(e) => updateVariantMutation.mutate({ id: variant.id, price: parseFloat(e.target.value) })}
                      className="w-24 text-right"
                      prefix="₹"
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      value={variant.stock_quantity}
                      onChange={(e) => updateVariantMutation.mutate({ id: variant.id, stock_quantity: parseInt(e.target.value) || 0 })}
                      className="w-20 text-right"
                    />
                  </div>
                  <Switch
                    checked={variant.is_available}
                    onCheckedChange={(checked) => updateVariantMutation.mutate({ id: variant.id, is_available: checked })}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => deleteVariantMutation.mutate(variant.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No variants added yet. This product will use the base price.
          </p>
        )}
      </div>
    </div>
  );
}
