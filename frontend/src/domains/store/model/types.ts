export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'Sensors' | 'Microcontrollers' | 'Accessories' | 'Apparel & Bags' | 'Stationery' | 'Rental' | 'Robotics Kits';
  rating: number;
  reviewsCount: number;
  features: string[];
  rentalPrice?: number;
  rentalPeriod?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
