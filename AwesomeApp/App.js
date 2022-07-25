/**
  * Sample React Native App
  * https://github.com/facebook/react-native
  *
  * @format
  * @flow strict-local
  */

  import React from 'react';
  import {useState} from "react";
  import type {Node} from 'react';
  import {
  SafeAreaView,
  StatusBar,
  Text,
  Button,
  View,
  } from 'react-native';
  import Calculator from 'calculator/src/NativeCalculator';

  const App: () => Node = () => {

  const [result, setResult] = useState<number | null>(null);

  async function onPress() {
      const newResult = await Calculator?.add(3,7);
      setResult(newResult ?? null);
  }
  return (
      <SafeAreaView>
      <StatusBar barStyle={'dark-content'} />
      <Text style={{ "margin":20 }}>3+7={result ?? "??"}</Text>
      <Button title="Compute" onPress={onPress} />
      </SafeAreaView>
  );
  };

  export default App;
