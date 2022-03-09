// @flow strict-local

import type {TurboModule} from 'react-native/Libraries/TurboModule/RCTExport';
import {TurboModuleRegistry} from 'react-native';

export interface Spec extends TurboModule {
  // your module methods go here, for example:
  createCalendarEvent(name: string, location: string): void;
}

export default (TurboModuleRegistry.get<Spec>('CalendarModule'): ?Spec);
