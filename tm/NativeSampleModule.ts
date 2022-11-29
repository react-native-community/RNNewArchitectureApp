import type {TurboModule} from 'react-native/Libraries/TurboModule/RCTExport';

import {TurboModuleRegistry} from 'react-native';

export type CustomType = {
  key: string;
  enabled: boolean;
  time?: number;
}

export interface Spec extends TurboModule {
  readonly reverseString: (input: string) => string;
  readonly passLargeNumber: (input: string) => number;
  readonly passCustomType: (input: CustomType) => CustomType;
}

export default (TurboModuleRegistry.getEnforcing<Spec>('NativeSampleModule'));
