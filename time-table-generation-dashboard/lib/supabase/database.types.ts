export type Json = 
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      course: {
        Row: {
          course_id: number
          course_code: string
          name: string
          course_type: "Major" | "Minor" | "Skill" | "AEC" | "VAC" | "Lab"
          department_id: number
          theory_credits: number
          lab_credits: number
        }
        Insert: {
          course_id?: number
          course_code: string
          name: string
          course_type: "Major" | "Minor" | "Skill" | "AEC" | "VAC" | "Lab"
          department_id: number
          theory_credits: number
          lab_credits: number
        }
        Update: {
          course_id?: number
          course_code?: string
          name?: string
          course_type?: "Major" | "Minor" | "Skill" | "AEC" | "VAC" | "Lab"
          department_id?: number
          theory_credits?: number
          lab_credits?: number
        }
        Relationships: [
          {
            foreignKeyName: "course_department_id_fkey"
            columns: ["department_id"]
            referencedRelation: "department"
            referencedColumns: ["department_id"]
          }
        ]
      }
      course_offering: {
        Row: {
          offering_id: number
          course_id: number
          term_id: number
          section: string | null
          enrollment_limit: number | null
        }
        Insert: {
          offering_id?: number
          course_id: number
          term_id: number
          section?: string | null
          enrollment_limit?: number | null
        }
        Update: {
          offering_id?: number
          course_id?: number
          term_id?: number
          section?: string | null
          enrollment_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "course_offering_course_id_fkey"
            columns: ["course_id"]
            referencedRelation: "course"
            referencedColumns: ["course_id"]
          },
          {
            foreignKeyName: "course_offering_term_id_fkey"
            columns: ["term_id"]
            referencedRelation: "term"
            referencedColumns: ["term_id"]
          }
        ]
      }
      department: {
        Row: {
          department_id: number
          institute_id: number
          name: string
        }
        Insert: {
          department_id?: number
          institute_id: number
          name: string
        }
        Update: {
          department_id?: number
          institute_id?: number
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "department_institute_id_fkey"
            columns: ["institute_id"]
            referencedRelation: "institute"
            referencedColumns: ["institute_id"]
          }
        ]
      }
      enrollment: {
        Row: {
          enrollment_id: number
          student_id: number
          offering_id: number
          enrolled_on: string
        }
        Insert: {
          enrollment_id?: number
          student_id: number
          offering_id: number
          enrolled_on: string
        }
        Update: {
          enrollment_id?: number
          student_id?: number
          offering_id?: number
          enrolled_on?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollment_offering_id_fkey"
            columns: ["offering_id"]
            referencedRelation: "course_offering"
            referencedColumns: ["offering_id"]
          },
          {
            foreignKeyName: "enrollment_student_id_fkey"
            columns: ["student_id"]
            referencedRelation: "student"
            referencedColumns: ["student_id"]
          }
        ]
      }
      faculty: {
        Row: {
          faculty_id: number
          department_id: number
          user_id: string | null
          name: string
          email: string | null
        }
        Insert: {
          faculty_id?: number
          department_id: number
          user_id?: string | null
          name: string
          email?: string | null
        }
        Update: {
          faculty_id?: number
          department_id?: number
          user_id?: string | null
          name?: string
          email?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "faculty_department_id_fkey"
            columns: ["department_id"]
            referencedRelation: "department"
            referencedColumns: ["department_id"]
          }
        ]
      }
      institute: {
        Row: {
          institute_id: number
          name: string
          created_at: string
        }
        Insert: {
          institute_id?: number
          name: string
          created_at?: string
        }
        Update: {
          institute_id?: number
          name?: string
          created_at?: string
        }
        Relationships: []
      }
      program: {
        Row: {
          program_id: number
          department_id: number
          name: string
        }
        Insert: {
          program_id?: number
          department_id: number
          name: string
        }
        Update: {
          program_id?: number
          department_id?: number
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_department_id_fkey"
            columns: ["department_id"]
            referencedRelation: "department"
            referencedColumns: ["department_id"]
          }
        ]
      }
      room: {
        Row: {
          room_id: number
          name: string
          capacity: number
          institute_id: number
          room_type: string | null
        }
        Insert: {
          room_id?: number
          name: string
          capacity: number
          institute_id: number
          room_type?: string | null
        }
        Update: {
          room_id?: number
          name?: string
          capacity?: number
          institute_id?: number
          room_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "room_institute_id_fkey"
            columns: ["institute_id"]
            referencedRelation: "institute"
            referencedColumns: ["institute_id"]
          }
        ]
      }
      student: {
        Row: {
          student_id: number
          program_id: number
          user_id: string | null
          name: string
          email: string | null
        }
        Insert: {
          student_id?: number
          program_id: number
          user_id?: string | null
          name: string
          email?: string | null
        }
        Update: {
          student_id?: number
          program_id?: number
          user_id?: string | null
          name?: string
          email?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_program_id_fkey"
            columns: ["program_id"]
            referencedRelation: "program"
            referencedColumns: ["program_id"]
          }
        ]
      }
      student_course_pref: {
        Row: {
          student_id: number
          course_id: number
          rank: number
        }
        Insert: {
          student_id: number
          course_id: number
          rank: number
        }
        Update: {
          student_id?: number
          course_id?: number
          rank?: number
        }
        Relationships: [
          {
            foreignKeyName: "student_course_pref_course_id_fkey"
            columns: ["course_id"]
            referencedRelation: "course"
            referencedColumns: ["course_id"]
          },
          {
            foreignKeyName: "student_course_pref_student_id_fkey"
            columns: ["student_id"]
            referencedRelation: "student"
            referencedColumns: ["student_id"]
          }
        ]
      }
      student_faculty_pref: {
        Row: {
          student_id: number
          faculty_id: number
          rank: number
        }
        Insert: {
          student_id: number
          faculty_id: number
          rank: number
        }
        Update: {
          student_id?: number
          faculty_id?: number
          rank?: number
        }
        Relationships: [
          {
            foreignKeyName: "student_faculty_pref_faculty_id_fkey"
            columns: ["faculty_id"]
            referencedRelation: "faculty"
            referencedColumns: ["faculty_id"]
          },
          {
            foreignKeyName: "student_faculty_pref_student_id_fkey"
            columns: ["student_id"]
            referencedRelation: "student"
            referencedColumns: ["student_id"]
          }
        ]
      }
      student_time_pref: {
        Row: {
          pref_id: number
          student_id: number
          day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun"
          start_time: string
          end_time: string
        }
        Insert: {
          pref_id?: number
          student_id: number
          day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun"
          start_time: string
          end_time: string
        }
        Update: {
          pref_id?: number
          student_id?: number
          day?: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun"
          start_time?: string
          end_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_time_pref_student_id_fkey"
            columns: ["student_id"]
            referencedRelation: "student"
            referencedColumns: ["student_id"]
          }
        ]
      }
      term: {
        Row: {
          term_id: number
          program_id: number
          year: number
          semester: number
          start_date: string | null
          end_date: string | null
        }
        Insert: {
          term_id?: number
          program_id: number
          year: number
          semester: number
          start_date?: string | null
          end_date?: string | null
        }
        Update: {
          term_id?: number
          program_id?: number
          year?: number
          semester?: number
          start_date?: string | null
          end_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "term_program_id_fkey"
            columns: ["program_id"]
            referencedRelation: "program"
            referencedColumns: ["program_id"]
          }
        ]
      }
      timeslot: {
        Row: {
          timeslot_id: number
          term_id: number
          start_time: string
          end_time: string
        }
        Insert: {
          timeslot_id?: number
          term_id: number
          start_time: string
          end_time: string
        }
        Update: {
          timeslot_id?: number
          term_id?: number
          start_time?: string
          end_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "timeslot_term_id_fkey"
            columns: ["term_id"]
            referencedRelation: "term"
            referencedColumns: ["term_id"]
          }
        ]
      }
      timetable_entry: {
        Row: {
          entry_id: number
          term_id: number
          day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun"
          timeslot_id: number
          offering_id: number
          room_id: number
          faculty_id: number
        }
        Insert: {
          entry_id?: number
          term_id: number
          day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun"
          timeslot_id: number
          offering_id: number
          room_id: number
          faculty_id: number
        }
        Update: {
          entry_id?: number
          term_id?: number
          day?: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun"
          timeslot_id?: number
          offering_id?: number
          room_id?: number
          faculty_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "timetable_entry_faculty_id_fkey"
            columns: ["faculty_id"]
            referencedRelation: "faculty"
            referencedColumns: ["faculty_id"]
          },
          {
            foreignKeyName: "timetable_entry_offering_id_fkey"
            columns: ["offering_id"]
            referencedRelation: "course_offering"
            referencedColumns: ["offering_id"]
          },
          {
            foreignKeyName: "timetable_entry_room_id_fkey"
            columns: ["room_id"]
            referencedRelation: "room"
            referencedColumns: ["room_id"]
          },
          {
            foreignKeyName: "timetable_entry_term_id_fkey"
            columns: ["term_id"]
            referencedRelation: "term"
            referencedColumns: ["term_id"]
          },
          {
            foreignKeyName: "timetable_entry_timeslot_id_fkey"
            columns: ["timeslot_id"]
            referencedRelation: "timeslot"
            referencedColumns: ["timeslot_id"]
          }
        ]
      }
      timetable_generation: {
        Row: {
          generation_id: number
          term_id: number
          output_json: Json
          generated_at: string
          is_valid: boolean | null
        }
        Insert: {
          generation_id?: number
          term_id: number
          output_json: Json
          generated_at?: string
          is_valid?: boolean | null
        }
        Update: {
          generation_id?: number
          term_id?: number
          output_json?: Json
          generated_at?: string
          is_valid?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "timetable_generation_term_id_fkey"
            columns: ["term_id"]
            referencedRelation: "term"
            referencedColumns: ["term_id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      day_of_week: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun"
      course_type: "Major" | "Minor" | "Skill" | "AEC" | "VAC" | "Lab"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
