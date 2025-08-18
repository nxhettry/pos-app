"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import AuthGuard from "@/components/auth-guard";
import MenuModal from "@/components/menu-modal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  Save,
  ShoppingCart,
  Menu,
  X,
  Search,
} from "lucide-react";
import useCart from "@/hooks/use-cart";
import useMenu from "@/hooks/use-menu";
import axios from "axios";
import { CartItemSchema } from "@/schema/cart-schema";
import { getUserIdFromLocalStorage } from "@/lib/utils";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!baseUrl) {
  throw new Error("API base URL is not defined");
}

interface MenuItem {
  id: number;
  itemName: string;
  categoryId: number;
  rate: number;
  description: string | null;
  image: string | null;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  MenuCategory: {
    id: number;
    name: string;
    description: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

interface CartItem {
  id?: number;
  cartId?: number;
  itemId: number;
  quantity: number;
  rate: number;
  totalPrice: number;
  notes?: string;
  menuItem: MenuItem;
}

interface Cart {
  id?: number;
  tableId: number;
  userId: number;
  status: "open" | "closed" | "cancelled";
  items: CartItem[];
}

function CartSkeleton() {
  return (
    <div className="px-4 py-4 space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-8 w-8 rounded" />
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-8" />
              </div>
              <div className="flex-1 text-right">
                <Skeleton className="h-6 w-16 ml-auto" />
              </div>
            </div>
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function CartItemComponent({
  item,
  onUpdateQuantity,
  onUpdateNotes,
  onRemove,
}: {
  item: CartItem;
  onUpdateQuantity: (itemId: number, quantity: number) => void;
  onUpdateNotes: (itemId: number, notes: string) => void;
  onRemove: (itemId: number) => void;
}) {
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-slate-900">
              {item.menuItem.itemName}
            </h3>
            <p className="text-sm text-slate-600">
              रु. {item.rate.toFixed(2)} each
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(item.itemId)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onUpdateQuantity(item.itemId, Math.max(0, item.quantity - 1))
              }
              disabled={item.quantity <= 1}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <Input
              type="number"
              value={item.quantity}
              onChange={(e) =>
                onUpdateQuantity(
                  item.itemId,
                  Math.max(1, Number.parseInt(e.target.value) || 1)
                )
              }
              className="w-20 text-center"
              min="1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdateQuantity(item.itemId, item.quantity + 1)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex-1 text-right">
            <span className="font-semibold text-lg">
              रु. {item.totalPrice.toFixed(2)}
            </span>
          </div>
        </div>

        <Textarea
          placeholder="Special instructions or notes..."
          value={item.notes || ""}
          onChange={(e) => onUpdateNotes(item.itemId, e.target.value)}
          className="resize-none"
          rows={2}
        />
      </CardContent>
    </Card>
  );
}

function AddItemModal({
  isOpen,
  onClose,
  onAddMultipleItems,
  menuData,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAddMultipleItems: (
    items: { menuItem: MenuItem; quantity: number }[]
  ) => void;
  menuData?: { category: { name: string; items: MenuItem[] } }[];
}) {
  const [selectedItems, setSelectedItems] = useState<Map<number, number>>(
    new Map()
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  if (!isOpen) return null;

  if (!menuData || !Array.isArray(menuData)) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="text-center">
            <div className="text-lg">Loading menu...</div>
          </div>
        </div>
      </div>
    );
  }

  const categories = menuData.map((item) => item.category);
  const allItems = menuData.flatMap((item) => item.category.items);

  const filteredItems = allItems.filter(
    (item) =>
      item.isAvailable &&
      (searchQuery === "" ||
        item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.MenuCategory.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()))
  );

  const displayItems = selectedCategory
    ? filteredItems.filter(
        (item) => item.MenuCategory.name === selectedCategory
      )
    : filteredItems;

  const toggleItemSelection = (item: MenuItem) => {
    const newSelected = new Map(selectedItems);
    if (newSelected.has(item.id)) {
      newSelected.delete(item.id);
    } else {
      newSelected.set(item.id, 1);
    }
    setSelectedItems(newSelected);
  };

