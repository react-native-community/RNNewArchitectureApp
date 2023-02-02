/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {StyleSheet, Text, View, Image} from 'react-native';

function ImageWithTitle(props: {title: string; image: string}): JSX.Element {
  return (
    <View style={styles.wrapper}>
      <Image style={styles.image} source={{uri: props.image}} />
      <Text style={styles.title}>{props.title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    padding: 10,
  },
  image: {
    width: 300,
    height: 200,
  },
  title: {
    marginTop: 5,
  }
});

export default ImageWithTitle;
