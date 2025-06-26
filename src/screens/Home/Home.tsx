import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { CardContent } from "../../components/ui/card";
import { useIsDesktop } from "../../hooks/useIsDesktop";
import { Plans } from "../Plans";

export const Home = () => {
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();
  
  return (
    <>
      {/* Hero Section */}
      <CardContent className={`flex flex-col items-center p-0 relative self-stretch w-full overflow-hidden ${
        isDesktop ? 'min-h-[600px]' : 'h-[730px]'
      }`}>
        <div className="relative w-full h-full flex flex-col items-center">
          <div className={`relative z-10 flex flex-col items-center text-center ${
            isDesktop ? 'px-8 pt-20 pb-20' : 'px-6 pt-12 pb-16'
          }`}>
            <h1 className={`leading-[1.1] font-normal text-text-heading mb-6 ${
              isDesktop ? 'text-[60px] max-w-4xl' : 'text-[40px]'
            }`}>
              {t('home.title')} <span className="font-bold">{t('home.title_bold')}</span>
            </h1>

            <p className={`font-light text-text-body uppercase tracking-wide mb-10 ${
              isDesktop ? 'text-lg max-w-2xl' : 'text-base max-w-[361px]'
            }`}>
              {t('home.subtitle')}
            </p>

            <p className={`text-text-body mb-12 leading-relaxed ${
              isDesktop ? 'text-2xl max-w-3xl' : 'text-xl max-w-[361px]'
            }`}>
              <span className="font-light">{t('home.description_light')} </span>
              <span className="font-bold">{t('home.description_tourism')}</span>
              <span className="font-light"> {t('home.description_or')} </span>
              <span className="font-bold">{t('home.description_business')}</span>
            </p>

            {/* Show CTA button only on mobile */}
            {!isDesktop && (
              <Link to="/plans">
                <Button
                  variant="outline"
                  className="w-[278px] h-12 border-2 border-primary rounded-lg bg-transparent hover:bg-primary hover:text-white transition-all duration-300 shadow-premium hover:shadow-premium-hover"
                >
                  <span className="font-semibold text-primary hover:text-white text-lg text-center tracking-wide">
                    {t('home.cta')}
                  </span>
                </Button>
              </Link>
            )}
          </div>

          <div className="relative w-full flex-1 mt-8">
            <img
              className="w-full h-full object-cover"
              alt="People using mobile phones internationally"
              src="/image-2.png"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white/60 to-transparent" />
          </div>
        </div>
      </CardContent>

      {/* Embedded Plans Section - Desktop Only */}
      {isDesktop && (
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {t('plans.title')}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Encuentra el plan perfecto para tu próximo viaje. Ofrecemos cobertura en más de 200 países con activación instantánea.
              </p>
            </div>
            
            <Plans isEmbedded={true} />
          </div>
        </div>
      )}
    </>
  );
};