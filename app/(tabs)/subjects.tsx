// app/(tabs)/subjects.tsx

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../constants/colors';
import { useCourses } from '../../src/CoursesContext';
import type { Course } from '../../src/models';
import { calculateGPA } from '../../src/gradeUtils';

interface CourseSection {
  title: string;      // 학기 이름 (예: '25-2', '25-1')
  isLatest: boolean;  // 가장 최근 학기 여부
  data: Course[];
}

type SemesterFilter = 'latest' | 'all';
type MajorFilter = 'all' | 'major' | 'general';
type SortMode = 'default' | 'name' | 'credits';

export default function SubjectsScreen() {
  const router = useRouter();
  const { courses } = useCourses();

  const [semesterFilter, setSemesterFilter] = useState<SemesterFilter>('all');
  const [majorFilter, setMajorFilter] = useState<MajorFilter>('all');
  const [sortMode, setSortMode] = useState<SortMode>('default');

  // 모든 과목을 학기별로 묶은 기본 섹션
  const allSections: CourseSection[] = useMemo(() => {
    if (!courses || courses.length === 0) return [];

    const rawSemesters = Array.from(
      new Set(
        courses
          .map((c) => c.semester)
          .filter((s): s is string => !!s && s.trim().length > 0),
      ),
    );

    // 최신 학기가 위로 오도록 정렬 (문자열 기준)
    rawSemesters.sort((a, b) => (a > b ? -1 : a < b ? 1 : 0));
    const latestSemester = rawSemesters[0];

    const result: CourseSection[] = rawSemesters.map((sem) => ({
      title: sem,
      isLatest: sem === latestSemester,
      data: courses.filter((c) => c.semester === sem),
    }));

    // 학기가 비어 있는 과목이 있으면 별도 섹션
    const noSemesterCourses = courses.filter(
      (c) => !c.semester || c.semester.trim().length === 0,
    );
    if (noSemesterCourses.length > 0) {
      result.push({
        title: '학기 미지정',
        isLatest: false,
        data: noSemesterCourses,
      });
    }

    return result;
  }, [courses]);

  // 상단 요약용: 가장 최근 학기 정보 + 전공/교양 비율
  const latestInfo = useMemo(() => {
    if (!allSections.length) return null;
    const latest = allSections.find((s) => s.isLatest);
    if (!latest) return null;

    const { totalCredits, gpa } = calculateGPA(latest.data);
    const majorCount = latest.data.filter((c) => c.isMajor).length;
    const generalCount = latest.data.length - majorCount;

    return {
      semester: latest.title,
      courseCount: latest.data.length,
      totalCredits,
      gpa,
      majorCount,
      generalCount,
    };
  }, [allSections]);

  // 필터/정렬이 적용된 섹션들
  const filteredSections: CourseSection[] = useMemo(() => {
    if (!allSections.length) return [];

    return allSections
      .filter((section) =>
        semesterFilter === 'all' ? true : section.isLatest,
      )
      .map((section) => {
        let data = section.data;

        // 전공/교양 필터
        if (majorFilter === 'major') {
          data = data.filter((c) => c.isMajor);
        } else if (majorFilter === 'general') {
          data = data.filter((c) => !c.isMajor);
        }

        // 정렬
        let sorted = [...data];
        if (sortMode === 'name') {
          sorted.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortMode === 'credits') {
          sorted.sort((a, b) => Number(b.credits) - Number(a.credits));
        }
        // default는 원래 순서 유지

        return {
          ...section,
          data: sorted,
        };
      })
      .filter((section) => section.data.length > 0);
  }, [allSections, semesterFilter, majorFilter, sortMode]);

  const renderCourseItem = ({ item }: { item: Course }) => {
    const isOngoing = !item.grade || item.grade === '-';
    const statusLabel = isOngoing ? '진행 중' : '완료';

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => router.push(`/course/${item.id}`)}
      >
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.courseName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.semesterText}>{item.semester || '-'}</Text>
          </View>

          <View style={styles.badgeRow}>
            <View
              style={[
                styles.badge,
                item.isMajor ? styles.badgeMajor : styles.badgeGeneral,
              ]}
            >
              <Text style={styles.badgeText}>
                {item.isMajor ? '전공' : '교양'}
              </Text>
            </View>

            <View
              style={[
                styles.badge,
                isOngoing ? styles.badgeOngoing : styles.badgeDone,
              ]}
            >
              <Text style={styles.badgeText}>{statusLabel}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>학점</Text>
          <Text style={styles.cardValue}>{item.credits}학점</Text>
        </View>

        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>성적</Text>
          <Text style={[styles.cardValue, isOngoing && styles.pendingGrade]}>
            {isOngoing ? '성적 미입력' : item.grade}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section }: { section: CourseSection }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>
        {section.title}
        {section.isLatest && ' (이번 학기)'}
      </Text>
    </View>
  );

  const renderFilterChip = (
    label: string,
    active: boolean,
    onPress: () => void,
  ) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.chipFilter,
        active && styles.chipFilterActive,
      ]}
    >
      <Text
        style={[
          styles.chipFilterText,
          active && styles.chipFilterTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>내 과목 관리</Text>

          {latestInfo && (
            <>
              <Text style={styles.summaryLine}>
                {latestInfo.semester} · {latestInfo.courseCount}과목 · 확정 성적{' '}
                {latestInfo.gpa !== null ? latestInfo.gpa : '-'} (
                {latestInfo.totalCredits}학점 기준)
              </Text>
              <Text style={styles.summaryLine2}>
                전공 {latestInfo.majorCount} · 교양 {latestInfo.generalCount}
              </Text>
            </>
          )}
        </View>

        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.8}
          onPress={() => router.push('/add-course')}
        >
          <Text style={styles.addButtonText}>과목 추가</Text>
        </TouchableOpacity>
      </View>

      {/* 필터/정렬 바 */}
      <View style={styles.filterBar}>
        <View style={styles.filterRow}>
          {renderFilterChip(
            '이번 학기',
            semesterFilter === 'latest',
            () => setSemesterFilter('latest'),
          )}
          {renderFilterChip(
            '전체 학기',
            semesterFilter === 'all',
            () => setSemesterFilter('all'),
          )}
        </View>

        <View style={styles.filterRow}>
          {renderFilterChip(
            '전체',
            majorFilter === 'all',
            () => setMajorFilter('all'),
          )}
          {renderFilterChip(
            '전공만',
            majorFilter === 'major',
            () => setMajorFilter('major'),
          )}
          {renderFilterChip(
            '교양만',
            majorFilter === 'general',
            () => setMajorFilter('general'),
          )}
        </View>

        <View style={styles.filterRow}>
          {renderFilterChip(
            '정렬: 기본',
            sortMode === 'default',
            () => setSortMode('default'),
          )}
          {renderFilterChip(
            '이름순',
            sortMode === 'name',
            () => setSortMode('name'),
          )}
          {renderFilterChip(
            '학점순',
            sortMode === 'credits',
            () => setSortMode('credits'),
          )}
        </View>
      </View>

      {/* 리스트 영역 */}
      {filteredSections.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>표시할 과목이 없습니다.</Text>
          <Text style={styles.emptyText}>
            필터를 변경하거나 “과목 추가” 버튼으로 새 과목을 등록해 주세요.
          </Text>
        </View>
      ) : (
        <SectionList
          sections={filteredSections}
          keyExtractor={(item) => item.id}
          renderItem={renderCourseItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  summaryLine: {
    marginTop: 4,
    fontSize: 11,
    color: colors.textMuted,
  },
  summaryLine2: {
    marginTop: 2,
    fontSize: 11,
    color: colors.textMuted,
  },
  addButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  filterBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  chipFilter: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
  },
  chipFilterActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipFilterText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  chipFilterTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 32,
  },
  sectionHeader: {
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  courseName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  semesterText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeMajor: {
    backgroundColor: colors.accentMint,
  },
  badgeGeneral: {
    backgroundColor: colors.accentPink,
  },
  badgeOngoing: {
    backgroundColor: colors.border,
  },
  badgeDone: {
    backgroundColor: colors.primary,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  cardLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  cardValue: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
  },
  pendingGrade: {
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
