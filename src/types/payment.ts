/** Payment domain types */

import type { PaymentMethodValue, PaymentStatusValue } from "./database";

/**
 * Payment method — SRS FR-CUS-010
 * Three distinct options must be shown separately in the UI.
 * All processed through Mock Payment Gateway (OI-005).
 */
export type PaymentMethod = PaymentMethodValue;
// "credit_card" | "card_charge" | "bitcoin"
// Note: card_charge = Direct Card Charge (OI-004), NOT credit card

export type PaymentStatus = PaymentStatusValue;

export interface PaymentCard {
  cardNumber: string;  // masked on display, e.g. "**** **** **** 4242"
  cardHolder: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;         // never stored, only used during mock processing
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionRef?: string; // mock transaction reference
  paidAt?: string;         // ISO 8601
  createdAt: string;
}

export interface MockPaymentPayload {
  bookingId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  /** Only required for credit_card and card_charge methods */
  card?: PaymentCard;
}

