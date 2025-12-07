"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import StoreHeader from "@/components/store/StoreHeader";
import StoreFooter from "@/components/store/StoreFooter";
import { publicStoreAPI, Product as APIProduct, StoreInfo } from "@/lib/api";
import { ShoppingCart, Clock, BookOpen } from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const subdomain = params.subdomain as string;
  const productId = params.id as string;

  const [product, setProduct] = useState<APIProduct | null>(null);
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (subdomain && productId) {
      fetchProductData();
    }
  }, [subdomain, productId]);

  const fetchProductData = async () => {
    try {
      setLoading(true);
      setError('');

      const [productData, storeData] = await Promise.all([
        publicStoreAPI.getProduct(subdomain, productId),
        publicStoreAPI.getStoreInfo(subdomain),
      ]);

      setProduct(productData);
      setStoreInfo(storeData);
    } catch (err: any) {
      console.error('Error fetching product data:', err);
      setError(err.message || '상품 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    // Get existing cart or create new one
    const savedCart = localStorage.getItem(`cart_${subdomain}`);
    const cart = savedCart ? JSON.parse(savedCart) : [];

    // Check if product already in cart
    const existingIndex = cart.findIndex((item: any) => item.id === product.id);
    if (existingIndex !== -1) {
      alert("이미 장바구니에 담긴 상품입니다!");
      return;
    }

    // Add product to cart
    const cartItem = {
      id: product.id,
      title: product.title,
      price: product.price,
      discount_price: product.discount_price,
      thumbnail: product.thumbnail,
      type: product.type,
    };

    cart.push(cartItem);
    localStorage.setItem(`cart_${subdomain}`, JSON.stringify(cart));

    // Trigger storage event to update header cart count
    window.dispatchEvent(new Event("storage"));

    alert("장바구니에 담겼습니다!");
  };

  const handleBuyNow = () => {
    alert("결제 기능은 곧 추가될 예정입니다!");
  };

  const formatPrice = (price: number) => {
    return `₩${price.toLocaleString()}`;
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return null;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}시간 ${mins}분` : `${mins}분`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600">로딩 중...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">{error || '상품을 찾을 수 없습니다.'}</p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            스토어로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const displayPrice = product.discount_price || product.price;
  const hasDiscount = product.discount_price && product.discount_price < product.price;

  return (
    <div className="flex flex-col min-h-screen">
      <StoreHeader storeName={storeInfo?.store_name || "내 스토어"} />

      <main className="flex-1 bg-gray-50">
        <div className="container py-12">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Left Column - Image */}
            <div className="space-y-4">
              <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                {product.thumbnail ? (
                  <img
                    src={product.thumbnail}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-24 h-24 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Product Meta */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold mb-3">상품 정보</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">유형</span>
                    <span className="font-medium">
                      {product.type === 'video' ? '동영상 강의' : '전자책'}
                    </span>
                  </div>
                  {product.category && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">카테고리</span>
                      <span className="font-medium">{product.category}</span>
                    </div>
                  )}
                  {product.duration && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">재생 시간</span>
                      <span className="font-medium flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDuration(product.duration)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="space-y-6">
              {/* Title and Price */}
              <div>
                <h1 className="text-4xl font-bold mb-4">{product.title}</h1>
                {product.description && (
                  <p className="text-xl text-gray-600 mb-6">{product.description}</p>
                )}

                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-4xl font-bold text-blue-600">
                    {formatPrice(displayPrice)}
                  </span>
                  {hasDiscount && (
                    <>
                      <span className="text-2xl text-gray-400 line-through">
                        {formatPrice(product.price)}
                      </span>
                      <span className="px-2 py-1 bg-red-500 text-white text-sm font-bold rounded">
                        {Math.round(((product.price - product.discount_price!) / product.price) * 100)}% OFF
                      </span>
                    </>
                  )}
                </div>

                {/* CTA Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 bg-blue-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    지금 구매하기
                  </button>
                  <button
                    onClick={handleAddToCart}
                    className="px-6 py-4 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    장바구니
                  </button>
                </div>
              </div>

              {/* Instructor Info */}
              <div className="bg-gray-100 p-6 rounded-lg">
                <h3 className="font-semibold mb-2">강사 정보</h3>
                <p className="text-lg font-medium">{storeInfo?.full_name}</p>
                {storeInfo?.bio && (
                  <p className="text-sm text-gray-600 mt-1">{storeInfo.bio}</p>
                )}
              </div>
            </div>
          </div>

          {/* Detailed Description */}
          {product.detailed_description && (
            <div className="mt-12 bg-white p-8 rounded-lg shadow-sm">
              <h2 className="text-2xl font-bold mb-6">상세 설명</h2>
              <div
                className="prose prose-lg max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-p:text-gray-700 prose-a:text-blue-600 prose-img:rounded-lg prose-img:shadow-md"
                dangerouslySetInnerHTML={{ __html: product.detailed_description }}
              />
            </div>
          )}
        </div>
      </main>

      {storeInfo && <StoreFooter storeInfo={storeInfo} />}
    </div>
  );
}
