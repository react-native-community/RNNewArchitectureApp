import type {TurboModule} from 'react-native/Libraries/TurboModule/RCTExport';

import {TurboModuleRegistry} from 'react-native';

export interface Spec extends TurboModule {
  readonly reverseString: (input: string) => string;
  readonly passLargeNumber: (input: string) => number;
}

export default (TurboModuleRegistry.getEnforcing<Spec>('NativeSampleModule'));
