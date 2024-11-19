/**
 * Generates a clean Amazon affiliate link with the correct format
 */
export function generateAffiliateLink(url: string): string {
  try {
    // Use browser's built-in URL API
    const amazonUrl = new window.URL(url);
    
    // Extract the ASIN
    let asin = '';
    const dpMatch = amazonUrl.pathname.match(/\/dp\/([A-Z0-9]{10})/);
    const gpdMatch = amazonUrl.pathname.match(/\/gp\/product\/([A-Z0-9]{10})/);
    
    if (dpMatch) {
      asin = dpMatch[1];
    } else if (gpdMatch) {
      asin = gpdMatch[1];
    } else {
      // Try to get ASIN from URL parameters
      asin = amazonUrl.searchParams.get('asin') || '';
    }

    if (!asin) {
      console.warn('Could not extract ASIN from URL:', url);
      return url;
    }

    // Return clean affiliate link without any additional parameters
    return `https://www.amazon.com/dp/${asin}?tag=pawfectfind-20`;
  } catch (err) {
    console.error('Error generating affiliate link:', err);
    return url;
  }
}