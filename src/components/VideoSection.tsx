import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useIsDesktop } from '../hooks/useIsDesktop';

export const VideoSection: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isDesktop = useIsDesktop();

  // Select video URL based on current language
  const videoUrl = i18n.language === 'en' 
    ? 'https://bunny-wp-pullzone-ojr219aebf.b-cdn.net/SimConnect_engCompr-1.mp4'
    : 'https://bunny-wp-pullzone-ojr219aebf.b-cdn.net/SimConnect_esp.mp4';

  return (
    <section className="bg-gray-900 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`${
          isDesktop 
            ? 'grid grid-cols-2 gap-16 items-center' 
            : 'space-y-8'
        }`}>
          {/* Left Column - Text Content */}
          <motion.div 
            className={`${isDesktop ? 'pr-8' : 'text-center'}`}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Subtitle */}
            <p className={`text-gray-300 mb-6 ${
              isDesktop ? 'text-lg' : 'text-base'
            }`}>
              {t('video.subtitle')}
            </p>

            {/* Main Title */}
            <h2 className={`text-white font-light mb-8 leading-tight ${
              isDesktop ? 'text-4xl' : 'text-2xl'
            }`}>
              {t('video.title_part1')} <span className="text-[#299ae4] font-normal">{t('video.title_highlight')}</span> {t('video.title_part2')}
            </h2>

            {/* Description */}
            <p className={`text-gray-300 leading-relaxed ${
              isDesktop ? 'text-lg' : 'text-base'
            }`}>
              {t('video.description')}
            </p>
          </motion.div>

          {/* Right Column - Video Player */}
          <motion.div 
            className={`${isDesktop ? 'pl-8' : 'w-full'}`}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative rounded-lg overflow-hidden shadow-2xl">
              <video
                className="w-full h-auto"
                controls
                preload="metadata"
                poster="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgdmlld0JveD0iMCAwIDgwMCA0NTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNDUwIiBmaWxsPSIjMjk5YWU0Ii8+CjxjaXJjbGUgY3g9IjQwMCIgY3k9IjIyNSIgcj0iNDAiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuOCIvPgo8cGF0aCBkPSJNMzg1IDIwNUw0MjAgMjI1TDM4NSAyNDVWMjA1WiIgZmlsbD0iIzI5OWFlNCIvPgo8L3N2Zz4K"
                style={{ aspectRatio: '16/9' }}
              >
                <source src={videoUrl} type="video/mp4" />
                {t('video.not_supported')}
              </video>
              
              {/* Video Overlay for Loading State */}
              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <div className="w-0 h-0 border-l-[20px] border-r-0 border-t-[12px] border-b-[12px] border-l-white border-t-transparent border-b-transparent ml-1"></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};