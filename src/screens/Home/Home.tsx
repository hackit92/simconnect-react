import React from "react";
import { useTranslation } from "react-i18next"; 
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../../components/ui/button";
import { CardContent } from "../../components/ui/card";
import { useIsDesktop } from "../../hooks/useIsDesktop";
import { WhyChooseUs } from "../../components/WhyChooseUs";
import { BenefitsSection } from "../../components/BenefitsSection";
import { WhatSimConnectIncludes } from "../../components/WhatSimConnectIncludes";
import { TestimonialsSection } from "../../components/TestimonialsSection";
import { Plans } from "../Plans";
import { CompatibilityChecker } from "../CompatibilityChecker";

export const Home = () => {
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();
  
  return (
    <>
      {/* Hero Section */}
      <CardContent className={`flex flex-col items-center p-0 relative self-stretch w-full overflow-hidden ${
        isDesktop ? 'min-h-[600px]' : 'h-[730px]'
      }`}>
        <div className={`relative w-full h-full flex items-center ${
          isDesktop ? 'lg:flex-row lg:justify-center lg:items-center' : 'flex-col'
        }`}>
          {/* Content */}
          <motion.div 
            className={`relative z-10 flex flex-col ${
            isDesktop 
              ? 'lg:w-3/5 lg:text-left lg:items-start px-16 py-24' 
              : 'items-center px-6 pt-12 pb-16 text-center'
          }`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className={`font-light text-gray-800 ${
              isDesktop ? 'text-5xl mb-2 max-w-5xl' : 'text-[40px] mb-6'
            }`}>
              {isDesktop ? (
                <>
                  <span className="font-light">{t('home.title').toUpperCase()}</span><br />
                  <span className="font-black text-gray-900 text-6xl">{t('home.title_bold').toUpperCase()}</span>
                </>
              ) : (
                <>
                  {t('home.title')} <span className="font-bold">{t('home.title_bold')}</span>
                </>
              )}
            </h1>

            <p className={`font-normal leading-[1.2] text-gray-700 uppercase tracking-[0.15em] ${
              isDesktop ? 'text-xl mb-10 max-w-3xl' : 'text-base mb-9 max-w-[361px]'
            }`}>
              {isDesktop ? t('home.hero_subtitle_desktop') : t('home.subtitle')}
            </p>

            <div className={`text-gray-700 space-y-2 ${
              isDesktop ? 'text-2xl mb-16 max-w-4xl' : 'text-xl mb-12 max-w-[361px]'
            }`}>
              {isDesktop ? (
                <p className="mb-3" dangerouslySetInnerHTML={{ __html: t('home.hero_full_description_desktop') }} />
              ) : (
                <p>
                  <span className="font-light">{t('home.description_light')} </span>
                  <span className="font-bold">{t('home.description_tourism')}</span>
                  <span className="font-light"> {t('home.description_or')} </span>
                  <span className="font-bold">{t('home.description_business')}</span>
                </p>
              )}
            </div>

            {/* CTA Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
              variant="outline"
              className={`border-2 border-gray-900 rounded-none bg-transparent hover:bg-gray-900 hover:text-white transition-all duration-300 font-bold tracking-[0.1em] ${
                isDesktop ? 'px-12 py-5 text-xl' : 'w-[278px] h-12 text-lg'
              }`}
              onClick={() => {
                if (isDesktop) {
                  // Scroll to plans section
                  const plansSection = document.getElementById('plans-section');
                  if (plansSection) {
                    plansSection.scrollIntoView({ behavior: 'smooth' });
                  }
                } else {
                  // Navigate to plans page on mobile
                  window.location.href = '/plans';
                }
              }}
            >
              {t('home.cta')}
              </Button>
            </motion.div>
          </motion.div>

          {/* Image */}
          <motion.div 
            className={`relative flex-1 ${
            isDesktop ? 'lg:w-2/5 lg:mt-0' : 'w-full mt-8'
          }`}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <img
              className="w-full h-full object-cover"
              alt="People using mobile phones internationally"
              src="/image-2.png"
            />
            <div className={`absolute inset-0 bg-gradient-to-t from-white/60 to-transparent ${
              isDesktop ? 'lg:hidden' : ''
            }`} />
          </motion.div>
        </div>
      </CardContent>

      {/* Why Choose Us Section - Mobile Only */}
      {!isDesktop && <WhyChooseUs />}
      
      {/* Benefits Section - Mobile Only */}
      {!isDesktop && <BenefitsSection />}

      {/* Embedded Plans Section - Desktop Only */}
      {isDesktop && (
        <div id="plans-section" className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {t('plans.title')}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {t('plans.subtitle')}
              </p>
            </div>
            
            <Plans isEmbedded={true} />
          </div>
        </div>
      )}

      {/* Why Choose Us Section - Desktop Only */}
      {isDesktop && <WhyChooseUs />}
      
      {/* Benefits Section - Desktop Only */}
      {isDesktop && <BenefitsSection />}
      
      {/* What SimConnect Includes Section */}
      <WhatSimConnectIncludes />
      
      {/* Compatibility Checker Section - After Benefits Section */}
      <CompatibilityChecker isEmbedded={true} />
      
      {/* Testimonials Section */}
      <TestimonialsSection />
    </>
  );
};