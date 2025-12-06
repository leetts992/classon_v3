"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Building, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { authAPI } from "@/lib/api";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

function SignupContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const defaultTab = searchParams.get("type") === "instructor" ? "instructor" : "user";

  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const [instructorForm, setInstructorForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    subdomain: "",
    storeName: "",
    agreeTerms: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userForm.password !== userForm.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다");
      return;
    }
    if (!userForm.agreeTerms) {
      setError("이용약관에 동의해주세요");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await authAPI.signupUser({
        email: userForm.email,
        password: userForm.password,
        full_name: userForm.name,
      });

      alert("회원가입이 완료되었습니다!");
      router.push("/login");
    } catch (err: any) {
      setError(err.message || "회원가입 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstructorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (instructorForm.password !== instructorForm.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다");
      return;
    }
    if (!instructorForm.agreeTerms) {
      setError("이용약관에 동의해주세요");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await authAPI.signupInstructor({
        email: instructorForm.email,
        password: instructorForm.password,
        full_name: instructorForm.name,
        subdomain: instructorForm.subdomain,
        store_name: instructorForm.storeName,
      });

      alert("강사 회원가입이 완료되었습니다!");
      router.push("/login");
    } catch (err: any) {
      setError(err.message || "회원가입 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-gray-900">Class-On</h1>
          </Link>
          <p className="text-gray-600 mt-2">강의 판매 플랫폼</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>회원가입</CardTitle>
            <CardDescription>
              이미 계정이 있으신가요?{" "}
              <Link href="/login" className="text-blue-600 hover:underline">
                로그인
              </Link>
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">
                {error}
              </div>
            )}

            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="user">
                  <User className="mr-2 h-4 w-4" />
                  사용자
                </TabsTrigger>
                <TabsTrigger value="instructor">
                  <Building className="mr-2 h-4 w-4" />
                  강사
                </TabsTrigger>
              </TabsList>

              {/* User Signup */}
              <TabsContent value="user">
                <form onSubmit={handleUserSubmit} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <label htmlFor="user-name" className="text-sm font-medium">
                      이름
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="user-name"
                        type="text"
                        placeholder="홍길동"
                        value={userForm.name}
                        onChange={(e) =>
                          setUserForm({ ...userForm, name: e.target.value })
                        }
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="user-email" className="text-sm font-medium">
                      이메일
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="user-email"
                        type="email"
                        placeholder="your@email.com"
                        value={userForm.email}
                        onChange={(e) =>
                          setUserForm({ ...userForm, email: e.target.value })
                        }
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="user-password" className="text-sm font-medium">
                      비밀번호
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="user-password"
                        type="password"
                        placeholder="••••••••"
                        value={userForm.password}
                        onChange={(e) =>
                          setUserForm({ ...userForm, password: e.target.value })
                        }
                        className="pl-10"
                        required
                        minLength={8}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      최소 8자 이상
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="user-confirm-password"
                      className="text-sm font-medium"
                    >
                      비밀번호 확인
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="user-confirm-password"
                        type="password"
                        placeholder="••••••••"
                        value={userForm.confirmPassword}
                        onChange={(e) =>
                          setUserForm({
                            ...userForm,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="user-terms"
                      checked={userForm.agreeTerms}
                      onCheckedChange={(checked) =>
                        setUserForm({
                          ...userForm,
                          agreeTerms: checked as boolean,
                        })
                      }
                    />
                    <label
                      htmlFor="user-terms"
                      className="text-sm text-muted-foreground cursor-pointer"
                    >
                      <Link href="/terms" className="text-blue-600 hover:underline">
                        이용약관
                      </Link>
                      {" "}및{" "}
                      <Link href="/privacy" className="text-blue-600 hover:underline">
                        개인정보처리방침
                      </Link>
                      에 동의합니다
                    </label>
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        회원가입 중...
                      </>
                    ) : (
                      <>
                        회원가입
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Instructor Signup */}
              <TabsContent value="instructor">
                <form onSubmit={handleInstructorSubmit} className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="inst-name" className="text-sm font-medium">
                        이름
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="inst-name"
                          type="text"
                          placeholder="홍길동"
                          value={instructorForm.name}
                          onChange={(e) =>
                            setInstructorForm({
                              ...instructorForm,
                              name: e.target.value,
                            })
                          }
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="inst-email" className="text-sm font-medium">
                        이메일
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="inst-email"
                          type="email"
                          placeholder="your@email.com"
                          value={instructorForm.email}
                          onChange={(e) =>
                            setInstructorForm({
                              ...instructorForm,
                              email: e.target.value,
                            })
                          }
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="subdomain" className="text-sm font-medium">
                      서브도메인
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="subdomain"
                        type="text"
                        placeholder="yourname"
                        value={instructorForm.subdomain}
                        onChange={(e) =>
                          setInstructorForm({
                            ...instructorForm,
                            subdomain: e.target.value.toLowerCase(),
                          })
                        }
                        pattern="[a-z0-9-]+"
                        required
                      />
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        .class-on.kr
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      영문 소문자, 숫자, 하이픈(-) 사용 가능
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="store-name" className="text-sm font-medium">
                      스토어 이름
                    </label>
                    <Input
                      id="store-name"
                      type="text"
                      placeholder="홍길동의 개발 강의"
                      value={instructorForm.storeName}
                      onChange={(e) =>
                        setInstructorForm({
                          ...instructorForm,
                          storeName: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="inst-password" className="text-sm font-medium">
                        비밀번호
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="inst-password"
                          type="password"
                          placeholder="••••••••"
                          value={instructorForm.password}
                          onChange={(e) =>
                            setInstructorForm({
                              ...instructorForm,
                              password: e.target.value,
                            })
                          }
                          className="pl-10"
                          required
                          minLength={8}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="inst-confirm-password"
                        className="text-sm font-medium"
                      >
                        비밀번호 확인
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="inst-confirm-password"
                          type="password"
                          placeholder="••••••••"
                          value={instructorForm.confirmPassword}
                          onChange={(e) =>
                            setInstructorForm({
                              ...instructorForm,
                              confirmPassword: e.target.value,
                            })
                          }
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="inst-terms"
                      checked={instructorForm.agreeTerms}
                      onCheckedChange={(checked) =>
                        setInstructorForm({
                          ...instructorForm,
                          agreeTerms: checked as boolean,
                        })
                      }
                    />
                    <label
                      htmlFor="inst-terms"
                      className="text-sm text-muted-foreground cursor-pointer"
                    >
                      <Link href="/terms" className="text-blue-600 hover:underline">
                        이용약관
                      </Link>
                      {" "}및{" "}
                      <Link href="/privacy" className="text-blue-600 hover:underline">
                        개인정보처리방침
                      </Link>
                      에 동의합니다
                    </label>
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        회원가입 중...
                      </>
                    ) : (
                      <>
                        강사 회원가입
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}


export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupContent />
    </Suspense>
  );
}
