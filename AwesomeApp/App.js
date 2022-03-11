/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import { useState } from 'react';
import type {Node} from 'react';
import {
  SafeAreaView,
  StatusBar,
  useColorScheme,
  Button,
  TurboModuleRegistry,
  Text,
} from 'react-native';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';

import CalendarModule from './ios/AwesomeApp/CalendarModule/js/NativeCalendarModule';

const App: () => Node = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const [eventId, setEventId] = useState<string>("");

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Button
        title="Click to invoke your native module!"
        color="#841584"
        onPress={async () => {
          const newId = await CalendarModule.createCalendarEvent('foo', 'bar');
          setEventId(newId);
        }}/>
      <Text style={{marginLeft:10}}>{eventId.length == 0 ? "No Event Created" : eventId}</Text>
    </SafeAreaView>
  );
};

export default App;
