"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocaleStore } from "@/lib/store";
import { LanguageSwitcher } from "./language-switcher";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLocaleStore();
  const pathname = usePathname();
  const router = useRouter();

  const handleHomeClick = () => {
    setIsOpen(false);
    sessionStorage.removeItem("pendingSectionScroll");

    if (pathname === "/") {
      window.scrollTo({ top: 0, behavior: "auto" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      return;
    }

    router.push("/");
  };

  const handleSectionClick = (sectionId: string) => {
    setIsOpen(false);

    // Single source of truth for section navigation across all pages.
    sessionStorage.setItem("pendingSectionScroll", sectionId);

    if (pathname === "/") {
      window.dispatchEvent(new Event("lagmed:scroll-to-pending-section"));
      return;
    }

    router.push("/");
  };

  const navLinks = [
    { type: "link" as const, href: "/", label: t("nav.home") },
    { type: "link" as const, href: "/shop", label: t("nav.shop") },
    { type: "section" as const, section: "about", label: t("nav.about") },
    { type: "section" as const, section: "contact", label: t("nav.contact") },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <button type="button" className="flex items-center" onClick={handleHomeClick}>
          <Image src="/logo%20v2-06.png" alt="GL MEDICAL" width={140} height={48} className="object-contain h-10 w-auto" priority />
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            if (link.type === "link" && link.href === "/") {
              return (
                <button
                  key={link.href}
                  type="button"
                  onClick={handleHomeClick}
                  className="text-sm font-medium text-gray-600 hover:text-navy-600 transition-colors cursor-pointer"
                >
                  {link.label}
                </button>
              );
            }

            if (link.type === "section") {
              return (
                <button
                  key={link.label}
                  onClick={() => handleSectionClick(link.section)}
                  className="text-sm font-medium text-gray-600 hover:text-navy-600 transition-colors cursor-pointer"
                >
                  {link.label}
                </button>
              );
            }
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => {
                  if (link.href === "/") {
                    handleHomeClick();
                    return;
                  }
                  setIsOpen(false);
                }}
                className="text-sm font-medium text-gray-600 hover:text-navy-600 transition-colors"
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher />
          <Link href="/quote">
            <Button>{t("product.request_quote")}</Button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-100 bg-white"
          >
            <div className="container mx-auto px-4 py-4 space-y-3">
              {navLinks.map((link) => {
                if (link.type === "link" && link.href === "/") {
                  return (
                    <button
                      key={link.href}
                      type="button"
                      onClick={handleHomeClick}
                      className="block text-sm font-medium text-gray-600 hover:text-navy-600 py-2 w-full text-left"
                    >
                      {link.label}
                    </button>
                  );
                }

                if (link.type === "section") {
                  return (
                    <button
                      key={link.label}
                      onClick={() => handleSectionClick(link.section)}
                      className="block text-sm font-medium text-gray-600 hover:text-navy-600 py-2 w-full text-left"
                    >
                      {link.label}
                    </button>
                  );
                }
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => {
                      if (link.href === "/") {
                        handleHomeClick();
                        return;
                      }
                      setIsOpen(false);
                    }}
                    className="block text-sm font-medium text-gray-600 hover:text-navy-600 py-2"
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="flex items-center gap-3 pt-2">
                <LanguageSwitcher />
                <Link href="/quote" className="flex-1">
                  <Button className="w-full">{t("product.request_quote")}</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
