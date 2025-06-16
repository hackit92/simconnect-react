import { createClient } from '@supabase/supabase-js@2';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

async function testImport() {
  try {
    // Check if the function is accessible
    const healthCheck = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-woocommerce`,
      {
        method: 'OPTIONS',
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!healthCheck.ok) {
      throw new Error('Edge function is not accessible. Please ensure it is deployed correctly.');
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-woocommerce`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Content-Type': 'application/json'
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Sync failed: ${errorData.error || 'Unknown error'}`);
    }

    const result = await response.json();
    console.log('Import result:', result);

    // Verify imported data
    const { data: products } = await supabase
      .from('wc_products')
      .select('*')
      .order('created_at', { ascending: false });
    
    console.log('Imported products:', products);

    const { data: categories } = await supabase
      .from('wc_categories')
      .select('*')
      .order('name');
    
    console.log('Imported categories:', categories);

  } catch (error) {
    console.error('Import test failed:', error.message);
    throw error; // Re-throw to be handled by the calling code
  }
}

testImport();