"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Navigation, Building2, Clock, ChevronLeft, ChevronRight, Star, ExternalLink } from "lucide-react";
import { useLocaleStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import type { Store } from "@/lib/types";

export function BoutiquesSection() {
  const { t, locale } = useLocaleStore();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStore, setActiveStore] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchStores() {
      const supabase = createClient();
      const { data } = await supabase
        .from("stores")
        .select("*")
        .order("sort_order", { ascending: true });
      if (data) {
        setStores(data);
        if (data.length > 0) setActiveStore(data[0].id);
      }
      setLoading(false);
    }
    fetchStores();
  }, []);

  const getName = (store: Store) =>
    locale === "ar" ? store.name_ar || store.name : locale === "fr" ? store.name_fr || store.name : store.name;

  const getCity = (store: Store) =>
    locale === "ar" ? store.city_ar || store.city : store.city;

  const getAddress = (store: Store) =>
    locale === "ar" ? store.address_ar || store.address : store.address;

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-navy-600 border-t-transparent" />
          </div>
        </div>
      </section>
    );
  }

  if (stores.length === 0) return null;

  const featured = stores.find((s) => s.id === activeStore) || stores[0];

  return (
    <section id="boutiques" className="py-20 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-navy-50 text-navy-600 text-sm font-medium mb-4">
            <Building2 className="h-4 w-4" />
            {t("boutiques.subtitle")}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            {t("boutiques.title")}
          </h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">
            {t("boutiques.description")}
          </p>
        </motion.div>

        {/* Featured Store + Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto mb-12"
        >
          <div className="grid lg:grid-cols-2 gap-6 bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Left: Store Image & Info */}
            <div className="relative">
              <div className="h-64 lg:h-full min-h-[300px] relative overflow-hidden">
                {featured.image_url ? (
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-all duration-700"
                    style={{ backgroundImage: `url(${featured.image_url})` }}
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-navy-600 to-navy-800 flex items-center justify-center">
                    <Building2 className="h-24 w-24 text-white/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Info overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  {featured.is_headquarters && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500 text-yellow-900 text-xs font-bold mb-3 shadow-lg">
                      <Star className="h-3 w-3" />
                      {t("boutiques.headquarters")}
                    </div>
                  )}
                  <h3 className="text-2xl font-bold mb-1">{getName(featured)}</h3>
                  <p className="text-white/80 text-sm">{getCity(featured)}</p>
                </div>
              </div>
            </div>

            {/* Right: Details */}
            <div className="p-6 lg:p-8 flex flex-col justify-center">
              <h3 className="text-xl font-bold text-gray-900 mb-5">
                {getName(featured)}
              </h3>

              <div className="space-y-4">
                {/* Address */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                  <div className="p-2 rounded-lg bg-navy-100 text-navy-600 flex-shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-0.5">
                      {t("contact.address")}
                    </p>
                    <p className="text-sm text-gray-700 font-medium">
                      {getAddress(featured)}
                      {getCity(featured) && `, ${getCity(featured)}`}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                {featured.phone && (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                    <div className="p-2 rounded-lg bg-green-100 text-green-600 flex-shrink-0">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-0.5">
                        {t("contact.phone")}
                      </p>
                      <a
                        href={`tel:${featured.phone}`}
                        className="text-sm text-gray-700 font-medium hover:text-navy-600 transition-colors"
                        dir="ltr"
                      >
                        {featured.phone}
                      </a>
                    </div>
                  </div>
                )}

                {/* Working hours */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-600 flex-shrink-0">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-0.5">
                      {t("boutiques.hours")}
                    </p>
                    <p className="text-sm text-gray-700 font-medium">
                      {t("boutiques.hours_value")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                {featured.google_maps_url && (
                  <a
                    href={featured.google_maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-navy-600 text-white text-sm font-semibold hover:bg-navy-700 transition-colors shadow-lg shadow-navy-600/20"
                  >
                    <Navigation className="h-4 w-4" />
                    {t("boutiques.directions")}
                  </a>
                )}
                {featured.phone && (
                  <a
                    href={`tel:${featured.phone}`}
                    className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    {t("boutiques.call")}
                  </a>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* All Stores Scrollable Row */}
        {stores.length > 1 && (
          <div className="relative max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {t("boutiques.all_stores")} ({stores.length})
              </h3>
              {stores.length > 3 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => scroll("left")}
                    className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => scroll("right")}
                    className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-2 px-2"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {stores.map((store) => {
                const isActive = store.id === activeStore;
                return (
                  <button
                    key={store.id}
                    onClick={() => setActiveStore(store.id)}
                    className={`flex-shrink-0 w-72 text-left rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                      isActive
                        ? "border-navy-500 shadow-lg shadow-navy-500/10"
                        : "border-gray-100 hover:border-gray-200 hover:shadow-md"
                    }`}
                  >
                    <div className="relative h-36 overflow-hidden">
                      {store.image_url ? (
                        <div
                          className="h-full w-full bg-cover bg-center"
                          style={{ backgroundImage: `url(${store.image_url})` }}
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-navy-100 to-navy-50 flex items-center justify-center">
                          <Building2 className="h-10 w-10 text-navy-300" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      {store.is_headquarters && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-yellow-500 text-yellow-900 text-[10px] font-bold">
                          HQ
                        </div>
                      )}
                      {isActive && (
                        <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-navy-500 ring-2 ring-white" />
                      )}
                    </div>
                    <div className="p-3 bg-white">
                      <h4 className="font-semibold text-sm text-gray-900 truncate">
                        {getName(store)}
                      </h4>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <MapPin className="h-3 w-3" />
                        {getCity(store)}
                      </div>
                      {store.phone && (
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                          <Phone className="h-3 w-3" />
                          <span dir="ltr">{store.phone}</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
