import z from "zod";

export const CartItemSchema = z.object({
  cartId: z.number().optional(),
  tableId: z.number(),
  cartData: z.array(
    z.object({
      itemId: z.number(),
      quantity: z.number().min(1),
      rate: z.number().min(0),
      totalPrice: z.number().min(0),
      notes: z.string().optional(),
    })
  ),
});
