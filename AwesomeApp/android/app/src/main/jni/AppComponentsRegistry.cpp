#include "AppComponentsRegistry.h"

#include <CoreComponentsRegistry.h>
#include <fbjni/fbjni.h>
#include <react/renderer/componentregistry/ComponentDescriptorProviderRegistry.h>
#include <react/renderer/components/rncore/ComponentDescriptors.h>
#include <react/renderer/components/centeredtext/ComponentDescriptors.h>

namespace facebook {
namespace react {

AppComponentsRegistry::AppComponentsRegistry(
    ComponentFactory *delegate)
    : delegate_(delegate) {}

std::shared_ptr<ComponentDescriptorProviderRegistry const>
AppComponentsRegistry::sharedProviderRegistry() {
auto providerRegistry = CoreComponentsRegistry::sharedProviderRegistry();

providerRegistry->add(concreteComponentDescriptorProvider<RNCenteredTextComponentDescriptor>());

return providerRegistry;
}

jni::local_ref<AppComponentsRegistry::jhybriddata>
AppComponentsRegistry::initHybrid(
    jni::alias_ref<jclass>,
    ComponentFactory *delegate) {
auto instance = makeCxxInstance(delegate);

auto buildRegistryFunction =
    [](EventDispatcher::Weak const &eventDispatcher,
        ContextContainer::Shared const &contextContainer)
    -> ComponentDescriptorRegistry::Shared {
    auto registry = AppComponentsRegistry::sharedProviderRegistry()
                        ->createComponentDescriptorRegistry(
                            {eventDispatcher, contextContainer});

    auto mutableRegistry =
        std::const_pointer_cast<ComponentDescriptorRegistry>(registry);

    mutableRegistry->setFallbackComponentDescriptor(
        std::make_shared<UnimplementedNativeViewComponentDescriptor>(
            ComponentDescriptorParameters{
                eventDispatcher, contextContainer, nullptr}));

    return registry;
};

delegate->buildRegistryFunction = buildRegistryFunction;
return instance;
}

void AppComponentsRegistry::registerNatives() {
registerHybrid({
    makeNativeMethod("initHybrid", AppComponentsRegistry::initHybrid),
});
}

} // namespace react
} // namespace facebook
