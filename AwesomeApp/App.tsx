/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {SafeAreaView, StyleSheet, Text, View, Image} from 'react-native';


function Movie(props) {
  return (
    <View style={{ padding: 10, flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ flexDirection: 'row', alignItems:'center' }}>
        <View style={{ width: 60, height: 60, backgroundColor: 'blue' }} />
        <View style={{marginLeft: 10}}>
          <Text>{props.title}</Text>
          <Text style={{color: 'grey'}}>{props.genre}</Text>
        </View>
      </View>
      <View style={{marginLeft: 'auto'}}>
        <Text>{props.time}</Text>
        <Text>{props.place}</Text>
      </View>
    </View>
  );
}

function App(): JSX.Element {
  return (
    <SafeAreaView>
      <Movie title="Movie 1" genre="Drama" time="17:00" place="Theater A" />

      {/* <View style={{flexDirection:'row'}}>
        <View>
          <Text>Alice</Text>
          <Text>Company A</Text>
        </View>
        <View>
          <Text>Bob</Text>
          <Text>Company B</Text>
        </View>
      </View> */}
      {/* <View>
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
      </View> */}
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
