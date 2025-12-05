import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { Course } from './models';
import { calculateGPA } from './gradeUtils';

export interface CoursesContextValue {
  courses: Course[];
  totalCredits: number;
  currentGpa: number | null;
  addCourse: (course: Omit<Course, 'id'>) => string;
  updateCourse: (id: string, patch: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  getCourseById: (id: string) => Course | undefined;
}

const CoursesContext = createContext<CoursesContextValue | undefined>(
  undefined,
);

export function CoursesProvider({ children }: { children: ReactNode }) {
  const [courses, setCourses] = useState<Course[]>([]);

  const { totalCredits, gpa } = useMemo(() => {
    return calculateGPA(courses);
  }, [courses]);

  const addCourse: CoursesContextValue['addCourse'] = (course) => {
    const id = Date.now().toString();
    setCourses((prev) => [...prev, { ...course, id }]);
    return id;
  };

  const updateCourse: CoursesContextValue['updateCourse'] = (id, patch) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    );
  };

  const deleteCourse: CoursesContextValue['deleteCourse'] = (id) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  const getCourseById = (id: string) => courses.find((c) => c.id === id);

  const value: CoursesContextValue = {
    courses,
    totalCredits,
    currentGpa: gpa,
    addCourse,
    updateCourse,
    deleteCourse,
    getCourseById,
  };

  return (
    <CoursesContext.Provider value={value}>{children}</CoursesContext.Provider>
  );
}

export function useCourses(): CoursesContextValue {
  const ctx = useContext(CoursesContext);
  if (!ctx) {
    throw new Error('useCourses must be used within CoursesProvider');
  }
  return ctx;
}
