/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {useState} from 'react';
import MarkerNativeModule from './js/NativeMarkerModule';
import PaintMarkerNativeComponent from './js/PaintMarkerNativeComponent';
import {Text, Pressable, StyleSheet} from 'react-native';

export default function Button(props: {
  onPress: (timestamp: number) => void;
  title: string;
}): JSX.Element {
  return (
    <Pressable
      style={styles.button}
      onPress={event => {
        props.onPress(event.nativeEvent.timestamp);
      }}>
      <Text numberOfLines={2} style={styles.text}>
        {props.title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 15,
    backgroundColor: 'grey',
    flex: 1,
    margin: 10,
  },
  text: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'white',
  },
});
