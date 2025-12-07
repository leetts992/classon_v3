"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import StoreHeader from "@/components/store/StoreHeader";
import StoreFooter from "@/components/store/StoreFooter";
import Banner from "@/components/store/Banner";
import ProductGrid from "@/components/store/ProductGrid";
import KakaoChannelButton from "@/components/store/KakaoChannelButton";
import { publicStoreAPI, Product as APIProduct, StoreInfo } from "@/lib/api";
import { Product } from "@/types";

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

export default function StorePage() {
  const params = useParams();
  const subdomain = params.subdomain as string;

  const [products, setProducts] = useState<Product[]>([]);
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (subdomain) {
      fetchStoreData();
    }
  }, [subdomain]);

  const fetchStoreData = async () => {
    try {
      setLoading(true);
      setError('');

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
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    // Get existing cart or create new one
    const savedCart = localStorage.getItem(`cart_${subdomain}`);
    const cart = savedCart ? JSON.parse(savedCart) : [];

    // Check if product already in cart
    const existingIndex = cart.findIndex((item: any) => item.id === productId);
    if (existingIndex !== -1) {
      alert("이미 장바구니에 담긴 상품입니다!");
      return;
    }

    // Add product to cart
    const cartItem = {
      id: product.id,
      title: product.title,
      price: product.price,
      discount_price: product.discountPrice,
      thumbnail: product.thumbnail,
      type: product.type,
    };

    cart.push(cartItem);
    localStorage.setItem(`cart_${subdomain}`, JSON.stringify(cart));

    // Trigger storage event to update header cart count
    window.dispatchEvent(new Event("storage"));

    alert("장바구니에 담겼습니다!");
  };

  const ebooks = products.filter((p) => p.type === "ebook");
  const videos = products.filter((p) => p.type === "video");

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <StoreHeader storeName="" />

        {/* Skeleton Banner */}
        <div className="w-full h-[280px] md:h-[350px] lg:h-[420px] bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />

        {/* Skeleton Products */}
        <main className="flex-1 py-16">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                  <div className="w-full h-48 bg-gray-300" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-300 rounded w-3/4" />
                    <div className="h-4 bg-gray-300 rounded w-1/2" />
                    <div className="h-8 bg-gray-300 rounded w-full mt-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        <footer className="bg-gray-100 h-64 animate-pulse" />
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

      <main className="flex-1">
        <Banner
          slides={
            storeInfo?.banner_slides && storeInfo.banner_slides.length > 0
              ? storeInfo.banner_slides.map((slide) => ({
                  id: slide.id,
                  imageUrl: slide.image_url,
                  title: slide.title,
                  subtitle: slide.subtitle,
                  linkUrl: slide.link_url,
                }))
              : [
                  {
                    id: "default-slide",
                    imageUrl: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=1920&h=600&fit=crop",
                    title: `${storeInfo?.full_name || '강사'}의 강의로 실력을 키우세요`,
                    subtitle: storeInfo?.bio || "다양한 강의를 만나보세요",
                    linkUrl: "#courses",
                  },
                ]
          }
        />

        {products.length === 0 ? (
          <section className="py-16 bg-white">
            <div className="container text-center">
              <p className="text-xl text-gray-600">아직 등록된 상품이 없습니다.</p>
              <p className="text-gray-500 mt-2">
                곧 멋진 강의가 준비될 예정입니다!
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
                  <ProductGrid products={ebooks} subdomain={subdomain} onAddToCart={handleAddToCart} />
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
                  <ProductGrid products={videos} subdomain={subdomain} onAddToCart={handleAddToCart} />
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {storeInfo && <StoreFooter storeInfo={storeInfo} />}

      {/* Kakao Channel Chat Button */}
      {storeInfo?.kakao_channel_id && (
        <KakaoChannelButton channelId={storeInfo.kakao_channel_id} />
      )}
    </div>
  );
}
