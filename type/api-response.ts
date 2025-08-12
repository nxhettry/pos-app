export type LoginResponse = {
  statusCode: number;
  data: {
    user: {
      id: number;
      username: string;
      role: string;
      email: string | null;
      phone: string | null;
      isActive: boolean;
    };
  };
  message: string;
  status: boolean;
};

export type TablesResponse = {
  statusCode: number;
  data: {
    id: number;
    name: string;
    status: "available" | "unavailable" | "reserved";
    createdAt: string;
    updatedAt: string;
  }[];
  message: string;
  status: boolean;
};

export type CategoryResponse = {
  statusCode: number;
  data: {
    id: number;
    name: string;
    description: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }[];
  message: string;
  status: boolean;
};

export type ItemResponse = {
  statusCode: number;
  data: {
    id: number;
    categoryId: number;
    itemName: string;
    description: string | null;
    rate: number;
    image: string | null;
    isAvailable: boolean;
    createdAt: string;
    updatedAt: string;
    MenuCategory: Category;
  }[];
  message: string;
  status: boolean;
};

interface Category {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
