export enum TemplatePath {
  GraphqlBlankSchema = 'graphql/blank-schema',
  LicenseApache20 = 'license/apache2',
  LicenseGplv3 = 'license/gplv3',
  LicenseMit = 'license/mit',
  LicenseOslv3 = 'license/oslv3',
  PhpRegistration = 'php/registration',
  XmlDiType = 'xml/di/type',
  XmlDiPlugin = 'xml/di/plugin',
  XmlDiPreference = 'xml/di/preference',
  XmlBlankAcl = 'xml/blank-acl',
  XmlBlankConfig = 'xml/blank-config',
  XmlBlankCrontab = 'xml/blank-crontab',
  XmlBlankDi = 'xml/blank-di',
  XmlBlankEmailTemplates = 'xml/blank-email-templates',
  XmlBlankEvents = 'xml/blank-events',
  XmlBlankExtensionAttributes = 'xml/blank-extension-attributes',
  XmlBlankFieldset = 'xml/blank-fieldset',
  XmlBlankIndexer = 'xml/blank-indexer',
  XmlBlankLayout = 'xml/blank-layout',
  XmlBlankMview = 'xml/blank-mview',
  XmlBlankPageTypes = 'xml/blank-page-types',
  XmlBlankRoutes = 'xml/blank-routes',
  XmlBlankSections = 'xml/blank-sections',
  XmlBlankSystem = 'xml/blank-system',
  XmlBlankView = 'xml/blank-view',
  XmlBlankWebapi = 'xml/blank-webapi',
  XmlBlankWidget = 'xml/blank-widget',
  XmlEventsObserver = 'xml/events/observer',
  XmlEventsEvent = 'xml/events/event',
  XmlModuleConfig = 'xml/module-config',
  XmlCronJob = 'xml/cron/job',
  XmlCronGroup = 'xml/cron/group',
  XmlDiCliCommandItem = 'xml/di/cli-command-item',
  XmlDiCliCommandArguments = 'xml/di/cli-command-arguments',
  XmlSystemField = 'xml/system/field',
  XmlSystemGroup = 'xml/system/group',
  XmlSystemSection = 'xml/system/section',
  XmlConfigField = 'xml/config/field',
  XmlConfigGroup = 'xml/config/group',
  XmlConfigSection = 'xml/config/section',
  XmlAclResource = 'xml/acl/resource',
  XmlBlankCronGroups = 'xml/blank-cron-groups',
  XmlCronGroupsGroup = 'xml/cron-groups/group',
  XmlBlankRoutesShell = 'xml/blank-routes-shell',
  XmlRoutesRoute = 'xml/routes/route',
  XmlRoutesRouter = 'xml/routes/router',
}

/**
 * Common interface for all template parameters
 */
export interface BaseTemplateParams {
  fileHeader?: string;
}

/**
 * Parameters for module registration
 */
export interface ModuleRegistrationParams extends BaseTemplateParams {
  vendor: string;
  module: string;
}

/**
 * Parameters for route configuration
 */
export interface RouteParams extends BaseTemplateParams {
  routerId: string;
  routeId: string;
  frontName: string;
  module: string;
}

/**
 * Parameters for license templates
 */
export interface LicenseParams extends BaseTemplateParams {
  year?: string | number;
  copyright: string;
}

/**
 * Parameters for event templates
 */
export interface EventParams extends BaseTemplateParams {
  eventName: string;
}

/**
 * Parameters for observer templates
 */
export interface ObserverParams extends BaseTemplateParams {
  name: string;
  className: string;
}

/**
 * Parameters for DI type templates
 */
export interface DiTypeParams extends BaseTemplateParams {
  subjectNamespace: string;
}

/**
 * Parameters for DI plugin templates
 */
export interface DiPluginParams extends BaseTemplateParams {
  pluginName: string;
  pluginType: string;
  sortOrder?: number | string;
}

/**
 * Parameters for DI preference templates
 */
export interface PreferenceParams extends BaseTemplateParams {
  forClass: string;
  typeClass: string;
}

/**
 * Parameters for cron job templates
 */
export interface CronJobParams extends BaseTemplateParams {
  jobName: string;
  jobInstance: string;
  cronSchedule: string;
}

/**
 * Parameters for cron group templates
 */
export interface CronGroupParams extends BaseTemplateParams {
  groupId: string;
}

/**
 * Parameters for module config templates
 */
export interface ModuleConfigParams extends BaseTemplateParams {
  moduleName: string;
  sequence: string[];
}

/**
 * Parameters for CLI command <item> fragments in di.xml
 */
export interface DiCliCommandItemParams extends BaseTemplateParams {
  itemName: string;
  itemClass: string;
}

/**
 * Parameters for system.xml <field>
 */
export interface SystemFieldParams extends BaseTemplateParams {
  fieldId: string;
  fieldType: string;
  sortOrder: number | string;
  label: string;
  sourceModel?: string;
  comment?: string;
}

/**
 * Parameters for system.xml <group>
 */
export interface SystemGroupParams extends BaseTemplateParams {
  groupId: string;
  sortOrder: number | string;
  label: string;
}

/**
 * Parameters for system.xml <section>
 */
export interface SystemSectionParams extends BaseTemplateParams {
  sectionId: string;
  sortOrder: number | string;
  label: string;
  tab: string;
  resource: string;
}

/**
 * Parameters for config.xml <field>
 */
export interface ConfigFieldParams extends BaseTemplateParams {
  fieldId: string;
  defaultValue: string;
}

/**
 * Parameters for config.xml <group>
 */
export interface ConfigGroupParams extends BaseTemplateParams {
  groupId: string;
}

/**
 * Parameters for config.xml <section>
 */
export interface ConfigSectionParams extends BaseTemplateParams {
  sectionId: string;
}

