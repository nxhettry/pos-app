"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "sonner";
import useTables from "@/hooks/use-tables";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

interface MergeOrderButtonProps {
  sourceTableId: number;
}

export function MergeOrderButton({ sourceTableId }: MergeOrderButtonProps) {
  const { data: tables, isLoading } = useTables();

  const [showMergeModal, setShowMergeModal] = useState(false);
  const [targetTableId, setTargetTableId] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [isMerging, setIsMerging] = useState(false);

  const handleMerge = async () => {
    if (!targetTableId || targetTableId === sourceTableId) {
      setError("Please select a valid target table.");
      return;
    }
    setIsMerging(true);
    setError("");
    try {
      await axios.post(`${baseUrl}/cart/Merge-table`, {
        sourceTableId,
        targetTableId,
      });
      setShowConfirm(false);
      setShowMergeModal(false);
      setTargetTableId(null);

      toast.success("Order Mergered successfully.");
    } catch (err) {
      toast.error("Failed to Merge order. Please try again.");
      console.error(err);
      setError("Failed to Merge order. Please try again.");
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="ml-2"
        onClick={() => setShowMergeModal(true)}
        disabled={isLoading}
      >
        Merge Order
      </Button>
      {/* Merge Modal */}
      {showMergeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px]">
            <h2 className="text-lg font-semibold mb-4">Merge Order</h2>
            <label className="block mb-2 text-sm font-medium">
              Select Target Table
            </label>
            <select
              value={targetTableId || ""}
              onChange={(e) => setTargetTableId(Number(e.target.value))}
              className="border border-gray-300 rounded-md p-2 mb-4 w-full"
            >
              <option value="" disabled>
                Select a table
              </option>
              {tables &&
                tables
                  .filter((t) => t.id !== sourceTableId)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      Table {t.id} {t.name ? `- ${t.name}` : ""}
                    </option>
                  ))}
            </select>
            {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowMergeModal(false);
                  setTargetTableId(null);
                  setError("");
                }}
              >
                Cancel
              </Button>
              <Button
                disabled={!targetTableId || targetTableId === sourceTableId}
                onClick={() => setShowConfirm(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Merge
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px]">
            <h2 className="text-lg font-semibold mb-4">Confirm Merge</h2>
            <p className="mb-4">
              Are you sure you want to Merge this order to{" "}
              <span className="font-bold">Table {targetTableId}</span>?
            </p>
            {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setShowConfirm(false)}
                disabled={isMerging}
              >
                Cancel
              </Button>
              <Button
                onClick={handleMerge}
                disabled={isMerging}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isMerging ? "Mergering..." : "Confirm"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
