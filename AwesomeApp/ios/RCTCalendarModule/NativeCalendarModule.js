'use strict';

import type {TurboModule} from 'react-native/Libraries/TurboModule/RCTExport';
import {TurboModuleRegistry} from 'react-native';

export interface Spec extends TurboModule {
    +getConstants: () => {|
        "DEFAULT_EVENT_NAME": "New Event"
    |};

    getString(id: string): Promise<string>;
}

export default (TurboModuleRegistry.get<Spec>('CalendarModule'): ?Spec);
