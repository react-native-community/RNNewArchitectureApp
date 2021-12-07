/**
 * @format
 * @flow strict-local
 */

import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import codegenNativeCommands from 'react-native/Libraries/Utilities/codegenNativeCommands';
import type {HostComponent} from 'react-native/Libraries/Renderer/shims/ReactNativeTypes';
import type {ViewProps} from 'react-native/Libraries/Components/View/ViewPropTypes';
import type {Int32} from 'react-native/Libraries/Types/CodegenTypes';
import * as React from 'react';

type NativeProps = $ReadOnly<{|
  ...ViewProps,
  color?: string,
  step?: Int32,
|}>;

export type AnswerViewerViewType = HostComponent<NativeProps>;

interface NativeCommands {
  +changeBackgroundColor: (
    viewRef: React.ElementRef<AnswerViewerViewType>,
    color: string,
  ) => void;
}

export const Commands: NativeCommands = codegenNativeCommands<NativeCommands>({
  supportedCommands: ['changeBackgroundColor'],
});

export default (codegenNativeComponent<NativeProps>(
  'AnswerViewer',
): AnswerViewerViewType);
