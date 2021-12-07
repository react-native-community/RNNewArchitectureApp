import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import codegenNativeCommands from 'react-native/Libraries/Utilities/codegenNativeCommands';
import {Int32} from 'react-native/Libraries/Types/CodegenTypes';
import type {  ViewProps, HostComponent } from 'react-native';
import React from 'react';

interface NativeProps extends ViewProps  {
    color?: string,
    step?: Int32,
};

export type AnswerViewerViewType = HostComponent<NativeProps>;

interface NativeCommands {
    changeBackgroundColor: (
        viewRef: React.ElementRef<AnswerViewerViewType>,
        color: string,
    ) => void;
}

export const Commands: NativeCommands = codegenNativeCommands<NativeCommands>({
    supportedCommands: ['changeBackgroundColor'],
});

export default (codegenNativeComponent<NativeProps>(
    'AnswerViewer',
));