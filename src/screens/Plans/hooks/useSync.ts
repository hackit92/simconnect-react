import { useState } from 'react';
import { supabase } from '../../../lib/supabase';

export function useSync() {
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-external-plans`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          },
        }
      );

      if (!response.ok) {
        let errorMessage = 'Error de sincronización. ';
        
        if (response.status === 503) {
          errorMessage += 'La función de sincronización no está disponible. ' +
            'Por favor, asegúrese de que la variable de entorno EXTERNAL_API_TOKEN esté configurada en Supabase.\n\n' +
            'Si el problema persiste, contacte al administrador del sistema.';
        } else {
          errorMessage += `Error ${response.status}. Por favor, verifique que la función esté correctamente configurada en Supabase.`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      if (result.success) {
        const { data: products, error: fetchError } = await supabase
          .from('wc_products')
          .select('*')
          .order('name');

        if (fetchError) throw fetchError;
        return products;
      }
    } catch (err) {
      console.error('Error during sync:', err);
      setError(err.message);
    } finally {
      setSyncing(false);
    }
  };

  return { handleSync, syncing, error };
}