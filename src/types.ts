export type SpecializationId = 'communications' | 'computer-networks' | 'industrial';

export type PortalSection = 'overview' | 'materials' | 'exams' | 'channels' | 'tools' | 'info';

export interface SpecializationColorConfig {
  primary: string;
  secondary: string;
  copper: string;
  glow: string;
}

export interface CourseMaterial {
  id: string;
  courseCode: string;
  courseNameAr: string;
  courseNameEn: string;
  titleAr: string;
  titleEn: string;
  category: 'lecture' | 'summary' | 'lab' | 'reference' | 'slides' | 'cheatsheet';
  semester: number; // 7 or 8
  author?: string;
  fileSize: string;
  fileFormat: 'PDF' | 'ZIP' | 'PPTX' | 'DOCX';
  downloadUrl: string;
  pages?: number;
  dateAdded: string;
  descriptionAr: string;
  featured?: boolean;
}

export interface ExamRecord {
  id: string;
  courseCode: string;
  courseNameAr: string;
  courseNameEn: string;
  year: string; // e.g. "2025/2026", "2024/2025", "2023/2024"
  term: 'midterm' | 'final' | 'quiz';
  semester: number;
  hasSolution: boolean;
  solutionAuthor?: string;
  durationMinutes: number;
  questionsCount: number;
  downloadUrl: string;
  solutionUrl?: string;
  notesAr?: string;
}

export interface ChannelLink {
  id: string;
  titleAr: string;
  titleEn: string;
  type: 'telegram' | 'whatsapp' | 'drive' | 'site' | 'coordinator';
  url: string;
  descriptionAr: string;
  badgeAr?: string;
  membersCount?: string;
}

export interface CourseInfo {
  code: string;
  nameAr: string;
  nameEn: string;
  creditHours: number;
  lectureHours: number;
  labHours: number;
  semester: number;
  prerequisites?: string[];
  descriptionAr: string;
  topicsAr: string[];
  instructor?: string;
}

export interface SpecializationData {
  id: SpecializationId;
  titleAr: string;
  titleEn: string;
  taglineAr: string;
  taglineEn: string;
  tag: string;
  badgeIndex: string;
  colors: SpecializationColorConfig;
  semesterCurrent: number;
  stats: {
    courses: number;
    hours: number;
    exams: number;
    materials: number;
    labs: number;
  };
  overviewAr: string;
  visionAr: string;
  careerPathsAr: string[];
  laboratoriesAr: string[];
  courses: CourseInfo[];
  materials: CourseMaterial[];
  exams: ExamRecord[];
  channels: ChannelLink[];
}
