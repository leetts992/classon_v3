"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, CheckCircle2, Circle, Bookmark, BookmarkCheck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ebookCustomerAPI, EbookStructure, EbookSection, UserEbookProgress } from "@/lib/api";
import TiptapEditor from "@/components/ebook/TiptapEditor";

export default function EbookViewerPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const subdomain = params.subdomain as string;

  const [loading, setLoading] = useState(true);
  const [structure, setStructure] = useState<EbookStructure | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [currentSection, setCurrentSection] = useState<EbookSection | null>(null);
  const [progressList, setProgressList] = useState<UserEbookProgress[]>([]);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  // Watermark - 사용자 이메일
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    // 로컬 스토리지에서 사용자 이메일 가져오기
    const email = localStorage.getItem("user_email");
    setUserEmail(email || "");

    fetchData();
  }, [productId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [structureData, progressData, bookmarksData] = await Promise.all([
        ebookCustomerAPI.getEbookStructure(productId),
        ebookCustomerAPI.getProductProgress(productId),
        ebookCustomerAPI.getProductBookmarks(productId),
      ]);

      setStructure(structureData);
      setProgressList(progressData);
      setBookmarks(new Set(bookmarksData.map((b) => b.section_id)));

      // 첫 번째 챕터를 자동으로 펼치고 첫 섹션 선택
      if (structureData.chapters.length > 0) {
        const firstChapter = structureData.chapters[0];
        setExpandedChapters(new Set([firstChapter.id]));

        if (firstChapter.sections && firstChapter.sections.length > 0) {
          await selectSection(firstChapter.sections[0].id);
        }
      }
    } catch (error: any) {
      console.error("Failed to fetch data:", error);
      if (error.message.includes("purchase")) {
        alert("이 전자책을 구매하지 않았습니다.");
        router.push(`/${subdomain}/my-courses`);
      } else {
        alert(error.message || "데이터를 불러오는데 실패했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleChapter = (chapterId: string) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  const selectSection = async (sectionId: string) => {
    try {
      const sectionData = await ebookCustomerAPI.getSectionContent(sectionId);
      setCurrentSection(sectionData);

      // 진행률 업데이트 (읽음 처리)
      await ebookCustomerAPI.updateProgress(sectionId, {
        is_completed: false,
        reading_progress: 0,
      });

      // 진행률 목록 갱신
      const updatedProgress = await ebookCustomerAPI.getProductProgress(productId);
      setProgressList(updatedProgress);
    } catch (error: any) {
      console.error("Failed to load section:", error);
      alert(error.message || "섹션을 불러오는데 실패했습니다.");
    }
  };

  const toggleComplete = async (sectionId: string) => {
    const progress = progressList.find((p) => p.section_id === sectionId);
    const isCompleted = progress?.is_completed || false;

    try {
      await ebookCustomerAPI.updateProgress(sectionId, {
        is_completed: !isCompleted,
        reading_progress: !isCompleted ? 100 : 0,
      });

      // 진행률 목록 갱신
      const updatedProgress = await ebookCustomerAPI.getProductProgress(productId);
      setProgressList(updatedProgress);
    } catch (error: any) {
      console.error("Failed to update progress:", error);
    }
  };

  const toggleBookmark = async (sectionId: string) => {
    try {
      if (bookmarks.has(sectionId)) {
        // 북마크 제거
        const bookmarkList = await ebookCustomerAPI.getProductBookmarks(productId);
        const bookmark = bookmarkList.find((b) => b.section_id === sectionId);
        if (bookmark) {
          await ebookCustomerAPI.deleteBookmark(bookmark.id);
          const newBookmarks = new Set(bookmarks);
          newBookmarks.delete(sectionId);
          setBookmarks(newBookmarks);
        }
      } else {
        // 북마크 추가
        await ebookCustomerAPI.createBookmark(sectionId, {});
        setBookmarks(new Set([...bookmarks, sectionId]));
      }
    } catch (error: any) {
      console.error("Failed to toggle bookmark:", error);
    }
  };

  const getSectionProgress = (sectionId: string) => {
    return progressList.find((p) => p.section_id === sectionId);
  };

  const calculateProgress = () => {
    if (!structure) return 0;
    const totalSections = structure.chapters.reduce((acc, ch) => acc + (ch.sections?.length || 0), 0);
    const completedSections = progressList.filter((p) => p.is_completed).length;
    return totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  if (!structure) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">전자책을 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b p-4 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/${subdomain}/my-courses`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              뒤로
            </Button>
            <div>
              <h1 className="text-xl font-bold">{structure.product_title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Progress value={calculateProgress()} className="w-32 h-2" />
                <span className="text-sm text-muted-foreground">{calculateProgress()}% 완료</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Table of Contents */}
        <div className="w-80 border-r bg-gray-50 overflow-y-auto">
          <div className="p-4">
            <h2 className="font-bold text-lg mb-4">목차</h2>
            <div className="space-y-2">
              {structure.chapters.map((chapter) => (
                <div key={chapter.id} className="border rounded-lg bg-white">
                  <button
                    className="w-full p-3 flex items-center justify-between text-left hover:bg-gray-50"
                    onClick={() => toggleChapter(chapter.id)}
                  >
                    <div className="flex items-center gap-2">
                      {expandedChapters.has(chapter.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <span className="font-semibold text-sm">{chapter.title}</span>
                    </div>
                  </button>

                  {expandedChapters.has(chapter.id) && (
                    <div className="border-t">
                      {chapter.sections?.map((section) => {
                        const progress = getSectionProgress(section.id);
                        const isCompleted = progress?.is_completed || false;
                        const isBookmarked = bookmarks.has(section.id);
                        const isCurrent = currentSection?.id === section.id;

                        return (
                          <div
                            key={section.id}
                            className={`px-3 py-2 border-b last:border-b-0 ${
                              isCurrent ? "bg-blue-50" : "hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <button
                                className="flex items-center gap-2 flex-1 text-left"
                                onClick={() => selectSection(section.id)}
                              >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleComplete(section.id);
                                  }}
                                  className="flex-shrink-0"
                                >
                                  {isCompleted ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <Circle className="h-4 w-4 text-gray-400" />
                                  )}
                                </button>
                                <span className="text-sm flex-1">{section.title}</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleBookmark(section.id);
                                }}
                                className="flex-shrink-0 ml-2"
                              >
                                {isBookmarked ? (
                                  <BookmarkCheck className="h-4 w-4 text-yellow-600" />
                                ) : (
                                  <Bookmark className="h-4 w-4 text-gray-400" />
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Content Area - Ebook Content */}
        <div className="flex-1 overflow-y-auto p-6 relative">
          {/* Watermark */}
          {userEmail && (
            <>
              <div className="fixed top-20 left-1/2 -translate-x-1/2 text-gray-300/30 text-sm font-mono pointer-events-none z-10 rotate-[-15deg]">
                {userEmail}
              </div>
              <div className="fixed bottom-20 right-20 text-gray-300/30 text-sm font-mono pointer-events-none z-10 rotate-[15deg]">
                {userEmail}
              </div>
              <div className="fixed top-1/2 left-1/4 text-gray-300/20 text-xs font-mono pointer-events-none z-10 rotate-[-25deg]">
                {userEmail}
              </div>
              <div className="fixed top-1/3 right-1/4 text-gray-300/20 text-xs font-mono pointer-events-none z-10 rotate-[25deg]">
                {userEmail}
              </div>
            </>
          )}

          {currentSection ? (
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <h2 className="text-3xl font-bold mb-2">{currentSection.title}</h2>
                {currentSection.is_free && (
                  <span className="inline-block text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    무료 미리보기
                  </span>
                )}
              </div>
              <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none">
                <TiptapEditor content={currentSection.content} editable={false} />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <p className="text-lg">왼쪽 목차에서 섹션을 선택하세요</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