  const updateQuantity = (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      const newSelected = new Map(selectedItems);
      newSelected.delete(itemId);
      setSelectedItems(newSelected);
    } else {
      const newSelected = new Map(selectedItems);
      newSelected.set(itemId, quantity);
      setSelectedItems(newSelected);
    }
  };

  const handleAddToCart = () => {
    const itemsToAdd: { menuItem: MenuItem; quantity: number }[] = [];

    selectedItems.forEach((quantity, itemId) => {
      const item = allItems.find((i) => i.id === itemId);
      if (item && quantity > 0) {
        itemsToAdd.push({ menuItem: item, quantity });
      }
    });

    if (itemsToAdd.length > 0) {
      onAddMultipleItems(itemsToAdd);
    }

    setSelectedItems(new Map());
    setSearchQuery("");
    setSelectedCategory(null);
    onClose();
  };

  const handleClose = () => {
    setSelectedItems(new Map());
    setSearchQuery("");
    setSelectedCategory(null);
    onClose();
  };

  const getTotalAmount = () => {
    let total = 0;
    selectedItems.forEach((quantity, itemId) => {
      const item = allItems.find((i) => i.id === itemId);
      if (item) {
        total += item.rate * quantity;
      }
    });
    return total;
  };

  const getTotalItemCount = () => {
    return Array.from(selectedItems.values()).reduce(
      (sum, qty) => sum + qty,
      0
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col z-50">
      <div className="bg-white border-b">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-slate-900">Add Items</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="p-2"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search items across all categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className="whitespace-nowrap"
            >
              All Categories (
              {allItems.filter((item) => item.isAvailable).length})
            </Button>
            {categories.map((category) => (
              <Button
                key={category.name}
                variant={
                  selectedCategory === category.name ? "default" : "outline"
                }
                size="sm"
                onClick={() => setSelectedCategory(category.name)}
                className="whitespace-nowrap"
              >
                {category.name} (
                {category.items.filter((item) => item.isAvailable).length})
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50 px-4 py-4">
        {displayItems.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            {searchQuery ? "No items match your search" : "No available items"}
          </div>
        ) : (
          <div className="space-y-3">
            {displayItems.map((item) => {
              const quantity = selectedItems.get(item.id) || 0;
              const isSelected = quantity > 0;

              return (
                <Card
                  key={item.id}
                  className={`cursor-pointer transition-all ${
                    isSelected
                      ? "ring-2 ring-blue-500 bg-blue-50"
                      : "hover:shadow-md"
                  }`}
                  onClick={() => toggleItemSelection(item)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg text-slate-900">
                            {item.itemName}
                          </h3>
                          <Badge variant="secondary" className="text-xs">
                            {item.MenuCategory.name}
                          </Badge>
                        </div>
                        {item.description && (
                          <p className="text-sm text-slate-600 mb-2">
                            {item.description}
                          </p>
                        )}
                        <div className="text-lg font-bold text-slate-900">
                          रु. {item.rate.toFixed(2)}
                        </div>
                      </div>

                      {isSelected && (
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateQuantity(
                                item.id,
                                Math.max(0, quantity - 1)
                              );
                            }}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center font-semibold">
                            {quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateQuantity(item.id, quantity + 1);
                            }}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {selectedItems.size > 0 && (
        <div className="bg-white border-t p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm text-slate-600">
                {getTotalItemCount()} items selected
              </div>
              <div className="text-lg font-bold text-slate-900">
                रु. {getTotalAmount().toFixed(2)}
              </div>
            </div>
            <Button onClick={handleAddToCart} size="lg">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TableCartPage() {
  const router = useRouter();
  const params = useParams();
  const tableId = Number.parseInt(params.id as string);

  const [cart, setCart] = useState<Cart | null>(null);
  const [isSaving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const { data: cartData, isLoading: isCartLoading } = useCart(tableId);

  const { data: menuData } = useMenu();

  useEffect(() => {
    if (!isCartLoading) {
      if (cartData && Array.isArray(cartData) && cartData.length > 0) {
        // Get the first (and should be only) cart for this table
        const serverCart = cartData[0];
        const transformedCart: Cart = {
          id: serverCart.id,
          tableId: serverCart.tableId,
          userId: 1, // Default user ID
          status: serverCart.status as "open" | "closed" | "cancelled",
          items: serverCart.CartItems
            ? serverCart.CartItems.map((item) => ({
                id: item.id,
                cartId: item.cartId,
                itemId: item.itemId,
                quantity: item.quantity,
                rate: item.rate,
                totalPrice: item.totalPrice,
                notes: item.notes || "",
                menuItem: {
                  id: item.MenuItem.id,
                  itemName: item.MenuItem.itemName,
                  categoryId: item.MenuItem.categoryId,
                  rate: item.MenuItem.rate,
                  description: item.MenuItem.description,
                  image: item.MenuItem.image,
                  isAvailable: item.MenuItem.isAvailable,
                  createdAt: item.MenuItem.createdAt,
                  updatedAt: item.MenuItem.updatedAt,
                  MenuCategory: {
                    id: item.MenuItem.categoryId,
                    name: "", // This will need to be filled from menu data
                    description: null,
                    isActive: true,
                    createdAt: "",
                    updatedAt: "",
                  },
                },
              }))
            : [],
        };
        setCart(transformedCart);
      } else {
        // No cart data, create empty cart
        const emptyCart: Cart = {
          tableId,
          userId: 1,
          status: "open",
          items: [],
        };
        setCart(emptyCart);
      }
    }
  }, [cartData, tableId, isCartLoading]);

  const updateQuantity = (itemId: number, quantity: number) => {
    if (!cart || !cart.items) return;

    const newQuantity = Math.max(1, quantity);

    setCart({
      ...cart,
      items: cart.items.map((item) =>
        item.itemId === itemId
          ? {
              ...item,
              quantity: newQuantity,
              totalPrice: item.rate * newQuantity,
            }
          : item
      ),
    });
  };

  const updateNotes = (itemId: number, notes: string) => {
    if (!cart || !cart.items) return;

    setCart({
      ...cart,
      items: cart.items.map((item) =>
        item.itemId === itemId ? { ...item, notes } : item
      ),
    });
  };

  const removeItem = (itemId: number) => {
    if (!cart || !cart.items) return;

    setCart({
      ...cart,
      items: cart.items.filter((item) => item.itemId !== itemId),
    });

    const removedItem = cart.items.find((item) => item.itemId === itemId);
    if (removedItem && removedItem.id) {
      console.log("=== ITEM TO DELETE FROM SERVER ===");
      console.log("Cart Item ID to delete:", removedItem.id);
      console.log("Item details:", {
        itemName: removedItem.menuItem?.itemName,
        quantity: removedItem.quantity,
        totalPrice: removedItem.totalPrice,
      });
    }
  };

  const addMultipleItems = (
    items: { menuItem: MenuItem; quantity: number }[]
  ) => {
    if (!cart || !items || items.length === 0) return;

    setCart((prevCart) => {
      if (!prevCart) return prevCart;

      const updatedItems = [...(prevCart.items || [])];

      items.forEach(({ menuItem, quantity }) => {
        if (!menuItem || !menuItem.id || quantity <= 0) return;

        const existingItemIndex = updatedItems.findIndex(
          (item) => item.itemId === menuItem.id
        );

        if (existingItemIndex >= 0) {
          const existingItem = updatedItems[existingItemIndex];
          const newQuantity = existingItem.quantity + quantity;
          updatedItems[existingItemIndex] = {
            ...existingItem,
            quantity: newQuantity,
            totalPrice: newQuantity * existingItem.rate,
          };
        } else {
          const newItem: CartItem = {
            itemId: menuItem.id,
            quantity,
            rate: menuItem.rate,
            totalPrice: menuItem.rate * quantity,
            menuItem,
            notes: "",
          };
          updatedItems.push(newItem);
        }
      });

      return {
        ...prevCart,
        items: updatedItems,
      };
    });
  };

  const saveCart = async () => {
    if (!cart || !cart.items) {
      setSaveMessage("No cart data to save.");
      setTimeout(() => setSaveMessage(""), 3000);
      return;
    }

    if (cart.items.length === 0) {
      setSaveMessage("Cannot save empty cart.");
      setTimeout(() => setSaveMessage(""), 3000);
      return;
    }

    const cartDataForAPI = {
      cartId: cart.id || undefined,
      tableId: tableId,
      items: cart.items.map((item) => ({
        itemId: item.itemId,
        quantity: item.quantity,
        rate: item.rate,
        totalPrice: item.totalPrice,
        notes: item.notes || undefined,
      })),
    };

    setSaving(true);
    try {
      const parsed = CartItemSchema.safeParse(cartDataForAPI);
      if (!parsed.success) {
        console.error("Validation errors found:", parsed.error.format());
        setSaveMessage("Invalid cart data. Please check all required fields.");
        setTimeout(() => setSaveMessage(""), 3000);
        return;
      }

      const userId = getUserIdFromLocalStorage();

      const res = await axios.post(`${baseUrl}/cart`, parsed.data, {
        headers: userId ? { userId } : {},
      });

      if (res.status !== 200 && res.status !== 201) {
        setSaveMessage("Failed to save cart. Please try again.");
        setTimeout(() => setSaveMessage(""), 3000);
        return;
      }

      setSaveMessage("Cart saved successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      console.error("Error saving cart:", error);
      setSaveMessage("Failed to save cart. Please try again.");
      setTimeout(() => setSaveMessage(""), 3000);
    } finally {
      setSaving(false);
    }
  };

  const getTotalAmount = () => {
    if (!cart || !cart.items || !Array.isArray(cart.items)) return 0;
    return cart.items.reduce((total, item) => {
      if (!item || typeof item.totalPrice !== "number") return total;
      return total + item.totalPrice;
    }, 0);
  };

  if (isCartLoading || !cart) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-slate-50 pb-32">
          {/* Header Skeleton */}
          <div className="bg-white shadow-sm border-b sticky top-0 z-40">
            <div className="px-4 py-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="p-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex-1">
                  <h1 className="text-xl font-bold text-slate-900">
                    Table {tableId}
                  </h1>
                  <Skeleton className="h-4 w-32 mt-1" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          </div>

          {/* Cart Items Skeleton */}
          <CartSkeleton />
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50 pb-32">
        {/* Header */}
        <div className="bg-white shadow-sm border-b sticky top-0 z-40">
          <div className="px-4 py-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-slate-900">
                  Table {tableId}
                </h1>
                <p className="text-sm text-slate-600">
                  {cart?.items?.length || 0} items • रु.{" "}
                  {getTotalAmount().toFixed(2)}
                </p>
              </div>
              <Button
                onClick={() => setShowAddModal(true)}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Item
              </Button>
            </div>
          </div>
        </div>

        {/* Cart Items */}
        <div className="px-4 py-4">
          {cart?.items?.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <ShoppingCart className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No items ordered
                </h3>
                <p className="text-slate-600 mb-4">
                  This table hasn{"'"}t ordered anything yet.
                </p>
                <Button onClick={() => setShowAddModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Item
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {cart?.items?.map((item) => (
                <CartItemComponent
                  key={item.itemId}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onUpdateNotes={updateNotes}
                  onRemove={removeItem}
                />
              ))}
            </div>
          )}
        </div>

        {/* Save Message */}
        {saveMessage && (
          <div className="fixed top-20 left-4 right-4 z-50">
            <Alert
              className={
                saveMessage.includes("success")
                  ? "border-green-200 bg-green-50"
                  : "border-red-200 bg-red-50"
              }
            >
              <AlertDescription
                className={
                  saveMessage.includes("success")
                    ? "text-green-800"
                    : "text-red-800"
                }
              >
                {saveMessage}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Bottom Save Bar */}
        {cart && cart.items?.length > 0 ? (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm text-slate-600">Total Amount</div>
                <div className="text-2xl font-bold text-slate-900">
                  रु. {getTotalAmount().toFixed(2)}
                </div>
              </div>
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200"
              >
                {cart?.items?.length || 0} items
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowMenu(true)}
                className="flex items-center gap-2"
              >
                <Menu className="w-4 h-4" />
                Menu
              </Button>
              <Button
                onClick={saveCart}
                disabled={isSaving}
                className="flex-1 h-12 text-lg font-semibold"
              >
                {isSaving ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Save Order
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4">
            <Button
              variant="outline"
              className="w-full flex items-center gap-2 bg-transparent"
              onClick={() => setShowMenu(true)}
            >
              <Menu className="w-4 h-4" />
              View Menu
            </Button>
          </div>
        )}

        {/* Add Item Modal */}
        <AddItemModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAddMultipleItems={addMultipleItems}
          menuData={menuData}
        />

        {/* Menu Modal */}
        <MenuModal isOpen={showMenu} onClose={() => setShowMenu(false)} />
      </div>
    </AuthGuard>
  );
}
