import React from "react";
import { StoreInfo } from "@/lib/api";

interface StoreFooterProps {
  storeInfo: StoreInfo;
}

export default function StoreFooter({ storeInfo }: StoreFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Store Name */}
        <div className="mb-5">
          <h2 className="text-[24px] font-bold tracking-tight">{storeInfo.store_name}</h2>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left Column - Navigation Links */}
          <div>
            <nav className="flex gap-6 text-[14px] mb-4">
              <a href="#" className="hover:text-gray-300 transition-colors">
                이용약관
              </a>
              <a href="#" className="hover:text-gray-300 transition-colors">
                개인정보처리방침
              </a>
              <a href="#" className="hover:text-gray-300 transition-colors">
                취소환불정책
              </a>
              <a href="#" className="hover:text-gray-300 transition-colors">
                자주하는 질문
              </a>
            </nav>

            {/* Company Information */}
            <div className="space-y-0.5 text-[12px] text-gray-400 leading-relaxed">
              <p>
                {storeInfo.footer_company_name && <span>{storeInfo.footer_company_name}</span>}
                {storeInfo.footer_ceo_name && <span className="ml-4">대표이사 : {storeInfo.footer_ceo_name}</span>}
                {storeInfo.footer_privacy_officer && <span className="ml-2">개인정보관리책임자 : {storeInfo.footer_privacy_officer}</span>}
              </p>
              <p>
                {storeInfo.footer_business_number && <span>사업자등록번호 : {storeInfo.footer_business_number}</span>}
                {storeInfo.footer_sales_number && <span className="ml-2">통신판매업신고번호 : {storeInfo.footer_sales_number}</span>}
              </p>
            </div>
          </div>

          {/* Right Column - Contact Info */}
          <div className="text-[12px] text-gray-400 leading-relaxed">
            {storeInfo.footer_contact && (
              <div className="mb-1">
                <p className="font-semibold text-white text-[14px]">고객센터 : {storeInfo.footer_contact}</p>
              </div>
            )}

            {storeInfo.footer_business_hours && (
              <div className="whitespace-pre-line mb-1">
                {storeInfo.footer_business_hours}
              </div>
            )}

            {storeInfo.footer_address && (
              <div className="whitespace-pre-line">
                {storeInfo.footer_address}
              </div>
            )}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-4 border-t border-gray-800">
          <p className="text-[12px] text-gray-500">
            © {currentYear} {storeInfo.store_name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
