#include "ColoredViewProps.h"
#include <react/renderer/components/image/conversions.h>
#include <react/renderer/core/PropsParserContext.h>
#include <react/renderer/core/propsConversions.h>

namespace facebook {
namespace react {

ColoredViewProps::ColoredViewProps(
    const PropsParserContext &context,
    const ColoredViewProps &sourceProps,
    const RawProps &rawProps): ViewProps(context, sourceProps, rawProps),

    color(convertRawProp(context, rawProps, "color", sourceProps.color, {})),
    image(convertRawProp(context, rawProps, "image", sourceProps.image, {}))
      {}

} // namespace react
} // namespace facebook
