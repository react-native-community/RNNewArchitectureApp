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
  Image,
  Button,
  View,
} from 'react-native';
import Calculator from 'library/src/NativeCalculator';
import ColoredView from 'library/src/ColoredViewNativeComponent';

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
      <ColoredView style={{"margin":20, width:100, height:100 }} color={"#FF00AA"} image={require("./home.png")}/>
    </SafeAreaView>
  );
};

export default App;
