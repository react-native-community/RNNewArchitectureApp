import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  createCalendarEvent(name: string, location: string): void;
}

export default TurboModuleRegistry.get<Spec>('CalendarModule');
