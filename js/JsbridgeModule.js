'use strict';
import {NativeModules} from 'react-native';

export async function getRandomAsync() {
  return await NativeModules.JsbridgeModule.getRandomAsync();
}
