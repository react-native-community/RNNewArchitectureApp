/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

function NameList(): JSX.Element {
  return (
    <View style={styles.wrapper}>
      <View>
        <Text>Alice</Text>
        <Text>Company A</Text>
      </View>
      <View>
        <Text>Bob</Text>
        <Text>Company B</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    padding: 5,
  },
});

export default NameList;
