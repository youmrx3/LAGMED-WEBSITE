"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocaleStore } from "@/lib/store";
import { LanguageSwitcher } from "./language-switcher";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLocaleStore();
  const router = useRouter();
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/shop", label: t("nav.shop") },
    { href: "/#about", label: t("nav.about"), isHash: true },
    { href: "/#contact", label: t("nav.contact"), isHash: true },
  ];

  const handleNavClick = (link: { href: string; isHash?: boolean }) => {
    // Close mobile menu
    setIsOpen(false);

    // If it's a hash link and we're not on home, navigate to home first
    if (link.isHash && pathname !== "/") {
      router.push("/" + link.href);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center">
          <Image src="/logo-navy.png" alt="LAGMED" width={140} height={48} className="object-contain h-10 w-auto" priority />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => handleNavClick(link)}
              className="text-sm font-medium text-gray-600 hover:text-navy-600 transition-colors"
            >
              {link.label}
            </Link>
          ))}
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
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => handleNavClick(link)}
                  className="block text-sm font-medium text-gray-600 hover:text-navy-600 py-2"
                >
                  {link.label}
                </Link>
              ))}
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
