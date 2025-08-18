"use client";

import React, { useState, useMemo, useEffect } from "react";
import useMenu from "@/hooks/use-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { X, Search } from "lucide-react";

interface MenuModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MenuModal({ isOpen, onClose }: MenuModalProps) {
  const { data: menuData, isLoading, isError } = useMenu();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = useMemo(() => {
    if (!menuData) return [];
    return menuData.map(
      (cat: {
        category: {
          name: string;
          items: Array<{
            id: number;
            itemName: string;
            description: string | null;
            rate: number;
            isAvailable: boolean;
          }>;
        };
      }) => ({
        id: cat.category.name,
        name: cat.category.name,
        items: cat.category.items.map((item) => ({
          id: item.id,
          name: item.itemName,
          description: item.description || "",
          price: item.rate,
          isAvailable: item.isAvailable,
        })),
      })
    );
  }, [menuData]);

  useEffect(() => {
    if (categories.length && !selectedCategory) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories, selectedCategory]);

  const filteredCategories = useMemo(
    () =>
      categories.map((category) => ({
        ...category,
        items: category.items.filter(
          (item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })),
    [categories, searchQuery]
  );

  const selectedCategoryData = filteredCategories.find(
    (cat) => cat.id === selectedCategory
  );

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded shadow text-center">
          Loading menu...
        </div>
      </div>
    );
  }

  if (isError || !categories.length) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded shadow text-center">
          Failed to load menu.
        </div>
      </div>
    );
  }

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
                className={`w-full text-left p-3 rounded-lg text-sm font-medium transition-colors ${
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
                    {selectedCategoryData.items.map(
                      (item: {
                        id: number;
                        name: string;
                        description: string;
                        price: number;
                        isAvailable: boolean;
                      }) => (
                        <Card
                          key={item.id}
                          className={!item.isAvailable ? "opacity-60" : ""}
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
                      )
                    )}
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
