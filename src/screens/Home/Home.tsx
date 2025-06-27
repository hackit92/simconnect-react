import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { CardContent } from "../../components/ui/card";
import { useIsDesktop } from "../../hooks/useIsDesktop";
import { WhyChooseUs } from "../../components/WhyChooseUs";
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
        <div className={`relative w-full h-full flex items-center ${
          isDesktop ? 'lg:flex-row lg:justify-center lg:items-center' : 'flex-col'
        }`}>
          {/* Content */}
          <div className={`relative z-10 flex flex-col ${
            isDesktop 
              ? 'lg:w-3/5 lg:text-left lg:items-start px-16 py-24' 
              : 'items-center px-6 pt-12 pb-16 text-center'
          }`}>
            <h1 className={`leading-[0.9] font-light text-gray-800 ${
              isDesktop ? 'text-7xl mb-8 max-w-5xl' : 'text-[40px] mb-6'
            }`}>
              {isDesktop ? (
                <>
                  <span className="font-light">TE CONECTAMOS EN</span><br />
                  <span className="font-black text-gray-900 text-8xl">+ 200 PAÍSES</span>
                </>
              ) : (
                <>
                  {t('home.title')} <span className="font-bold">{t('home.title_bold')}</span>
                </>
              )}
            </h1>

            <p className={`font-normal text-gray-700 uppercase tracking-[0.15em] ${
              isDesktop ? 'text-2xl mb-10 max-w-3xl' : 'text-base mb-8 max-w-[361px]'
            }`}>
              {isDesktop ? 'CON NUESTROS SERVICIOS DE DATOS MÓVILES INTERNACIONALES' : t('home.subtitle')}
            </p>

            <div className={`text-gray-700 leading-relaxed space-y-2 ${
              isDesktop ? 'text-2xl mb-16 max-w-4xl' : 'text-xl mb-12 max-w-[361px]'
            }`}>
              {isDesktop ? (
                <>
                  <p className="mb-3">
                    YA SEA POR <span className="font-bold text-gray-900">TURISMO</span> O <span className="font-bold text-gray-900">NEGOCIOS</span>, CONÉCTATE CON LA
                  </p>
                  <p className="mb-3">
                    MAYOR VELOCIDAD Y DISPONIBILIDAD DEL MERCADO.
                  </p>
                  <p>
                    COMO EN CASA, A <span className="italic font-medium text-primary">PRECIOS LOCALES</span> EN <span className="font-bold text-gray-900">TODO EL MUNDO</span>.
                  </p>
                </>
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
              {isDesktop ? 'EXPLORA NUESTROS PLANES' : t('home.cta')}
            </Button>
          </div>

          {/* Image */}
          <div className={`relative flex-1 ${
            isDesktop ? 'lg:w-2/5 lg:mt-0' : 'w-full mt-8'
          }`}>
            <img
              className="w-full h-full object-cover"
              alt="People using mobile phones internationally"
              src="/image-2.png"
            />
            <div className={`absolute inset-0 bg-gradient-to-t from-white/60 to-transparent ${
              isDesktop ? 'lg:hidden' : ''
            }`} />
          </div>
        </div>
      </CardContent>

      {/* Why Choose Us Section - Mobile Only */}
      {!isDesktop && <WhyChooseUs />}

      {/* Embedded Plans Section - Desktop Only */}
      {isDesktop && (
        <div id="plans-section" className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {t('plans.title')}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Te ayudamos a conectarte desde cualquier parte del mundo.
              </p>
            </div>
            
            <Plans isEmbedded={true} />
          </div>
        </div>
      )}

      {/* Why Choose Us Section - Desktop Only */}
      {isDesktop && <WhyChooseUs />}
    </>
  );
};