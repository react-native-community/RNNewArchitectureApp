/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {Text} from 'react-native';
import MeasureComponent from '../MeasureComponent';

export default function ThousandsTexts(props: {
  markerName: string;
  count: number;
}): JSX.Element {
  const views = Array.from(Array(props.count).keys()).map((element, index) => {
    return <Text key={index}>Nice text: {index}</Text>;
  });
  return (
    <MeasureComponent
      title={`${props.count} <Text />`}
      markerName={props.markerName}>
      {views}
    </MeasureComponent>
  );
}
