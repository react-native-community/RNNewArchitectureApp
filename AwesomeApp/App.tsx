/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {SafeAreaView, StyleSheet, Text, View, Image} from 'react-native';

function App(): JSX.Element {
  return (
    <SafeAreaView>
      <View>
        <View style={styles.margin10}>
          <View style={styles.padding10}>
            <Image
              style={styles.image}
              source={{uri: 'https://placekitten.com/200/300'}}
            />
            <View></View>
            <Text>This is a title</Text>
          </View>
         </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  image: {
    width: 200,
    height: 300,
  },
  margin10: {
    margin: 10,
  },
  padding10: {
    padding: 10,
  },
});

export default App;
