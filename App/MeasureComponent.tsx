/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {useState} from 'react';
import RTNTimeToRender from 'rtn-timetorender/js/RTNTimeToRenderNativeComponent';
import {Text, View} from 'react-native';

export default function MeasureComponent(props: {
  children: React.ReactNode;
  markerName: string;
  title: string;
}): JSX.Element {
  const [renderTime, setRenderTime] = useState<number | null>(null);
  return (
    <>
      {renderTime != null ? (
        <Text>
          Took {renderTime}ms to render {props.title}
        </Text>
      ) : null}
      <View
        style={{margin: 10, height: 5, width: '100%', backgroundColor: 'black'}}
      />
      {props.children}
      <RTNTimeToRender
        markerName={props.markerName}
        onMarkerPainted={event => {
          setRenderTime(Math.round(event.nativeEvent.paintTime));
        }}
      />
    </>
  );
}
