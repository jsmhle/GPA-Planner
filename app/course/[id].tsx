// app/course/[id].tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Switch,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '../../constants/colors';
import { useCourses } from '../../src/CoursesContext';
import type { GradeLetter } from '../../src/models';
import { Picker } from '@react-native-picker/picker';

const gradeOptions: GradeLetter[] = ['-', 'A+', 'A0', 'B+', 'B0', 'C+', 'C0', 'D+', 'D0', 'F'];

export default function CourseDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { courses, updateCourse, deleteCourse } = useCourses();

  const course = Array.isArray(courses)
    ? courses.find((c) => c.id === id)
    : undefined;

  const [name, setName] = useState('');
  const [credits, setCredits] = useState('');
  const [isMajor, setIsMajor] = useState(false);
  const [semester, setSemester] = useState('');
  const [grade, setGrade] = useState<GradeLetter>('-');
  const [memo, setMemo] = useState('');

  useEffect(() => {
    if (course) {
      setName(course.name ?? '');
      setCredits(String(course.credits ?? ''));
      setIsMajor(!!course.isMajor);
      setSemester(course.semester ?? '');
      setGrade((course.grade as GradeLetter) ?? '-');
      setMemo(course.memo ?? '');
    }
  }, [course]);

  if (!course) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>과목 정보를 찾을 수 없습니다.</Text>
        <TouchableOpacity
          style={[styles.button, styles.backButton]}
          onPress={() => router.back()}
        >
          <Text style={[styles.buttonText, styles.backButtonText]}>돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleSave = () => {
    if (!name.trim()) {
      // 최소한 과목명만 검증
      return;
    }

    const parsedCredits = Number(credits);
    if (isNaN(parsedCredits) || parsedCredits <= 0) {
      return;
    }

    updateCourse(course.id, {
      name: name.trim(),
      credits: parsedCredits,
      isMajor,
      semester: semester.trim() || '미지정',
      grade,
      memo: memo.trim() || undefined,
    });

    // 저장 후 바로 이전 화면(내 과목 관리)으로 이동
    router.back();
  };

  const handleDelete = () => {
    // 바로 삭제 후 이전 화면으로 이동
    deleteCourse(course.id);
    router.back();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>과목 설정</Text>

      {/* 과목명 */}
      <View style={styles.field}>
        <Text style={styles.label}>과목명</Text>
        <TextInput
          style={styles.input}
          placeholder="예) 운영체제"
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={setName}
        />
      </View>

      {/* 학점 */}
      <View style={styles.field}>
        <Text style={styles.label}>학점</Text>
        <TextInput
          style={styles.input}
          placeholder="예) 3"
          placeholderTextColor={colors.textMuted}
          value={credits}
          onChangeText={setCredits}
          keyboardType="numeric"
        />
      </View>

      {/* 전공 여부 */}
      <View style={styles.fieldRow}>
        <View>
          <Text style={styles.label}>전공 여부</Text>
          <Text style={styles.subLabel}>전공 과목이라면 스위치를 켜 주세요.</Text>
        </View>
        <Switch
          value={isMajor}
          onValueChange={setIsMajor}
          thumbColor={isMajor ? colors.primary : '#f4f3f4'}
          trackColor={{ false: colors.border, true: colors.primary }}
        />
      </View>

      {/* 학기 */}
      <View style={styles.field}>
        <Text style={styles.label}>학기</Text>
        <TextInput
          style={styles.input}
          placeholder="예) 2025-2"
          placeholderTextColor={colors.textMuted}
          value={semester}
          onChangeText={setSemester}
        />
      </View>

      {/* 성적 */}
      <View style={styles.field}>
        <Text style={styles.label}>성적</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={grade}
            onValueChange={(value) => setGrade(value as GradeLetter)}
          >
            {gradeOptions.map((g) => (
              <Picker.Item key={g} label={g} value={g} />
            ))}
          </Picker>
        </View>
      </View>

      {/* 메모 */}
      <View style={styles.field}>
        <Text style={styles.label}>메모 (선택)</Text>
        <TextInput
          style={[styles.input, styles.memoInput]}
          placeholder="과제, 시험, 주의할 점 등을 메모로 남길 수 있습니다."
          placeholderTextColor={colors.textMuted}
          value={memo}
          onChangeText={setMemo}
          multiline
        />
      </View>

      {/* 버튼 영역 */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Text style={[styles.buttonText, styles.deleteButtonText]}>
            과목 삭제
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
        >
          <Text style={styles.buttonText}>설정 저장</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  notFoundContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
  },
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: colors.bg,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 24,
  },
  field: {
    marginBottom: 20,
  },
  fieldRow: {
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  subLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.card,
  },
  memoInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 30,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: colors.bg,
  },
  deleteButtonText: {
    color: colors.danger,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  backButton: {
    marginTop: 12,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backButtonText: {
    color: colors.text,
  },
});
