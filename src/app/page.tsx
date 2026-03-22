"use client";

import { useEffect } from "react";
import { HeroSection } from "@/components/home/hero-section";
import { AllProductsSection } from "@/components/home/all-products-section";
import { BoutiquesSection } from "@/components/home/boutiques-section";
import { AboutSection } from "@/components/home/about-section";
import { WhyUsSection } from "@/components/home/why-us-section";
import { CategoriesSection } from "@/components/home/categories-section";
import { ProductsSection } from "@/components/home/products-section";
import { BrandsSection } from "@/components/home/brands-section";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { CTASection } from "@/components/home/cta-section";
import { ContactSection } from "@/components/home/contact-section";

export default function HomePage() {
  useEffect(() => {
    const scrollToPendingSection = (smooth = true) => {
      const pendingSection = sessionStorage.getItem("pendingSectionScroll");
      if (!pendingSection) return;

      let attempts = 0;
      const maxAttempts = 40;

      const alignToSection = (behavior: ScrollBehavior) => {
        const element = document.getElementById(pendingSection);
        if (!element) return false;

        const headerOffset = 80;
        const targetY = Math.max(0, element.getBoundingClientRect().top + window.scrollY - headerOffset);
        window.scrollTo({ top: targetY, behavior });
        return true;
      };

      const tryScroll = () => {
        if (alignToSection(smooth ? "smooth" : "auto")) {
          // Correct final position after delayed layout shifts (images/animations).
          window.setTimeout(() => alignToSection("auto"), 250);
          window.setTimeout(() => alignToSection("auto"), 700);
          window.setTimeout(() => alignToSection("auto"), 1300);
          sessionStorage.removeItem("pendingSectionScroll");
          return;
        }

        attempts += 1;
        if (attempts < maxAttempts) {
          window.setTimeout(tryScroll, 90);
        }
      };

      window.setTimeout(tryScroll, 60);
    };

    scrollToPendingSection(false);

    const onScrollRequest = () => scrollToPendingSection(true);
    window.addEventListener("lagmed:scroll-to-pending-section", onScrollRequest);

    return () => {
      window.removeEventListener("lagmed:scroll-to-pending-section", onScrollRequest);
    };
  }, []);

  return (
    <>
      <HeroSection />
      <AllProductsSection />
      <CategoriesSection />
      <BoutiquesSection />
      <ProductsSection type="best_seller" />
      <ProductsSection type="new" />
      <AboutSection />
      <WhyUsSection />
      <BrandsSection />
      <TestimonialsSection />
      <CTASection />
      <ContactSection />
    </>
  );
}