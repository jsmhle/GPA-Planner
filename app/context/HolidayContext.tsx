// app/context/HolidayContext.tsx

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

// ---------- 타입 ----------

export interface Holiday {
  /** YYYY-MM-DD */
  date: string;
  name: string;
  isHoliday: boolean;
}

export interface TaskItem {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  title: string;
}

export interface HolidayContextValue {
  holidaysByDate: Record<string, Holiday[]>;
  isLoading: boolean;
  error: string | null;

  tasks: TaskItem[];
  addTask: (title: string, date: string) => void;
  removeTask: (id: string) => void;
}

const HolidayContext = createContext<HolidayContextValue | undefined>(
  undefined,
);

// 공휴일 API 키 (URL 인코딩 그대로 사용)
const SERVICE_KEY =
  'r%2BUmzWhugvLgDmCOnfr6tDQeIQ7SzRwfwDq858BYZrYv90GNSrYVvOiVY6C00dan3iao9T9OCExwxpjQNupVaQ%3D%3D';

// ---------- 공휴일 호출 유틸 ----------

// 한 해 전체 공휴일(1~12월)을 불러오기
async function fetchHolidaysForYear(year: number): Promise<Holiday[]> {
  const all: Holiday[] = [];

  for (let month = 1; month <= 12; month++) {
    const monthStr = month.toString().padStart(2, '0');

    const url =
      'https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getHoliDeInfo' +
      `?serviceKey=${SERVICE_KEY}` +
      '&_type=json' +
      '&numOfRows=100' +
      `&solYear=${year}` +
      `&solMonth=${monthStr}`;

    try {
      const res = await fetch(url);
      const json = await res.json();
      const items = json?.response?.body?.items?.item;

      if (!items) continue;
      const list = Array.isArray(items) ? items : [items];

      list.forEach((item: any) => {
        const locdate = String(item.locdate); // 20250101
        if (!/^\d{8}$/.test(locdate)) return;
        const date = `${locdate.slice(0, 4)}-${locdate.slice(
          4,
          6,
        )}-${locdate.slice(6, 8)}`;

        all.push({
          date,
          name: item.dateName ?? '공휴일',
          isHoliday: true,
        });
      });
    } catch (e) {
      console.warn('공휴일 조회 실패:', year, monthStr, e);
    }
  }

  return all;
}

// ---------- Provider ----------

export function HolidayProvider({ children }: { children: ReactNode }) {
  const [holidaysByDate, setHolidaysByDate] = useState<
    Record<string, Holiday[]>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [tasks, setTasks] = useState<TaskItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const currentYear = new Date().getFullYear();
        // ★ 전년도 / 올해 / 내년도까지 3년치 공휴일 로딩
        const years = [currentYear - 1, currentYear, currentYear + 1];

        const results = await Promise.all(
          years.map((y) => fetchHolidaysForYear(y)),
        );
        const merged = results.flat();

        const map: Record<string, Holiday[]> = {};
        merged.forEach((h) => {
          if (!map[h.date]) map[h.date] = [];
          map[h.date].push(h);
        });

        if (!cancelled) {
          setHolidaysByDate(map);
          setError(null);
        }
      } catch (e) {
        console.warn(e);
        if (!cancelled) {
          setError('공휴일 정보를 불러오는 중 오류가 발생했습니다.');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  // ---------- D-Day 과제/시험 관리 ----------

  const addTask = (title: string, date: string) => {
    const trimmed = title.trim();
    if (!trimmed || !date) return;

    setTasks((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        title: trimmed,
        date,
      },
    ]);
  };

  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const value: HolidayContextValue = {
    holidaysByDate,
    isLoading,
    error,
    tasks,
    addTask,
    removeTask,
  };

  return (
    <HolidayContext.Provider value={value}>{children}</HolidayContext.Provider>
  );
}

// ---------- Hook ----------

export function useHolidays(): HolidayContextValue {
  const ctx = useContext(HolidayContext);
  if (!ctx) throw new Error('useHolidays는 HolidayProvider 내부에서만 사용해야 합니다.');
  return ctx;
}
