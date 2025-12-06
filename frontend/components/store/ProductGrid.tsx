import ProductCard from "./ProductCard";

interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  discountPrice?: number;
  thumbnail: string;
  type: "ebook" | "video";
  rating?: number;
  reviewCount?: number;
  duration?: number;
}

interface ProductGridProps {
  products: Product[];
  subdomain?: string;
  onAddToCart?: (productId: string) => void;
}

export default function ProductGrid({
  products,
  subdomain,
  onAddToCart,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">등록된 상품이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          {...product}
          subdomain={subdomain}
          onAddToCart={() => onAddToCart?.(product.id)}
        />
      ))}
    </div>
  );
}
