import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const OrderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [OrderItemSchema], required: true },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pendiente", "preparando", "enviado", "entregado", "cancelado"],
      default: "pendiente",
    },
    // Pago en línea (Mercado Pago, Checkout Pro vía API de Orders)
    paid: { type: Boolean, default: false },
    paidAt: { type: Date, default: null },
    mp: {
      orderId: { type: String, default: null },
      status: { type: String, default: null },
      statusDetail: { type: String, default: null },
      checkoutUrl: { type: String, default: null },
      lastSync: { type: Date, default: null },
    },
    shipping: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      notes: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

export type OrderDoc = InferSchemaType<typeof OrderSchema>;
export const Order: Model<OrderDoc> = models.Order || model<OrderDoc>("Order", OrderSchema);
