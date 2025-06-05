// Form field types
export interface FormField {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  options?: string[];
}

// Product specification ranges
export interface SpecificationRange {
  min: number;
  max: number;
  unit: string;
}

export interface ProductSpecifications {
  // Wetsuit specifications
  heightRange?: SpecificationRange;
  weightRange?: SpecificationRange;
  chestSizeRange?: SpecificationRange;
  waterTempRange?: SpecificationRange;
  thicknessOptions?: string[];
  
  // Ski/Snowboard specifications
  lengthRange?: SpecificationRange;
  weightCapacityRange?: SpecificationRange;
  experienceLevel?: string[];
  ridingStyleOptions?: string[];
  
  // Skateboard specifications
  deckWidthRange?: SpecificationRange;
  wheelDiameterRange?: SpecificationRange;
  durometer?: SpecificationRange;
  
  // Helmet specifications
  headCircumferenceRange?: SpecificationRange;
  
  // General specifications
  sizeOptions?: string[];
  ageRange?: SpecificationRange;
}

// Product types
export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  description?: string;
  features: string[];
  category: string;
  sport: string;
  quantity: number;
  inStock: boolean;
  image?: string;
  score?: number;
  matchReasons?: string[];
  specifications?: ProductSpecifications;
}

// Product for recommendations (includes score and match reasons)
export interface RecommendationProduct extends Product {
  score: number;
  matchReasons: string[];
}

// Form data type
export interface FormData {
  [key: string]: string | number;
}

// Category forms structure
export interface CategoryForms {
  [sport: string]: {
    [category: string]: FormField[];
  };
}
