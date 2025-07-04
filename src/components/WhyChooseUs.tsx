import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Smartphone, Truck, Hand, Globe, DollarSign, Heart } from 'lucide-react';
import { useIsDesktop } from '../hooks/useIsDesktop';

export const WhyChooseUs: React.FC = () => {
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  const features = [
    {
      icon: <Smartphone className="w-8 h-8 text-[#299ae4]" />,
      title: t('why_choose.no_physical_sim'),
      description: t('why_choose.no_physical_sim_desc')
    },
    {
      icon: <Globe className="w-8 h-8 text-[#299ae4]" />,
      title: t('why_choose.global_coverage'),
      description: t('why_choose.global_coverage_desc')
    },
    {
      icon: <Truck className="w-8 h-8 text-[#299ae4]" />,
      title: t('why_choose.instant_delivery'),
      description: t('why_choose.instant_delivery_desc')
    },
    {
      icon: <DollarSign className="w-8 h-8 text-[#299ae4]" />,
      title: t('why_choose.save_roaming'),
      description: t('why_choose.save_roaming_desc')
    },
    {
      icon: <Hand className="w-8 h-8 text-[#299ae4]" />,
      title: t('why_choose.easy_setup'),
      description: t('why_choose.easy_setup_desc')
    },
    {
      icon: <Heart className="w-8 h-8 text-[#299ae4]" />,
      title: t('why_choose.total_satisfaction'),
      description: t('why_choose.total_satisfaction_desc')
    }
  ];

  return (
    <section className={`bg-white ${isDesktop ? 'py-20' : 'py-12'}`}>
      <div className={`max-w-7xl mx-auto ${isDesktop ? 'px-8' : 'px-6'}`}>
        {/* Title */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className={`font-normal text-gray-800 ${isDesktop ? 'text-4xl' : 'text-2xl'}`}>
            {t('why_choose.title')} <span className="text-[#299ae4] font-semibold">{t('why_choose.title_brand')}</span>?
          </h2>
        </motion.div>

        {/* Content Layout */}
        <div className={`flex items-center ${
          isDesktop 
            ? 'flex-row gap-16' 
            : 'flex-col gap-8'
        }`}>
          {/* Phone Image */}
          <motion.div 
            className={`${isDesktop ? 'w-1/3' : 'w-full max-w-xs'} flex justify-center`}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative">
              <img
                src="/phone-mockup.png"
                alt="SimConnect App on Phone"
                className={`${isDesktop ? 'h-96' : 'h-80'} w-auto object-contain`}
              />
            </div>
          </motion.div>

          {/* Features Grid */}
          <motion.div 
            className={`${isDesktop ? 'w-2/3' : 'w-full'}`}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className={`grid gap-8 ${
              isDesktop 
                ? 'grid-cols-2' 
                : 'grid-cols-1'
            }`}>
              {features.map((feature, index) => (
                <motion.div 
                  key={index} 
                  className="flex items-start space-x-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + (index * 0.1) }}
                  whileHover={{ scale: 1.02 }}
                >
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {feature.icon}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <h3 className={`font-bold text-gray-800 mb-2 ${
                      isDesktop ? 'text-lg' : 'text-base'
                    }`}>
                      {feature.title}
                    </h3>
                    <p className={`text-gray-600 leading-relaxed ${
                      isDesktop ? 'text-base' : 'text-sm'
                    }`}>
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};