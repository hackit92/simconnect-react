import React from 'react';

interface TabSelectorProps {
  selectedTab: 'countries' | 'regions';
  onTabChange: (tab: 'countries' | 'regions') => void;
}

export const TabSelector: React.FC<TabSelectorProps> = ({ selectedTab, onTabChange }) => {
  return (
    <div className="flex bg-gray-100 rounded-2xl p-1">
      <button
        onClick={() => onTabChange('countries')}
        className={`flex-1 py-3 px-6 text-sm font-semibold text-center rounded-xl transition-all duration-200 ${
          selectedTab === 'countries'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-800'
        }`}
      >
        Países
      </button>
      <button
        onClick={() => onTabChange('regions')}
        className={`flex-1 py-3 px-6 text-sm font-semibold text-center rounded-xl transition-all duration-200 ${
          selectedTab === 'regions'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-800'
        }`}
      >
        Regiones
      </button>
    </div>
  );
};