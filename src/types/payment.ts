/** Payment domain types */

export type PaymentStatus = "pending" | "success" | "failed" | "refunded";

export type PaymentMethod = "credit_card" | "debit_card" | "bank_transfer";

export interface PaymentCard {
  cardNumber: string;   // masked, e.g. "**** **** **** 4242"
  cardHolder: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;          // never stored
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionRef?: string;
  paidAt?: string; // ISO 8601
  createdAt: string;
}

export interface MockPaymentPayload {
  bookingId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  card: PaymentCard;
}
