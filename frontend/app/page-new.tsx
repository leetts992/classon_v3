"use client";

import { motion } from "framer-motion";
import { ArrowRight, Palette, CreditCard, BarChart3, Zap, Shield, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";

const features = [
  {
    icon: Palette,
    title: "커스터마이징",
    description: "나만의 브랜드 색상, 로고, 배너로 스토어를 꾸미세요",
    gradient: "from-yellow-400 to-orange-500",
    bg: "from-yellow-50 to-orange-50",
    border: "border-yellow-200",
  },
  {
    icon: CreditCard,
    title: "결제 연동",
    description: "아임포트/토스 페이먼츠로 쉽고 안전한 결제",
    gradient: "from-blue-400 to-cyan-500",
    bg: "from-blue-50 to-cyan-50",
    border: "border-blue-200",
  },
  {
    icon: BarChart3,
    title: "실시간 분석",
    description: "매출, 방문자, 판매 통계를 한눈에 확인",
    gradient: "from-pink-400 to-purple-500",
    bg: "from-pink-50 to-purple-50",
    border: "border-pink-200",
  },
  {
    icon: Zap,
    title: "5분 만에 오픈",
    description: "복잡한 설정 없이 빠르게 스토어 시작",
    gradient: "from-green-400 to-emerald-500",
    bg: "from-green-50 to-emerald-50",
    border: "border-green-200",
  },
  {
    icon: Shield,
    title: "안전한 콘텐츠 보호",
    description: "구매자만 접근 가능한 보안 시스템",
    gradient: "from-indigo-400 to-blue-500",
    bg: "from-indigo-50 to-blue-50",
    border: "border-indigo-200",
  },
  {
    icon: Globe,
    title: "서브도메인 제공",
    description: "yourname.class-on.kr 도메인 무료 제공",
    gradient: "from-purple-400 to-pink-500",
    bg: "from-purple-50 to-pink-50",
    border: "border-purple-200",
  },
];

const testimonials = [
  {
    name: "김철수",
    role: "개발 강사",
    content: "설정이 너무 간단해서 놀랐어요! 10분 만에 제 스토어를 오픈했습니다.",
    rating: 5,
  },
  {
    name: "이영희",
    role: "디자인 강사",
    content: "디자인 커스터마이징이 정말 자유로워서 제 브랜드를 잘 표현할 수 있어요.",
    rating: 5,
  },
  {
    name: "박민수",
    role: "마케팅 강사",
    content: "매출 분석 기능이 정말 유용합니다. 학생들 관리도 편해졌어요.",
    rating: 5,
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* Hero Section - Notion Style */}
        <section className="relative overflow-hidden bg-gradient-to-br from-yellow-50 via-blue-50 to-pink-50 py-20 md:py-32">
          {/* Animated gradient orbs - Notion style */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-yellow-400/30 to-transparent rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-br from-blue-400/30 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-gradient-to-br from-pink-400/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />

          <div className="container relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-5xl mx-auto space-y-8"
            >
              {/* Colorful badge */}
              <div className="flex justify-center">
                <span className="inline-flex items-center px-6 py-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold shadow-lg text-sm">
                  ✨ 강사를 위한 올인원 플랫폼
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900">
                5분 만에 나만의
                <br />
                <span className="bg-gradient-to-r from-yellow-500 via-blue-500 to-pink-500 bg-clip-text text-transparent">
                  강의 판매 사이트
                </span>{" "}
                오픈
              </h1>

              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                전자책과 동영상 강의를 쉽게 판매하세요.
                <br />
                복잡한 기술 없이, 누구나 5분이면 충분합니다.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center bg-gradient-to-r from-yellow-400 via-blue-500 to-pink-500 text-white font-bold text-lg px-10 py-5 rounded-2xl shadow-lg shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300"
                >
                  무료로 시작하기
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/demo"
                  className="inline-flex items-center justify-center bg-white text-gray-900 font-semibold text-lg px-10 py-5 rounded-2xl border-2 border-gray-300 hover:border-blue-500 shadow-md transition-all"
                >
                  데모 보기
                </Link>
              </div>

              <div className="pt-12">
                <p className="text-sm text-gray-500 mb-4">
                  이미 <span className="font-bold text-gray-900">1,000명 이상</span>의 강사가 사용 중
                </p>
                <div className="flex justify-center items-center space-x-8 opacity-40">
                  <div className="w-24 h-8 bg-gray-300 rounded-lg" />
                  <div className="w-24 h-8 bg-gray-300 rounded-lg" />
                  <div className="w-24 h-8 bg-gray-300 rounded-lg" />
                  <div className="w-24 h-8 bg-gray-300 rounded-lg" />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section - Colorful Cards */}
        <section className="py-20 md:py-32 bg-white">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-semibold mb-4 text-sm">
                주요 기능
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
                강의 판매에 필요한
                <br />
                모든 기능이 여기에
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                복잡한 설정 없이 클릭 몇 번으로 전문적인 스토어를 만들어보세요
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className={`group bg-gradient-to-br ${feature.bg} border-2 ${feature.border} rounded-3xl p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300`}>
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                      <p className="text-gray-600 text-lg">{feature.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Demo Section */}
        <section className="py-20 md:py-32 bg-gradient-to-br from-purple-50 to-blue-50">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 text-purple-700 font-semibold mb-4 text-sm">
                실제 사례
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
                강사님들의 스토어를
                <br />
                미리 만나보세요
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer border-2 hover:border-blue-500">
                    <div className="aspect-video bg-gradient-to-br from-yellow-100 via-blue-100 to-pink-100 flex items-center justify-center">
                      <span className="text-6xl">🎨</span>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-xl mb-2 text-gray-900">
                        강사 {item}의 스토어
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        전문적인 디자인과 쉬운 관리로 매출 300% 증가
                      </p>
                      <Link
                        href="/demo"
                        className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700"
                      >
                        스토어 방문하기
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 md:py-32 bg-white">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-pink-100 text-pink-700 font-semibold mb-4 text-sm">
                후기
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
                강사님들의 생생한 이야기
              </h2>
              <div className="flex items-center justify-center space-x-2 text-lg">
                <span className="text-yellow-500 text-2xl">★★★★★</span>
                <span className="font-bold text-gray-900">4.9</span>
                <span className="text-gray-600">(243개 리뷰)</span>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full border-2">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex space-x-1 text-yellow-500 text-xl">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <span key={i}>★</span>
                        ))}
                      </div>
                      <p className="text-gray-700 italic text-lg">
                        "{testimonial.content}"
                      </p>
                      <div>
                        <p className="font-semibold text-gray-900">{testimonial.name}</p>
                        <p className="text-sm text-gray-600">
                          {testimonial.role}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-32 bg-gradient-to-r from-yellow-400 via-blue-500 to-pink-500">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center max-w-3xl mx-auto space-y-8"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                지금 바로 시작하세요
              </h2>
              <p className="text-xl text-white/90">
                신용카드 필요 없습니다. 5분이면 충분합니다.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center bg-white text-gray-900 font-bold text-lg px-10 py-5 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                무료로 시작하기
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
