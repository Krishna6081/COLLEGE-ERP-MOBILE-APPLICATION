import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../store/useAuthStore';
import { AuthNavigator } from './AuthNavigator';
import { RoleBasedNavigator } from './RoleBasedNavigator';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  if (isLoading) {
    return <LoadingSpinner message="Checking authentication status..." />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <RoleBasedNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};
