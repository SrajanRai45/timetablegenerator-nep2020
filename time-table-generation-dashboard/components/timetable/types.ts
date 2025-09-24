import { Database } from "@/lib/supabase/database.types";

export const dayNames = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]

export const dayOrder: { [key: string]: number } = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 7,
}

export type Room = Database["public"]["Tables"]["room"]["Row"];
export type TimeSlot = Database["public"]["Tables"]["timeslot"]["Row"];
export type Course = Database["public"]["Tables"]["course"]["Row"];
export type CourseOffering = Database["public"]["Tables"]["course_offering"]["Row"];
export type Faculty = Database["public"]["Tables"]["faculty"]["Row"];
export type TimetableEntry = Database["public"]["Tables"]["timetable_entry"]["Row"];
export type DayName = Database["public"]["Enums"]["day_name"];