export type UserRole = 'admin' | 'family' | 'volunteer';
export type TaskPriority = 'Critical' | 'High' | 'Medium' | 'Low';
export type TaskStatus = 'Not Started' | 'In Progress' | 'Waiting' | 'Blocked' | 'Completed' | 'Cancelled';
export type GuestSide = 'Bride' | 'Groom' | 'Both';
export type GuestGroup = 'Family' | 'Friends' | 'VIP';
export type RsvpStatus = 'Pending' | 'Confirmed' | 'Declined';
export type BookingStatus = 'Not Booked' | 'Enquired' | 'Negotiating' | 'Booked' | 'Confirmed' | 'Cancelled';

export type BookingCategory =
  | 'Makeup Artist' | 'Wedding Clothes' | 'Decoration' | 'Veg Food Catering'
  | 'Non Veg Food Catering' | 'Photographer' | 'Videographer' | 'Mehendi Artist'
  | 'DJ / Sound' | 'Lighting' | 'Transportation' | 'Venue'
  | 'Invitation Cards Printing' | 'Accommodation / Guest Hotel' | 'Others';

export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  role: UserRole;
  created_at: string;
}

export interface WeddingEvent {
  id: string;
  name: string;
  slug: string;
  event_date: string | null;
  color_theme: 'sangeet' | 'haldi' | 'nikah' | 'reception' | 'custom';
  description: string | null;
  is_archived: boolean;
  created_by: string | null;
  created_at: string;
  sort_order: number;
}

export interface Task {
  id: string;
  event_id: string | null;
  name: string;
  description: string | null;
  category: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string | null;
  completion: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  assignees?: Profile[];
  checklist?: { id: string; label: string; is_done: boolean }[];
}

export interface ShoppingItem {
  id: string;
  event_id: string | null;
  name: string;
  category: string;
  quantity: number;
  budget: number;
  actual_price: number | null;
  store: string | null;
  is_purchased: boolean;
  assigned_to: string | null;
  receipt_url: string | null;
  created_at: string;
}

export interface BudgetCategory {
  id: string;
  event_id: string | null;
  name: string;
  planned_amount: number;
}

export interface BudgetExpense {
  id: string;
  category_id: string | null;
  event_id: string | null;
  vendor_name: string | null;
  description: string | null;
  amount: number;
  is_advance: boolean;
  paid_on: string;
  created_by: string | null;
  created_at: string;
}

export interface Guest {
  id: string;
  full_name: string;
  phone: string | null;
  side: GuestSide;
  guest_group: GuestGroup;
  rsvp_status: RsvpStatus;
  invitation_sent: boolean;
  plus_ones: number;
  notes: string | null;
  created_at: string;
}

export interface Vendor {
  id: string;
  name: string;
  phone: string | null;
  category: string;
  advance_paid: number;
  balance: number;
  rating: number | null;
  notes: string | null;
  created_at: string;
}

export interface Booking {
  id: string;
  event_id: string | null;
  category: BookingCategory;
  custom_category_name: string | null;
  vendor_name: string | null;
  status: BookingStatus;
  booking_date: string | null;
  contract_signed: boolean;
  advance_paid: number;
  balance_due: number;
  final_payment_due_date: string | null;
  contact_person: string | null;
  contact_phone: string | null;
  trial_scheduled_date: string | null;
  fitting_dates: string[] | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  profile_id: string;
  title: string;
  body: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}
