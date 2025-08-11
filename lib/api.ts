// API utility functions for the POS system

export interface User {
  id: number;
  staffId: string;
  name: string;
  role: string;
}

export interface Table {
  id: number;
  name: string;
  capacity: number;
  status: "available" | "occupied" | "reserved";
  currentGuests?: number;
  reservedTime?: string;
}

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  isAvailable: boolean;
}

export interface CartItem {
  id?: number;
  cartId?: number;
  itemId: number;
  quantity: number;
  rate: number;
  totalPrice: number;
  notes?: string;
  menuItem: MenuItem;
}

export interface Cart {
  id?: number;
  tableId: number;
  userId: number;
  status: "open" | "closed" | "cancelled";
  items: CartItem[];
}

// Authentication API
export const authAPI = {
  login: async (id: string, password: string): Promise<User> => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Login failed");
    }

    const data = await response.json();
    return data.user;
  },
};

// Tables API
export const tablesAPI = {
  getAll: async (): Promise<Table[]> => {
    const response = await fetch("/api/tables");

    if (!response.ok) {
      throw new Error("Failed to fetch tables");
    }

    const data = await response.json();
    return data.tables;
  },
};

// Cart API
export const cartAPI = {
  getByTableId: async (tableId: number): Promise<Cart> => {
    const response = await fetch(`/api/carts/${tableId}`);

    if (!response.ok) {
      throw new Error("Failed to fetch cart");
    }

    const data = await response.json();
    return data.cart;
  },

  update: async (tableId: number, cart: Cart): Promise<void> => {
    const response = await fetch(`/api/carts/${tableId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cart.items }),
    });

    if (!response.ok) {
      throw new Error("Failed to update cart");
    }
  },
};

// Menu API
export const menuAPI = {
  getAll: async (): Promise<
    { id: string; name: string; items: MenuItem[] }[]
  > => {
    const response = await fetch("/api/menu");

    if (!response.ok) {
      throw new Error("Failed to fetch menu");
    }

    const data = await response.json();
    return data.menu;
  },
};
