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
import { getUserFromLocalStorage } from "@/lib/utils";
import { TransferOrderButton } from "./transfer-button";
import { MergeOrderButton } from "./merge-button";

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
    <div className="mainText px-4 py-4 space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="mainText mb-4">
          <CardContent className="mainText p-4">
            <div className="mainText flex items-start justify-between mb-3">
              <div className="mainText flex-1">
                <Skeleton className="mainText h-6 w-32 mb-2" />
                <Skeleton className="mainText h-4 w-20" />
              </div>
              <Skeleton className="mainText h-8 w-8 rounded" />
            </div>
            <div className="mainText flex items-center gap-3 mb-3">
              <div className="mainText flex items-center gap-2">
                <Skeleton className="mainText h-8 w-8" />
                <Skeleton className="mainText h-8 w-20" />
                <Skeleton className="mainText h-8 w-8" />
              </div>
              <div className="mainText flex-1 text-right">
                <Skeleton className="mainText h-6 w-16 ml-auto" />
              </div>
            </div>
            <Skeleton className="mainText h-16 w-full" />
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
    <Card className="mainText mb-4">
      <CardContent className="mainText p-4">
        <div className="mainText flex items-start justify-between mb-3">
          <div className="mainText flex-1">
            <h3 className="mainText font-semibold text-lg text-slate-900">
              {item.menuItem.itemName}
            </h3>
            <p className="mainText text-sm text-slate-600">
              रु. {item.rate.toFixed(2)} each
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(item.itemId)}
            className="mainText text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="mainText w-4 h-4" />
          </Button>
        </div>

        <div className="mainText flex items-center gap-3 mb-3">
          <div className="mainText flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onUpdateQuantity(item.itemId, Math.max(0, item.quantity - 1))
              }
              disabled={item.quantity <= 1}
            >
              <Minus className="mainText w-4 h-4" />
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
              className="mainText w-20 text-center"
              min="1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdateQuantity(item.itemId, item.quantity + 1)}
            >
              <Plus className="mainText w-4 h-4" />
            </Button>
          </div>
          <div className="mainText flex-1 text-right">
            <span className="mainText font-semibold text-lg">
              रु. {item.totalPrice.toFixed(2)}
            </span>
          </div>
        </div>

        <Textarea
          placeholder="Special instructions or notes..."
          value={item.notes || ""}
          onChange={(e) => onUpdateNotes(item.itemId, e.target.value)}
          className="mainText resize-none"
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
      <div className="mainText fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="mainText bg-white rounded-lg p-8">
          <div className="mainText text-center">
            <div className="mainText text-lg">Loading menu...</div>
          </div>
        </div>
      </div>
    );
  }

  const categories = menuData.map((item) => item.category);

  const allItems = menuData.flatMap((m) =>
    m.category.items.map((item) => ({
      ...item,
      MenuCategory: item.MenuCategory || { name: m.category.name },
    }))
  );

  let itemsToDisplay = allItems;

  if (selectedCategory) {
    const categoryData = menuData.find(
      (c) => c.category.name === selectedCategory
    );
    itemsToDisplay = categoryData ? categoryData.category.items : [];
  }

  const filteredItems = itemsToDisplay.filter((item) => {
    const matchesSearch =
      searchQuery === "" ||
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());

    return item.isAvailable && matchesSearch;
  });

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

    handleClose();
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
    <div className="mainText fixed inset-0 bg-black bg-opacity-50 flex flex-col z-50">
      <div className="mainText bg-white border-b">
        <div className="mainText px-4 py-4">
          <div className="mainText flex items-center justify-between mb-4">
            <h1 className="mainText text-2xl font-bold text-slate-900">
              Add Items
            </h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="mainText p-2"
            >
              <X className="mainText w-6 h-6" />
            </Button>
          </div>

          <div className="mainText relative mb-4">
            <Search className="mainText absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mainText pl-10"
            />
          </div>

          <div className="mainText flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className={` whitespace-nowrap${
                selectedCategory === null ? " mainBg text-white" : "mainText"
              }`}
            >
              All Categories (
              {allItems.filter((item) => item.isAvailable).length})
            </Button>
            {categories?.map((category) => (
              <Button
                key={category.name}
                variant={
                  selectedCategory === category.name ? "default" : "outline"
                }
                size="sm"
                onClick={() => setSelectedCategory(category.name)}
                className={`whitespace-nowrap${
                  selectedCategory === category.name
                    ? "mainBg text-white"
                    : "mainText"
                }`}
              >
                {category.name} (
                {category.items.filter((item) => item.isAvailable).length})
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="mainText flex-1 overflow-y-auto bg-slate-50 px-4 py-4">
        {filteredItems.length === 0 ? (
          <div className="mainText text-center py-12 text-slate-500">
            {searchQuery
              ? "No items match your search"
              : "No available items in this category"}
          </div>
        ) : (
          <div className="mainText space-y-3">
            {filteredItems.map((item) => {
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
                  <CardContent className="mainText p-4">
                    <div className="mainText flex items-start justify-between">
                      <div className="mainText flex-1">
                        <div className="mainText flex items-center gap-2 mb-1">
                          <h3 className="mainText font-semibold text-lg text-slate-900">
                            {item.itemName}
                          </h3>

                          {item.MenuCategory?.name && (
                            <Badge
                              variant="secondary"
                              className="mainText text-xs"
                            >
                              {item.MenuCategory.name}
                            </Badge>
                          )}
                        </div>
                        {item.description && (
                          <p className="mainText text-sm text-slate-600 mb-2">
                            {item.description}
                          </p>
                        )}
                        <div className="mainText text-lg font-bold text-slate-900">
                          रु. {item.rate.toFixed(2)}
                        </div>
                      </div>

                      {isSelected && (
                        <div className="mainText flex items-center gap-2 ml-4">
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
                            <Minus className="mainText w-4 h-4" />
                          </Button>
                          <span className="mainText w-8 text-center font-semibold">
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
                            <Plus className="mainText w-4 h-4" />
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
        <div className="mainText bg-white border-t p-4">
          <div className="mainText flex items-center justify-between mb-3">
            <div>
              <div className="mainText text-sm text-slate-600">
                {getTotalItemCount()} items selected
              </div>
              <div className="mainText text-lg font-bold text-slate-900">
                रु. {getTotalAmount().toFixed(2)}
              </div>
            </div>
            <Button className="mainBg" onClick={handleAddToCart} size="lg">
              <ShoppingCart className=" w-4 h-4 mr-2" />
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
        const serverCart = cartData[0];

        const cartItemsList = serverCart.cartItems || [];

        const transformedCart: Cart = {
          id: serverCart.id,
          tableId: serverCart.tableId,
          userId: 1,
          status: serverCart.status as "open" | "closed" | "cancelled",

          items: cartItemsList
            .filter((cartItem: any) => cartItem.item)
            .map((cartItem: any) => {
              const menu = cartItem.item;

              return {
                id: cartItem.id,
                cartId: cartItem.cartId,
                itemId: cartItem.itemId,
                quantity: cartItem.quantity,
                rate: cartItem.rate,
                totalPrice: cartItem.totalPrice,
                notes: cartItem.notes || "",
                menuItem: {
                  id: menu.id,
                  itemName: menu.itemName,
                  categoryId: menu.categoryId,
                  rate: menu.rate,
                  description: menu.description,
                  image: menu.imageUrl,
                  isAvailable: menu.isAvailable,
                  createdAt: menu.createdAt,
                  updatedAt: menu.updatedAt,
                  MenuCategory: {
                    id: menu.categoryId,
                    name: "",
                    description: null,
                    isActive: true,
                    createdAt: "",
                    updatedAt: "",
                  },
                },
              };
            }),
        };

        setCart(transformedCart);
      } else {
        setCart({
          tableId: tableId,
          userId: 1,
          status: "open",
          items: [],
        });
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

      const user = getUserFromLocalStorage();

      const res = await axios.post(`${baseUrl}/cart`, parsed.data, {
        headers: user ? { userId: user.id, username: user.username } : {},
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
        <div className="mainText min-h-screen bg-slate-50 pb-32">
          {/* Header Skeleton */}
          <div className="mainText bg-white shadow-sm border-b sticky top-0 z-40">
            <div className="mainText px-4 py-4">
              <div className="mainText flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="mainText p-2"
                >
                  <ArrowLeft className="mainText w-5 h-5" />
                </Button>
                <div className="mainText flex-1">
                  <h1 className="mainText text-xl font-bold text-slate-900">
                    Table {tableId}
                  </h1>
                  <Skeleton className="mainText h-4 w-32 mt-1" />
                </div>
                <Skeleton className="mainText h-8 w-20" />
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
      <div className="mainText min-h-screen bg-slate-50 pb-32">
        {/* Header */}
        <div className="mainText bg-white shadow-sm border-b sticky top-0 z-40">
          <div className="mainText px-4 py-4">
            <div className="mainText flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="mainText p-2"
              >
                <ArrowLeft className="mainText w-5 h-5" />
              </Button>
              <div className="mainText flex-1">
                <h1 className="mainText text-xl font-bold text-slate-900">
                  Table {tableId}
                </h1>
                <p className="mainText text-sm text-slate-600">
                  {cart?.items?.length || 0} items • रु.{" "}
                  {getTotalAmount().toFixed(2)}
                </p>
              </div>

              <div className="mainText flex flex-col gap-2">
                <TransferOrderButton sourceTableId={tableId} />
                <MergeOrderButton sourceTableId={tableId} />
              </div>

              <Button
                onClick={() => setShowAddModal(true)}
                size="sm"
                className=" mainBg hover:bg-blue-700"
              >
                <Plus className=" w-4 h-4 mr-1" />
                Add Item
              </Button>
            </div>
          </div>
        </div>

        {/* Cart Items */}
        <div className="mainText px-4 py-4">
          {cart?.items?.length === 0 ? (
            <Card className="mainText text-center py-12">
              <CardContent>
                <ShoppingCart className="mainText w-16 h-16 mx-auto text-slate-400 mb-4" />
                <h3 className="mainText text-lg font-semibold text-slate-900 mb-2">
                  No items ordered
                </h3>
                <p className="mainText text-slate-600 mb-4">
                  This table hasn{"'"}t ordered anything yet.
                </p>
                <Button
                  className="mainBg"
                  onClick={() => setShowAddModal(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Item
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="mainText space-y-4">
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
          <div className="mainText fixed top-20 left-4 right-4 z-50">
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
          <div className="mainText fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4">
            <div className="mainText flex items-center justify-between mb-3">
              <div>
                <div className="mainText text-sm text-slate-600">
                  Total Amount
                </div>
                <div className="mainText text-2xl font-bold text-slate-900">
                  रु. {getTotalAmount().toFixed(2)}
                </div>
              </div>
              <Badge
                variant="outline"
                className="mainText bg-blue-50 text-blue-700 border-blue-200"
              >
                {cart?.items?.length || 0} items
              </Badge>
            </div>
            <div className="mainText flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowMenu(true)}
                className="mainText flex items-center gap-2"
              >
                <Menu className="mainText w-4 h-4" />
                Menu
              </Button>
              <Button
                onClick={saveCart}
                disabled={isSaving}
                className="mainBg flex-1 h-12 text-lg font-semibold"
              >
                {isSaving ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="mainText w-5 h-5 mr-2" />
                    Save Order
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="mainText fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4">
            <Button
              variant="outline"
              className="mainText w-full flex items-center gap-2 bg-transparent"
              onClick={() => setShowMenu(true)}
            >
              <Menu className="mainText w-4 h-4" />
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
