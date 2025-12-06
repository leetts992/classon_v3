"use client";

import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Banner from "@/components/store/Banner";
import ProductGrid from "@/components/store/ProductGrid";
import { publicStoreAPI, Product as APIProduct, StoreInfo } from "@/lib/api";
import { Product } from "@/types";

// Get current instructor's subdomain from API
async function getCurrentInstructorSubdomain(): Promise<string | null> {
  try {
    const { authAPI } = await import('@/lib/api');
    const instructorProfile = await authAPI.getCurrentInstructor();
    console.log('Current instructor:', instructorProfile);
    return instructorProfile.subdomain;
  } catch (error) {
    console.error('Failed to fetch instructor profile:', error);
    return null;
  }
}

// Convert API Product to UI Product type
function convertProduct(apiProduct: APIProduct): Product {
  // Convert type: 'VIDEO' -> 'video', 'EBOOK' -> 'ebook'
  const productType = (apiProduct.type as string) === 'VIDEO' ? 'video' : 'ebook';

  return {
    id: apiProduct.id,
    title: apiProduct.title,
    description: apiProduct.description || '',
    price: apiProduct.price,
    discountPrice: apiProduct.discount_price,
    thumbnail: apiProduct.thumbnail || 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=600&fit=crop',
    type: productType,
    rating: 0, // TODO: Implement rating system
    reviewCount: 0, // TODO: Implement review system
    category: apiProduct.category || '기타',
    instructorId: apiProduct.instructor_id,
    isPublished: apiProduct.is_published,
    createdAt: apiProduct.created_at,
    duration: apiProduct.duration,
  };
}

export default function DemoStorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStoreData();
  }, []);

  const fetchStoreData = async () => {
    try {
      setLoading(true);
      setError('');

      // Get current instructor's subdomain from API
      const subdomain = await getCurrentInstructorSubdomain();

      if (!subdomain) {
        setError('로그인한 강사 정보를 찾을 수 없습니다. 다시 로그인해주세요.');
        return;
      }

      console.log('Fetching store data for subdomain:', subdomain);

      // Fetch store info and products in parallel
      const [storeData, productsData] = await Promise.all([
        publicStoreAPI.getStoreInfo(subdomain),
        publicStoreAPI.getStoreProducts(subdomain),
      ]);

      console.log('Store data:', storeData);
      console.log('Products data:', productsData);

      setStoreInfo(storeData);
      setProducts(productsData.map(convertProduct));
    } catch (err: any) {
      console.error('Error fetching store data:', err);
      setError(err.message || '스토어 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (productId: string) => {
    console.log("Add to cart:", productId);
    // TODO: Implement cart functionality
    alert("장바구니에 담겼습니다!");
  };

  const ebooks = products.filter((p) => p.type === "ebook");
  const videos = products.filter((p) => p.type === "video");

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
      <Header
        storeName={storeInfo?.store_name || "내 스토어"}
        logo="/logo.png"
        menuItems={[
          { name: "홈", path: "/demo" },
          { name: "전체 강의", path: "/demo/courses" },
          { name: "소개", path: "/demo/about" },
        ]}
        cartCount={0}
        isAuthenticated={false}
      />

      <main className="flex-1">
        <Banner
          title={`${storeInfo?.full_name || '강사'}의 강의로 실력을 키우세요`}
          subtitle={storeInfo?.bio || "다양한 강의를 만나보세요"}
          imageUrl="https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=1200&h=800&fit=crop"
          ctaText="전체 강의 보기"
          ctaLink="#courses"
        />

        {products.length === 0 ? (
          <section className="py-16 bg-white">
            <div className="container text-center">
              <p className="text-xl text-gray-600">아직 등록된 상품이 없습니다.</p>
              <p className="text-gray-500 mt-2">
                대시보드에서 상품을 등록하고 게시해보세요!
              </p>
            </div>
          </section>
        ) : (
          <>
            {/* Ebooks Section */}
            {ebooks.length > 0 && (
              <section className="py-16 bg-white">
                <div className="container">
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold mb-2">📚 전자책</h2>
                    <p className="text-gray-600">
                      언제 어디서나 편하게 읽을 수 있는 전자책으로 학습하세요
                    </p>
                  </div>
                  <ProductGrid products={ebooks} onAddToCart={handleAddToCart} />
                </div>
              </section>
            )}

            {/* Videos Section */}
            {videos.length > 0 && (
              <section id="courses" className="py-16 bg-gray-50">
                <div className="container">
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold mb-2">🎥 동영상 강의</h2>
                    <p className="text-gray-600">
                      실습 중심의 동영상 강의로 실력을 향상시키세요
                    </p>
                  </div>
                  <ProductGrid products={videos} onAddToCart={handleAddToCart} />
                </div>
              </section>
            )}
          </>
        )}

        {/* CTA Section */}
        <section className="py-20 bg-blue-600">
          <div className="container text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              이 스토어처럼 당신만의
              <br />
              강의 사이트를 5분 만에
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Class-On으로 전문적인 강의 판매 스토어를 무료로 시작하세요
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/"
                className="inline-flex items-center justify-center bg-white text-blue-600 font-bold text-lg px-10 py-4 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Class-On 시작하기
              </a>
              <a
                href="#"
                className="inline-flex items-center justify-center bg-transparent text-white font-semibold text-lg px-10 py-4 rounded-xl border-2 border-white hover:bg-white/10 transition-colors"
              >
                더 많은 예시 보기
              </a>
            </div>
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
