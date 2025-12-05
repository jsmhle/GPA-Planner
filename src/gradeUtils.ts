import { Course, GradeLetter, GPAResult } from './models';

// 성적 → 평점 매핑
const gradePointMap: Record<GradeLetter, number | null> = {
  'A+': 4.5,
  'A0': 4.0,
  'B+': 3.5,
  'B0': 3.0,
  'C+': 2.5,
  'C0': 2.0,
  'D+': 1.5,
  'D0': 1.0,
  F: 0,
  '-': null, // 성적 미입력
};

// 개별 등급을 평점 숫자로 변환
export function gradeToPoint(grade?: GradeLetter): number | null {
  if (!grade) return null;
  return gradePointMap[grade] ?? null;
}

// 과목 배열 기준으로 GPA 계산 (방어코드 포함)
export function calculateGPA(courses: Course[] | undefined | null): GPAResult {
  if (!Array.isArray(courses) || courses.length === 0) {
    return {
      totalCredits: 0,
      gpa: null,
    };
  }

  let totalCredits = 0;
  let totalPoints = 0;

  for (const course of courses) {
    const point = gradeToPoint(course.grade);

    // 성적이 없는 과목('-', undefined 등)은 GPA 계산에서 제외
    if (point === null) continue;

    const credits = Number(course.credits) || 0;
    if (credits <= 0) continue;

    totalCredits += credits;
    totalPoints += point * credits;
  }

  if (totalCredits === 0) {
    return {
      totalCredits: 0,
      gpa: null,
    };
  }

  const gpaRaw = totalPoints / totalCredits;
  const gpaRounded = Math.round(gpaRaw * 100) / 100; // 소수 둘째 자리까지 반올림

  return {
    totalCredits,
    gpa: gpaRounded,
  };
}

// 현재까지 이수한 과목 기준 GPA (필요 시 학기 필터)
export function calculateCurrentGPA(
  allCourses: Course[] | undefined | null,
  currentSemester?: string,
): GPAResult {
  if (!Array.isArray(allCourses)) {
    return { totalCredits: 0, gpa: null };
  }

  const filtered = currentSemester
    ? allCourses.filter((c) => c.semester === currentSemester)
    : allCourses;

  return calculateGPA(filtered);
}

// 목표 GPA 관련 타입
interface TargetGPAInput {
  completedCourses: Course[]; // 이미 성적이 확정된 과목들
  remainingCredits: number; // 앞으로 들을 총 학점 수
  targetOverallGPA: number; // 목표 총 GPA
}

export interface TargetGPAResult {
  possible: boolean; // 이론상 달성이 가능한지
  requiredAveragePoint: number | null; // 남은 과목에서 필요한 평균 평점 (4.5 만점 기준)
}

// 목표 GPA를 맞추기 위한 필요 평균 평점 계산
export function calculateRequiredAverageForTargetGPA(
  input: TargetGPAInput,
): TargetGPAResult {
  const { completedCourses, remainingCredits, targetOverallGPA } = input;

  if (remainingCredits <= 0) {
    // 남은 학점이 없는데 목표를 바꾸려 한다면 계산 불가
    return {
      possible: false,
      requiredAveragePoint: null,
    };
  }

  const completedResult = calculateGPA(completedCourses);

  // 성적이 하나도 없으면 지금까지 총점 = 0 으로 본다
  const completedGPA = completedResult.gpa ?? 0;
  const completedCredits = completedResult.totalCredits;

  // 전체 GPA 공식을 기반으로 역산:
  // (기존총점 + x * 남은학점) / (기존학점 + 남은학점) = 목표GPA
  const totalCreditsAfter = completedCredits + remainingCredits;
  if (totalCreditsAfter === 0) {
    return {
      possible: false,
      requiredAveragePoint: null,
    };
  }

  const currentTotalPoints = completedGPA * completedCredits;
  const requiredTotalPoints = targetOverallGPA * totalCreditsAfter;
  const requiredPointsFromRemaining = requiredTotalPoints - currentTotalPoints;

  const requiredAveragePoint = requiredPointsFromRemaining / remainingCredits;

  // 4.5 만점 기준으로 0 ~ 4.5 범위를 벗어나면 현실적으로 불가능
  if (requiredAveragePoint > 4.5 || requiredAveragePoint < 0) {
    return {
      possible: false,
      requiredAveragePoint,
    };
  }

  // 소수 둘째 자리까지 정리
  const rounded = Math.round(requiredAveragePoint * 100) / 100;

  return {
    possible: true,
    requiredAveragePoint: rounded,
  };
}
