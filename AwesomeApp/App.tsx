/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { StyleSheet, Text, View, Image, ScrollView, SafeAreaView } from 'react-native';
import ImageWithTitle from './ImageWithTitle';
import NameList from './NameList';
import MovieDetails from './Movie';

function App(): JSX.Element {
  return (
    <SafeAreaView>
      <Text style={styles.sectionTitle}>Adding padding/margin to components</Text>
      <ImageWithTitle title="Cat" image="https://placekitten.com/300/200" />

      <View style={styles.sectionBreak} />

      <Text style={styles.sectionTitle}>Components in row</Text>

      <NameList />

      <View style={styles.sectionBreak} />

      <Text style={styles.sectionTitle}>Positioning components in a flat list item</Text>
      <MovieDetails title="Movie 1" genre="Drama" time="17:00" place="Theater A" />
      <MovieDetails title="Movie 2" genre="Comedy" time="19:00" place="Theater B" />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 22,
    margin: 5,
  },
  sectionBreak: {
    height: 3,
    backgroundColor: 'grey',
    marginTop: 15,
    marginBottom: 15,
  }
});

export default App;
