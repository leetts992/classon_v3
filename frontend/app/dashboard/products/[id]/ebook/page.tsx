"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, GripVertical, Trash2, Eye, EyeOff, ChevronDown, ChevronRight, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { productsAPI, ebookInstructorAPI, EbookChapter, EbookSection } from "@/lib/api";
import TiptapEditor from "@/components/ebook/TiptapEditor";

export default function EbookEditorPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [productTitle, setProductTitle] = useState("");
  const [chapters, setChapters] = useState<EbookChapter[]>([]);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [selectedSection, setSelectedSection] = useState<EbookSection | null>(null);
  const [sectionContent, setSectionContent] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Dialog states
  const [showChapterDialog, setShowChapterDialog] = useState(false);
  const [showSectionDialog, setShowSectionDialog] = useState(false);
  const [currentChapterId, setCurrentChapterId] = useState<string | null>(null);
  const [chapterTitle, setChapterTitle] = useState("");
  const [chapterDescription, setChapterDescription] = useState("");
  const [sectionTitle, setSectionTitle] = useState("");
  const [sectionIsFree, setSectionIsFree] = useState(false);

  useEffect(() => {
    fetchData();
  }, [productId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [product, chaptersData] = await Promise.all([
        productsAPI.get(productId),
        ebookInstructorAPI.getProductChapters(productId),
      ]);

      setProductTitle(product.title);
      setChapters(chaptersData);

      // 첫 번째 챕터를 자동으로 펼치기
      if (chaptersData.length > 0) {
        setExpandedChapters(new Set([chaptersData[0].id]));
      }
    } catch (error: any) {
      console.error("Failed to fetch data:", error);
      alert(error.message || "데이터를 불러오는데 실패했습니다.");
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

  const openChapterDialog = () => {
    setChapterTitle("");
    setChapterDescription("");
    setShowChapterDialog(true);
  };

  const createChapter = async () => {
    try {
      const newChapter = await ebookInstructorAPI.createChapter({
        product_id: productId,
        title: chapterTitle,
        description: chapterDescription,
        order_index: chapters.length,
      });
      setChapters([...chapters, { ...newChapter, sections: [] }]);
      setShowChapterDialog(false);
      alert("챕터가 생성되었습니다!");
    } catch (error: any) {
      console.error("Failed to create chapter:", error);
      alert(error.message || "챕터 생성에 실패했습니다.");
    }
  };

  const deleteChapter = async (chapterId: string) => {
    if (!confirm("이 챕터와 모든 섹션을 삭제하시겠습니까?")) return;

    try {
      await ebookInstructorAPI.deleteChapter(chapterId);
      setChapters(chapters.filter((c) => c.id !== chapterId));
      if (selectedSection?.chapter_id === chapterId) {
        setSelectedSection(null);
        setSectionContent(null);
      }
      alert("챕터가 삭제되었습니다!");
    } catch (error: any) {
      console.error("Failed to delete chapter:", error);
      alert(error.message || "챕터 삭제에 실패했습니다.");
    }
  };

  const openSectionDialog = (chapterId: string) => {
    setCurrentChapterId(chapterId);
    setSectionTitle("");
    setSectionIsFree(false);
    setShowSectionDialog(true);
  };

  const createSection = async () => {
    if (!currentChapterId) return;

    try {
      const chapter = chapters.find((c) => c.id === currentChapterId);
      const newSection = await ebookInstructorAPI.createSection({
        chapter_id: currentChapterId,
        title: sectionTitle,
        is_free: sectionIsFree,
        order_index: chapter?.sections?.length || 0,
      });

      // 챕터의 섹션 목록 업데이트
      setChapters(
        chapters.map((c) =>
          c.id === currentChapterId
            ? { ...c, sections: [...(c.sections || []), newSection] }
            : c
        )
      );

      setShowSectionDialog(false);
      alert("섹션이 생성되었습니다!");
    } catch (error: any) {
      console.error("Failed to create section:", error);
      alert(error.message || "섹션 생성에 실패했습니다.");
    }
  };

  const selectSection = (section: EbookSection) => {
    setSelectedSection(section);
    setSectionContent(section.content || null);
  };

  const saveSection = async () => {
    if (!selectedSection) return;

    try {
      setSaving(true);
      await ebookInstructorAPI.updateSection(selectedSection.id, {
        content: sectionContent,
      });
      alert("저장되었습니다!");
    } catch (error: any) {
      console.error("Failed to save section:", error);
      alert(error.message || "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const deleteSection = async (sectionId: string) => {
    if (!confirm("이 섹션을 삭제하시겠습니까?")) return;

    try {
      await ebookInstructorAPI.deleteSection(sectionId);

      // 섹션 목록에서 제거
      setChapters(
        chapters.map((c) => ({
          ...c,
          sections: c.sections?.filter((s) => s.id !== sectionId),
        }))
      );

      if (selectedSection?.id === sectionId) {
        setSelectedSection(null);
        setSectionContent(null);
      }

      alert("섹션이 삭제되었습니다!");
    } catch (error: any) {
      console.error("Failed to delete section:", error);
      alert(error.message || "섹션 삭제에 실패했습니다.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">로딩 중...</p>
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
              onClick={() => router.push(`/dashboard/products/${productId}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              뒤로
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{productTitle}</h1>
              <p className="text-sm text-muted-foreground">전자책 콘텐츠 편집</p>
            </div>
          </div>
          {selectedSection && (
            <Button onClick={saveSection} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "저장 중..." : "저장"}
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Chapter/Section List */}
        <div className="w-80 border-r bg-gray-50 overflow-y-auto">
          <div className="p-4">
            <Button onClick={openChapterDialog} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              챕터 추가
            </Button>
          </div>

          <div className="space-y-2 px-4 pb-4">
            {chapters.map((chapter) => (
              <div key={chapter.id} className="border rounded-lg bg-white">
                <div className="p-3 flex items-center justify-between">
                  <button
                    className="flex items-center gap-2 flex-1 text-left"
                    onClick={() => toggleChapter(chapter.id)}
                  >
                    {expandedChapters.has(chapter.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <span className="font-semibold">{chapter.title}</span>
                  </button>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openSectionDialog(chapter.id)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteChapter(chapter.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                {expandedChapters.has(chapter.id) && (
                  <div className="border-t">
                    {chapter.sections && chapter.sections.length > 0 ? (
                      chapter.sections.map((section) => (
                        <button
                          key={section.id}
                          className={`w-full text-left px-6 py-2 hover:bg-gray-100 flex items-center justify-between ${
                            selectedSection?.id === section.id ? "bg-blue-50" : ""
                          }`}
                          onClick={() => selectSection(section)}
                        >
                          <span className="text-sm">{section.title}</span>
                          <div className="flex items-center gap-1">
                            {section.is_free && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                무료
                              </span>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteSection(section.id);
                              }}
                            >
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-6 py-3 text-sm text-muted-foreground">
                        섹션이 없습니다
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Content Area - Editor */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedSection ? (
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">{selectedSection.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {selectedSection.is_free ? "무료 미리보기 섹션" : "유료 콘텐츠"}
                </p>
              </div>
              <TiptapEditor
                content={sectionContent}
                onChange={setSectionContent}
                editable={true}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <p className="text-lg mb-2">편집할 섹션을 선택하세요</p>
                <p className="text-sm">왼쪽에서 섹션을 클릭하여 시작하세요</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chapter Dialog */}
      <Dialog open={showChapterDialog} onOpenChange={setShowChapterDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>챕터 추가</DialogTitle>
            <DialogDescription>새로운 챕터를 생성합니다</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="chapter-title">챕터 제목 *</Label>
              <Input
                id="chapter-title"
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
                placeholder="예: 1장. 시작하기"
              />
            </div>
            <div>
              <Label htmlFor="chapter-description">챕터 설명</Label>
              <Input
                id="chapter-description"
                value={chapterDescription}
                onChange={(e) => setChapterDescription(e.target.value)}
                placeholder="간단한 설명 (선택사항)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChapterDialog(false)}>
              취소
            </Button>
            <Button onClick={createChapter} disabled={!chapterTitle}>
              생성
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Section Dialog */}
      <Dialog open={showSectionDialog} onOpenChange={setShowSectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>섹션 추가</DialogTitle>
            <DialogDescription>새로운 섹션을 생성합니다</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="section-title">섹션 제목 *</Label>
              <Input
                id="section-title"
                value={sectionTitle}
                onChange={(e) => setSectionTitle(e.target.value)}
                placeholder="예: 1.1 개발 환경 설정"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="section-free"
                checked={sectionIsFree}
                onCheckedChange={setSectionIsFree}
              />
              <Label htmlFor="section-free">무료 미리보기로 설정</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSectionDialog(false)}>
              취소
            </Button>
            <Button onClick={createSection} disabled={!sectionTitle}>
              생성
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
