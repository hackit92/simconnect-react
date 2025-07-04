import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'es',
    debug: true,
    
    interpolation: {
      escapeValue: false,
    },

    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    resources: {
      es: {
        translation: {
          // Navigation
          "nav.home": "Inicio",
          "nav.plans": "Planes",
          "nav.cart": "Carrito",
          
          // Home page
          "home.title": "te conectamos en",
          "home.title_bold": "+ 200 países",
          "home.subtitle": "Con nuestros servicios de datos móviles internacionales",
          "home.description_light": "ya sea por",
          "home.description_tourism": "turismo",
          "home.description_or": "o",
          "home.description_business": "negocios",
          "home.cta": "EXPLORA NUESTROS PLANES",
          
          // Plans page
          "plans.title": "¿Dónde necesitas conectarte?",
          "plans.search_placeholder": "Buscar por país o región (ej: España, Europa, Latinoamérica)",
          "plans.tab_countries": "Países",
          "plans.tab_regions": "Regiones",
          "plans.back_to_countries": "Volver a países",
          "plans.back_to_regions": "Volver a regiones",
          "plans.plans_for": "Planes para",
          "plans.available_plans": "Planes Disponibles",
          "plans.prices_in": "Precios mostrados en:",
          "plans.no_countries_found": "No se encontraron países",
          "plans.no_countries_message": "Intenta ajustar tu búsqueda o verifica que los datos estén sincronizados correctamente.",
          "plans.no_plans_found": "No se encontraron planes",
          "plans.no_plans_country_message": "No hay planes disponibles para el país seleccionado.",
          "plans.no_plans_select_message": "Selecciona un país o región para ver los planes disponibles.",
          "plans.no_results": "No se encontraron resultados",
          "plans.no_results_message": "No encontramos países o regiones que coincidan con",
          "plans.clear_search": "Limpiar búsqueda",
          "plans.countries_found": "Países encontrados para",
          "plans.hide_list": "Ocultar lista",
          "plans.loading": "Cargando...",
          "plans.loading_plans": "Cargando planes...",
          "plans.loading_regions": "Cargando regiones...",
          "plans.syncing": "Sincronizando...",
          "plans.sync": "Sincronizar",
          "plans.page_of": "Página {{current}} de {{total}}",
          "plans.previous": "Anterior",
          "plans.next": "Siguiente",
          "plans.no_content": "Sin contenido",
          "plans.country": "país",
          "plans.countries": "países",
          "plans.regional_plan": "plan regional",
          "plans.regional_plans": "planes regionales",
          
          // Plan details
          "plan.data": "Datos",
          "plan.validity": "Vigencia",
          "plan.days": "días",
          "plan.plan": "Plan",
          "plan.add_to_cart": "AÑADIR AL CARRITO",
          "plan.added_to_cart": "AÑADIDO AL CARRITO",
          "plan.regional_plan": "Plan Regional",
          "plan.international_plan": "Plan Internacional",
          "plan.regional_coverage": "Cobertura Regional:",
          
          // Cart page
          "cart.title": "Carrito de Compras",
          "cart.empty": "Vaciar",
          "cart.products_count": "{{count}} producto en tu carrito",
          "cart.products_count_plural": "{{count}} productos en tu carrito",
          "cart.empty_title": "Tu carrito está vacío",
          "cart.empty_message": "Explora nuestros planes de datos móviles y encuentra el perfecto para tu próximo viaje.",
          "cart.explore_plans": "Explorar Planes",
          "cart.quantity": "Cantidad:",
          "cart.each": "cada uno",
          "cart.order_summary": "Resumen del Pedido",
          "cart.subtotal": "Subtotal ({{count}} productos)",
          "cart.activation": "Activación",
          "cart.free": "Gratis",
          "cart.total": "Total",
          "cart.checkout": "Proceder al Pago",
          "cart.checkout_development": "Funcionalidad de pago en desarrollo. ¡Pronto estará disponible!",
          "cart.footer_text": "Activación instantánea • Soporte 24/7 • Garantía de satisfacción",
          
          // Welcome message
          "welcome.title": "Encuentra tu plan perfecto",
          "welcome.message": "Usa el buscador arriba o las pestañas de \"Países\" y \"Regiones\" para explorar nuestros planes de datos móviles",
          "welcome.feature1": "Más de 200 países disponibles",
          "welcome.feature2": "Planes regionales y por país",
          "welcome.feature3": "Activación instantánea",
          "welcome.no_data_title": "No hay datos disponibles",
          "welcome.no_data_message": "Parece que no hay países o planes cargados. Intenta sincronizar los datos.",
          
          // Regions
          "region.latinoamerica": "Latinoamérica",
          "region.europa": "Europa",
          "region.norteamerica": "Norteamérica",
          "region.balcanes": "Balcanes",
          "region.oriente-medio": "Oriente Medio",
          "region.caribe": "Caribe",
          "region.caucaso": "Cáucaso",
          "region.asia-central": "Asia Central",
          "region.asia": "Asia",
          "region.africa": "África",
          "region.oceania": "Oceanía",
          
          // Common
          "common.error": "Error:",
          "common.country": "País",
          "common.region": "Región",
          "common.loading": "Cargando...",
          "common.search": "Buscar",
          "common.clear": "Limpiar",
          "common.back": "Volver",
          "common.close": "Cerrar",
          "common.save": "Guardar",
          "common.cancel": "Cancelar",
          "common.confirm": "Confirmar",
          "common.yes": "Sí",
          "common.no": "No"
        }
      },
      en: {
        translation: {
          // Navigation
          "nav.home": "Home",
          "nav.plans": "Plans",
          "nav.cart": "Cart",
          
          // Home page
          "home.title": "we connect you in",
          "home.title_bold": "+ 200 countries",
          "home.subtitle": "With our international mobile data services",
          "home.description_light": "whether for",
          "home.description_tourism": "tourism",
          "home.description_or": "or",
          "home.description_business": "business",
          "home.cta": "EXPLORE OUR PLANS",
          
          // Plans page
          "plans.title": "Where do you need to connect?",
          "plans.search_placeholder": "Search by country or region (e.g: Spain, Europe, Latin America)",
          "plans.tab_countries": "Countries",
          "plans.tab_regions": "Regions",
          "plans.back_to_countries": "Back to countries",
          "plans.back_to_regions": "Back to regions",
          "plans.plans_for": "Plans for",
          "plans.available_plans": "Available Plans",
          "plans.prices_in": "Prices shown in:",
          "plans.no_countries_found": "No countries found",
          "plans.no_countries_message": "Try adjusting your search or verify that the data is properly synchronized.",
          "plans.no_plans_found": "No plans found",
          "plans.no_plans_country_message": "No plans available for the selected country.",
          "plans.no_plans_select_message": "Select a country or region to see available plans.",
          "plans.no_results": "No results found",
          "plans.no_results_message": "We couldn't find countries or regions matching",
          "plans.clear_search": "Clear search",
          "plans.countries_found": "Countries found for",
          "plans.hide_list": "Hide list",
          "plans.loading": "Loading...",
          "plans.loading_plans": "Loading plans...",
          "plans.loading_regions": "Loading regions...",
          "plans.syncing": "Syncing...",
          "plans.sync": "Sync",
          "plans.page_of": "Page {{current}} of {{total}}",
          "plans.previous": "Previous",
          "plans.next": "Next",
          "plans.no_content": "No content",
          "plans.country": "country",
          "plans.countries": "countries",
          "plans.regional_plan": "regional plan",
          "plans.regional_plans": "regional plans",
          
          // Plan details
          "plan.data": "Data",
          "plan.validity": "Validity",
          "plan.days": "days",
          "plan.plan": "Plan",
          "plan.add_to_cart": "ADD TO CART",
          "plan.added_to_cart": "ADDED TO CART",
          "plan.regional_plan": "Regional Plan",
          "plan.international_plan": "International Plan",
          "plan.regional_coverage": "Regional Coverage:",
          
          // Cart page
          "cart.title": "Shopping Cart",
          "cart.empty": "Empty",
          "cart.products_count": "{{count}} product in your cart",
          "cart.products_count_plural": "{{count}} products in your cart",
          "cart.empty_title": "Your cart is empty",
          "cart.empty_message": "Explore our mobile data plans and find the perfect one for your next trip.",
          "cart.explore_plans": "Explore Plans",
          "cart.quantity": "Quantity:",
          "cart.each": "each",
          "cart.order_summary": "Order Summary",
          "cart.subtotal": "Subtotal ({{count}} products)",
          "cart.activation": "Activation",
          "cart.free": "Free",
          "cart.total": "Total",
          "cart.checkout": "Proceed to Checkout",
          "cart.checkout_development": "Payment functionality in development. Coming soon!",
          "cart.footer_text": "Instant activation • 24/7 Support • Satisfaction guarantee",
          
          // Welcome message
          "welcome.title": "Find your perfect plan",
          "welcome.message": "Use the search above or the \"Countries\" and \"Regions\" tabs to explore our mobile data plans",
          "welcome.feature1": "Over 200 countries available",
          "welcome.feature2": "Regional and country-specific plans",
          "welcome.feature3": "Instant activation",
          "welcome.no_data_title": "No data available",
          "welcome.no_data_message": "It seems there are no countries or plans loaded. Try syncing the data.",
          
          // Regions
          "region.latinoamerica": "Latin America",
          "region.europa": "Europe",
          "region.norteamerica": "North America",
          "region.balcanes": "Balkans",
          "region.oriente-medio": "Middle East",
          "region.caribe": "Caribbean",
          "region.caucaso": "Caucasus",
          "region.asia-central": "Central Asia",
          "region.asia": "Asia",
          "region.africa": "Africa",
          "region.oceania": "Oceania",
          
          // Common
          "common.error": "Error:",
          "common.country": "Country",
          "common.region": "Region",
          "common.loading": "Loading...",
          "common.search": "Search",
          "common.clear": "Clear",
          "common.back": "Back",
          "common.close": "Close",
          "common.save": "Save",
          "common.cancel": "Cancel",
          "common.confirm": "Confirm",
          "common.yes": "Yes",
          "common.no": "No"
        }
      }
    }
  });

export default i18n;