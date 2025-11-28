"use client";
import { getUserFromLocalStorage } from "@/lib/utils";
import { TablesResponse } from "@/type/api-response";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export default function useTables() {
  return useQuery({
    queryKey: ["tables"],
    queryFn: async () => {
      try {
        const userId = getUserFromLocalStorage();

        axios.defaults.withCredentials = true;
        const res = await axios.get<TablesResponse>(`${baseUrl}/table`, {
          headers: userId ? { userId: userId.id } : {},
        });

        return res.data.data;
      } catch (error) {
        toast.error("Error getting tables");
        console.error("Error fetching tables data: ", error);
      }
    },
  });
}
