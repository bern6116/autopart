export type SortOption =
  | "featured"
  | "price_asc"
  | "price_desc"
  | "newest"
  | "best_selling"
  | "top_rated";

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "best_selling", label: "Best Selling" },
  { value: "top_rated", label: "Top Rated" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
];

export interface ShopFiltersState {
  search: string;
  categories: string[];
  brands: string[];
  priceMin: number;
  priceMax: number;
  stockStatus: Array<"in_stock" | "low_stock" | "out_of_stock">;
  ratingMin: number;
  isOnSale: boolean;
  isNew: boolean;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
}
