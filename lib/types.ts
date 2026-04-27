export type UserRole = "admin" | "kelas";

export interface AuthUser {
  id: number;
  name: string;
  role: UserRole;
}

export interface Lab {
  id: number;
  name: string;
  location: string;
  created_at: string;
}

export interface LabItem {
  id: number;
  lab_id: number;
  name: string;
  category: string;
  initial_quantity: number;
  functional_quantity: number;
}

export interface ClassAccount {
  id: number;
  name: string;
  username: string;
  password: string;
}

export type SessionStatus = "aktif" | "aman" | "selisih" | "pending";
export type ItemCondition = "baik" | "rusak" | "hilang";
export type AlertType = "selisih" | "rusak";

export interface Session {
  id: number;
  lab_id: number;
  class_id: number;
  started_at: string;
  ended_at: string | null;
  status: SessionStatus;
}

export interface SessionItemStatus {
  id: number;
  session_id: number;
  lab_item_id: number;
  counted_quantity: number;
  condition: ItemCondition;
}

export interface Alert {
  id: number;
  session_id: number;
  lab_item_id: number;
  type: AlertType;
  message: string;
  created_at: string;
}
