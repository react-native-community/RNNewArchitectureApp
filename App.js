/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import { NativeModules, Button } from 'react-native';
import type {Node} from 'react';
import MapView from './js/MapView.js';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import NativeCalendarModule from './CalendarModule/NativeCalendarModule';

const NewModuleButton = () => {
  const onPress = () => {
    NativeCalendarModule.createCalendarEvent('testName', 'testLocation');
  };

  return (
    <Button
      title="Click to invoke your native module!"
      color="#841584"
      onPress={onPress}
    />
  );
};

const App: () => Node = () => {
  return (
    <View style={{ flex: 1, flexDirection: "column", padding: 20 }}>
      <MapView zoomEnabled={false} style={{ flex: 5 }} />
      <NewModuleButton style={{ flex: 1 }} />
    </View>
  );
};

export default App;
