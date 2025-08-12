"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MenuModal from "@/components/menu-modal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, CheckCircle, Menu } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import useTables from "@/hooks/use-tables";
import { TablesSkeleton } from "@/components/table-skeleton";

interface Table {
  id: number;
  name: string;
  capacity: number;
  status: "available" | "occupied" | "reserved";
  currentGuests?: number;
  reservedTime?: string;
}

function TableCard({ table }: { table: Table }) {
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 border-green-200";
      case "occupied":
        return "bg-red-100 text-red-800 border-red-200";
      case "reserved":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <CheckCircle className="w-4 h-4" />;
      case "occupied":
        return <Users className="w-4 h-4" />;
      case "reserved":
        return <Clock className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const handleTableClick = () => {
    router.push(`/tables/${table.id}`);
  };

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
        table.status === "available"
          ? "hover:border-green-300"
          : table.status === "occupied"
          ? "hover:border-red-300"
          : "hover:border-yellow-300"
      }`}
      onClick={handleTableClick}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg text-slate-900">{table.name}</h3>
          <Badge
            className={`${getStatusColor(
              table.status
            )} flex items-center gap-1`}
          >
            {getStatusIcon(table.status)}
            {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
          </Badge>
        </div>

        <div className="space-y-2 text-sm text-slate-600">
          <div className="flex items-center justify-between">
            <span>Capacity:</span>
            <span className="font-medium">{table.capacity} guests</span>
          </div>

          {table.status === "occupied" && table.currentGuests && (
            <div className="flex items-center justify-between">
              <span>Current:</span>
              <span className="font-medium">{table.currentGuests} guests</span>
            </div>
          )}

          {table.status === "reserved" && table.reservedTime && (
            <div className="flex items-center justify-between">
              <span>Reserved:</span>
              <span className="font-medium">{table.reservedTime}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function TablesPage() {
  const { userData, isLoggedIn, logout, isLoading: authLoading } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();
  const { data: tables, isLoading: isTablesLoading } = useTables();

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.replace("/");
    }
  }, [isLoggedIn, authLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  if (authLoading || isTablesLoading || !isLoggedIn) {
    return <TablesSkeleton />;
  }

  const getStatusCounts = () => {
    return {
      available: tables.filter((t: Table) => t.status === "available").length,
      occupied: tables.filter((t: Table) => t.status === "occupied").length,
      reserved: tables.filter((t: Table) => t.status === "reserved").length,
    };
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Rato-POS</h1>
              <p className="text-sm text-slate-600">
                Welcome, {userData?.username}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="text-sm bg-transparent"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Status Summary */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-800">
              {statusCounts.available}
            </div>
            <div className="text-sm text-green-600">Available</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-red-800">
              {statusCounts.occupied}
            </div>
            <div className="text-sm text-red-600">Occupied</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-yellow-800">
              {statusCounts.reserved}
            </div>
            <div className="text-sm text-yellow-600">Reserved</div>
          </div>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="px-4 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tables.map((table: Table) => (
            <TableCard key={table.id} table={table} />
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-3">
        <div className="flex justify-center">
          <Button
            variant="outline"
            className="w-full max-w-xs bg-transparent flex items-center gap-2"
            onClick={() => setShowMenu(true)}
          >
            <Menu className="w-4 h-4" />
            View Menu
          </Button>
        </div>
      </div>

      {/* Menu Modal */}
      <MenuModal isOpen={showMenu} onClose={() => setShowMenu(false)} />
    </div>
  );
}
