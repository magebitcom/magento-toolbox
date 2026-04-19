export const DiagnosticCode = {
  ObserverDuplicateInFile: 'magento-toolbox.observer.duplicateInSameFile',
  ObserverDuplicateInOtherPlaces: 'magento-toolbox.observer.duplicateInOtherPlaces',
  ObserverDisabledMissing: 'magento-toolbox.observer.disabledObserverDoesNotExist',

  PluginDuplicateInFile: 'magento-toolbox.plugin.duplicateInSameFile',
  PluginDuplicateInOtherPlaces: 'magento-toolbox.plugin.duplicateInOtherPlaces',
  PluginDisabledMissing: 'magento-toolbox.plugin.disabledPluginDoesNotExist',

  AclEmptyId: 'magento-toolbox.acl.emptyId',
  AclMissingTitle: 'magento-toolbox.acl.missingTitle',

  CacheableFalseInDefaultLayout: 'magento-toolbox.layout.cacheableFalseInDefault',

  ModuleNameMismatch: 'magento-toolbox.module.nameMismatch',

  ModuleScopeWrongArea: 'magento-toolbox.module.wrongScope',

  PluginAttrEmpty: 'magento-toolbox.pluginAttr.empty',
  PluginAttrClassMissing: 'magento-toolbox.pluginAttr.classMissing',

  PreferenceForEmpty: 'magento-toolbox.preference.forEmpty',
  PreferenceTypeEmpty: 'magento-toolbox.preference.typeEmpty',
  PreferenceForMissing: 'magento-toolbox.preference.forMissing',
  PreferenceTypeMissing: 'magento-toolbox.preference.typeMissing',

  DiTypeEmpty: 'magento-toolbox.diType.empty',
  DiTypeMissing: 'magento-toolbox.diType.missing',
  DiArgumentObjectMissing: 'magento-toolbox.diArgument.objectMissing',

  VirtualTypeSourceEmpty: 'magento-toolbox.virtualType.sourceEmpty',
  VirtualTypeSourceMissing: 'magento-toolbox.virtualType.sourceMissing',

  WebApiClassEmpty: 'magento-toolbox.webApi.classEmpty',
  WebApiClassMissing: 'magento-toolbox.webApi.classMissing',
  WebApiMethodEmpty: 'magento-toolbox.webApi.methodEmpty',
  WebApiMethodMissing: 'magento-toolbox.webApi.methodMissing',
  WebApiMethodNotPublic: 'magento-toolbox.webApi.methodNotPublic',
} as const;

export type DiagnosticCodeValue = (typeof DiagnosticCode)[keyof typeof DiagnosticCode];
