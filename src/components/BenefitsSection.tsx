import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useIsDesktop } from '../hooks/useIsDesktop';

export const BenefitsSection: React.FC = () => {
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  const benefits = [
    {
      number: '1',
      title: t('benefits.choose_plan.title'),
      description: t('benefits.choose_plan.description'),
      icon: '/icons/choose-plan.svg',
    },
    {
      number: '2',
      title: t('benefits.install.title'),
      description: t('benefits.install.description'),
      icon: '/icons/install.svg',
    },
    {
      number: '3',
      title: t('benefits.connect.title'),
      description: t('benefits.connect.description'),
      icon: '/icons/connect.svg',
    },
    {
      number: '4',
      title: t('benefits.enjoy.title'),
      description: t('benefits.enjoy.description'),
      icon: '/icons/enjoy.svg',
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
              <div className="flex items-center justify-center mb-4">
                <img 
                  src={benefit.icon} 
                  alt={benefit.title}
                  className="w-16 h-16 object-contain"
                  onError={(e) => {
                    // Fallback to number if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML += `
                      <div class="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold">
                        ${benefit.number}
                      </div>
                    `;
                  }}
                />
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