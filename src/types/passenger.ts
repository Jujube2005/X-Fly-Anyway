/** Passenger domain types */

import type { PassengerTitleValue, GenderValue } from "./database";

export type PassengerTitle = PassengerTitleValue;
// "Mr" | "Mrs" | "Ms" | "Master"

export type Gender = GenderValue;
// "male" | "female" | "unspecified"

export type PassengerType = "adult" | "child" | "infant";

export interface Passenger {
  id?: string;
  type: PassengerType;
  title: PassengerTitle;
  firstName: string;
  lastName: string;
  dateOfBirth: string;    // YYYY-MM-DD
  gender: Gender;
  nationality: string;    // ISO 3166-1 alpha-2 — required for FR-DASH-007 analytics
  passportNumber?: string;
  passportExpiry?: string; // YYYY-MM-DD
}

