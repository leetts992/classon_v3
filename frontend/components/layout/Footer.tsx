import Link from "next/link";
import { Facebook, Instagram, Youtube, Twitter } from "lucide-react";

interface FooterProps {
  storeName?: string;
  socialLinks?: {
    instagram?: string;
    youtube?: string;
    twitter?: string;
    facebook?: string;
  };
  footerText?: string;
}

export default function Footer({
  storeName = "Class-On",
  socialLinks,
  footerText,
}: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{storeName}</h3>
            <p className="text-sm text-muted-foreground">
              {footerText || "전자책과 동영상 강의로 성장하세요"}
            </p>
            {/* Social Links */}
            {socialLinks && (
              <div className="flex space-x-4">
                {socialLinks.instagram && (
                  <Link
                    href={socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Instagram className="h-5 w-5" />
                  </Link>
                )}
                {socialLinks.youtube && (
                  <Link
                    href={socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Youtube className="h-5 w-5" />
                  </Link>
                )}
                {socialLinks.twitter && (
                  <Link
                    href={socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Twitter className="h-5 w-5" />
                  </Link>
                )}
                {socialLinks.facebook && (
                  <Link
                    href={socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Facebook className="h-5 w-5" />
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">빠른 링크</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/courses" className="hover:text-foreground transition-colors">
                  강의 목록
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors">
                  소개
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground transition-colors">
                  문의하기
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">고객 지원</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/faq" className="hover:text-foreground transition-colors">
                  자주 묻는 질문
                </Link>
              </li>
              <li>
                <Link href="/refund" className="hover:text-foreground transition-colors">
                  환불 정책
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-foreground transition-colors">
                  고객센터
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">법률 정보</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  이용약관
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  개인정보처리방침
                </Link>
              </li>
              <li>
                <Link href="/business" className="hover:text-foreground transition-colors">
                  사업자 정보
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {currentYear} {storeName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
