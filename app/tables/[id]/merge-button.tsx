"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "sonner";
import useTables from "@/hooks/use-tables";
import { getAccessToken } from "@/lib/utils";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

interface MergeOrderButtonProps {
  sourceTableId: number;
}

export function MergeOrderButton({ sourceTableId }: MergeOrderButtonProps) {
  const { data: tables, isLoading } = useTables();

  const [showMergeModal, setShowMergeModal] = useState(false);
  const [secondSourceTableId, setSecondSourceTableId] = useState<number | null>(
    null
  );
  const [targetTableId, setTargetTableId] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [isMerging, setIsMerging] = useState(false);

  const handleMerge = async () => {
    // validation: second source selected and distinct, and valid target distinct from both sources
    if (!secondSourceTableId) {
      setError("Please select a second source table to merge from.");
      return;
    }
    if (secondSourceTableId === sourceTableId) {
      setError(
        "Please pick a different second source table (can't be the same as the current table)."
      );
      return;
    }
    if (!targetTableId) {
      setError("Please select a destination table.");
      return;
    }
    setIsMerging(true);
    setError("");
    try {
      const token = getAccessToken();
      await axios.post(`${baseUrl}/cart/merge-tables`, {
        sourceTableIds: [sourceTableId, secondSourceTableId],
        targetTableId,
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setShowConfirm(false);
      setShowMergeModal(false);
      setTargetTableId(null);
      setSecondSourceTableId(null);

      toast.success("Order Merged successfully.");
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
        Merge Table
      </Button>

      {/* Merge Modal */}
      {showMergeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px]">
            <h2 className="text-lg font-semibold mb-4">Merge Order</h2>
            <p className="text-sm mb-2">
              Select two source tables and a destination table.
            </p>

            <label className="block mb-2 text-sm font-medium">
              Source Table A
            </label>
            <div className="border border-gray-200 rounded-md p-2 mb-4 bg-gray-50">
              <span className="text-sm">Table {sourceTableId}</span>
            </div>

            <label className="block mb-2 text-sm font-medium">
              Source Table B
            </label>
            <select
              value={secondSourceTableId || ""}
              onChange={(e) => setSecondSourceTableId(Number(e.target.value))}
              className="border border-gray-300 rounded-md p-2 mb-4 w-full"
            >
              <option value="" disabled>
                Select second source table
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

            <label className="block mb-2 text-sm font-medium">
              Destination Table
            </label>
            <select
              value={targetTableId || ""}
              onChange={(e) => setTargetTableId(Number(e.target.value))}
              className="border border-gray-300 rounded-md p-2 mb-4 w-full"
            >
              <option value="" disabled>
                Select destination table
              </option>
              {tables &&
                tables.map((t) => (
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
                  setSecondSourceTableId(null);
                  setError("");
                }}
              >
                Cancel
              </Button>
              <Button
                disabled={!secondSourceTableId || !targetTableId}
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
              Are you sure you want to merge orders from
              <span className="font-bold"> Table {sourceTableId}</span> and
              <span className="font-bold">
                {" "}
                Table {secondSourceTableId}
              </span>{" "}
              into
              <span className="font-bold"> Table {targetTableId}</span>?
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
                {isMerging ? "Merging..." : "Confirm"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
