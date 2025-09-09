// src/pages/teacher/types.ts

// Podstawowe typy z bazy danych
export interface User {
    id: string;
    vendor_id: number;
    email: string;
    full_name: string;
    role: 'student' | 'teacher' | 'admin';
    is_active: boolean;
    created_at: string;
  }
  
  export interface UserStats {
    user_id: string;
    total_points: number;
    current_level: number;
    daily_streak: number;
    last_active: string;
    idle_points_rate: number;
    last_idle_claim: string;
    quizzes_completed: number;
    perfect_scores: number;
    total_time_spent: number;
    updated_at: string;
  }
  
  export interface Group {
    id: number;
    vendor_id: number;
    name: string;
    academic_year: string;
    is_active: boolean;
    created_at: string;
  }
  
  export interface GroupMember {
    group_id: number;
    user_id: string;
    joined_at: string;
    groups?: Group;
  }
  
  export interface CourseAccess {
    course_id: number;
    group_id: number | null;
    teacher_id: string | null;
    assigned_at: string;
    groups?: Group;
  }
  
  export interface ActivityProgress {
    user_id: string;
    activity_id: number;
    started_at: string;
    completed_at: string | null;
    score: number | null;
    attempts: number;
    time_spent: number;
    last_attempt: any;
    activities?: Activity;
  }
  
  export interface Activity {
    id: number;
    topic_id: number;
    type: 'quiz' | 'material';
    title: string;
    position: number;
    is_published: boolean;
    content: string | null;
    duration_min: number | null;
    passing_score: number | null;
    time_limit: number | null;
    max_attempts: number | null;
    created_at: string;
    topics?: Topic;
  }
  
  export interface Topic {
    id: number;
    course_id: number;
    title: string;
    position: number;
    is_published: boolean;
    created_at: string;
    courses?: Course;
  }
  
  export interface Course {
    id: number;
    vendor_id: number;
    title: string;
    description: string | null;
    icon_emoji: string | null;
    is_published: boolean;
    created_at: string;
    course_access?: CourseAccess[];
  }
  
  // Typy złożone dla widoków nauczyciela
  export interface StudentData extends User {
    groups: GroupMember[];
    user_stats: UserStats[];
  }
  
  export interface TeacherIdentity {
    id: string;
    email: string;
    full_name: string;
    role: 'teacher';
    vendor_id: number;
  }
  
  export interface CourseProgress {
    course_id: number;
    course_title: string;
    completed_activities: number;
    total_activities: number;
    avg_score: number;
    last_activity: string;
    quizzes_passed: number;
    quizzes_failed: number;
  }
  
  export interface StudentWithProgress extends StudentData {
    course_progress: CourseProgress[];
    recent_activities: ActivityProgress[];
  }
  
  // Typy dla filtrów i parametrów
  export interface StudentsListFilters {
    searchTerm: string;
    groupFilter: string;
    sortBy?: 'name' | 'points' | 'activity';
    sortOrder?: 'asc' | 'desc';
  }
  
  // Typy dla odpowiedzi z RPC
  export interface GetStudentCourseProgressResponse {
    course_id: number;
    course_title: string;
    completed_activities: number;
    total_activities: number;
    avg_score: number | null;
    last_activity: string | null;
    quizzes_passed: number;
    quizzes_failed: number;
  }