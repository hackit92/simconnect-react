import React, { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import type { Category, Product } from "../../../lib/supabase";
import { supabase } from '../../../lib/supabase';

// Import region SVG assets
import AsiaIcon from '../../../assets/regions/asia.svg?react';
import CaribeIcon from '../../../assets/regions/caribe.svg?react';
import CaucasoIcon from '../../../assets/regions/caucaso.svg?react';
import EuropaIcon from '../../../assets/regions/europa.svg?react';
import LatinoAmericaIcon from '../../../assets/regions/latino-america.svg?react';
import MedioOrienteIcon from '../../../assets/regions/medio-oriente.svg?react';
import NorteamericaIcon from '../../../assets/regions/norteamerica.svg?react';

interface RegionOption {
  value: string;
  label: string;
  countries: string[];
  keywords: string[];
}

interface RegionGridProps {
  onSelectRegion: (regionValue: string) => void;
}

const regions: RegionOption[] = [
  {
    value: 'latinoamerica',
    label: 'Latinoamérica',
    countries: ['mx', 'br', 'ar', 'cl', 'co', 'pe', 've', 'ec', 'bo', 'py', 'uy', 'cr', 'pa', 'gt', 'hn', 'sv', 'ni', 'cu', 'do'],
    keywords: ['latinoamerica', 'latin america', 'america latina', 'sudamerica', 'south america', 'latam', 'my-latam']
  },
  {
    value: 'europa',
    label: 'Europa',
    countries: ['es', 'fr', 'de', 'it', 'gb', 'pt', 'nl', 'be', 'ch', 'at', 'dk', 'fi', 'ie', 'no', 'se', 'pl', 'cz', 'hu', 'ro', 'bg', 'hr', 'si', 'sk', 'lt', 'lv', 'ee'],
    keywords: ['europa', 'europe', 'european']
  },
  {
    value: 'norteamerica',
    label: 'Norteamérica',
    countries: ['us', 'ca'],
    keywords: ['norteamerica', 'north america', 'america del norte']
  },
  {
    value: 'balcanes',
    label: 'Balcanes',
    countries: ['rs', 'ba', 'me', 'mk', 'al', 'xk'],
    keywords: ['balcanes', 'balkans', 'balkan']
  },
  {
    value: 'oriente-medio',
    label: 'Oriente Medio',
    countries: ['il', 'tr', 'ae', 'sa', 'qa', 'kw', 'bh', 'om', 'jo', 'lb', 'sy', 'iq', 'ir'],
    keywords: ['oriente medio', 'middle east', 'gulf', 'golfo']
  },
  {
    value: 'caribe',
    label: 'Caribe',
    countries: ['cu', 'do', 'jm', 'bs', 'bb', 'tt', 'ag', 'lc', 'gd', 'vc', 'kn', 'dm'],
    keywords: ['caribe', 'caribbean', 'antillas']
  },
  {
    value: 'asia-central',
    label: 'Asia Central y Cáucaso',
    countries: ['kz', 'uz', 'tm', 'tj', 'kg'],
    keywords: ['asia central', 'central asia', 'asia centrale', 'caucaso', 'caucasus', 'caucasian']
  },
  {
    value: 'asia',
    label: 'Asia',
    countries: ['cn', 'jp', 'kr', 'in', 'th', 'sg', 'my', 'id', 'ph', 'vn', 'kh', 'la', 'mm', 'bd', 'pk', 'lk'],
    keywords: ['asia']
  }
];

// Map region values to their corresponding SVG components
const regionIcons: Record<string, React.ComponentType<any>> = {
  'latinoamerica': LatinoAmericaIcon,
  'europa': EuropaIcon,
  'norteamerica': NorteamericaIcon,
  'oriente-medio': MedioOrienteIcon,
  'caribe': CaribeIcon,
  'caucaso': CaucasoIcon,
  'asia': AsiaIcon,
};

export const RegionGrid: React.FC<RegionGridProps> = ({
  onSelectRegion,
}) => {
  const [regionCounts, setRegionCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // Fetch regional plan counts efficiently from database
  useEffect(() => {
    const fetchRegionCounts = async () => {
      setLoading(true);
      try {
        // Get counts for each region using the new plan_type and region_code fields
        const { data: regionalPlans, error } = await supabase
          .from('wc_products')
          .select('region_code')
          .eq('active', true)
          .eq('plan_type', 'regional')
          .not('region_code', 'is', null);

        if (error) throw error;

        // Count plans by region
        const counts: Record<string, number> = {};
        regionalPlans?.forEach(plan => {
          if (plan.region_code) {
            counts[plan.region_code] = (counts[plan.region_code] || 0) + 1;
          }
        });

        setRegionCounts(counts);
      } catch (error) {
        console.error('Error fetching region counts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRegionCounts();
  }, []);

  const handleRegionClick = (region: RegionOption) => {
    onSelectRegion(region.value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Cargando regiones...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {regions.map((region) => {
          // Count countries available in this region
          const regionCategories = categories.filter(cat => 
            region.countries.includes(cat.slug.toLowerCase())
          );
          
          // Get regional plans count from database
          const regionalPlansCount = regionCounts[region.value] || 0;
          
          const hasContent = regionCategories.length > 0 || regionalPlansCount > 0;
          
          // Get the appropriate icon component
          const IconComponent = regionIcons[region.value];
          
          return (
            <button
              key={region.value}
              onClick={() => handleRegionClick(region)}
              disabled={!hasContent}
              className={`p-4 text-center rounded-lg border transition-all duration-200 ${
                hasContent
                  ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
                  : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
              }`}
            >
              {/* Region Icon */}
              <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                {IconComponent ? (
                  <IconComponent className="w-10 h-10 text-[#299ae4]" />
                ) : (
                  <Globe className="w-10 h-10 text-[#299ae4]" />
                )}
              </div>
              
              <div className="text-lg font-medium mb-1">{region.label}</div>
              <div className="text-sm text-gray-500">
                {regionCategories.length > 0 && (
                  <div>{regionCategories.length} {regionCategories.length === 1 ? 'país' : 'países'}</div>
                )}
                {regionalPlansCount > 0 && (
                  <div>{regionalPlansCount} {regionalPlansCount === 1 ? 'plan regional' : 'planes regionales'}</div>
                )}
                {!hasContent && <div>Sin contenido</div>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};