"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { X, Search } from "lucide-react";

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  isAvailable: boolean;
  image?: string;
}

interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

const mockMenuData: MenuCategory[] = [
  {
    id: "appetizers",
    name: "Appetizers",
    items: [
      {
        id: 1,
        name: "Caesar Salad",
        description: "Fresh romaine lettuce with parmesan cheese and croutons",
        price: 8.99,
        category: "Appetizers",
        isAvailable: true,
      },
      {
        id: 2,
        name: "Chicken Wings",
        description: "Spicy buffalo wings served with ranch dressing",
        price: 12.99,
        category: "Appetizers",
        isAvailable: true,
      },
      {
        id: 3,
        name: "Mozzarella Sticks",
        description: "Golden fried mozzarella with marinara sauce",
        price: 9.99,
        category: "Appetizers",
        isAvailable: false,
      },
    ],
  },
  {
    id: "main-course",
    name: "Main Course",
    items: [
      {
        id: 4,
        name: "Chicken Curry",
        description: "Traditional curry with basmati rice and naan bread",
        price: 15.99,
        category: "Main Course",
        isAvailable: true,
      },
      {
        id: 5,
        name: "Vegetable Fried Rice",
        description: "Wok-fried rice with mixed vegetables and soy sauce",
        price: 12.99,
        category: "Main Course",
        isAvailable: true,
      },
      {
        id: 6,
        name: "Grilled Salmon",
        description: "Fresh Atlantic salmon with lemon butter sauce",
        price: 18.99,
        category: "Main Course",
        isAvailable: true,
      },
      {
        id: 7,
        name: "Beef Steak",
        description: "8oz ribeye steak with garlic mashed potatoes",
        price: 24.99,
        category: "Main Course",
        isAvailable: false,
      },
    ],
  },
  {
    id: "desserts",
    name: "Desserts",
    items: [
      {
        id: 8,
        name: "Chocolate Cake",
        description: "Rich chocolate cake with vanilla ice cream",
        price: 6.99,
        category: "Desserts",
        isAvailable: true,
      },
      {
        id: 9,
        name: "Tiramisu",
        description: "Classic Italian dessert with coffee and mascarpone",
        price: 7.99,
        category: "Desserts",
        isAvailable: true,
      },
    ],
  },
  {
    id: "beverages",
    name: "Beverages",
    items: [
      {
        id: 10,
        name: "Fresh Orange Juice",
        description: "Freshly squeezed orange juice",
        price: 4.99,
        category: "Beverages",
        isAvailable: true,
      },
      {
        id: 11,
        name: "Coffee",
        description: "Freshly brewed coffee",
        price: 2.99,
        category: "Beverages",
        isAvailable: true,
      },
      {
        id: 12,
        name: "Soft Drinks",
        description: "Coca-Cola, Pepsi, Sprite, Fanta",
        price: 2.49,
        category: "Beverages",
        isAvailable: true,
      },
    ],
  },
];

interface MenuModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MenuModal({ isOpen, onClose }: MenuModalProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<string>("appetizers");
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const filteredCategories = mockMenuData.map((category) => ({
    ...category,
    items: category.items.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  }));

  const selectedCategoryData = filteredCategories.find(
    (cat) => cat.id === selectedCategory
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col z-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-slate-900">Menu</h1>
            <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Category Sidebar */}
        <div className="w-32 bg-slate-50 border-r overflow-y-auto">
          <div className="p-2 space-y-1">
            {filteredCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`w-full text-left p-3 rounded-lg text-sm font-medium transition-colors रु. {
                  selectedCategory === category.id
                    ? "bg-blue-600 text-white"
                    : "text-slate-700 hover:bg-slate-200"
                }`}
              >
                {category.name}
                <div className="text-xs opacity-75 mt-1">
                  {category.items.length} items
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="p-4">
            {selectedCategoryData && (
              <>
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  {selectedCategoryData.name}
                </h2>

                {selectedCategoryData.items.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    {searchQuery
                      ? "No items match your search"
                      : "No items in this category"}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedCategoryData.items.map((item) => (
                      <Card
                        key={item.id}
                        className={`रु. {!item.isAvailable ? "opacity-60" : ""}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-lg text-slate-900">
                                  {item.name}
                                </h3>
                                {!item.isAvailable && (
                                  <Badge
                                    variant="outline"
                                    className="text-red-600 border-red-200"
                                  >
                                    Out of Stock
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-slate-600 mb-2">
                                {item.description}
                              </p>
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-xl font-bold text-slate-900">
                                रु. {item.price.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
