"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import StoreHeader from "@/components/store/StoreHeader";
import Footer from "@/components/layout/Footer";
import ProductGrid from "@/components/store/ProductGrid";
import { publicStoreAPI, Product as APIProduct, StoreInfo } from "@/lib/api";
import { Product } from "@/types";

// Convert API Product to UI Product type
function convertProduct(apiProduct: APIProduct): Product {
  const productType = (apiProduct.type as string) === 'VIDEO' ? 'video' : 'ebook';

  return {
    id: apiProduct.id,
    title: apiProduct.title,
    description: apiProduct.description || '',
    price: apiProduct.price,
    discountPrice: apiProduct.discount_price,
    thumbnail: apiProduct.thumbnail || 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=600&fit=crop',
    type: productType,
    rating: 0,
    reviewCount: 0,
    category: apiProduct.category || '기타',
    instructorId: apiProduct.instructor_id,
    isPublished: apiProduct.is_published,
    createdAt: apiProduct.created_at,
    duration: apiProduct.duration,
  };
}

export default function CoursesPage() {
  const params = useParams();
  const subdomain = params.subdomain as string;

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter states
  const [selectedType, setSelectedType] = useState<'all' | 'video' | 'ebook'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'price-low' | 'price-high'>('latest');

  useEffect(() => {
    if (subdomain) {
      fetchStoreData();
    }
  }, [subdomain]);

  useEffect(() => {
    applyFilters();
  }, [products, selectedType, selectedCategory, sortBy]);

  const fetchStoreData = async () => {
    try {
      setLoading(true);
      setError('');

      const [storeData, productsData] = await Promise.all([
        publicStoreAPI.getStoreInfo(subdomain),
        publicStoreAPI.getStoreProducts(subdomain),
      ]);

      setStoreInfo(storeData);
      setProducts(productsData.map(convertProduct));
    } catch (err: any) {
      console.error('Error fetching store data:', err);
      setError(err.message || '스토어 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(p => p.type === selectedType);
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case 'latest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'price-low':
        filtered.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
        break;
    }

    setFilteredProducts(filtered);
  };

  const handleAddToCart = (productId: string) => {
    console.log("Add to cart:", productId);
    alert("장바구니에 담겼습니다!");
  };

  // Get unique categories
  const categories = Array.from(new Set(products.map(p => p.category)));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600">로딩 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">{error}</p>
          <p className="text-gray-600 mb-4">스토어를 찾을 수 없습니다: {subdomain}</p>
          <button
            onClick={fetchStoreData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <StoreHeader storeName={storeInfo?.store_name || "내 스토어"} />

      <main className="flex-1 bg-gray-50">
        {/* Page Header */}
        <section className="bg-white border-b">
          <div className="container py-8">
            <h1 className="text-4xl font-bold mb-2">전체 강의</h1>
            <p className="text-gray-600">
              {storeInfo?.full_name}님의 모든 강의를 만나보세요
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="bg-white border-b">
          <div className="container py-6">
            <div className="flex flex-wrap gap-4 items-center">
              {/* Type Filter */}
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedType('all')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedType === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  전체
                </button>
                <button
                  onClick={() => setSelectedType('video')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedType === 'video'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  동영상 강의
                </button>
                <button
                  onClick={() => setSelectedType('ebook')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedType === 'ebook'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  전자책
                </button>
              </div>

              {/* Category Filter */}
              {categories.length > 0 && (
                <div className="flex gap-2 items-center">
                  <span className="text-sm text-gray-600">카테고리:</span>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">전체</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Sort */}
              <div className="flex gap-2 items-center ml-auto">
                <span className="text-sm text-gray-600">정렬:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="latest">최신순</option>
                  <option value="price-low">가격 낮은순</option>
                  <option value="price-high">가격 높은순</option>
                </select>
              </div>
            </div>

            {/* Result Count */}
            <div className="mt-4 text-sm text-gray-600">
              총 {filteredProducts.length}개의 강의
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-12">
          <div className="container">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-xl text-gray-600">
                  {products.length === 0
                    ? '아직 등록된 강의가 없습니다.'
                    : '선택한 조건에 맞는 강의가 없습니다.'}
                </p>
              </div>
            ) : (
              <ProductGrid products={filteredProducts} subdomain={subdomain} onAddToCart={handleAddToCart} />
            )}
          </div>
        </section>
      </main>

      <Footer
        storeName={storeInfo?.store_name || "내 스토어"}
        footerText={storeInfo?.bio || "함께 성장해요"}
        socialLinks={{
          youtube: "https://youtube.com",
          instagram: "https://instagram.com",
          twitter: "https://twitter.com",
        }}
      />
    </div>
  );
}
