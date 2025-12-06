"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import StoreHeader from "@/components/store/StoreHeader";
import StoreFooter from "@/components/store/StoreFooter";
import { publicStoreAPI, StoreInfo } from "@/lib/api";
import { BookOpen, Video, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MyCourse {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  type: string;
  purchased_at: string;
  progress?: number;
}

export default function MyCoursesPage() {
  const params = useParams();
  const router = useRouter();
  const subdomain = params.subdomain as string;

  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [courses, setCourses] = useState<MyCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (subdomain) {
      checkLoginStatus();
      fetchStoreInfo();
      loadMyCourses();
    }
  }, [subdomain]);

  const checkLoginStatus = () => {
    const token = localStorage.getItem("customer_token");
    const storedSubdomain = localStorage.getItem("customer_subdomain");

    if (token && storedSubdomain === subdomain) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
      router.push(`/${subdomain}/login?redirect=/my-courses`);
    }
  };

  const fetchStoreInfo = async () => {
    try {
      const data = await publicStoreAPI.getStoreInfo(subdomain);
      setStoreInfo(data);
    } catch (error) {
      console.error("Failed to fetch store info:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMyCourses = () => {
    // TODO: 백엔드에서 구매한 강의 목록 가져오기
    // 임시로 localStorage에서 로드
    const savedCourses = localStorage.getItem(`my_courses_${subdomain}`);
    if (savedCourses) {
      setCourses(JSON.parse(savedCourses));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600">로딩 중...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <StoreHeader storeName={storeInfo?.store_name || "내 스토어"} />

      <main className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">내 강의</h1>
            <p className="text-gray-600">
              구매한 강의 {courses.length}개
            </p>
          </div>

          {courses.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-lg shadow-sm p-16 text-center">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2 text-gray-900">
                구매한 강의가 없습니다
              </h2>
              <p className="text-gray-600 mb-6">
                관심있는 강의를 구매하고 학습을 시작해보세요
              </p>
              <Button
                onClick={() => router.push(`/${subdomain}`)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                강의 둘러보기
              </Button>
            </div>
          ) : (
            /* Courses Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() =>
                    router.push(`/${subdomain}/my-courses/${course.id}`)
                  }
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-gray-200">
                    <img
                      src={
                        course.thumbnail ||
                        "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=600&fit=crop"
                      }
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    {/* Progress Bar */}
                    {course.progress !== undefined && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-300">
                        <div
                          className="h-full bg-blue-600 transition-all"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    {/* Type Badge */}
                    <div className="flex items-center gap-2 mb-2">
                      {course.type === "video" ? (
                        <Video className="h-4 w-4 text-blue-600" />
                      ) : (
                        <BookOpen className="h-4 w-4 text-green-600" />
                      )}
                      <span className="text-xs font-medium text-gray-600">
                        {course.type === "video" ? "동영상 강의" : "전자책"}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                      {course.title}
                    </h3>

                    {/* Description */}
                    {course.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {course.description}
                      </p>
                    )}

                    {/* Progress */}
                    {course.progress !== undefined && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <Clock className="h-4 w-4" />
                        <span>{course.progress}% 완료</span>
                      </div>
                    )}

                    {/* Purchase Date */}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>구매일: {formatDate(course.purchased_at)}</span>
                    </div>

                    {/* Continue Button */}
                    <Button
                      className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/${subdomain}/my-courses/${course.id}`);
                      }}
                    >
                      {course.progress && course.progress > 0
                        ? "이어서 학습하기"
                        : "학습 시작하기"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {storeInfo && <StoreFooter storeInfo={storeInfo} />}
    </div>
  );
}
