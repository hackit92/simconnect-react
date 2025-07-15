import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useIsDesktop } from '../hooks/useIsDesktop';

export const WhatSimConnectIncludes: React.FC = () => {
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  const features = [
    t('what_includes.feature1'),
    t('what_includes.feature2'),
    t('what_includes.feature3'),
    t('what_includes.feature4'),
    t('what_includes.feature5'),
  ];

  return (
    <section className="bg-gray-900 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`${
          isDesktop 
            ? 'flex items-center justify-between' 
            : 'text-center'
        }`}>
          {/* Title */}
          <motion.div 
            className={`${isDesktop ? 'w-1/3' : 'mb-8'}`}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className={`text-white font-light ${
              isDesktop ? 'text-4xl text-left' : 'text-2xl'
            }`}>
              {t('what_includes.title_part1')} <span className="text-[#299ae4] font-normal">{t('what_includes.title_part2')}</span>?
            </h2>
          </motion.div>

          {/* Features Grid */}
          <motion.div 
            className={`${isDesktop ? 'w-2/3 pl-16' : 'w-full'}`}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className={`grid gap-6 ${
              isDesktop 
                ? 'grid-cols-2' 
                : 'grid-cols-1'
            }`}>
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-start space-x-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + (index * 0.1) }}
                >
                  <div className="w-2 h-2 bg-[#299ae4] rounded-full mt-3 flex-shrink-0"></div>
                  <p className={`text-white leading-relaxed ${
                    isDesktop ? 'text-lg' : 'text-base'
                  }`}>
                    {feature}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};