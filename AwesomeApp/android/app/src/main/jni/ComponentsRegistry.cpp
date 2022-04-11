#include "ComponentsRegistry.h"

#include <CoreComponentsRegistry.h>
#include <fbjni/fbjni.h>
#include <react/renderer/componentregistry/ComponentDescriptorProviderRegistry.h>
#include <react/renderer/components/rncore/ComponentDescriptors.h>
#include <react/renderer/components/library/ComponentDescriptors.h>

namespace facebook {
namespace react {

ComponentsRegistry::ComponentsRegistry(
    ComponentFactory *delegate)
    : delegate_(delegate) {}

std::shared_ptr<ComponentDescriptorProviderRegistry const>
ComponentsRegistry::sharedProviderRegistry() {
auto providerRegistry = CoreComponentsRegistry::sharedProviderRegistry();

providerRegistry->add(concreteComponentDescriptorProvider<ColoredViewComponentDescriptor>());

return providerRegistry;
}

jni::local_ref<ComponentsRegistry::jhybriddata>
ComponentsRegistry::initHybrid(
    jni::alias_ref<jclass>,
    ComponentFactory *delegate) {
auto instance = makeCxxInstance(delegate);

auto buildRegistryFunction =
    [](EventDispatcher::Weak const &eventDispatcher,
        ContextContainer::Shared const &contextContainer)
    -> ComponentDescriptorRegistry::Shared {
    auto registry = ComponentsRegistry::sharedProviderRegistry()
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

void ComponentsRegistry::registerNatives() {
registerHybrid({
    makeNativeMethod("initHybrid", ComponentsRegistry::initHybrid),
});
}

} // namespace react
} // namespace facebook
