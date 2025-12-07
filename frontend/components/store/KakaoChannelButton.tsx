"use client";

import { useEffect } from "react";

interface KakaoChannelButtonProps {
  channelId: string;
}

export default function KakaoChannelButton({ channelId }: KakaoChannelButtonProps) {
  useEffect(() => {
    if (!channelId) return;

    // 카카오 SDK 스크립트 로드
    const script = document.createElement("script");
    script.src = "https://developers.kakao.com/sdk/js/kakao.js";
    script.async = true;

    script.onload = () => {
      if (window.Kakao && !window.Kakao.isInitialized()) {
        // Kakao JavaScript SDK 초기화 (공개 JavaScript 키 필요)
        // 일단 채널 채팅 URL로 직접 이동하는 방식 사용
      }
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [channelId]);

  if (!channelId) return null;

  const handleClick = () => {
    // 카카오톡 채널 채팅 URL로 이동
    const channelUrl = `http://pf.kakao.com/${channelId}/chat`;
    window.open(channelUrl, "_blank", "width=400,height=600");
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#FEE500] hover:bg-[#FDD835] rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
      aria-label="카카오톡 상담"
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 3C6.477 3 2 6.477 2 11C2 13.395 3.292 15.534 5.292 16.958L4.292 20.708C4.227 20.952 4.292 21.214 4.461 21.398C4.63 21.583 4.884 21.662 5.123 21.607L9.708 20.458C10.447 20.652 11.214 20.75 12 20.75C17.523 20.75 22 17.273 22 12.75C22 8.227 17.523 4.75 12 4.75V3Z"
          fill="#3C1E1E"
        />
      </svg>
    </button>
  );
}

// TypeScript 타입 확장
declare global {
  interface Window {
    Kakao: any;
  }
}
