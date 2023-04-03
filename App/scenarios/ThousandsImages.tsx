/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {Image} from 'react-native';
import MeasureComponent from '../MeasureComponent';

export default function ThousandsImages(props: {
  markerName: string;
  count: number;
}): JSX.Element {
  const views = Array.from(Array(props.count).keys()).map((element, index) => {
    return (
      <Image
        style={{width: 100, height: 100, margin: 5}}
        source={{
          uri: 'https://placekitten.com/100/100',
        }}
      />
    );
  });
  return (
    <MeasureComponent
      title={`${props.count} <Image />`}
      markerName={props.markerName}>
      {views}
    </MeasureComponent>
  );
}
