// @flow
import type {ViewProps} from 'react-native/Libraries/Components/View/ViewPropTypes';
import type {HostComponent} from 'react-native';
import { ViewStyle } from 'react-native';
import type {ImageSource} from '../../Image/ImageSource';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

type NativeProps = $ReadOnly<{|
    ...ViewProps,
    color: string,
    image?: ?ImageSource,
|}>;

export default (codegenNativeComponent<NativeProps>(
    'ColoredView',
): HostComponent<NativeProps>);
