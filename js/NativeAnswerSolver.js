/**
 * @format
 * @flow strict-local
 */

'use strict';

import type {TurboModule} from 'react-native/Libraries/TurboModule/RCTExport';
import {TurboModuleRegistry} from 'react-native';

export interface Spec extends TurboModule {
  answerTheUltimateQuestion(input: string): number;
}

export default (TurboModuleRegistry.get<Spec>('NativeAnswerSolver'): ?Spec);
