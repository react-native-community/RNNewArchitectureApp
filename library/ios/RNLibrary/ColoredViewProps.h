#pragma once

#include <react/renderer/components/view/ViewProps.h>
#include <react/renderer/core/PropsParserContext.h>
#include <react/renderer/imagemanager/primitives.h>

namespace facebook {
namespace react {

class ColoredViewProps final : public ViewProps {
 public:
  ColoredViewProps() = default;
  ColoredViewProps(const PropsParserContext& context, const ColoredViewProps &sourceProps, const RawProps &rawProps);

#pragma mark - Props

  std::string color{};
  ImageSource image{};
};

} // namespace react
} // namespace facebook
