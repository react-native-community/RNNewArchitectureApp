import React from 'react';
import type {Node} from 'react';
import {
  SafeAreaView,
  StatusBar,
  Button,
  useColorScheme,
} from "react-native";
import CalendarModule  from "./NativeCalendarModule"
import MapView from './MapView';

const { DEFAULT_EVENT_NAME } = CalendarModule.getConstants();

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? 'black' : 'white',
  };

  const onPress = () => {
    CalendarModule.createCalendarEvent(DEFAULT_EVENT_NAME, 'testLocation');
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Button
        title="Click to invoke your native module!"
        color="#841584"
        onPress={onPress}/>
      <MapView zoomEnabled={false} style={{ width: "100%", height: "100%" }} />
    </SafeAreaView>
  );
};

export default App;