/**
 * Parameters for an acl.xml <resource> leaf
 */
export interface AclResourceParams extends BaseTemplateParams {
  resourceId: string;
  title: string;
}

/**
 * Parameters for a routes.xml <route> fragment
 */
export interface RoutesRouteParams extends BaseTemplateParams {
  routeId: string;
  frontName: string;
  moduleName: string;
}

/**
 * Parameters for a routes.xml <router> wrapper
 */
export interface RoutesRouterParams extends BaseTemplateParams {
  routerId: string;
}

/**
 * Partials for the <router> wrapper — inner <route> content.
 */
export interface RoutesRouterPartials extends BaseTemplatePartials {
  routesContent: string;
}

/**
 * Parameters for a cron_groups.xml <group>
 */
export interface CronGroupsGroupParams extends BaseTemplateParams {
  groupId: string;
  scheduleGenerateEvery: number | string;
  scheduleAheadFor: number | string;
  scheduleLifetime: number | string;
  historyCleanupEvery: number | string;
  historySuccessLifetime: number | string;
  historyFailureLifetime: number | string;
  useSeparateProcess: 0 | 1;
}

/**
 * Template parameters mapped by template path
 */
export interface TemplateParams {
  [TemplatePath.PhpRegistration]: ModuleRegistrationParams;
  [TemplatePath.XmlBlankRoutes]: RouteParams;
  [TemplatePath.LicenseMit]: LicenseParams;
  [TemplatePath.LicenseGplv3]: LicenseParams;
  [TemplatePath.LicenseApache20]: LicenseParams;
  [TemplatePath.LicenseOslv3]: LicenseParams;
  [TemplatePath.XmlEventsEvent]: EventParams;
  [TemplatePath.XmlEventsObserver]: ObserverParams;
  [TemplatePath.XmlDiType]: DiTypeParams;
  [TemplatePath.XmlDiPlugin]: DiPluginParams;
  [TemplatePath.XmlDiPreference]: PreferenceParams;
  [TemplatePath.XmlCronJob]: CronJobParams;
  [TemplatePath.XmlCronGroup]: CronGroupParams;
  [TemplatePath.XmlModuleConfig]: ModuleConfigParams;
  [TemplatePath.XmlDiCliCommandItem]: DiCliCommandItemParams;
  [TemplatePath.XmlDiCliCommandArguments]: BaseTemplateParams;
  [TemplatePath.XmlSystemField]: SystemFieldParams;
  [TemplatePath.XmlSystemGroup]: SystemGroupParams;
  [TemplatePath.XmlSystemSection]: SystemSectionParams;
  [TemplatePath.XmlConfigField]: ConfigFieldParams;
  [TemplatePath.XmlConfigGroup]: ConfigGroupParams;
  [TemplatePath.XmlConfigSection]: ConfigSectionParams;
  [TemplatePath.XmlAclResource]: AclResourceParams;
  [TemplatePath.XmlBlankCronGroups]: BaseTemplateParams;
  [TemplatePath.XmlCronGroupsGroup]: CronGroupsGroupParams;
  [TemplatePath.XmlBlankRoutesShell]: BaseTemplateParams;
  [TemplatePath.XmlRoutesRoute]: RoutesRouteParams;
  [TemplatePath.XmlRoutesRouter]: RoutesRouterParams;
  [key: string]: BaseTemplateParams;
}

/**
 * Common partials interface
 */
export interface BaseTemplatePartials {
  fileHeader?: string;
  [key: string]: string | undefined;
}

/**
 * Partials for event templates
 */
export interface EventTemplatePartials extends BaseTemplatePartials {
  eventContent: string;
}

/**
 * Partials for DI type templates
 */
export interface DiTypeTemplatePartials extends BaseTemplatePartials {
  typeContent: string;
}

/**
 * Partials for cron group templates
 */
export interface CronGroupTemplatePartials extends BaseTemplatePartials {
  groupContent: string;
}

/**
 * Partials for the CLI command arguments wrapper template
 */
export interface DiCliCommandArgumentsTemplatePartials extends BaseTemplatePartials {
  itemsContent: string;
}

/**
 * Partials for system.xml <group> — the inner list of rendered <field> elements
 */
export interface SystemGroupTemplatePartials extends BaseTemplatePartials {
  fieldsContent: string;
}

/**
 * Partials for system.xml <section> — the inner list of rendered <group> elements
 */
export interface SystemSectionTemplatePartials extends BaseTemplatePartials {
  groupsContent: string;
}

/**
 * Partials for config.xml <group> — the inner list of rendered <field> defaults
 */
export interface ConfigGroupTemplatePartials extends BaseTemplatePartials {
  fieldsContent: string;
}

/**
 * Partials for config.xml <section> — the inner list of rendered <group> blocks
 */
export interface ConfigSectionTemplatePartials extends BaseTemplatePartials {
  groupsContent: string;
}

/**
 * Template partials mapped by template path
 */
export interface TemplatePartials {
  [TemplatePath.XmlEventsEvent]: EventTemplatePartials;
  [TemplatePath.XmlDiType]: DiTypeTemplatePartials;
  [TemplatePath.XmlCronGroup]: CronGroupTemplatePartials;
  [TemplatePath.XmlDiCliCommandArguments]: DiCliCommandArgumentsTemplatePartials;
  [TemplatePath.XmlSystemGroup]: SystemGroupTemplatePartials;
  [TemplatePath.XmlSystemSection]: SystemSectionTemplatePartials;
  [TemplatePath.XmlConfigGroup]: ConfigGroupTemplatePartials;
  [TemplatePath.XmlConfigSection]: ConfigSectionTemplatePartials;
  [TemplatePath.XmlRoutesRouter]: RoutesRouterPartials;
  [key: string]: BaseTemplatePartials;
}
