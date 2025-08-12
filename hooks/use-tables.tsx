"use client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!baseUrl)
  throw new Error(
    "NEXT_PUBLIC_API_BASE_URL is not defined in environment variables"
  );

export default function useTables() {
  return useQuery({
    queryKey: ["tables"],
    queryFn: async () => {
      try {
        axios.defaults.withCredentials = true;
        const res = await axios.get(`${baseUrl}/tables`);

        console.log("tables data : ", res.data.data);

        return res.data.data;
      } catch (error) {
        toast.error("Error getting tables");
        console.error("Error fetching tables data: ", error);
      }
    },
  });
}
