"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import AuthGuard from "@/components/auth-guard";
import MenuModal from "@/components/menu-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  Save,
  ShoppingCart,
  Menu,
} from "lucide-react";

interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
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

// Mock menu items - replace with actual API call
const mockMenuItems: MenuItem[] = [
  { id: 1, name: "Chicken Curry", price: 15.99, category: "Main Course" },
  {
    id: 2,
    name: "Vegetable Fried Rice",
    price: 12.99,
    category: "Main Course",
  },
  { id: 3, name: "Caesar Salad", price: 8.99, category: "Appetizer" },
  { id: 4, name: "Chocolate Cake", price: 6.99, category: "Dessert" },
  { id: 5, name: "Fresh Juice", price: 4.99, category: "Beverage" },
];

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
              {item.menuItem.name}
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
  onAddItem,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (menuItem: MenuItem, quantity: number) => void;
}) {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [quantity, setQuantity] = useState(1);

  if (!isOpen) return null;

  const handleAdd = () => {
    if (selectedItem) {
      onAddItem(selectedItem, quantity);
      setSelectedItem(null);
      setQuantity(1);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[80vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Add Item
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {mockMenuItems.map((item) => (
              <div
                key={item.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors रु. {
                  selectedItem?.id === item.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
                onClick={() => setSelectedItem(item)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-slate-600">{item.category}</p>
                  </div>
                  <span className="font-semibold">
                    रु. {item.price.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {selectedItem && (
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-4">
                <span>Quantity:</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      Math.max(1, Number.parseInt(e.target.value) || 1)
                    )
                  }
                  className="w-20 text-center"
                  min="1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <Button onClick={handleAdd} className="w-full">
                Add to Cart - रु. {(selectedItem.price * quantity).toFixed(2)}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function TableCartPage() {
  const router = useRouter();
  const params = useParams();
  const tableId = Number.parseInt(params.id as string);

  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    loadCartData();
  }, [tableId]);

  const loadCartData = async () => {
    setIsLoading(true);
    try {
      // Mock API call - replace with actual API
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mock cart data - some tables have items, others are empty
      const mockCart: Cart = {
        id: 1,
        tableId,
        userId: 1,
        status: "open",
        items:
          tableId === 2
            ? [
                {
                  id: 1,
                  cartId: 1,
                  itemId: 1,
                  quantity: 2,
                  rate: 15.99,
                  totalPrice: 31.98,
                  notes: "Extra spicy",
                  menuItem: mockMenuItems[0],
                },
                {
                  id: 2,
                  cartId: 1,
                  itemId: 3,
                  quantity: 1,
                  rate: 8.99,
                  totalPrice: 8.99,
                  menuItem: mockMenuItems[2],
                },
              ]
            : [],
      };

      setCart(mockCart);
    } catch (error) {
      console.error("Failed to load cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = (itemId: number, quantity: number) => {
    if (!cart) return;

    setCart({
      ...cart,
      items: cart.items.map((item) =>
        item.itemId === itemId
          ? { ...item, quantity, totalPrice: item.rate * quantity }
          : item
      ),
    });
  };

  const updateNotes = (itemId: number, notes: string) => {
    if (!cart) return;

    setCart({
      ...cart,
      items: cart.items.map((item) =>
        item.itemId === itemId ? { ...item, notes } : item
      ),
    });
  };

  const removeItem = (itemId: number) => {
    if (!cart) return;

    setCart({
      ...cart,
      items: cart.items.filter((item) => item.itemId !== itemId),
    });
  };

  const addItem = (menuItem: MenuItem, quantity: number) => {
    if (!cart) return;

    const existingItem = cart.items.find((item) => item.itemId === menuItem.id);

    if (existingItem) {
      updateQuantity(menuItem.id, existingItem.quantity + quantity);
    } else {
      const newItem: CartItem = {
        itemId: menuItem.id,
        quantity,
        rate: menuItem.price,
        totalPrice: menuItem.price * quantity,
        menuItem,
      };

      setCart({
        ...cart,
        items: [...cart.items, newItem],
      });
    }
  };

  const saveCart = async () => {
    if (!cart) return;

    setSaving(true);
    try {
      // Mock API call - replace with actual API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSaveMessage("Cart saved successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      setSaveMessage("Failed to save cart. Please try again.");
      setTimeout(() => setSaveMessage(""), 3000);
    } finally {
      setSaving(false);
    }
  };

  const getTotalAmount = () => {
    return cart?.items.reduce((total, item) => total + item.totalPrice, 0) || 0;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading cart...</div>
      </div>
    );
  }

  return (
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
                {cart?.items.length || 0} items • रु. {getTotalAmount().toFixed(2)}
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
        {cart?.items.length === 0 ? (
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
            {cart?.items.map((item) => (
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
      {cart && cart.items.length > 0 ? (
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
              {cart.items.length} items
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
        onAddItem={addItem}
      />

      {/* Menu Modal */}
      <MenuModal isOpen={showMenu} onClose={() => setShowMenu(false)} />
    </div>
  );
}

function TableCartPageWithAuth() {
  return (
    <AuthGuard>
      <TableCartPage />
    </AuthGuard>
  );
}
