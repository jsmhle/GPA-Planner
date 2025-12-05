// app/add-course.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Switch,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../constants/colors';
import { useCourses } from '../src/CoursesContext';
import type { GradeLetter } from '../src/models';
import { Picker } from '@react-native-picker/picker';

const gradeOptions: GradeLetter[] = ['-', 'A+', 'A0', 'B+', 'B0', 'C+', 'C0', 'D+', 'D0', 'F'];

export default function AddCourseScreen() {
  const router = useRouter();
  const { addCourse } = useCourses();

  const [name, setName] = useState('');
  const [credits, setCredits] = useState('');
  const [isMajor, setIsMajor] = useState(false);
  const [semester, setSemester] = useState('');
  const [grade, setGrade] = useState<GradeLetter>('-');
  const [memo, setMemo] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      return;
    }

    const parsedCredits = Number(credits);
    if (isNaN(parsedCredits) || parsedCredits <= 0) {
      return;
    }

    addCourse({
      name: name.trim(),
      credits: parsedCredits,
      isMajor,
      semester: semester.trim() || '미지정',
      grade,
      memo: memo.trim() || undefined,
    });

    // 과목 추가 후 바로 "내 과목 관리" 화면으로 돌아가기
    router.back();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>새 과목 추가</Text>

      {/* 과목명 */}
      <View style={styles.field}>
        <Text style={styles.label}>과목명</Text>
        <TextInput
          style={styles.input}
          placeholder="예) 데이터베이스"
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

      {/* 저장 버튼 */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>저장</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  saveButton: {
    marginTop: 8,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
});
