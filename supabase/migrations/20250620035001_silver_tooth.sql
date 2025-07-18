/*
  # Update country code mapping function

  1. Changes
    - Update get_iso2_from_slug function to include comprehensive country mappings
    - Add mappings for Afghanistan, Aruba, and many other missing countries
    - Ensure proper country name display in cart and product listings

  2. Security
    - No changes to RLS policies
*/

-- Update the country code mapping function with comprehensive mappings
CREATE OR REPLACE FUNCTION get_iso2_from_slug(slug_input text)
RETURNS text AS $$
BEGIN
  -- Direct mapping for common country slugs to ISO2 codes
  RETURN CASE slug_input
    -- Europe
    WHEN 'spain' THEN 'es'
    WHEN 'espana' THEN 'es'
    WHEN 'españa' THEN 'es'
    WHEN 'france' THEN 'fr'
    WHEN 'francia' THEN 'fr'
    WHEN 'germany' THEN 'de'
    WHEN 'alemania' THEN 'de'
    WHEN 'italy' THEN 'it'
    WHEN 'italia' THEN 'it'
    WHEN 'united-kingdom' THEN 'gb'
    WHEN 'reino-unido' THEN 'gb'
    WHEN 'netherlands' THEN 'nl'
    WHEN 'holanda' THEN 'nl'
    WHEN 'paises-bajos' THEN 'nl'
    WHEN 'portugal' THEN 'pt'
    WHEN 'greece' THEN 'gr'
    WHEN 'grecia' THEN 'gr'
    WHEN 'switzerland' THEN 'ch'
    WHEN 'suiza' THEN 'ch'
    WHEN 'austria' THEN 'at'
    WHEN 'belgium' THEN 'be'
    WHEN 'belgica' THEN 'be'
    WHEN 'denmark' THEN 'dk'
    WHEN 'dinamarca' THEN 'dk'
    WHEN 'finland' THEN 'fi'
    WHEN 'finlandia' THEN 'fi'
    WHEN 'ireland' THEN 'ie'
    WHEN 'irlanda' THEN 'ie'
    WHEN 'norway' THEN 'no'
    WHEN 'noruega' THEN 'no'
    WHEN 'sweden' THEN 'se'
    WHEN 'suecia' THEN 'se'
    WHEN 'poland' THEN 'pl'
    WHEN 'polonia' THEN 'pl'
    WHEN 'czechia' THEN 'cz'
    WHEN 'czech-republic' THEN 'cz'
    WHEN 'republica-checa' THEN 'cz'
    WHEN 'hungary' THEN 'hu'
    WHEN 'hungria' THEN 'hu'
    WHEN 'romania' THEN 'ro'
    WHEN 'rumania' THEN 'ro'
    WHEN 'bulgaria' THEN 'bg'
    WHEN 'croatia' THEN 'hr'
    WHEN 'croacia' THEN 'hr'
    WHEN 'slovenia' THEN 'si'
    WHEN 'eslovenia' THEN 'si'
    WHEN 'slovakia' THEN 'sk'
    WHEN 'eslovaquia' THEN 'sk'
    WHEN 'lithuania' THEN 'lt'
    WHEN 'lituania' THEN 'lt'
    WHEN 'latvia' THEN 'lv'
    WHEN 'letonia' THEN 'lv'
    WHEN 'estonia' THEN 'ee'
    WHEN 'iceland' THEN 'is'
    WHEN 'islandia' THEN 'is'
    WHEN 'luxembourg' THEN 'lu'
    WHEN 'luxemburgo' THEN 'lu'
    WHEN 'malta' THEN 'mt'
    WHEN 'cyprus' THEN 'cy'
    WHEN 'chipre' THEN 'cy'
    WHEN 'albania' THEN 'al'
    WHEN 'bosnia-and-herzegovina' THEN 'ba'
    WHEN 'bosnia-y-herzegovina' THEN 'ba'
    WHEN 'montenegro' THEN 'me'
    WHEN 'serbia' THEN 'rs'
    WHEN 'north-macedonia' THEN 'mk'
    WHEN 'macedonia-del-norte' THEN 'mk'
    WHEN 'kosovo' THEN 'xk'
    
    -- Americas
    WHEN 'united-states' THEN 'us'
    WHEN 'estados-unidos' THEN 'us'
    WHEN 'canada' THEN 'ca'
    WHEN 'mexico' THEN 'mx'
    WHEN 'mejico' THEN 'mx'
    WHEN 'brazil' THEN 'br'
    WHEN 'brasil' THEN 'br'
    WHEN 'argentina' THEN 'ar'
    WHEN 'chile' THEN 'cl'
    WHEN 'colombia' THEN 'co'
    WHEN 'peru' THEN 'pe'
    WHEN 'venezuela' THEN 've'
    WHEN 'ecuador' THEN 'ec'
    WHEN 'bolivia' THEN 'bo'
    WHEN 'paraguay' THEN 'py'
    WHEN 'uruguay' THEN 'uy'
    WHEN 'costa-rica' THEN 'cr'
    WHEN 'panama' THEN 'pa'
    WHEN 'guatemala' THEN 'gt'
    WHEN 'honduras' THEN 'hn'
    WHEN 'el-salvador' THEN 'sv'
    WHEN 'nicaragua' THEN 'ni'
    WHEN 'cuba' THEN 'cu'
    WHEN 'dominican-republic' THEN 'do'
    WHEN 'republica-dominicana' THEN 'do'
    WHEN 'jamaica' THEN 'jm'
    WHEN 'haiti' THEN 'ht'
    WHEN 'bahamas' THEN 'bs'
    WHEN 'barbados' THEN 'bb'
    WHEN 'trinidad-and-tobago' THEN 'tt'
    WHEN 'trinidad-y-tobago' THEN 'tt'
    WHEN 'antigua-and-barbuda' THEN 'ag'
    WHEN 'antigua-y-barbuda' THEN 'ag'
    WHEN 'saint-lucia' THEN 'lc'
    WHEN 'santa-lucia' THEN 'lc'
    WHEN 'grenada' THEN 'gd'
    WHEN 'granada' THEN 'gd'
    WHEN 'saint-vincent-and-the-grenadines' THEN 'vc'
    WHEN 'san-vicente-y-las-granadinas' THEN 'vc'
    WHEN 'saint-kitts-and-nevis' THEN 'kn'
    WHEN 'san-cristobal-y-nieves' THEN 'kn'
    WHEN 'dominica' THEN 'dm'
    WHEN 'belize' THEN 'bz'
    WHEN 'guyana' THEN 'gy'
    WHEN 'suriname' THEN 'sr'
    WHEN 'french-guiana' THEN 'gf'
    WHEN 'guayana-francesa' THEN 'gf'
    WHEN 'puerto-rico' THEN 'pr'
    WHEN 'aruba' THEN 'aw'
    WHEN 'curacao' THEN 'cw'
    WHEN 'sint-maarten' THEN 'sx'
    
    -- Asia
    WHEN 'china' THEN 'cn'
    WHEN 'japan' THEN 'jp'
    WHEN 'japon' THEN 'jp'
    WHEN 'south-korea' THEN 'kr'
    WHEN 'corea-del-sur' THEN 'kr'
    WHEN 'north-korea' THEN 'kp'
    WHEN 'corea-del-norte' THEN 'kp'
    WHEN 'india' THEN 'in'
    WHEN 'thailand' THEN 'th'
    WHEN 'tailandia' THEN 'th'
    WHEN 'singapore' THEN 'sg'
    WHEN 'singapur' THEN 'sg'
    WHEN 'malaysia' THEN 'my'
    WHEN 'malasia' THEN 'my'
    WHEN 'indonesia' THEN 'id'
    WHEN 'philippines' THEN 'ph'
    WHEN 'filipinas' THEN 'ph'
    WHEN 'vietnam' THEN 'vn'
    WHEN 'cambodia' THEN 'kh'
    WHEN 'camboya' THEN 'kh'
    WHEN 'laos' THEN 'la'
    WHEN 'myanmar' THEN 'mm'
    WHEN 'bangladesh' THEN 'bd'
    WHEN 'pakistan' THEN 'pk'
    WHEN 'sri-lanka' THEN 'lk'
    WHEN 'afghanistan' THEN 'af'
    WHEN 'afganistan' THEN 'af'
    WHEN 'nepal' THEN 'np'
    WHEN 'bhutan' THEN 'bt'
    WHEN 'butan' THEN 'bt'
    WHEN 'maldives' THEN 'mv'
    WHEN 'maldivas' THEN 'mv'
    WHEN 'brunei' THEN 'bn'
    WHEN 'brunei-darussalam' THEN 'bn'
    WHEN 'east-timor' THEN 'tl'
    WHEN 'timor-oriental' THEN 'tl'
    WHEN 'mongolia' THEN 'mn'
    
    -- Central Asia
    WHEN 'kazakhstan' THEN 'kz'
    WHEN 'kazajistan' THEN 'kz'
    WHEN 'uzbekistan' THEN 'uz'
    WHEN 'kyrgyzstan' THEN 'kg'
    WHEN 'kirguistan' THEN 'kg'
    WHEN 'tajikistan' THEN 'tj'
    WHEN 'tayikistan' THEN 'tj'
    WHEN 'turkmenistan' THEN 'tm'
    
    -- Caucasus
    WHEN 'georgia' THEN 'ge'
    WHEN 'armenia' THEN 'am'
    WHEN 'azerbaijan' THEN 'az'
    WHEN 'azerbaiyan' THEN 'az'
    
    -- Middle East
    WHEN 'israel' THEN 'il'
    WHEN 'turkey' THEN 'tr'
    WHEN 'turquia' THEN 'tr'
    WHEN 'united-arab-emirates' THEN 'ae'
    WHEN 'emiratos-arabes-unidos' THEN 'ae'
    WHEN 'saudi-arabia' THEN 'sa'
    WHEN 'arabia-saudita' THEN 'sa'
    WHEN 'qatar' THEN 'qa'
    WHEN 'catar' THEN 'qa'
    WHEN 'kuwait' THEN 'kw'
    WHEN 'bahrain' THEN 'bh'
    WHEN 'barein' THEN 'bh'
    WHEN 'oman' THEN 'om'
    WHEN 'jordan' THEN 'jo'
    WHEN 'jordania' THEN 'jo'
    WHEN 'lebanon' THEN 'lb'
    WHEN 'libano' THEN 'lb'
    WHEN 'syria' THEN 'sy'
    WHEN 'siria' THEN 'sy'
    WHEN 'iraq' THEN 'iq'
    WHEN 'iran' THEN 'ir'
    WHEN 'palestine' THEN 'ps'
    WHEN 'palestina' THEN 'ps'
    
    -- Africa
    WHEN 'south-africa' THEN 'za'
    WHEN 'sudafrica' THEN 'za'
    WHEN 'egypt' THEN 'eg'
    WHEN 'egipto' THEN 'eg'
    WHEN 'morocco' THEN 'ma'
    WHEN 'marruecos' THEN 'ma'
    WHEN 'nigeria' THEN 'ng'
    WHEN 'kenya' THEN 'ke'
    WHEN 'ghana' THEN 'gh'
    WHEN 'ethiopia' THEN 'et'
    WHEN 'etiopia' THEN 'et'
    WHEN 'tanzania' THEN 'tz'
    WHEN 'uganda' THEN 'ug'
    WHEN 'zimbabwe' THEN 'zw'
    WHEN 'zambia' THEN 'zm'
    WHEN 'botswana' THEN 'bw'
    WHEN 'namibia' THEN 'na'
    WHEN 'algeria' THEN 'dz'
    WHEN 'argelia' THEN 'dz'
    WHEN 'tunisia' THEN 'tn'
    WHEN 'tunez' THEN 'tn'
    WHEN 'libya' THEN 'ly'
    WHEN 'libia' THEN 'ly'
    WHEN 'sudan' THEN 'sd'
    WHEN 'south-sudan' THEN 'ss'
    WHEN 'sudan-del-sur' THEN 'ss'
    WHEN 'angola' THEN 'ao'
    WHEN 'mozambique' THEN 'mz'
    WHEN 'madagascar' THEN 'mg'
    WHEN 'mauritius' THEN 'mu'
    WHEN 'mauricio' THEN 'mu'
    WHEN 'seychelles' THEN 'sc'
    WHEN 'comoros' THEN 'km'
    WHEN 'comoras' THEN 'km'
    WHEN 'djibouti' THEN 'dj'
    WHEN 'yibuti' THEN 'dj'
    WHEN 'eritrea' THEN 'er'
    WHEN 'somalia' THEN 'so'
    WHEN 'rwanda' THEN 'rw'
    WHEN 'ruanda' THEN 'rw'
    WHEN 'burundi' THEN 'bi'
    WHEN 'congo' THEN 'cg'
    WHEN 'congo-democratic-republic' THEN 'cd'
    WHEN 'congo-republica-democratica' THEN 'cd'
    WHEN 'central-african-republic' THEN 'cf'
    WHEN 'republica-centroafricana' THEN 'cf'
    WHEN 'chad' THEN 'td'
    WHEN 'cameroon' THEN 'cm'
    WHEN 'camerun' THEN 'cm'
    WHEN 'equatorial-guinea' THEN 'gq'
    WHEN 'guinea-ecuatorial' THEN 'gq'
    WHEN 'gabon' THEN 'ga'
    WHEN 'sao-tome-and-principe' THEN 'st'
    WHEN 'santo-tome-y-principe' THEN 'st'
    WHEN 'cape-verde' THEN 'cv'
    WHEN 'cabo-verde' THEN 'cv'
    WHEN 'guinea' THEN 'gn'
    WHEN 'guinea-bissau' THEN 'gw'
    WHEN 'guinea-bisau' THEN 'gw'
    WHEN 'sierra-leone' THEN 'sl'
    WHEN 'liberia' THEN 'lr'
    WHEN 'cote-divoire' THEN 'ci'
    WHEN 'costa-de-marfil' THEN 'ci'
    WHEN 'burkina-faso' THEN 'bf'
    WHEN 'mali' THEN 'ml'
    WHEN 'niger' THEN 'ne'
    WHEN 'senegal' THEN 'sn'
    WHEN 'gambia' THEN 'gm'
    WHEN 'mauritania' THEN 'mr'
    WHEN 'western-sahara' THEN 'eh'
    WHEN 'sahara-occidental' THEN 'eh'
    WHEN 'benin' THEN 'bj'
    WHEN 'togo' THEN 'tg'
    WHEN 'malawi' THEN 'mw'
    WHEN 'lesotho' THEN 'ls'
    WHEN 'eswatini' THEN 'sz'
    WHEN 'swaziland' THEN 'sz'
    
    -- Oceania
    WHEN 'australia' THEN 'au'
    WHEN 'new-zealand' THEN 'nz'
    WHEN 'nueva-zelanda' THEN 'nz'
    WHEN 'fiji' THEN 'fj'
    WHEN 'papua-new-guinea' THEN 'pg'
    WHEN 'papua-nueva-guinea' THEN 'pg'
    WHEN 'samoa' THEN 'ws'
    WHEN 'tonga' THEN 'to'
    WHEN 'vanuatu' THEN 'vu'
    WHEN 'solomon-islands' THEN 'sb'
    WHEN 'islas-salomon' THEN 'sb'
    WHEN 'palau' THEN 'pw'
    WHEN 'palaos' THEN 'pw'
    WHEN 'micronesia' THEN 'fm'
    WHEN 'marshall-islands' THEN 'mh'
    WHEN 'islas-marshall' THEN 'mh'
    WHEN 'kiribati' THEN 'ki'
    WHEN 'nauru' THEN 'nr'
    WHEN 'tuvalu' THEN 'tv'
    WHEN 'cook-islands' THEN 'ck'
    WHEN 'islas-cook' THEN 'ck'
    WHEN 'niue' THEN 'nu'
    WHEN 'tokelau' THEN 'tk'
    WHEN 'new-caledonia' THEN 'nc'
    WHEN 'nueva-caledonia' THEN 'nc'
    WHEN 'french-polynesia' THEN 'pf'
    WHEN 'polinesia-francesa' THEN 'pf'
    WHEN 'wallis-and-futuna' THEN 'wf'
    WHEN 'wallis-y-futuna' THEN 'wf'
    WHEN 'pitcairn' THEN 'pn'
    WHEN 'islas-pitcairn' THEN 'pn'
    WHEN 'norfolk-island' THEN 'nf'
    WHEN 'isla-norfolk' THEN 'nf'
    
    -- Eastern Europe and Russia
    WHEN 'russia' THEN 'ru'
    WHEN 'rusia' THEN 'ru'
    WHEN 'ukraine' THEN 'ua'
    WHEN 'ucrania' THEN 'ua'
    WHEN 'belarus' THEN 'by'
    WHEN 'bielorrusia' THEN 'by'
    WHEN 'moldova' THEN 'md'
    WHEN 'moldavia' THEN 'md'
    
    -- Additional territories and dependencies
    WHEN 'andorra' THEN 'ad'
    WHEN 'monaco' THEN 'mc'
    WHEN 'san-marino' THEN 'sm'
    WHEN 'vatican-city' THEN 'va'
    WHEN 'ciudad-del-vaticano' THEN 'va'
    WHEN 'liechtenstein' THEN 'li'
    WHEN 'faroe-islands' THEN 'fo'
    WHEN 'islas-feroe' THEN 'fo'
    WHEN 'greenland' THEN 'gl'
    WHEN 'groenlandia' THEN 'gl'
    WHEN 'svalbard' THEN 'sj'
    WHEN 'isle-of-man' THEN 'im'
    WHEN 'isla-de-man' THEN 'im'
    WHEN 'jersey' THEN 'je'
    WHEN 'guernsey' THEN 'gg'
    WHEN 'gibraltar' THEN 'gi'
    WHEN 'bermuda' THEN 'bm'
    WHEN 'falkland-islands' THEN 'fk'
    WHEN 'islas-malvinas' THEN 'fk'
    WHEN 'south-georgia' THEN 'gs'
    WHEN 'georgia-del-sur' THEN 'gs'
    WHEN 'saint-helena' THEN 'sh'
    WHEN 'santa-elena' THEN 'sh'
    WHEN 'saint-barthelemy' THEN 'bl'
    WHEN 'san-bartolome' THEN 'bl'
    WHEN 'saint-martin' THEN 'mf'
    WHEN 'san-martin' THEN 'mf'
    WHEN 'saint-pierre-and-miquelon' THEN 'pm'
    WHEN 'san-pedro-y-miquelon' THEN 'pm'
    WHEN 'guadeloupe' THEN 'gp'
    WHEN 'guadalupe' THEN 'gp'
    WHEN 'martinique' THEN 'mq'
    WHEN 'martinica' THEN 'mq'
    WHEN 'mayotte' THEN 'yt'
    WHEN 'reunion' THEN 're'
    WHEN 'guam' THEN 'gu'
    WHEN 'northern-mariana-islands' THEN 'mp'
    WHEN 'islas-marianas-del-norte' THEN 'mp'
    WHEN 'american-samoa' THEN 'as'
    WHEN 'samoa-americana' THEN 'as'
    WHEN 'virgin-islands-us' THEN 'vi'
    WHEN 'islas-virgenes-us' THEN 'vi'
    WHEN 'virgin-islands-british' THEN 'vg'
    WHEN 'islas-virgenes-britanicas' THEN 'vg'
    WHEN 'turks-and-caicos' THEN 'tc'
    WHEN 'islas-turcas-y-caicos' THEN 'tc'
    WHEN 'cayman-islands' THEN 'ky'
    WHEN 'islas-caiman' THEN 'ky'
    WHEN 'anguilla' THEN 'ai'
    WHEN 'montserrat' THEN 'ms'
    WHEN 'heard-island' THEN 'hm'
    WHEN 'bouvet-island' THEN 'bv'
    WHEN 'isla-bouvet' THEN 'bv'
    WHEN 'christmas-island' THEN 'cx'
    WHEN 'isla-de-navidad' THEN 'cx'
    WHEN 'cocos-islands' THEN 'cc'
    WHEN 'islas-cocos' THEN 'cc'
    
    -- If no match found, try to extract first 2 characters if it looks like an ISO2 code
    ELSE 
      CASE 
        WHEN length(slug_input) = 2 THEN lower(slug_input)
        WHEN length(slug_input) >= 2 AND slug_input ~ '^[a-zA-Z]{2}$' THEN lower(slug_input)
        ELSE NULL
      END
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update existing products with country_code based on their categories
UPDATE wc_products 
SET country_code = (
  SELECT get_iso2_from_slug(c.slug)
  FROM wc_categories c
  WHERE c.id = ANY(
    SELECT jsonb_array_elements_text(wc_products.category_ids)::integer
  )
  AND get_iso2_from_slug(c.slug) IS NOT NULL
  LIMIT 1
)
WHERE plan_type = 'country' 
  AND (country_code IS NULL OR country_code = '')
  AND category_ids IS NOT NULL 
  AND jsonb_array_length(category_ids) > 0;