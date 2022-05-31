/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  TouchableOpacity,
} from 'react-native';
import {useState} from 'react';
import type {Node} from 'react';
import {getRandomAsync} from './js/JsbridgeModule';
import NativeTurboModule from './js/NativeTurboModule';
import RenderView from './js/NativeRenderView';

const App: () => Node = () => {
  const NUM = 10000;
  const TEXT = `task：Computes the sum of ${NUM} random numbers`;
  const [countBridge, setCountBridge] = useState(0);
  const [bridgeTime, setBridgeTime] = useState(0);
  const [countTurbo, setCountTurbo] = useState(0);
  const [turboTime, setTurboTime] = useState(0);
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: 'white',
  };

  const getCountByBridge = async () => {
    let count = 0,
      startTime = new Date().getTime();
    for (let i = 0; i < NUM; i++) {
      count += await getRandomAsync();
    }
    setCountBridge(count);
    setBridgeTime(new Date().getTime() - startTime);
  };

  const getCountByTurboModule = async () => {
    let count = 0,
      startTime = new Date().getTime();
    for (let i = 0; i < NUM; i++) {
      count += NativeTurboModule?.getRandomSync() || 0;
    }
    setCountTurbo(count);
    setTurboTime(new Date().getTime() - startTime);
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'lsight-content' : 'dark-content'} />
      <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 20}}>
        <TouchableOpacity onPress={getCountByBridge}>
          <View style={styles.button}>
            <Text style={styles.text}>execute by jsBridge</Text>
          </View>
        </TouchableOpacity>
        <View style={{marginLeft: 10}}>
          <Text>{TEXT}</Text>
          <Text>{`result：${countBridge}`}</Text>
          <Text>{`time：${bridgeTime}ms`}</Text>
        </View>
      </View>
      <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 20}}>
        <TouchableOpacity onPress={getCountByTurboModule}>
          <View
            style={Object.assign(
              {...styles.button},
              {backgroundColor: 'blue'},
            )}>
            <Text style={styles.text}>execute by turboModule</Text>
          </View>
        </TouchableOpacity>
        <View style={{marginLeft: 10}}>
          <Text>{TEXT}</Text>
          <Text>{`result：${countTurbo}`}</Text>
          <Text>{`time：${turboTime}ms`}</Text>
        </View>
      </View>
      <RenderView
        num={NUM}
        style={{
          width: 350,
          height: 100,
          marginTop: 20,
        }}
      />
      <Text
        style={{
          fontWeight: 'bold',
          fontSize: 30,
        }}>{`If the JS bridge of efficiency is 1, the Turbo Module is ${
        bridgeTime / turboTime
      }`}</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 100,
    height: 100,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {color: 'white', fontWeight: 'bold'},
});

export default App;
