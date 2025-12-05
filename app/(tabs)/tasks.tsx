// app/(tabs)/tasks.tsx

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {
  Calendar,
  DateData,
  LocaleConfig,
} from 'react-native-calendars';

import { useHolidays } from '../context/HolidayContext';
import { colors } from '../../constants/colors';

// ---------- 캘린더 한국어 설정 ----------
LocaleConfig.locales['ko'] = {
  monthNames: [
    '1월',
    '2월',
    '3월',
    '4월',
    '5월',
    '6월',
    '7월',
    '8월',
    '9월',
    '10월',
    '11월',
    '12월',
  ],
  monthNamesShort: [
    '1월',
    '2월',
    '3월',
    '4월',
    '5월',
    '6월',
    '7월',
    '8월',
    '9월',
    '10월',
    '11월',
    '12월',
  ],
  dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘',
};

LocaleConfig.defaultLocale = 'ko';

// ---------- D-Day 계산 ----------
function getDDayLabel(dateString: string): string {
  const today = new Date();
  const todayUTC = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const target = new Date(dateString + 'T00:00:00');

  const diffMs = target.getTime() - todayUTC.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'D-day';
  if (diffDays > 0) return `D-${diffDays}`;
  return `D+${Math.abs(diffDays)}`;
}

export default function TasksScreen() {
  const { holidaysByDate, isLoading, error, tasks, addTask, removeTask } =
    useHolidays();

  const todayStr = useMemo(() => {
    const d = new Date();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [taskTitle, setTaskTitle] = useState('');

  // 날짜별 과제 묶기
  const tasksByDate = useMemo(() => {
    const map: Record<string, typeof tasks> = {};
    tasks.forEach((t) => {
      if (!map[t.date]) map[t.date] = [];
      map[t.date].push(t);
    });
    return map;
  }, [tasks]);

  const tasksForSelectedDate = tasksByDate[selectedDate] ?? [];
  const holidaysForSelectedDate = holidaysByDate[selectedDate] ?? [];

  // 캘린더 마킹
  const markedDates = useMemo(() => {
    const marked: Record<string, any> = {};

    // 공휴일 표시
    Object.keys(holidaysByDate).forEach((date) => {
      marked[date] = {
        ...(marked[date] ?? {}),
        marked: true,
        dotColor: colors.accentPink,
      };
    });

    // 과제/시험 D-Day 표시 (있으면 보라색 점으로 덮어씀)
    tasks.forEach((t) => {
      marked[t.date] = {
        ...(marked[t.date] ?? {}),
        marked: true,
        dotColor: colors.primary,
      };
    });

    // 선택한 날짜 하이라이트
    if (selectedDate) {
      marked[selectedDate] = {
        ...(marked[selectedDate] ?? {}),
        selected: true,
        selectedColor: colors.primary,
      };
    }

    return marked;
  }, [holidaysByDate, tasks, selectedDate]);

  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  const handleAddTask = () => {
    if (!taskTitle.trim()) return;
    if (!selectedDate) return;

    addTask(taskTitle, selectedDate);
    setTaskTitle('');
  };

  const renderTaskItem = ({ item }: { item: (typeof tasks)[number] }) => {
    const dday = getDDayLabel(item.date);
    return (
      <View style={styles.taskRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.taskTitle}>{item.title}</Text>
          <Text style={styles.taskSub}>{item.date} · {dday}</Text>
        </View>
        <TouchableOpacity
          style={styles.taskDeleteButton}
          onPress={() => removeTask(item.id)}
        >
          <Text style={styles.taskDeleteText}>삭제</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoading && !Object.keys(holidaysByDate).length) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.loadingText}>공휴일 정보를 불러오는 중입니다…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>학사 일정</Text>
      <Text style={styles.screenSub}>
        캘린더에서 날짜를 선택하고, 아래에 과제·시험 D-Day를 등록하세요.
      </Text>

      <Calendar
        current={todayStr}
        onDayPress={handleDayPress}
        markedDates={markedDates}
        theme={{
          calendarBackground: colors.card,
          textSectionTitleColor: colors.text,
          dayTextColor: colors.text,
          todayTextColor: colors.primary,
          monthTextColor: colors.text,
          arrowColor: colors.primary,
        }}
        style={styles.calendar}
      />

      {/* 선택된 날짜 정보 / 공휴일 */}
      <View style={styles.selectedBox}>
        <Text style={styles.selectedDateText}>{selectedDate}</Text>
        {holidaysForSelectedDate.length > 0 && (
          <Text style={styles.holidayText}>
            {holidaysForSelectedDate.map((h) => h.name).join(', ')}
          </Text>
        )}
      </View>

      {/* D-Day 입력 */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={taskTitle}
          onChangeText={setTaskTitle}
          placeholder="예: 운영체제 과제 마감, 자료구조 중간고사"
          placeholderTextColor={colors.textMuted}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
          <Text style={styles.addButtonText}>추가</Text>
        </TouchableOpacity>
      </View>

      {/* 선택 날짜의 과제 목록 */}
      <FlatList
        data={tasksForSelectedDate}
        keyExtractor={(item) => item.id}
        renderItem={renderTaskItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            선택한 날짜에 등록된 과제가 없습니다.
          </Text>
        }
        style={{ marginTop: 10 }}
      />

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

// ---------- 스타일 ----------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
  loadingText: {
    marginTop: 8,
    color: colors.textMuted,
    fontSize: 13,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  screenSub: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 12,
  },
  calendar: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  selectedBox: {
    paddingVertical: 6,
    marginBottom: 6,
  },
  selectedDateText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  holidayText: {
    fontSize: 13,
    color: colors.accentPink,
    marginTop: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  input: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.text,
  },
  addButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: colors.primary,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 13,
    color: colors.textMuted,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 6,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  taskSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  taskDeleteButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.danger,
    marginLeft: 8,
  },
  taskDeleteText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '600',
  },
  errorText: {
    marginTop: 6,
    fontSize: 12,
    color: colors.danger,
  },
});
