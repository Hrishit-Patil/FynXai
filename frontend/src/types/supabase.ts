export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          phone_number: string | null
          email: string | null
          role: 'Applicant' | 'Admin' | 'Officer'
          created_at: string
        }
        Insert: {
          id: string
          first_name?: string | null
          last_name?: string | null
          phone_number?: string | null
          email?: string | null
          role?: 'Applicant' | 'Admin' | 'Officer'
          created_at?: string
        }
        Update: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          phone_number?: string | null
          email?: string | null
          role?: 'Applicant' | 'Admin' | 'Officer'
          created_at?: string
        }
      }
    }
  }
}