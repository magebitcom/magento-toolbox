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
  XmlCronJob = 'xml/cron/job',
  XmlCronGroup = 'xml/cron/group',
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
 * Template partials mapped by template path
 */
export interface TemplatePartials {
  [TemplatePath.XmlEventsEvent]: EventTemplatePartials;
  [TemplatePath.XmlDiType]: DiTypeTemplatePartials;
  [TemplatePath.XmlCronGroup]: CronGroupTemplatePartials;
  [key: string]: BaseTemplatePartials;
}
