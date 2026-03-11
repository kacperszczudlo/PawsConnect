import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LoginScreen } from './src/screens/LoginScreen'; // Import Twojego nowego ekranu

export default function App() {
  return (
    <SafeAreaProvider>
      {/* Na razie wyświetlamy tylko ekran logowania. 
          Docelowo tu znajdzie się NavigationContainer. */}
      <LoginScreen />
    </SafeAreaProvider>
  );
}