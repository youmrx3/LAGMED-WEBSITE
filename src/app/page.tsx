"use client";

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