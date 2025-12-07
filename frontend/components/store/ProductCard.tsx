"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart, Star, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface ProductCardProps {
  id: string;
  title: string;
  description?: string;
  price: number;
  discountPrice?: number;
  thumbnail: string;
  type: "ebook" | "video";
  rating?: number;
  reviewCount?: number;
  duration?: number; // 동영상 길이 (분)
  subdomain?: string; // For store pages
  onAddToCart?: () => void;
}

export default function ProductCard({
  id,
  title,
  description,
  price,
  discountPrice,
  thumbnail,
  type,
  rating = 0,
  reviewCount = 0,
  duration,
  subdomain,
  onAddToCart,
}: ProductCardProps) {
  const finalPrice = discountPrice || price;
  const discountPercentage = discountPrice
    ? Math.round(((price - discountPrice) / price) * 100)
    : 0;

  // Build product URL - on subdomain pages, use relative path without subdomain prefix
  const productUrl = subdomain ? `/products/${id}` : `/product/${id}`;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col overflow-hidden border hover:border-blue-200 hover:shadow-lg transition-all">
        {/* Thumbnail */}
        <Link href={productUrl}>
          <div className="relative aspect-video overflow-hidden bg-gray-100">
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            {/* Type Badge */}
            <Badge
              className="absolute top-3 left-3 bg-blue-600 text-white border-0"
            >
              {type === "video" ? (
                <>
                  <Clock className="w-3 h-3 mr-1" />
                  {duration ? `${duration}분` : "동영상"}
                </>
              ) : (
                <>
                  <FileText className="w-3 h-3 mr-1" />
                  전자책
                </>
              )}
            </Badge>
            {/* Discount Badge */}
            {discountPercentage > 0 && (
              <Badge
                variant="destructive"
                className="absolute top-3 right-3 font-bold"
              >
                {discountPercentage}% OFF
              </Badge>
            )}
          </div>
        </Link>

        <CardContent className="flex-1 p-4">
          <Link href={productUrl}>
            <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-primary transition-colors">
              {title}
            </h3>
          </Link>

          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {description}
            </p>
          )}

          {/* Rating */}
          {rating > 0 && (
            <div className="flex items-center space-x-1 mb-3">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{rating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">
                ({reviewCount})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline space-x-2">
            {discountPrice ? (
              <>
                <span className="text-2xl font-bold text-primary">
                  ₩{finalPrice.toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground line-through">
                  ₩{price.toLocaleString()}
                </span>
              </>
            ) : (
              <span className="text-2xl font-bold">
                ₩{price.toLocaleString()}
              </span>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Button
            className="w-full"
            onClick={(e) => {
              e.preventDefault();
              onAddToCart?.();
            }}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            장바구니 담기
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
