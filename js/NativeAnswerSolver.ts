import type {TurboModule} from 'react-native';
import {TurboModuleRegistry} from 'react-native';

export interface Spec extends TurboModule {
   answerTheUltimateQuestion(input: string): number;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeAnswerSolver');
