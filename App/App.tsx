/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {useState} from 'react';
import {Text, ScrollView, SafeAreaView} from 'react-native';
import RTNTimeToRender from 'rtn-timetorender/js/NativeTimeToRender';
import ThousandViews from './scenarios/ThousandsViews';
import ThousandsTexts from './scenarios/ThousandsTexts';
import Button from './Button';
import ThousandsImages from './scenarios/ThousandsImages';
import MeasureComponent from './MeasureComponent';

enum Scenarios {
  Views1500,
  Views5000,
  Text1500,
  Text5000,
  Image1500,
  Image5000,
  Custom,
}

function App(): JSX.Element {
  const [scenario, setScenario] = useState<Scenarios | null>(null);

  let perfTest = null;
  if (scenario != null) {
    switch (scenario) {
      case Scenarios.Views1500:
        perfTest = <ThousandViews markerName="views1500" count={1500} />;
        break;
      case Scenarios.Views5000:
        perfTest = <ThousandViews markerName="views5000" count={5000} />;
        break;
      case Scenarios.Text1500:
        perfTest = <ThousandsTexts markerName="texts1500" count={1500} />;
        break;
      case Scenarios.Text5000:
        perfTest = <ThousandsTexts markerName="texts5000" count={5000} />;
        break;
      case Scenarios.Image1500:
        perfTest = <ThousandsImages markerName="images1500" count={1500} />;
        break;
      case Scenarios.Image5000:
        perfTest = <ThousandsImages markerName="images5000" count={5000} />;
        break;
      case Scenarios.Custom:
        perfTest = (
          <MeasureComponent markerName="custom" title="Custom scenario">
            {/* You can write your own performance scenario here */}
            <Text>Measured rendering this text.</Text>
          </MeasureComponent>
        );
        break;
    }
  }
  return (
    <SafeAreaView>
      <ScrollView
        contentContainerStyle={{alignItems: 'center'}}
        automaticallyAdjustContentInsets={true}>
        {scenario === null ? (
          <>
            <Button
              onPress={timestamp => {
                RTNTimeToRender?.startMarker('views1500', timestamp);
                setScenario(Scenarios.Views1500);
              }}
              title="Render 1500 <View />"
            />
            <Button
              onPress={timestamp => {
                RTNTimeToRender?.startMarker('views5000', timestamp);
                setScenario(Scenarios.Views5000);
              }}
              title="Render 5000 <View />"
            />
            <Button
              onPress={timestamp => {
                RTNTimeToRender?.startMarker('texts1500', timestamp);
                setScenario(Scenarios.Text1500);
              }}
              title="Render 1500 <Text />"
            />
            <Button
              onPress={timestamp => {
                RTNTimeToRender?.startMarker('texts5000', timestamp);
                setScenario(Scenarios.Text5000);
              }}
              title="Render 5000 <Text />"
            />
            <Button
              onPress={timestamp => {
                RTNTimeToRender?.startMarker('images1500', timestamp);
                setScenario(Scenarios.Image1500);
              }}
              title="Render 1500 <Image />"
            />
            <Button
              onPress={timestamp => {
                RTNTimeToRender?.startMarker('images5000', timestamp);
                setScenario(Scenarios.Image5000);
              }}
              title="Render 5000 <Image />"
            />
            <Button
              onPress={timestamp => {
                RTNTimeToRender?.startMarker('custom', timestamp);
                setScenario(Scenarios.Custom);
              }}
              title="Render custom scenario"
            />
          </>
        ) : null}
        {scenario != null ? (
          <>
            <Button
              onPress={() => {
                setScenario(null);
              }}
              title="Reset"
            />
            {perfTest}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

export default App;
