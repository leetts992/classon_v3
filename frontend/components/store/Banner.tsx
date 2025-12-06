"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface BannerProps {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  ctaText?: string;
  ctaLink?: string;
}

export default function Banner({
  title,
  subtitle,
  imageUrl,
  ctaText = "전체 강의 보기",
  ctaLink = "/courses",
}: BannerProps) {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
                {subtitle}
              </p>
            )}
            <Button size="lg" asChild>
              <a href={ctaLink}>
                {ctaText}
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </motion.div>

          {/* Image or Gradient Box */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative aspect-video lg:aspect-square rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/10"
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Hide image on error, show gradient background
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-6xl opacity-20">🎓</div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 -z-10 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-0 left-0 -z-10 h-96 w-96 rounded-full bg-secondary/5 blur-3xl" />
    </section>
  );
}
