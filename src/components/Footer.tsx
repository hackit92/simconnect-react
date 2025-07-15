import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Facebook, Instagram } from 'lucide-react';
import { useIsDesktop } from '../hooks/useIsDesktop';

export const Footer: React.FC = () => {
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className={`grid gap-12 ${
          isDesktop 
            ? 'grid-cols-4' 
            : 'grid-cols-1'
        }`}>
          {/* Logo and Description */}
          <div className={`${isDesktop ? 'col-span-1' : 'text-justified'}`}>
            <div className="mb-6">
              <img
                className="h-8 w-auto"
                alt="SimConnect Travel Logo"
                src="/image-1.png"
              />
            </div>
            <p className={`text-gray-300 leading-relaxed ${
              isDesktop ? 'text-sm' : 'text-base'
            }`}>
              {t('footer.description')}
            </p>
          </div>

          {/* Company Section */}
          <div className={`${isDesktop ? '' : 'text-center'}`}>
            <h3 className="text-lg font-semibold mb-6">
              {t('footer.company.title')}
            </h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                >
                  {t('footer.company.support_center')}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                >
                  {t('footer.company.terms_of_service')}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                >
                  {t('footer.company.privacy_policy')}
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Guides Section */}
          <div className={`${isDesktop ? '' : 'text-center'}`}>
            <h3 className="text-lg font-semibold mb-6">
              {t('footer.quick_guides.title')}
            </h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                >
                  {t('footer.quick_guides.install_ios')}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                >
                  {t('footer.quick_guides.install_android')}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                >
                  {t('footer.quick_guides.prepare_activation')}
                </a>
              </li>
              <li>
                <Link
                  to="/compatibility"
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                >
                  {t('footer.quick_guides.verify_compatibility')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className={`${isDesktop ? '' : 'text-center'}`}>
            <h3 className="text-lg font-semibold mb-6">
              {t('footer.contact.title')}
            </h3>
            <div className="flex space-x-4 justify-center">
              <a
                href="https://facebook.com/simconnect"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center transition-colors duration-200"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5 text-white" />
              </a>
              <a
                href="https://instagram.com/simconnect"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className={`text-center ${isDesktop ? 'space-y-2' : 'space-y-4'}`}>
            <p className="text-gray-400 text-sm">
              {t('footer.copyright', { year: new Date().getFullYear() })}
            </p>
            <p className="text-gray-500 text-xs leading-relaxed">
              {t('footer.disclaimer')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};