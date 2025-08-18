"use client";
import { CartResponse } from "@/type/api-response";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { getUserIdFromLocalStorage } from "@/lib/utils";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!baseUrl)
  throw new Error(
    "NEXT_PUBLIC_API_BASE_URL is not defined in environment variables"
  );

export default function useCart(tableId: number) {
  return useQuery({
    queryKey: ["cart", tableId],
    queryFn: async () => {
      try {
        const userId = getUserIdFromLocalStorage();


        const res = await axios.get<CartResponse>(
          `${baseUrl}/cart/table/${tableId}`,
          {
            headers: userId ? { userId } : {},
          }
        );

        return res.data.data;
      } catch (error) {
        toast.error("Error getting cart");
        console.error("Error fetching cart data: ", error);
      }
    },
    refetchOnWindowFocus: false,
  });
}
