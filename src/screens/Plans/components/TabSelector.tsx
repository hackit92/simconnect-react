import React from 'react';

interface TabSelectorProps {
  selectedTab: 'countries' | 'regions';
  onTabChange: (tab: 'countries' | 'regions') => void;
}

export const TabSelector: React.FC<TabSelectorProps> = ({ selectedTab, onTabChange }) => {
  const { t } = useTranslation();

  return (
    <div className="flex border-b border-gray-200 justify-center max-w-md mx-auto">
      <button
        onClick={() => onTabChange('countries')}
        className={`py-3 px-8 text-sm font-semibold text-center transition-all duration-200 ${
          selectedTab === 'countries'
            ? 'text-primary border-b-2 border-primary'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        {t('plans.tab_countries')}
      </button>
      <button
        onClick={() => onTabChange('regions')}
        className={`py-3 px-8 text-sm font-semibold text-center transition-all duration-200 ${
          selectedTab === 'regions'
            ? 'text-primary border-b-2 border-primary'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        {t('plans.tab_regions')}
      </button>
    </div>
  );
};