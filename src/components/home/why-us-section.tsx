"use client";

import { motion } from "framer-motion";
import { Award, Truck, HeadphonesIcon, DollarSign } from "lucide-react";
import { useLocaleStore } from "@/lib/store";

export function WhyUsSection() {
  const { t } = useLocaleStore();

  const features = [
    {
      icon: Award,
      title: t("why_us.quality"),
      description: t("why_us.quality_desc"),
      color: "bg-navy-50 text-navy-600",
    },
    {
      icon: Truck,
      title: t("why_us.delivery"),
      description: t("why_us.delivery_desc"),
      color: "bg-green-50 text-green-600",
    },
    {
      icon: HeadphonesIcon,
      title: t("why_us.support"),
      description: t("why_us.support_desc"),
      color: "bg-purple-50 text-purple-600",
    },
    {
      icon: DollarSign,
      title: t("why_us.pricing"),
      description: t("why_us.pricing_desc"),
      color: "bg-orange-50 text-orange-600",
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            {t("why_us.title")}
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-xl p-6 text-center space-y-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div
                className={`inline-flex p-3 rounded-xl ${feature.color}`}
              >
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-gray-900">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
