#include "ColoredViewState.h"

namespace facebook {
namespace react {

ImageSource ColoredViewState::getImageSource() const {
  return imageSource_;
}

ImageRequest const &ColoredViewState::getImageRequest() const {
  return *imageRequest_;
}

} // namespace react
} // namespace facebook

