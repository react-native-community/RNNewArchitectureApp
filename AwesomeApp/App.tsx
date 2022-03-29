/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
 import React from 'react';
 import type {Node} from 'react';
 import {
   SafeAreaView,
   StatusBar,
   useColorScheme,
   Button,
 } from 'react-native';
 import {
   Colors,
 } from 'react-native/Libraries/NewAppScreen';

 import CalendarModule from 'calendar/js/NativeCalendar';

 const App: () => Node = () => {
   const isDarkMode = useColorScheme() === 'dark';
   const backgroundStyle = {
     backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
   };
   return (
     <SafeAreaView style={backgroundStyle}>
       <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
       <Button
         title="Click to invoke your native module!"
         color="#841584"
         onPress={() => {
           CalendarModule.createCalendarEvent('foo', 'bar');
         }}/>
     </SafeAreaView>
   );
 };
 export default App;
