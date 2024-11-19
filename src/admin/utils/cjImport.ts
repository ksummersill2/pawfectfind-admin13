import { CJProduct } from '../types/cjProduct';

export const extractPrice = (priceStr: string | undefined): number => {
  if (!priceStr) return 0;
  
  // Try to find a price pattern in the string
  const priceMatch = priceStr.match(/[\d,.]+/);
  if (!priceMatch) return 0;

  // Clean up the price string and convert to number
  const cleanPrice = priceMatch[0].replace(/,/g, '');
  const price = parseFloat(cleanPrice);
  
  return isNaN(price) ? 0 : price;
};

export const extractImageUrl = (htmlStr: string | undefined): string => {
  if (!htmlStr) return '';
  const match = htmlStr.match(/src="([^"]+)"/);
  return match ? match[1] : '';
};

export const mapCsvToProduct = (row: Record<string, any>): Partial<CJProduct> => {
  // Default to 0 for price if not found
  const defaultPrice = 19.99;

  return {
    catalog_id: row['LINK ID'] || row['LINK_ID'] || '',
    name: row['NAME'] || '',
    description: row['DESCRIPTION'] || '',
    price: defaultPrice, // Set default price since CJ doesn't provide prices in feed
    retail_price: defaultPrice,
    image_url: extractImageUrl(row['HTML_LINKS'] || row['HTML LINKS']),
    buy_url: row['CLICK URL'] || row['CLICK_URL'] || '',
    advertiser_name: row['ADVERTISER'] || '',
    advertiser_id: row['ADV_CID'] || '',
    category: row['CATEGORY'] || 'Pets',
    in_stock: true,
    currency: 'USD',
    imported: false
  };
};

export const validateProduct = (product: Partial<CJProduct>): string | null => {
  if (!product.catalog_id) return 'Missing catalog ID';
  if (!product.name) return 'Missing product name';
  if (!product.buy_url) return 'Missing buy URL';
  if (!product.image_url) return 'Missing image URL';
  return null;
};