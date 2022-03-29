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
 import MapView from 'map-view/js/MapViewNativeComponents';

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
        <MapView style={{width:'100%', height:'100%'}} zoomEnabled={false}/>
     </SafeAreaView>
   );
 };
 export default App;
