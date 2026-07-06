export type CourseGrade = {
  course_id: string;
  course_name: string;
  total_marks_100: number;
  letter_grade: string;
};

export type CourseSection = {
  section: string;
  max_marks: number;
  marks_obtained: number;
};

export type StudentCourse = {
  course_id: string;
  course_name: string;
  instructor: string;
  credits: number;
  attendance_pct: number;
  grade: string;
  marks_100: number;
  sections: CourseSection[];
};

export type StudentProject = {
  file: string;
  title: string;
  course_id: string;
  course_name: string;
  group: number;
  group_total: number;
  summary: string;
  members: Array<{ name: string; student_id: string }>;
};

export type StudentRecord = {
  student_id: string;
  name: string;
  program: string;
  term: number;
  email: string;
  cgpa: number;
  attendance: {
    overall_pct: number;
    by_course: Array<{
      course_id: string;
      course_name: string;
      classes_held: number;
      classes_attended: number;
      attendance_pct: number;
    }>;
  };
  courses: StudentCourse[];
  grades: CourseGrade[];
  projects: StudentProject[];
  skills: string[];
  analytics: {
    course_count: number;
    attendance_count: number;
    project_count: number;
    average_marks_100: number;
    attendance_flags: string[];
    project_topics: string[];
  };
  placement_status: string;
};

export type Metadata = {
  total_students: number;
  average_cgpa: number;
  median_cgpa: number;
  cgpa_distribution: Record<string, number>;
  attendance_statistics: {
    average: number;
    median: number;
    min: number;
    max: number;
  };
  placement_statistics: {
    project_linked_students: number;
    unknown_students: number;
    placement_data_available: boolean;
  };
  program_counts: Record<string, number>;
  grade_distribution: Record<string, number>;
  course_analytics: Array<{
    course_id: string;
    course_name: string;
    students: number;
    average_attendance: number;
    average_marks_100: number;
  }>;
  project_analytics: Array<{
    title: string;
    course: string;
    group: number;
    member_count: number;
  }>;
  top_courses: Array<{ label: string; count: number }>;
  project_topic_counts: Array<{ label: string; count: number }>;
};

export type EmbeddingDoc = {
  student_id: string;
  text: string;
};
