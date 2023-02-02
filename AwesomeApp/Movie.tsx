/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

function MovieDetails(props: {
  title: string;
  genre: string;
  time: string;
  place: string;
}): JSX.Element {
  return (
    <View style={styles.wrapper}>
      <View style={styles.movieInfo}>
        <View style={styles.thumbnail} />
        <View style={styles.movieNameAndGenre}>
          <Text>{props.title}</Text>
          <Text style={styles.subtitle}>{props.genre}</Text>
        </View>
      </View>
      <View style={styles.eventInfo}>
        <Text>{props.time}</Text>
        <Text>{props.place}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtitle: {
    color: 'grey',
  },
  movieNameAndGenre: {
    marginLeft: 10,
  },
  thumbnail: {
    width: 60,
    height: 60,
    backgroundColor: 'blue',
  },
  eventInfo: {
    marginLeft: 'auto',
  },
  movieInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default MovieDetails;
