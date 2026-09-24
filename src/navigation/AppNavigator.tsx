import React from 'react';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import {
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';

import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import InboxScreen from '../screens/InboxScreen';
import ExpensesScreen from '../screens/ExpensesScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import GroupScreen from '../screens/GroupScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SplitExpenseScreen from '../screens/SplitExpenseScreen';

import { colors } from '../theme/theme';

const Tab =
  createBottomTabNavigator();

const Stack =
  createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarActiveTintColor:
          colors.primary,

        tabBarInactiveTintColor:
          colors.secondaryText,

        tabBarStyle: {
          height: 68,
          paddingTop: 6,
          paddingBottom: 8,
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          backgroundColor: '#FFFFFF',
          elevation: 8,
          shadowOpacity: 0.08,
          shadowRadius: 8,
          shadowOffset: {
            width: 0,
            height: -2,
          },
        },

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },

        tabBarIcon: ({
          color,
          size,
          focused,
        }) => {
          let iconName:
            keyof typeof Ionicons.glyphMap =
            'home-outline';

          if (route.name === 'Home') {
            iconName = focused
              ? 'home'
              : 'home-outline';
          }

          if (route.name === 'Inbox') {
            iconName = focused
              ? 'notifications'
              : 'notifications-outline';
          }

          if (route.name === 'Expenses') {
            iconName = focused
              ? 'receipt'
              : 'receipt-outline';
          }

          if (route.name === 'Analytics') {
            iconName = focused
              ? 'stats-chart'
              : 'stats-chart-outline';
          }

          if (route.name === 'Group') {
            iconName = focused
              ? 'people'
              : 'people-outline';
          }

          if (route.name === 'Profile') {
            iconName = focused
              ? 'person'
              : 'person-outline';
          }

          return (
            <Ionicons
              name={iconName}
              size={focused ? size + 1 : size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
      />

      <Tab.Screen
        name="Inbox"
        component={InboxScreen}
      />

      <Tab.Screen
        name="Expenses"
        component={ExpensesScreen}
      />

      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
      />

      <Tab.Screen
        name="Group"
        component={GroupScreen}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
      />

      <Stack.Screen
        name="SplitExpense"
        component={SplitExpenseScreen}
      />
    </Stack.Navigator>
  );
}