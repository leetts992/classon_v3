"use client";

import { useState } from "react";
import { X, ChevronDown } from "lucide-react";
import { Label } from "@/components/ui/label";

interface ProductOption {
  name: string;
  price?: number;
  description?: string;
}

interface AdditionalOption {
  name: string;
  price: number;
  description?: string;
}

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  productTitle: string;
  basePrice: number;
  productOptions?: ProductOption[];
  additionalOptions?: AdditionalOption[];
  onPurchase: (selectedOption: string, selectedAdditional: string[]) => void;
}

export default function PurchaseModal({
  isOpen,
  onClose,
  productTitle,
  basePrice,
  productOptions,
  additionalOptions,
  onPurchase,
}: PurchaseModalProps) {
  const [selectedOption, setSelectedOption] = useState("");
  const [selectedAdditionalOptions, setSelectedAdditionalOptions] = useState<string[]>([]);

  if (!isOpen) return null;

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()}원`;
  };

  // Calculate total price
  const calculateTotalPrice = () => {
    let total = basePrice;

    // Add selected product option price
    if (selectedOption && productOptions) {
      const option = productOptions.find((opt) => opt.name === selectedOption);
      if (option && option.price) {
        total = option.price;
      }
    }

    // Add additional options prices
    if (additionalOptions) {
      selectedAdditionalOptions.forEach((optName) => {
        const option = additionalOptions.find((opt) => opt.name === optName);
        if (option) {
          total += option.price;
        }
      });
    }

    return total;
  };

  const handlePurchase = () => {
    if (productOptions && productOptions.length > 0 && !selectedOption) {
      alert("강의 상품을 선택해주세요!");
      return;
    }
    onPurchase(selectedOption, selectedAdditionalOptions);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[1px]">
      {/* Modal Container */}
      <div className="w-full max-w-md bg-white rounded-t-2xl shadow-xl animate-slide-up max-h-[70vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">강의 상품</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Product Title */}
          <div>
            <h3 className="text-base font-bold text-gray-900">{productTitle}</h3>
          </div>

          {/* Product Options */}
          {productOptions && productOptions.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="productOption" className="text-sm font-medium text-gray-700">
                강의 상품
              </Label>
              <div className="relative">
                <select
                  id="productOption"
                  value={selectedOption}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-[#FF8547] focus:border-transparent text-sm"
                >
                  <option value="">선택해주세요</option>
                  {productOptions.map((opt, idx) => (
                    <option key={idx} value={opt.name}>
                      {opt.name}
                      {opt.description && ` (${opt.description})`}
                      {opt.price && ` - ${formatPrice(opt.price)}`}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Additional Options */}
          {additionalOptions && additionalOptions.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">
                옵션 (선택)
              </Label>
              <div className="space-y-2">
                {additionalOptions.map((opt, idx) => (
                  <div key={idx} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:border-[#FF8547] transition-colors">
                    <input
                      type="checkbox"
                      id={`addon-${idx}`}
                      checked={selectedAdditionalOptions.includes(opt.name)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAdditionalOptions([...selectedAdditionalOptions, opt.name]);
                        } else {
                          setSelectedAdditionalOptions(selectedAdditionalOptions.filter(n => n !== opt.name));
                        }
                      }}
                      className="mt-0.5 w-5 h-5 text-[#FF8547] border-gray-300 rounded focus:ring-[#FF8547]"
                    />
                    <label htmlFor={`addon-${idx}`} className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">{opt.name}</span>
                        <span className="text-sm font-bold text-gray-900">+{formatPrice(opt.price)}</span>
                      </div>
                      {opt.description && (
                        <span className="text-xs text-gray-500">{opt.description}</span>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Total Price */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">
                {selectedOption || "기본 상품"}
              </span>
              <span className="text-sm font-medium text-gray-900">
                {formatPrice(selectedOption && productOptions
                  ? (productOptions.find(opt => opt.name === selectedOption)?.price || basePrice)
                  : basePrice)}
              </span>
            </div>

            {selectedAdditionalOptions.length > 0 && (
              <>
                {selectedAdditionalOptions.map((optName, idx) => {
                  const option = additionalOptions?.find(opt => opt.name === optName);
                  return option ? (
                    <div key={idx} className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">{option.name}</span>
                      <span className="text-sm font-medium text-gray-900">
                        +{formatPrice(option.price)}
                      </span>
                    </div>
                  ) : null;
                })}
              </>
            )}

            <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-200">
              <span className="text-base font-bold text-gray-900">총 결제 금액</span>
              <span className="text-xl font-bold text-[#FF8547]">
                {formatPrice(calculateTotalPrice())}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handlePurchase}
            className="w-full bg-[#FF8547] hover:bg-[#FF7035] text-white font-bold py-2.5 px-6 rounded-lg transition-colors text-base"
          >
            강의 구매하기
          </button>
        </div>
      </div>
    </div>
  );
}
