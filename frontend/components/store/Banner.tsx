"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface BannerSlide {
  id: string;
  imageUrl: string;
  title?: string;
  subtitle?: string;
  linkUrl?: string;
}

interface BannerProps {
  slides?: BannerSlide[];
  autoPlayInterval?: number;
}

export default function Banner({
  slides = [],
  autoPlayInterval = 5000,
}: BannerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // 슬라이드가 없으면 기본 슬라이드 사용
  const defaultSlides: BannerSlide[] = [
    {
      id: "default-1",
      imageUrl: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=1920&h=600&fit=crop",
      title: "환영합니다",
      subtitle: "다양한 강의를 만나보세요",
    },
  ];

  const bannerSlides = slides.length > 0 ? slides : defaultSlides;

  // 자동 슬라이드
  useEffect(() => {
    if (bannerSlides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [bannerSlides.length, autoPlayInterval]);

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const handleSlideClick = (slide: BannerSlide) => {
    if (slide.linkUrl) {
      window.location.href = slide.linkUrl;
    }
  };

  return (
    <section className="relative w-full h-[280px] md:h-[350px] lg:h-[420px] overflow-hidden bg-black">
      {/* 슬라이드 컨테이너 */}
      <div className="relative w-full h-full">
        {bannerSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
            onClick={() => handleSlideClick(slide)}
            style={{ cursor: slide.linkUrl ? "pointer" : "default" }}
          >
            <img
              src={slide.imageUrl}
              alt={slide.title || `Slide ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {/* 오버레이 그라데이션 */}
            {(slide.title || slide.subtitle) && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent">
                <div className="container h-full flex items-end pb-16">
                  <div className="text-white space-y-4">
                    {slide.title && (
                      <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold">
                        {slide.title}
                      </h2>
                    )}
                    {slide.subtitle && (
                      <p className="text-lg md:text-xl text-white/90">
                        {slide.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 이전/다음 버튼 (슬라이드가 2개 이상일 때만 표시) */}
      {bannerSlides.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-full transition-all"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-full transition-all"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* 인디케이터 (슬라이드가 2개 이상일 때만 표시) */}
      {bannerSlides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {bannerSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide
                  ? "bg-white w-8"
                  : "bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
