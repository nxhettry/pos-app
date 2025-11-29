"use client";
import { CartResponse } from "@/type/api-response";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { getAccessToken } from "@/lib/utils";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export default function useCart(tableId: number) {
  return useQuery({
    queryKey: ["cart", tableId],
    queryFn: async () => {
      try {
        const token = getAccessToken();

        const res = await axios.get<CartResponse>(
          `${baseUrl}/cart/table/${tableId}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );

        return res.data.data;
      } catch (error) {
        toast.error("Error getting cart");
        console.error("Error fetching cart data: ", error);
      }
    },
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
