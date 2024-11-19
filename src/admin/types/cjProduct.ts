export interface CJProduct {
  catalog_id: string;
  name: string;
  description: string;
  price: number;
  retail_price: number;
  image_url: string;
  buy_url: string;
  advertiser_name: string;
  advertiser_id: string;
  category: string;
  in_stock: boolean;
  currency: string;
  imported: boolean;
}