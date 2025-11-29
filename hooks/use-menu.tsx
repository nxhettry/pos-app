"use client";
import { CategoryResponse, ItemResponse } from "@/type/api-response";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { getAccessToken } from "@/lib/utils";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export default function useMenu() {
  return useQuery({
    queryKey: ["menu"],
    queryFn: async () => {
      try {
        const token = getAccessToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const [categoriesRes, itemsRes] = await Promise.all([
          axios.get<CategoryResponse>(`${baseUrl}/menu/categories/`, { headers }),
          axios.get<ItemResponse>(`${baseUrl}/menu/items/`, { headers }),
        ]);

        const categories = categoriesRes.data.data;
        const items = itemsRes.data.data;

        const combinedData = categories.map((category) => {
          const categoryItems = items.filter(
            (item) => item.categoryId === category.id
          );

          return {
            category: {
              name: category.name,
              items: categoryItems,
            },
          };
        });

        return combinedData;
      } catch (error) {
        toast.error("Error getting menu");
        console.error("Error fetching menu data: ", error);
      }
    },
  });
}
