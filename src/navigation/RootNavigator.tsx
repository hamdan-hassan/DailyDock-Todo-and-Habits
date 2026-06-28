/**
 * DailyDock — Root Navigator
 *
 * Bottom tab navigator with custom styled tab bar.
 */

import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from '../components/ui/Icon';
import { useTheme } from '../theme';
import { radii } from '../theme/radii';
import type {
  RootTabParamList,
  HomeStackParamList,
  TasksStackParamList,
  HabitsStackParamList,
} from '../types';

// Screens
import { HomeScreen } from '../features/home/screens/HomeScreen';
import { TaskListScreen } from '../features/tasks/screens/TaskListScreen';
import { TaskFormScreen } from '../features/tasks/screens/TaskFormScreen';
import { HabitListScreen } from '../features/habits/screens/HabitListScreen';
import { HabitFormScreen } from '../features/habits/screens/HabitFormScreen';
import { SearchScreen } from '../features/search/screens/SearchScreen';
import { AnalyticsScreen } from '../features/analytics/screens/AnalyticsScreen';
import { SettingsScreen } from '../features/settings/screens/SettingsScreen';

const Tab = createBottomTabNavigator<RootTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const TasksStack = createNativeStackNavigator<TasksStackParamList>();
const HabitsStack = createNativeStackNavigator<HabitsStackParamList>();

function HomeStackNavigator() {
  const { colors } = useTheme();
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen
        name="TaskForm"
        component={TaskFormScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <HomeStack.Screen
        name="HabitForm"
        component={HabitFormScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <HomeStack.Screen name="Search" component={SearchScreen} />
    </HomeStack.Navigator>
  );
}

function TasksStackNavigator() {
  const { colors } = useTheme();
  return (
    <TasksStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <TasksStack.Screen name="TaskList" component={TaskListScreen} />
      <TasksStack.Screen
        name="TaskForm"
        component={TaskFormScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
    </TasksStack.Navigator>
  );
}

function HabitsStackNavigator() {
  const { colors } = useTheme();
  return (
    <HabitsStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <HabitsStack.Screen name="HabitList" component={HabitListScreen} />
      <HabitsStack.Screen
        name="HabitForm"
        component={HabitFormScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
    </HabitsStack.Navigator>
  );
}

export function RootNavigator() {
  const { colors, isDark, typography } = useTheme();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: string = 'home';
            switch (route.name) {
              case 'HomeTab':
                iconName = 'home';
                break;
              case 'TasksTab':
                iconName = 'check-circle';
                break;
              case 'HabitsTab':
                iconName = 'loop';
                break;
              case 'AnalyticsTab':
                iconName = 'bar-chart';
                break;
              case 'SettingsTab':
                iconName = 'settings';
                break;
            }
            return (
              <Icon
                name={iconName}
                size={focused ? 26 : 24}
                color={color}
              />
            );
          },
          tabBarActiveTintColor: colors.tabBarActive,
          tabBarInactiveTintColor: colors.tabBarInactive,
          tabBarLabelStyle: {
            ...typography.tabLabel,
            marginTop: -2,
          },
          tabBarStyle: {
            position: 'absolute',
            bottom: Platform.OS === 'ios' ? 32 : 16,
            left: 16,
            right: 16,
            elevation: 8,
            backgroundColor: colors.tabBarBackground,
            borderRadius: 24,
            height: 64,
            paddingBottom: 8,
            paddingTop: 8,
            borderTopWidth: 0,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
          },
        })}
      >
        <Tab.Screen
          name="HomeTab"
          component={HomeStackNavigator}
          options={{ tabBarLabel: 'Home' }}
        />
        <Tab.Screen
          name="TasksTab"
          component={TasksStackNavigator}
          options={{ tabBarLabel: 'Tasks' }}
        />
        <Tab.Screen
          name="HabitsTab"
          component={HabitsStackNavigator}
          options={{ tabBarLabel: 'Habits' }}
        />
        <Tab.Screen
          name="AnalyticsTab"
          component={AnalyticsScreen}
          options={{ tabBarLabel: 'Analytics' }}
        />
        <Tab.Screen
          name="SettingsTab"
          component={SettingsScreen}
          options={{ tabBarLabel: 'Settings' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
