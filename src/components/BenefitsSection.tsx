import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CreditCard, QrCode, Wifi, ThumbsUp } from 'lucide-react';
import { useIsDesktop } from '../hooks/useIsDesktop';

export const BenefitsSection: React.FC = () => {
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  const benefits = [
    {
      number: '1',
      title: t('benefits.choose_plan.title'),
      description: t('benefits.choose_plan.description'),
      icon: <CreditCard className="w-12 h-12 text-primary" />
    },
    {
      number: '2',
      title: t('benefits.install.title'),
      description: t('benefits.install.description'),
      icon: <QrCode className="w-12 h-12 text-primary" />
    },
    {
      number: '3',
      title: t('benefits.connect.title'),
      description: t('benefits.connect.description'),
      icon: <Wifi className="w-12 h-12 text-primary" />
    },
    {
      number: '4',
      title: t('benefits.enjoy.title'),
      description: t('benefits.enjoy.description'),
      icon: <ThumbsUp className="w-12 h-12 text-primary" />
    },
  ];

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className={`font-normal text-gray-800 ${isDesktop ? 'text-4xl' : 'text-2xl'} mb-4`}>
            {t('benefits.title')} <span className="text-[#299ae4] font-semibold">eSim</span> {t('benefits.title_suffix')}
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            {t('benefits.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            >
              <div className="flex items-center justify-center mb-4 w-16 h-16 rounded-full bg-primary/10">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};