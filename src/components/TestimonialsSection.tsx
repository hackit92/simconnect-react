import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useIsDesktop } from '../hooks/useIsDesktop';

interface Testimonial {
  id: number;
  quote: string;
  name: string;
  position: string;
  image: string;
}

export const TestimonialsSection: React.FC = () => {
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials: Testimonial[] = [
    {
      id: 1,
      quote: t('testimonials.testimonial1.quote'),
      name: t('testimonials.testimonial1.name'),
      position: t('testimonials.testimonial1.position'),
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      id: 2,
      quote: t('testimonials.testimonial2.quote'),
      name: t('testimonials.testimonial2.name'),
      position: t('testimonials.testimonial2.position'),
      image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      id: 3,
      quote: t('testimonials.testimonial3.quote'),
      name: t('testimonials.testimonial3.name'),
      position: t('testimonials.testimonial3.position'),
      image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      id: 4,
      quote: t('testimonials.testimonial4.quote'),
      name: t('testimonials.testimonial4.name'),
      position: t('testimonials.testimonial4.position'),
      image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      id: 5,
      quote: t('testimonials.testimonial5.quote'),
      name: t('testimonials.testimonial5.name'),
      position: t('testimonials.testimonial5.position'),
      image: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    }
  ];

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  const goToTestimonial = (index: number) => {
    setCurrentIndex(index);
  };

  // Calculate visible testimonials for desktop
  const getVisibleTestimonials = () => {
    if (!isDesktop) return [testimonials[currentIndex]];
    
    const visible = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % testimonials.length;
      visible.push(testimonials[index]);
    }
    return visible;
  };

  const visibleTestimonials = getVisibleTestimonials();

  return (
    <section className="bg-gray-900 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`${
          isDesktop 
            ? 'flex items-start justify-between' 
            : 'text-center'
        }`}>
          {/* Title Section */}
          <motion.div 
            className={`${isDesktop ? 'w-1/3 pr-8' : 'mb-12'}`}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className={`text-white font-light mb-6 ${
              isDesktop ? 'text-4xl text-left' : 'text-3xl'
            }`}>
              {t('testimonials.title_part1')}<br />
              <span className="text-[#299ae4] font-normal">{t('testimonials.title_part2')}</span>
            </h2>
            <p className={`text-gray-300 ${
              isDesktop ? 'text-lg text-left' : 'text-base'
            }`}>
              {t('testimonials.subtitle')}
            </p>
          </motion.div>

          {/* Testimonials Carousel */}
          <motion.div 
            className={`${isDesktop ? 'w-2/3' : 'w-full'} relative`}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Navigation Arrows - Desktop Only */}
            {isDesktop && (
              <>
                <button
                  onClick={prevTestimonial}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-12 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-200"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={nextTestimonial}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-12 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-200"
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              </>
            )}

            {/* Testimonials Container */}
            <div className="overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  className={`flex ${isDesktop ? 'gap-6' : 'justify-center'}`}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                >
                  {visibleTestimonials.map((testimonial, index) => (
                    <div
                      key={`${testimonial.id}-${currentIndex}-${index}`}
                      className={`${
                        isDesktop ? 'flex-1' : 'w-full max-w-md'
                      } relative`}
                    >
                      {/* Speech Bubble */}
                      <div className="bg-white rounded-2xl p-6 mb-4 relative shadow-lg">
                        <p className="text-gray-700 text-sm leading-relaxed italic">
                          "{testimonial.quote}"
                        </p>
                        {/* Speech bubble tail */}
                        <div className="absolute bottom-0 left-8 transform translate-y-full">
                          <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[10px] border-l-transparent border-r-transparent border-t-white"></div>
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div className="flex items-center space-x-3 pl-2">
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
                        />
                        <div>
                          <h4 className="text-white font-semibold text-sm">
                            {testimonial.name}
                          </h4>
                          <p className="text-gray-400 text-xs">
                            {testimonial.position}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToTestimonial(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentIndex
                      ? 'bg-[#299ae4] w-6'
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};