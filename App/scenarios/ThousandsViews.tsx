/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {View} from 'react-native';
import MeasureComponent from '../MeasureComponent';

export default function ThousandsViews(props: {
  markerName: string;
  count: number;
}): JSX.Element {
  const views = Array.from(Array(props.count).keys()).map((element, index) => {
    return (
      <View
        key={index}
        style={{
          width: 100,
          height: 100,
          backgroundColor: 'red',
          margin: 5,
        }}
      />
    );
  });
  return (
    <MeasureComponent
      title={`${props.count} <View />`}
      markerName={props.markerName}>
      {views}
    </MeasureComponent>
  );
}
