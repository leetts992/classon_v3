"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Product, ProductType, productsAPI, uploadAPI } from "@/lib/api";
import { Loader2, X, ArrowLeft } from "lucide-react";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(() => import("@/components/rich-text-editor"), {
  ssr: false,
  loading: () => <div className="p-4 bg-gray-50 rounded-lg">에디터 로딩 중...</div>,
});

interface ProductFormProps {
  product?: Product | null;
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [detailedDescription, setDetailedDescription] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [type, setType] = useState<ProductType>("video");
  const [category, setCategory] = useState("");
  const [duration, setDuration] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  // Load product data if editing
  useEffect(() => {
    if (product) {
      setTitle(product.title);
      setDescription(product.description || "");
      setDetailedDescription(product.detailed_description || "");
      setPrice(product.price.toString());
      setDiscountPrice(product.discount_price?.toString() || "");
      setType(product.type);
      setCategory(product.category || "");
      setDuration(product.duration?.toString() || "");
      setThumbnail(product.thumbnail || "");
      setFileUrl(product.file_url || "");
      setIsPublished(product.is_published);
    }
  }, [product]);

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingThumbnail(true);
    setError("");

    try {
      const response = await uploadAPI.uploadImage(file);
      setThumbnail(response.url);
    } catch (err: any) {
      setError(err.message || "썸네일 업로드에 실패했습니다.");
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFile(true);
    setError("");

    try {
      let response;
      if (type === "video") {
        response = await uploadAPI.uploadVideo(file);
      } else {
        response = await uploadAPI.uploadDocument(file);
      }
      setFileUrl(response.url);
    } catch (err: any) {
      setError(err.message || "파일 업로드에 실패했습니다.");
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const data = {
        title,
        description: description || undefined,
        detailed_description: detailedDescription || undefined,
        price: parseInt(price),
        discount_price: discountPrice ? parseInt(discountPrice) : undefined,
        type,
        category: category || undefined,
        duration: duration ? parseInt(duration) : undefined,
        thumbnail: thumbnail || undefined,
        file_url: fileUrl || undefined,
        is_published: isPublished,
      };

      if (product) {
        // Update existing product
        await productsAPI.update(product.id, data);
      } else {
        // Create new product
        await productsAPI.create(data);
      }

      router.push("/dashboard/products");
    } catch (err: any) {
      setError(err.message || "상품 저장에 실패했습니다.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-5xl py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/dashboard/products")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            상품 목록으로
          </Button>
          <h1 className="text-3xl font-bold">
            {product ? "상품 수정" : "새 상품 등록"}
          </h1>
          <p className="text-gray-600 mt-1">
            {product
              ? "상품 정보를 수정하세요."
              : "새로운 강의 또는 전자책을 등록하세요."}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
                <TabsList className="bg-white border border-gray-200">
                  <TabsTrigger value="basic">기본 정보</TabsTrigger>
                  <TabsTrigger value="detail">상세 페이지</TabsTrigger>
                  <TabsTrigger value="files">파일 & 설정</TabsTrigger>
                </TabsList>
              </div>

              {/* Basic Info Tab */}
              <TabsContent value="basic" className="p-6 space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">
                    상품명 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="예: Python 완전정복 강의"
                    required
                    className="bg-white"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">간단한 설명 (목록 표시용)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="상품 목록에 표시될 간단한 설명을 입력하세요"
                    rows={3}
                    className="bg-white"
                  />
                </div>

                {/* Type */}
                <div className="space-y-2">
                  <Label htmlFor="type">
                    상품 유형 <span className="text-red-500">*</span>
                  </Label>
                  <Select value={type} onValueChange={(value) => setType(value as ProductType)}>
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">동영상 강의</SelectItem>
                      <SelectItem value="ebook">전자책</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">카테고리</Label>
                  <Input
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="예: 프로그래밍, 디자인, 마케팅"
                    className="bg-white"
                  />
                </div>

                {/* Price */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">
                      가격 (원) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="49000"
                      required
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discountPrice">할인 가격 (원)</Label>
                    <Input
                      id="discountPrice"
                      type="number"
                      value={discountPrice}
                      onChange={(e) => setDiscountPrice(e.target.value)}
                      placeholder="39000"
                      className="bg-white"
                    />
                  </div>
                </div>

                {/* Duration (for videos) */}
                {type === "video" && (
                  <div className="space-y-2">
                    <Label htmlFor="duration">재생 시간 (분)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="120"
                      className="bg-white"
                    />
                  </div>
                )}
              </TabsContent>

              {/* Detail Page Tab */}
              <TabsContent value="detail" className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label>상세 페이지 내용</Label>
                  <p className="text-sm text-gray-600">
                    이미지를 드래그 앤 드롭하거나 툴바의 이미지 버튼을 클릭하여 추가할 수 있습니다.
                  </p>
                  <RichTextEditor
                    value={detailedDescription}
                    onChange={setDetailedDescription}
                  />
                </div>
              </TabsContent>

              {/* Files & Settings Tab */}
              <TabsContent value="files" className="p-6 space-y-6">
                {/* Thumbnail Upload */}
                <div className="space-y-2">
                  <Label htmlFor="thumbnail">썸네일 이미지</Label>
                  <div className="space-y-3">
                    {thumbnail && (
                      <div className="relative w-full h-64 border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                        <img
                          src={thumbnail}
                          alt="Thumbnail preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setThumbnail("")}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Input
                        id="thumbnail"
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailUpload}
                        disabled={isUploadingThumbnail}
                        className="flex-1 bg-white"
                      />
                      {isUploadingThumbnail && (
                        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                      )}
                    </div>
                  </div>
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                  <Label htmlFor="file">
                    {type === "video" ? "동영상 파일" : "전자책 파일 (PDF)"}
                  </Label>
                  <div className="space-y-3">
                    {fileUrl && (
                      <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                        <span className="text-sm text-green-700 truncate flex-1 mr-2">
                          {fileUrl}
                        </span>
                        <button
                          type="button"
                          onClick={() => setFileUrl("")}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Input
                        id="file"
                        type="file"
                        accept={type === "video" ? "video/*" : ".pdf,.epub"}
                        onChange={handleFileUpload}
                        disabled={isUploadingFile}
                        className="flex-1 bg-white"
                      />
                      {isUploadingFile && (
                        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Publish Toggle */}
                <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <input
                    type="checkbox"
                    id="isPublished"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <Label htmlFor="isPublished" className="cursor-pointer font-medium">
                    스토어에 게시하기
                  </Label>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/products")}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  저장 중...
                </>
              ) : (
                product ? "수정 완료" : "등록하기"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
