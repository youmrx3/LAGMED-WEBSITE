"use client";

import { motion } from "framer-motion";
import { MapPin, Phone, Mail } from "lucide-react";
import { useLocaleStore } from "@/lib/store";

export function ContactSection() {
  const { t } = useLocaleStore();

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            {t("contact.title")}
          </h2>
          <p className="text-gray-600 mt-3">{t("contact.subtitle")}</p>
        </motion.div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50">
              <MapPin className="h-6 w-6 text-navy-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900">{t("contact.address")}</h3>
                <p className="text-gray-600 text-sm">Bordj Bou Arreridj, Algeria</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50">
              <Phone className="h-6 w-6 text-navy-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900">{t("contact.phone")}</h3>
                <p className="text-gray-600 text-sm">+213 XX XX XX XX</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50">
              <Mail className="h-6 w-6 text-navy-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900">{t("contact.email")}</h3>
                <p className="text-gray-600 text-sm">contact@lagmed.dz</p>
              </div>
            </div>
          </motion.div>

          {/* Google Maps Embed */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-xl overflow-hidden shadow-sm border border-gray-200"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d51641.672!2d4.7!3d36.07!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x128d6b8e9e6b7b0b%3A0x7f9e7a6f7f9e7a6f!2sBordj%20Bou%20Arreridj!5e0!3m2!1sen!2sdz!4v1700000000000!5m2!1sen!2sdz"
              width="100%"
              height="350"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="LAGMED Location"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
