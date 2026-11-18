import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  Users,
  GraduationCap,
  CheckCircle2,
  BookOpen,
  BookMarked,
  Wallet,
  AlertTriangle,
  Building2,
  Award,
  Briefcase,
  Calendar,
  Clock,
  FileText,
  TrendingUp,
} from 'lucide-react-native';
import { Colors } from '../constants/colors';
import { Radii, Shadows } from '../constants/theme';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
  icon?: React.ReactNode;
}

const getAutoIcon = (title: string, color: string) => {
  const t = title.toLowerCase();
  const props = { size: 20, color, strokeWidth: 2.2 };
  if (t.includes('student') || t.includes('user')) return <Users {...props} />;
  if (t.includes('faculty') || t.includes('teacher') || t.includes('staff')) return <GraduationCap {...props} />;
  if (t.includes('attendance') || t.includes('present') || t.includes('placed')) return <CheckCircle2 {...props} />;
  if (t.includes('issued') || t.includes('returned')) return <BookMarked {...props} />;
  if (t.includes('book') || t.includes('available') || t.includes('subject')) return <BookOpen {...props} />;
  if (t.includes('default') || t.includes('overdue') || t.includes('pending') || t.includes('alert') || t.includes('due')) {
    if (t.includes('pending') && (t.includes('₹') || t.includes('fee'))) return <Wallet {...props} />;
    return <AlertTriangle {...props} />;
  }
  if (t.includes('demand') || t.includes('collect') || t.includes('fee') || t.includes('revenue')) return <Wallet {...props} />;
  if (t.includes('dept') || t.includes('department') || t.includes('college') || t.includes('campus')) return <Building2 {...props} />;
  if (t.includes('sgpa') || t.includes('cgpa') || t.includes('result') || t.includes('grade')) return <Award {...props} />;
  if (t.includes('drive') || t.includes('company') || t.includes('placement') || t.includes('offer')) return <Briefcase {...props} />;
  if (t.includes('exam') || t.includes('schedule') || t.includes('lecture') || t.includes('class')) return <Calendar {...props} />;
  if (t.includes('leave') || t.includes('today')) return <Clock {...props} />;
  if (t.includes('assign') || t.includes('notice') || t.includes('complaint')) return <FileText {...props} />;
  return <TrendingUp {...props} />;
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  color = Colors.primary,
  icon,
}) => {
  const tintBg = color.startsWith('#') && color.length === 7 ? `${color}15` : Colors.primaryLight;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <View style={[styles.iconBox, { backgroundColor: tintBg }]}>
          {icon || getAutoIcon(title, color)}
        </View>
      </View>
      <Text style={[styles.value, { color: Colors.textPrimary }]} numberOfLines={1}>
        {value}
      </Text>
      {subtitle ? (
        <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
      ) : (
        <View style={[styles.bottomAccent, { backgroundColor: color }]} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 140,
    backgroundColor: Colors.cardBg,
    borderRadius: Radii.lg,
    padding: 16,
    margin: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  value: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 10,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  bottomAccent: {
    width: 28,
    height: 3,
    borderRadius: 2,
    marginTop: 10,
    opacity: 0.8,
  },
});
