// constants/colors.ts

export type AppColors = {
  bg: string;
  card: string;
  primary: string;
  accentPink: string;
  accentMint: string;
  text: string;
  textMuted: string;
  border: string;
  danger: string;
};

export const colors: AppColors = {
  bg: '#F9F5FF',         // 부드러운 보라톤 배경
  card: '#FFFFFF',       // 카드/모달 배경
  primary: '#A855F7',    // 메인 포인트 (보라)
  accentPink: '#FB7185', // 핑크 포인트
  accentMint: '#34D399', // 민트 포인트
  text: '#111827',       // 기본 텍스트
  textMuted: '#6B7280',  // 흐린 텍스트
  border: '#E5E7EB',     // 테두리
  danger: '#F97373',     // 삭제/위험 색
};
