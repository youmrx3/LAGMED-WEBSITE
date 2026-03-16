"use client";

import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { useLocaleStore } from "@/lib/store";

const partners = [
  {
    name: "LAGMED BBA - Siège",
    name_fr: "LAGMED BBA - Siège",
    name_ar: "لاقمد برج بوعريريج - المقر الرئيسي",
    city: "Bordj Bou Arreridj",
    city_ar: "برج بوعريريج",
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&q=80",
  },
  {
    name: "LAGMED Algiers",
    name_fr: "LAGMED Alger",
    name_ar: "لاقمد الجزائر العاصمة",
    city: "Algiers",
    city_ar: "الجزائر",
    image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400&q=80",
  },
  {
    name: "LAGMED Constantine",
    name_fr: "LAGMED Constantine",
    name_ar: "لاقمد قسنطينة",
    city: "Constantine",
    city_ar: "قسنطينة",
    image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&q=80",
  },
  {
    name: "LAGMED Oran",
    name_fr: "LAGMED Oran",
    name_ar: "لاقمد وهران",
    city: "Oran",
    city_ar: "وهران",
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400&q=80",
  },
  {
    name: "LAGMED Sétif",
    name_fr: "LAGMED Sétif",
    name_ar: "لاقمد سطيف",
    city: "Sétif",
    city_ar: "سطيف",
    image: "https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=400&q=80",
  },
  {
    name: "LAGMED Batna",
    name_fr: "LAGMED Batna",
    name_ar: "لاقمد باتنة",
    city: "Batna",
    city_ar: "باتنة",
    image: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=400&q=80",
  },
];

export function PartnersSection() {
  const { t, locale } = useLocaleStore();

  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <p className="text-navy-600 font-semibold text-sm uppercase tracking-wider mb-2">
            {t("partners.subtitle")}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            {t("partners.title")}
          </h2>
        </motion.div>
      </div>

      {/* Infinite scrolling marquee */}
      <div className="relative">
        {/* Gradient masks */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10" />

        <motion.div
          className="flex gap-6"
          animate={{ x: locale === "ar" ? ["0%", "50%"] : ["0%", "-50%"] }}
          transition={{
            x: { duration: 30, repeat: Infinity, ease: "linear" },
          }}
        >
          {/* Double the items for seamless loop */}
          {[...partners, ...partners].map((partner, i) => {
            const name =
              locale === "ar"
                ? partner.name_ar
                : locale === "fr"
                  ? partner.name_fr
                  : partner.name;
            const city = locale === "ar" ? partner.city_ar : partner.city;

            return (
              <div
                key={i}
                className="flex-shrink-0 w-72 group cursor-pointer"
              >
                <div className="relative rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className="h-44 overflow-hidden">
                    <div
                      className="h-full w-full bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                      style={{ backgroundImage: `url(${partner.image})` }}
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="font-bold text-base">{name}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-200 mt-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {city}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
