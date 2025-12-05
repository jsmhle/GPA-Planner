// src/models.ts

// 성적 등급 타입
export type GradeLetter =
  | 'A+'
  | 'A0'
  | 'B+'
  | 'B0'
  | 'C+'
  | 'C0'
  | 'D+'
  | 'D0'
  | 'F'
  | '-'; // '-' : 아직 성적 미입력 상태

// 과목 정보 타입
export interface Course {
  id: string;         // 고유 ID (uuid 등)
  name: string;       // 과목명
  credits: number;    // 학점
  isMajor: boolean;   // ✅ 전공 여부 (true: 전공, false: 교양)
  semester: string;   // 학기 (예: '2025-2')
  grade?: GradeLetter; // 성적 (없으면 '-' 또는 undefined)
  memo?: string;       // 메모 (선택)
}

// GPA 계산 결과
export interface GPAResult {
  totalCredits: number; // 성적이 반영된 과목들의 총 학점
  gpa: number | null;   // GPA (없으면 null)
}
