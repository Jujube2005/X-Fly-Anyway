/** Passenger domain types */

export type PassengerType = "adult" | "child" | "infant";

export type Gender = "male" | "female" | "unspecified";

export interface Passenger {
  id: string;
  type: PassengerType;
  title: "Mr" | "Mrs" | "Ms" | "Master";
  firstName: string;
  lastName: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: Gender;
  nationality: string;    // ISO 3166-1 alpha-2
  passportNumber?: string;
  passportExpiry?: string; // YYYY-MM-DD
}
