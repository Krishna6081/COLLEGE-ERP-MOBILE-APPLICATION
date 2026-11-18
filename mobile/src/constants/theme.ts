import { Platform, ViewStyle } from 'react-native';

export const Layout = {
  desktopBreakpoint: 960,
  tabletBreakpoint: 680,
  sidebarWidth: 256,
  maxContentWidth: 1180,
};

export const Radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
};

export const Shadows = {
  sm: Platform.select<ViewStyle>({
    web: {
      boxShadow: '0 1px 2px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(15, 23, 42, 0.04)',
    } as any,
    default: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 1,
    },
  })!,
  md: Platform.select<ViewStyle>({
    web: {
      boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(15, 23, 42, 0.04)',
    } as any,
    default: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.07,
      shadowRadius: 8,
      elevation: 3,
    },
  })!,
  lg: Platform.select<ViewStyle>({
    web: {
      boxShadow: '0 12px 32px rgba(15, 23, 42, 0.12), 0 4px 12px rgba(79, 70, 229, 0.08)',
    } as any,
    default: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 6,
    },
  })!,
};

export const webGradient = (
  from = '#4F46E5',
  to = '#7C3AED',
  angle = 135
): ViewStyle =>
  Platform.OS === 'web'
    ? ({ backgroundImage: `linear-gradient(${angle}deg, ${from} 0%, ${to} 100%)` } as any)
    : { backgroundColor: from };

export const webInteractive: ViewStyle =
  Platform.OS === 'web'
    ? ({
        cursor: 'pointer',
        transitionProperty: 'transform, box-shadow, background-color, border-color, opacity',
        transitionDuration: '160ms',
        transitionTimingFunction: 'ease',
      } as any)
    : {};
