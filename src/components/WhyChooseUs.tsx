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
      title: "SIN NECESIDAD DE SIM FÍSICA",
      description: "Mantienes tu tarjeta SIM física conservando los servicios de voz y SMS y agregas una eSIM desde cualquier lugar fácil y rápido"
    },
    {
      icon: <Globe className="w-8 h-8 text-[#299ae4]" />,
      title: "COBERTURA GLOBAL",
      description: "Planes de datos en más de 200 países conectándote con los operadores locales más importantes."
    },
    {
      icon: <Truck className="w-8 h-8 text-[#299ae4]" />,
      title: "ENTREGA INMEDIATA",
      description: "Recibirás tu eSIM inmediatamente al terminar la compra del plan de tu elección"
    },
    {
      icon: <DollarSign className="w-8 h-8 text-[#299ae4]" />,
      title: "AHORRA EN COSTOS DE ROAMING",
      description: "Paga precios locales para los servicios de internet móvil"
    },
    {
      icon: <Hand className="w-8 h-8 text-[#299ae4]" />,
      title: "FÁCIL DE CONFIGURAR",
      description: "Instalación rápida y sencilla en solo unos clics utilizando un código QR"
    },
    {
      icon: <Heart className="w-8 h-8 text-[#299ae4]" />,
      title: "TOTAL SATISFACCIÓN",
      description: "Para nosotros lo más importante es que nuestro servicio te encante, desde la contratación y durante tu viaje por lo que te proporcionamos un servicio boutique de atención a clientes y soporte"
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
            ¿Por qué elegir <span className="text-[#299ae4] font-semibold">SimConnect</span>?
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