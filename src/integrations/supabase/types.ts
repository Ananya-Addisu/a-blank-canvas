export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string | null
          full_name: string
          id: string
          is_active: boolean | null
          phone_number: string
          pin_hash: string
          profile_picture: string | null
          profile_picture_url: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          full_name: string
          id?: string
          is_active?: boolean | null
          phone_number: string
          pin_hash: string
          profile_picture?: string | null
          profile_picture_url?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          phone_number?: string
          pin_hash?: string
          profile_picture?: string | null
          profile_picture_url?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          description: string | null
          id: string
          setting_key: string
          setting_value: string
          updated_at: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          setting_key: string
          setting_value: string
          updated_at?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      bundle_courses: {
        Row: {
          bundle_id: string
          course_id: string
          created_at: string | null
          id: string
        }
        Insert: {
          bundle_id: string
          course_id: string
          created_at?: string | null
          id?: string
        }
        Update: {
          bundle_id?: string
          course_id?: string
          created_at?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bundle_courses_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "bundles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bundle_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      bundles: {
        Row: {
          created_at: string | null
          description: string
          discount_percentage: number | null
          display_order: number | null
          featured_path_order: number
          home_category_id: string | null
          id: string
          is_active: boolean | null
          is_bundle_exclusive: boolean
          is_featured_path: boolean
          is_featured_path_exclusive: boolean
          name: string
          price: number
          semester: string
          thumbnail_url: string | null
          updated_at: string | null
          year_level: string
        }
        Insert: {
          created_at?: string | null
          description: string
          discount_percentage?: number | null
          display_order?: number | null
          featured_path_order?: number
          home_category_id?: string | null
          id?: string
          is_active?: boolean | null
          is_bundle_exclusive?: boolean
          is_featured_path?: boolean
          is_featured_path_exclusive?: boolean
          name: string
          price?: number
          semester: string
          thumbnail_url?: string | null
          updated_at?: string | null
          year_level: string
        }
        Update: {
          created_at?: string | null
          description?: string
          discount_percentage?: number | null
          display_order?: number | null
          featured_path_order?: number
          home_category_id?: string | null
          id?: string
          is_active?: boolean | null
          is_bundle_exclusive?: boolean
          is_featured_path?: boolean
          is_featured_path_exclusive?: boolean
          name?: string
          price?: number
          semester?: string
          thumbnail_url?: string | null
          updated_at?: string | null
          year_level?: string
        }
        Relationships: [
          {
            foreignKeyName: "bundles_home_category_id_fkey"
            columns: ["home_category_id"]
            isOneToOne: false
            referencedRelation: "home_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      chapters: {
        Row: {
          course_id: string
          created_at: string | null
          description: string | null
          id: string
          is_published: boolean | null
          order_index: number
          title: string
          updated_at: string | null
        }
        Insert: {
          course_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          order_index?: number
          title: string
          updated_at?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          order_index?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chapters_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      competition_participants: {
        Row: {
          competition_id: string
          id: string
          rank: number | null
          registered_at: string | null
          score: number | null
          status: string
          student_id: string
        }
        Insert: {
          competition_id: string
          id?: string
          rank?: number | null
          registered_at?: string | null
          score?: number | null
          status?: string
          student_id: string
        }
        Update: {
          competition_id?: string
          id?: string
          rank?: number | null
          registered_at?: string | null
          score?: number | null
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "competition_participants_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competition_participants_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      competition_questions: {
        Row: {
          competition_id: string | null
          correct_answer: string
          created_at: string | null
          explanation: string | null
          id: string
          options: Json | null
          order_index: number | null
          points: number | null
          question_text: string
          question_type: string
          updated_at: string | null
        }
        Insert: {
          competition_id?: string | null
          correct_answer: string
          created_at?: string | null
          explanation?: string | null
          id?: string
          options?: Json | null
          order_index?: number | null
          points?: number | null
          question_text: string
          question_type?: string
          updated_at?: string | null
        }
        Update: {
          competition_id?: string | null
          correct_answer?: string
          created_at?: string | null
          explanation?: string | null
          id?: string
          options?: Json | null
          order_index?: number | null
          points?: number | null
          question_text?: string
          question_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "competition_questions_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
        ]
      }
      competitions: {
        Row: {
          created_at: string | null
          date: string
          description: string
          duration: number
          gated_bundle_id: string | null
          gated_course_id: string | null
          id: string
          is_finished: boolean | null
          is_published: boolean | null
          max_participants: number
          registered_count: number | null
          status: string | null
          time: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          description: string
          duration: number
          gated_bundle_id?: string | null
          gated_course_id?: string | null
          id?: string
          is_finished?: boolean | null
          is_published?: boolean | null
          max_participants: number
          registered_count?: number | null
          status?: string | null
          time: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          description?: string
          duration?: number
          gated_bundle_id?: string | null
          gated_course_id?: string | null
          id?: string
          is_finished?: boolean | null
          is_published?: boolean | null
          max_participants?: number
          registered_count?: number | null
          status?: string | null
          time?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "competitions_gated_bundle_id_fkey"
            columns: ["gated_bundle_id"]
            isOneToOne: false
            referencedRelation: "bundles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competitions_gated_course_id_fkey"
            columns: ["gated_course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category: string
          created_at: string | null
          department: string
          description: string
          discount_percentage: number | null
          display_order: number | null
          home_category_id: string | null
          id: string
          is_bundle_exclusive: boolean | null
          name: string
          price: number
          sample_pdf_url: string | null
          sample_video_url: string | null
          status: string | null
          syllabus: string | null
          teacher_id: string | null
          thumbnail_url: string | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          department: string
          description: string
          discount_percentage?: number | null
          display_order?: number | null
          home_category_id?: string | null
          id?: string
          is_bundle_exclusive?: boolean | null
          name: string
          price?: number
          sample_pdf_url?: string | null
          sample_video_url?: string | null
          status?: string | null
          syllabus?: string | null
          teacher_id?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          department?: string
          description?: string
          discount_percentage?: number | null
          display_order?: number | null
          home_category_id?: string | null
          id?: string
          is_bundle_exclusive?: boolean | null
          name?: string
          price?: number
          sample_pdf_url?: string | null
          sample_video_url?: string | null
          status?: string | null
          syllabus?: string | null
          teacher_id?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_home_category_id_fkey"
            columns: ["home_category_id"]
            isOneToOne: false
            referencedRelation: "home_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      device_bindings: {
        Row: {
          bound_at: string | null
          created_at: string | null
          device_fingerprint: string
          device_model: string
          device_os: string
          device_version: string
          id: string
          is_active: boolean | null
          last_accessed: string | null
          user_id: string
          user_type: string
        }
        Insert: {
          bound_at?: string | null
          created_at?: string | null
          device_fingerprint: string
          device_model: string
          device_os: string
          device_version: string
          id?: string
          is_active?: boolean | null
          last_accessed?: string | null
          user_id: string
          user_type: string
        }
        Update: {
          bound_at?: string | null
          created_at?: string | null
          device_fingerprint?: string
          device_model?: string
          device_os?: string
          device_version?: string
          id?: string
          is_active?: boolean | null
          last_accessed?: string | null
          user_id?: string
          user_type?: string
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          bundle_id: string | null
          course_id: string | null
          created_at: string | null
          enrollment_type: string
          expires_at: string | null
          id: string
          payment_amount: number
          status: string
          student_id: string
          updated_at: string | null
        }
        Insert: {
          bundle_id?: string | null
          course_id?: string | null
          created_at?: string | null
          enrollment_type: string
          expires_at?: string | null
          id?: string
          payment_amount: number
          status?: string
          student_id: string
          updated_at?: string | null
        }
        Update: {
          bundle_id?: string | null
          course_id?: string | null
          created_at?: string | null
          enrollment_type?: string
          expires_at?: string | null
          id?: string
          payment_amount?: number
          status?: string
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "bundles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      home_categories: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          is_system: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          is_system?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          is_system?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          completed_at: string | null
          created_at: string | null
          enrollment_id: string
          id: string
          last_position: number | null
          lesson_id: string
          progress_percentage: number | null
          status: string
          student_id: string
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          enrollment_id: string
          id?: string
          last_position?: number | null
          lesson_id: string
          progress_percentage?: number | null
          status?: string
          student_id: string
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          enrollment_id?: string
          id?: string
          last_position?: number | null
          lesson_id?: string
          progress_percentage?: number | null
          status?: string
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          chapter_id: string
          content_url: string | null
          created_at: string | null
          description: string | null
          download_url: string | null
          duration: number | null
          id: string
          is_downloadable: boolean | null
          is_preview: boolean | null
          is_published: boolean | null
          lesson_type: string
          order_index: number
          page_count: number | null
          rejection_reason: string | null
          title: string
          updated_at: string | null
          video_source: string | null
          youtube_url: string | null
        }
        Insert: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          chapter_id: string
          content_url?: string | null
          created_at?: string | null
          description?: string | null
          download_url?: string | null
          duration?: number | null
          id?: string
          is_downloadable?: boolean | null
          is_preview?: boolean | null
          is_published?: boolean | null
          lesson_type: string
          order_index?: number
          page_count?: number | null
          rejection_reason?: string | null
          title: string
          updated_at?: string | null
          video_source?: string | null
          youtube_url?: string | null
        }
        Update: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          chapter_id?: string
          content_url?: string | null
          created_at?: string | null
          description?: string | null
          download_url?: string | null
          duration?: number | null
          id?: string
          is_downloadable?: boolean | null
          is_preview?: boolean | null
          is_published?: boolean | null
          lesson_type?: string
          order_index?: number
          page_count?: number | null
          rejection_reason?: string | null
          title?: string
          updated_at?: string | null
          video_source?: string | null
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      library_content: {
        Row: {
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          author: string | null
          category_id: string | null
          content_markdown: string | null
          content_type: string
          course_id: string | null
          created_at: string | null
          description: string | null
          download_count: number | null
          duration: number | null
          file_size: number | null
          file_url: string | null
          id: string
          page_count: number | null
          rejection_reason: string | null
          requires_enrollment: boolean | null
          subject: string
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          video_source: string | null
          youtube_url: string | null
        }
        Insert: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          author?: string | null
          category_id?: string | null
          content_markdown?: string | null
          content_type: string
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          download_count?: number | null
          duration?: number | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          page_count?: number | null
          rejection_reason?: string | null
          requires_enrollment?: boolean | null
          subject: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          video_source?: string | null
          youtube_url?: string | null
        }
        Update: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          author?: string | null
          category_id?: string | null
          content_markdown?: string | null
          content_type?: string
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          download_count?: number | null
          duration?: number | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          page_count?: number | null
          rejection_reason?: string | null
          requires_enrollment?: boolean | null
          subject?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          video_source?: string | null
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "library_content_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_content_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "library_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_content_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      library_items: {
        Row: {
          created_at: string | null
          description: string
          icon: string | null
          id: string
          item_count: number | null
          name: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          icon?: string | null
          id?: string
          item_count?: number | null
          name: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          icon?: string | null
          id?: string
          item_count?: number | null
          name?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string
          user_id: string
          user_type: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type: string
          user_id: string
          user_type: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string
          user_id?: string
          user_type?: string
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          account_name: string
          account_number: string
          bank_name: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          method_name: string
          updated_at: string | null
        }
        Insert: {
          account_name: string
          account_number: string
          bank_name?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          method_name: string
          updated_at?: string | null
        }
        Update: {
          account_name?: string
          account_number?: string
          bank_name?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          method_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      payment_submissions: {
        Row: {
          admin_notes: string | null
          amount: number
          enrollment_id: string
          id: string
          payment_method: string
          reviewed_at: string | null
          reviewed_by: string | null
          screenshot_urls: string[]
          status: string
          student_id: string
          submitted_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          enrollment_id: string
          id?: string
          payment_method: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          screenshot_urls: string[]
          status?: string
          student_id: string
          submitted_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          enrollment_id?: string
          id?: string
          payment_method?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          screenshot_urls?: string[]
          status?: string
          student_id?: string
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_submissions_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_submissions_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      pinned_items: {
        Row: {
          created_at: string
          display_order: number
          id: string
          item_id: string
          item_type: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          item_id: string
          item_type: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          item_id?: string
          item_type?: string
        }
        Relationships: []
      }
      popup_notice_dismissals: {
        Row: {
          dismissed_at: string
          id: string
          notice_id: string
          student_id: string
        }
        Insert: {
          dismissed_at?: string
          id?: string
          notice_id: string
          student_id: string
        }
        Update: {
          dismissed_at?: string
          id?: string
          notice_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "popup_notice_dismissals_notice_id_fkey"
            columns: ["notice_id"]
            isOneToOne: false
            referencedRelation: "popup_notices"
            referencedColumns: ["id"]
          },
        ]
      }
      popup_notices: {
        Row: {
          button_text: string | null
          created_at: string
          display_interval_hours: number
          end_date: string
          id: string
          image_url: string
          is_active: boolean
          link_id: string | null
          link_type: string | null
          start_date: string
          target_year_level: string | null
          title: string
          updated_at: string
        }
        Insert: {
          button_text?: string | null
          created_at?: string
          display_interval_hours?: number
          end_date: string
          id?: string
          image_url: string
          is_active?: boolean
          link_id?: string | null
          link_type?: string | null
          start_date?: string
          target_year_level?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          button_text?: string | null
          created_at?: string
          display_interval_hours?: number
          end_date?: string
          id?: string
          image_url?: string
          is_active?: boolean
          link_id?: string | null
          link_type?: string | null
          start_date?: string
          target_year_level?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          answers: Json | null
          completed_at: string | null
          id: string
          quiz_id: string
          score: number | null
          started_at: string | null
          status: string
          student_id: string
          total_points: number | null
        }
        Insert: {
          answers?: Json | null
          completed_at?: string | null
          id?: string
          quiz_id: string
          score?: number | null
          started_at?: string | null
          status?: string
          student_id: string
          total_points?: number | null
        }
        Update: {
          answers?: Json | null
          completed_at?: string | null
          id?: string
          quiz_id?: string
          score?: number | null
          started_at?: string | null
          status?: string
          student_id?: string
          total_points?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          correct_answer: string
          created_at: string | null
          explanation: string | null
          id: string
          options: Json | null
          order_index: number
          points: number | null
          question_text: string
          question_type: string
          quiz_id: string
        }
        Insert: {
          correct_answer: string
          created_at?: string | null
          explanation?: string | null
          id?: string
          options?: Json | null
          order_index?: number
          points?: number | null
          question_text: string
          question_type?: string
          quiz_id: string
        }
        Update: {
          correct_answer?: string
          created_at?: string | null
          explanation?: string | null
          id?: string
          options?: Json | null
          order_index?: number
          points?: number | null
          question_text?: string
          question_type?: string
          quiz_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          content_markdown: string | null
          course_id: string | null
          created_at: string | null
          description: string | null
          duration: number | null
          feedback_mode: string
          id: string
          passing_score: number | null
          status: string
          teacher_id: string
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          content_markdown?: string | null
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          feedback_mode?: string
          id?: string
          passing_score?: number | null
          status?: string
          teacher_id: string
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          content_markdown?: string | null
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          feedback_mode?: string
          id?: string
          passing_score?: number | null
          status?: string
          teacher_id?: string
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quizzes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      student_competitions: {
        Row: {
          competition_id: string
          created_at: string | null
          end_time: string | null
          id: string
          score: number | null
          start_time: string | null
          status: string | null
          student_id: string
        }
        Insert: {
          competition_id: string
          created_at?: string | null
          end_time?: string | null
          id?: string
          score?: number | null
          start_time?: string | null
          status?: string | null
          student_id: string
        }
        Update: {
          competition_id?: string
          created_at?: string | null
          end_time?: string | null
          id?: string
          score?: number | null
          start_time?: string | null
          status?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_competitions_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_competitions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          academic_year: string | null
          created_at: string | null
          email: string | null
          full_name: string
          gender: string | null
          hide_how_to_use_tooltip: boolean | null
          id: string
          institution: string | null
          is_active: boolean | null
          is_approved: boolean | null
          last_logout_at: string | null
          phone_number: string
          pin_hash: string
          profile_picture: string | null
          profile_picture_url: string | null
          stream: string | null
          updated_at: string | null
        }
        Insert: {
          academic_year?: string | null
          created_at?: string | null
          email?: string | null
          full_name: string
          gender?: string | null
          hide_how_to_use_tooltip?: boolean | null
          id?: string
          institution?: string | null
          is_active?: boolean | null
          is_approved?: boolean | null
          last_logout_at?: string | null
          phone_number: string
          pin_hash: string
          profile_picture?: string | null
          profile_picture_url?: string | null
          stream?: string | null
          updated_at?: string | null
        }
        Update: {
          academic_year?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string
          gender?: string | null
          hide_how_to_use_tooltip?: boolean | null
          id?: string
          institution?: string | null
          is_active?: boolean | null
          is_approved?: boolean | null
          last_logout_at?: string | null
          phone_number?: string
          pin_hash?: string
          profile_picture?: string | null
          profile_picture_url?: string | null
          stream?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      teacher_earnings: {
        Row: {
          amount: number
          created_at: string | null
          enrollment_id: string | null
          id: string
          notes: string | null
          paid_at: string | null
          status: string
          teacher_id: string
          type: string
          withdrawal_request_date: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          enrollment_id?: string | null
          id?: string
          notes?: string | null
          paid_at?: string | null
          status?: string
          teacher_id: string
          type: string
          withdrawal_request_date?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          enrollment_id?: string | null
          id?: string
          notes?: string | null
          paid_at?: string | null
          status?: string
          teacher_id?: string
          type?: string
          withdrawal_request_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teacher_earnings_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_earnings_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          bio: string | null
          created_at: string | null
          credentials_url: string | null
          email: string
          experience: string | null
          full_name: string
          id: string
          intro_video_url: string | null
          is_active: boolean | null
          is_approved: boolean | null
          last_logout_at: string | null
          phone_number: string
          pin_hash: string
          profile_picture: string | null
          profile_picture_url: string | null
          specialization: string | null
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          credentials_url?: string | null
          email: string
          experience?: string | null
          full_name: string
          id?: string
          intro_video_url?: string | null
          is_active?: boolean | null
          is_approved?: boolean | null
          last_logout_at?: string | null
          phone_number: string
          pin_hash: string
          profile_picture?: string | null
          profile_picture_url?: string | null
          specialization?: string | null
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          credentials_url?: string | null
          email?: string
          experience?: string | null
          full_name?: string
          id?: string
          intro_video_url?: string | null
          is_active?: boolean | null
          is_approved?: boolean | null
          last_logout_at?: string | null
          phone_number?: string
          pin_hash?: string
          profile_picture?: string | null
          profile_picture_url?: string | null
          specialization?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          admin_edited_content: string | null
          content: string
          created_at: string | null
          id: string
          image_urls: string[] | null
          rating: number | null
          status: string
          student_id: string
          student_name: string
          updated_at: string | null
        }
        Insert: {
          admin_edited_content?: string | null
          content: string
          created_at?: string | null
          id?: string
          image_urls?: string[] | null
          rating?: number | null
          status?: string
          student_id: string
          student_name: string
          updated_at?: string | null
        }
        Update: {
          admin_edited_content?: string | null
          content?: string
          created_at?: string | null
          id?: string
          image_urls?: string[] | null
          rating?: number | null
          status?: string
          student_id?: string
          student_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      trusted_devices: {
        Row: {
          created_at: string
          device_name: string | null
          device_token_hash: string
          hardware_id: string | null
          id: string
          last_seen: string
          revoked: boolean
          user_agent: string | null
          user_id: string
          user_type: string
        }
        Insert: {
          created_at?: string
          device_name?: string | null
          device_token_hash: string
          hardware_id?: string | null
          id?: string
          last_seen?: string
          revoked?: boolean
          user_agent?: string | null
          user_id: string
          user_type: string
        }
        Update: {
          created_at?: string
          device_name?: string | null
          device_token_hash?: string
          hardware_id?: string | null
          id?: string
          last_seen?: string
          revoked?: boolean
          user_agent?: string | null
          user_id?: string
          user_type?: string
        }
        Relationships: []
      }
      tutorial_videos: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          duration: number | null
          id: string
          is_active: boolean | null
          target_audience: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          uploaded_by: string | null
          video_url: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          duration?: number | null
          id?: string
          is_active?: boolean | null
          target_audience?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          uploaded_by?: string | null
          video_url: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          duration?: number | null
          id?: string
          is_active?: boolean | null
          target_audience?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          uploaded_by?: string | null
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "tutorial_videos_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      user_downloads: {
        Row: {
          content_id: string
          content_type: string
          created_at: string | null
          downloaded_at: string | null
          encrypted: boolean | null
          file_path: string
          file_size: number
          id: string
          is_deleted: boolean | null
          last_accessed: string | null
          user_id: string
          user_type: string
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string | null
          downloaded_at?: string | null
          encrypted?: boolean | null
          file_path: string
          file_size: number
          id?: string
          is_deleted?: boolean | null
          last_accessed?: string | null
          user_id: string
          user_type: string
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string | null
          downloaded_at?: string | null
          encrypted?: boolean | null
          file_path?: string
          file_size?: number
          id?: string
          is_deleted?: boolean | null
          last_accessed?: string | null
          user_id?: string
          user_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      pending_content_approvals: {
        Row: {
          approval_status: string | null
          content_type: string | null
          content_url: string | null
          course_title: string | null
          created_at: string | null
          id: string | null
          lesson_type: string | null
          teacher_id: string | null
          teacher_name: string | null
          title: string | null
          video_source: string | null
          youtube_url: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_update_student: {
        Args: {
          p_academic_year?: string
          p_email?: string
          p_full_name?: string
          p_institution?: string
          p_phone_number?: string
          p_pin?: string
          p_student_id: string
        }
        Returns: boolean
      }
      admin_update_teacher: {
        Args: {
          p_email?: string
          p_experience?: string
          p_full_name?: string
          p_phone_number?: string
          p_pin?: string
          p_specialization?: string
          p_teacher_id: string
        }
        Returns: boolean
      }
      approve_content: {
        Args: {
          p_admin_id: string
          p_content_id: string
          p_content_type: string
        }
        Returns: boolean
      }
      bind_device: {
        Args: {
          p_device_fingerprint: string
          p_device_model: string
          p_device_os: string
          p_device_version: string
          p_user_id: string
          p_user_type: string
        }
        Returns: {
          message: string
          success: boolean
        }[]
      }
      check_device_binding: {
        Args: {
          p_device_fingerprint: string
          p_user_id: string
          p_user_type: string
        }
        Returns: {
          bound_device: string
          is_bound: boolean
          message: string
        }[]
      }
      cleanup_old_payment_proofs: { Args: never; Returns: undefined }
      get_admin_by_id: {
        Args: { p_admin_id: string }
        Returns: {
          created_at: string
          full_name: string
          id: string
          is_active: boolean
          phone_number: string
          profile_picture_url: string
          role: string
          updated_at: string
        }[]
      }
      get_dashboard_stats: {
        Args: never
        Returns: {
          pending_payments: number
          pending_students: number
          pending_teachers: number
          total_students: number
          total_teachers: number
        }[]
      }
      get_student_by_id: {
        Args: { p_student_id: string }
        Returns: {
          academic_year: string
          created_at: string
          email: string
          full_name: string
          gender: string
          id: string
          institution: string
          is_approved: boolean
          phone_number: string
          profile_picture_url: string
          stream: string
          updated_at: string
        }[]
      }
      get_teacher_by_id: {
        Args: { p_teacher_id: string }
        Returns: {
          bio: string
          created_at: string
          credentials_url: string
          email: string
          experience: string
          full_name: string
          id: string
          is_active: boolean
          is_approved: boolean
          phone_number: string
          profile_picture_url: string
          specialization: string
          updated_at: string
        }[]
      }
      get_user_devices: {
        Args: { p_user_id: string; p_user_type: string }
        Returns: {
          created_at: string
          device_name: string
          id: string
          last_seen: string
          revoked: boolean
          user_agent: string
        }[]
      }
      register_trusted_device: {
        Args: {
          p_device_name?: string
          p_device_token_hash: string
          p_user_agent?: string
          p_user_id: string
          p_user_type: string
        }
        Returns: {
          device_id: string
          success: boolean
        }[]
      }
      reject_content: {
        Args: {
          p_admin_id: string
          p_content_id: string
          p_content_type: string
          p_reason: string
        }
        Returns: boolean
      }
      reset_device_binding: {
        Args: { p_user_id: string; p_user_type: string }
        Returns: {
          message: string
          success: boolean
        }[]
      }
      revoke_all_user_devices: {
        Args: { p_user_id: string; p_user_type: string }
        Returns: boolean
      }
      revoke_trusted_device: { Args: { p_device_id: string }; Returns: boolean }
      signup_student: {
        Args: {
          p_academic_year?: string
          p_email?: string
          p_full_name: string
          p_gender?: string
          p_institution?: string
          p_phone_number: string
          p_pin: string
          p_stream?: string
        }
        Returns: {
          email: string
          full_name: string
          id: string
          is_approved: boolean
          phone_number: string
        }[]
      }
      signup_teacher:
        | {
            Args: {
              p_bio?: string
              p_credentials_url?: string
              p_email: string
              p_experience?: string
              p_full_name: string
              p_phone_number: string
              p_pin: string
              p_specialization?: string
            }
            Returns: {
              email: string
              full_name: string
              id: string
              is_approved: boolean
              phone_number: string
            }[]
          }
        | {
            Args: {
              p_bio?: string
              p_credentials_url?: string
              p_email: string
              p_experience?: string
              p_full_name: string
              p_intro_video_url?: string
              p_phone_number: string
              p_pin: string
              p_specialization?: string
            }
            Returns: {
              email: string
              full_name: string
              id: string
              is_approved: boolean
              phone_number: string
            }[]
          }
      update_student_pin: {
        Args: { p_new_pin: string; p_student_id: string }
        Returns: boolean
      }
      verify_admin_login: {
        Args: { p_phone_number: string; p_pin: string }
        Returns: {
          created_at: string
          full_name: string
          id: string
          is_active: boolean
          phone_number: string
          role: string
        }[]
      }
      verify_device_token: {
        Args: {
          p_device_token_hash: string
          p_user_id: string
          p_user_type: string
        }
        Returns: {
          device_id: string
          device_name: string
          is_valid: boolean
        }[]
      }
      verify_student_login: {
        Args: { p_phone_number: string; p_pin: string }
        Returns: {
          academic_year: string
          created_at: string
          email: string
          full_name: string
          gender: string
          id: string
          institution: string
          is_active: boolean
          is_approved: boolean
          phone_number: string
          stream: string
        }[]
      }
      verify_teacher_login: {
        Args: { p_phone_number: string; p_pin: string }
        Returns: {
          bio: string
          created_at: string
          credentials_url: string
          email: string
          experience: string
          full_name: string
          id: string
          is_active: boolean
          is_approved: boolean
          phone_number: string
          specialization: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
