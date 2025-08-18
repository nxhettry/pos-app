"use client";
import { CategoryResponse, ItemResponse } from "@/type/api-response";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!baseUrl)
  throw new Error(
    "NEXT_PUBLIC_API_BASE_URL is not defined in environment variables"
  );

export default function useMenu() {
  return useQuery({
    queryKey: ["menu"],
    queryFn: async () => {
      try {
        const [categoriesRes, itemsRes] = await Promise.all([
          axios.get<CategoryResponse>(`${baseUrl}/menu/categories/`),
          axios.get<ItemResponse>(`${baseUrl}/menu/items/`),
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
