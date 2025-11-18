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

export type CartResponse = {
  statusCode: number;
  data: Cart[];
  message: string;
  status: boolean;
};

export interface Cart {
  cartItems: never[];
  id?: number;
  tableId: number;
  createdBy: number | null;
  status: "open" | "closed" | "pending";
  createdAt: string;
  updatedAt: string;
  User: User | null;
  CartItems: CartItem[];
}

export interface CartItem {
  id: number;
  cartId: number;
  itemId: number;
  quantity: number;
  rate: number;
  totalPrice: number;
  notes: string | null;
  createdAt: string;
  MenuItem: MenuItem;
  Item?: MenuItem;
}

export interface MenuItem {
  id: number;
  categoryId: number;
  itemName: string;
  description: string | null;
  rate: number;
  image: string | null;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  username: string;
  role: string;
  email: string | null;
  phone: string | null;
  isActive: boolean;
}
