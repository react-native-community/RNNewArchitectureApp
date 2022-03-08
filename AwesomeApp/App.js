import React from 'react';
import type {Node} from 'react';
import {
  SafeAreaView,
  StatusBar,
  Button,
  useColorScheme,
  NativeModules,
} from "react-native";

const { CalendarModule } = NativeModules;

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? 'black' : 'white',
  };

  const onPress = () => {
    CalendarModule.createCalendarEvent('testName', 'testLocation');
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Button
        title="Click to invoke your native module!"
        color="#841584"
        onPress={onPress}/>
    </SafeAreaView>
  );
};

export default App;
