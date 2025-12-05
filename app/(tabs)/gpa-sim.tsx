import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors } from '../../constants/colors';
import { useCourses } from '../../src/CoursesContext';
import {
  calculateGPA,
  calculateRequiredAverageForTargetGPA,
  type TargetGPAResult,
} from '../../src/gradeUtils';

export default function GpaSimScreen() {
  // 전체 과목 정보 컨텍스트에서 가져오기
  const { courses } = useCourses();

  // 입력값(목표 GPA, 남은 학점) 상태
  const [targetGpaText, setTargetGpaText] = useState('');
  const [remainingCreditsText, setRemainingCreditsText] = useState('');
  const [result, setResult] = useState<TargetGPAResult | null>(null);

  // 현재까지 GPA 계산(성적이 있는 과목 기준)
  const current = useMemo(() => calculateGPA(courses), [courses]);

  // 버튼 클릭 시 시뮬레이션 수행
  const handleSimulate = () => {
    const targetGpa = Number(targetGpaText);
    const remainingCredits = Number(remainingCreditsText);

    // 입력값 검증
    if (isNaN(targetGpa) || targetGpa <= 0 || targetGpa > 4.5) {
      Alert.alert('입력 오류', '목표 GPA는 0 ~ 4.5 사이의 숫자로 입력해 주세요.');
      return;
    }
    if (isNaN(remainingCredits) || remainingCredits <= 0) {
      Alert.alert('입력 오류', '남은 학점 수를 1 이상의 숫자로 입력해 주세요.');
      return;
    }

    // 이미 성적이 확정된 과목만 대상으로 사용(grade가 '-'가 아닌 과목)
    const completedCourses = Array.isArray(courses)
      ? courses.filter((c) => c.grade && c.grade !== '-')
      : [];

    // 목표 GPA를 맞추기 위해 필요한 평균 평점 계산
    const r = calculateRequiredAverageForTargetGPA({
      completedCourses,
      remainingCredits,
      targetOverallGPA: targetGpa,
    });

    setResult(r);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 화면 제목 */}
      <Text style={styles.title}>GPA 시뮬레이션</Text>

      {/* 현재까지 성적 요약 카드 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>현재까지 성적</Text>
        <Text style={styles.cardText}>
          이수 학점:{' '}
          <Text style={styles.highlight}>{current.totalCredits}</Text> 학점
        </Text>
        <Text style={styles.cardText}>
          현재 GPA:{' '}
          <Text style={styles.highlight}>
            {current.gpa !== null ? current.gpa.toFixed(2) : '-'}
          </Text>
        </Text>
      </View>

      {/* 목표 GPA 입력 필드 */}
      <View style={styles.field}>
        <Text style={styles.label}>목표 총 GPA</Text>
        <TextInput
          style={styles.input}
          placeholder="예) 3.8"
          placeholderTextColor={colors.textMuted}
          value={targetGpaText}
          onChangeText={setTargetGpaText}
          keyboardType="numeric"
        />
      </View>

      {/* 남은 학점 입력 필드 */}
      <View style={styles.field}>
        <Text style={styles.label}>앞으로 들을 총 학점 수</Text>
        <TextInput
          style={styles.input}
          placeholder="예) 15"
          placeholderTextColor={colors.textMuted}
          value={remainingCreditsText}
          onChangeText={setRemainingCreditsText}
          keyboardType="numeric"
        />
      </View>

      {/* 계산 버튼 */}
      <TouchableOpacity style={styles.button} onPress={handleSimulate}>
        <Text style={styles.buttonText}>필요한 평균 평점 계산</Text>
      </TouchableOpacity>

      {/* 결과 표시 카드 */}
      {result && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>결과</Text>
          {result.requiredAveragePoint === null ? (
            <Text style={styles.cardText}>계산할 수 없습니다.</Text>
          ) : (
            <>
              <Text style={styles.cardText}>
                남은 과목에서 필요한 평균 평점은{' '}
                <Text style={styles.highlight}>
                  {result.requiredAveragePoint.toFixed(2)}
                </Text>
                {' / 4.5'} 입니다.
              </Text>
              {!result.possible && (
                <Text style={[styles.cardText, styles.warning]}>
                  이론상 달성하기 어려운 목표입니다. 목표를 다시 설정하는 것을
                  고려해 주세요.
                </Text>
              )}
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
}

// 화면 스타일 정의
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
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  highlight: {
    fontWeight: '700',
    color: colors.primary,
  },
  warning: {
    marginTop: 8,
    color: colors.danger,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
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
  button: {
    marginTop: 8,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
});
