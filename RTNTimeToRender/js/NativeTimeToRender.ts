import type {TurboModule} from 'react-native/Libraries/TurboModule/RCTExport';
import {TurboModuleRegistry} from 'react-native';

export interface Spec extends TurboModule {
  startMarker(name: string, time: number): void;
}

export default TurboModuleRegistry.get<Spec>(
  'RTNTimeToRender',
) as Spec | null;
