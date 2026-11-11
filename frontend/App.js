import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, Platform } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import { theme } from './src/theme/colors';

// Components
import Navbar from './src/components/Navbar';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import JobListScreen from './src/screens/JobListScreen';
import JobDetailScreen from './src/screens/JobDetailScreen';
import PostJobScreen from './src/screens/PostJobScreen';
import ContractsListScreen from './src/screens/ContractsListScreen';
import ContractRoomScreen from './src/screens/ContractRoomScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import WalletScreen from './src/screens/WalletScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HowItWorksScreen from './src/screens/HowItWorksScreen';

function MainApp() {
  const [currentScreen, setCurrentScreen] = useState('Home');
  const [screenParams, setScreenParams] = useState({});

  const navigate = (screenName, params = {}) => {
    setCurrentScreen(screenName);
    setScreenParams(params);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Jobs':
        return <JobListScreen route={{ params: screenParams }} onNavigate={navigate} />;
      case 'JobDetail':
        return <JobDetailScreen route={{ params: screenParams }} onNavigate={navigate} />;
      case 'PostJob':
        return <PostJobScreen onNavigate={navigate} />;
      case 'Contracts':
        return <ContractsListScreen onNavigate={navigate} />;
      case 'ContractRoom':
        return <ContractRoomScreen route={{ params: screenParams }} onNavigate={navigate} />;
      case 'Dashboard':
        return <DashboardScreen onNavigate={navigate} />;
      case 'Wallet':
        return <WalletScreen onNavigate={navigate} />;
      case 'Login':
        return <LoginScreen onNavigate={navigate} />;
      case 'Register':
        return <RegisterScreen onNavigate={navigate} />;
      case 'HowItWorks':
        return <HowItWorksScreen onNavigate={navigate} />;
      case 'Home':
      default:
        return <HomeScreen onNavigate={navigate} />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Navbar currentScreen={currentScreen} onNavigate={navigate} />
      <View style={styles.mainContent}>
        {renderScreen()}
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  mainContent: {
    flex: 1,
  },
});
