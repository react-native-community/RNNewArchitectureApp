import type { ViewProps } from 'ViewPropTypes';
import type { HostComponent } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

export interface NativeProps extends ViewProps {
  zoomEnabled: boolean,
}

export default codegenNativeComponent<NativeProps>(
  'MapView',
) as HostComponent<NativeProps>;
