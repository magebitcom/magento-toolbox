# Change Log

All notable changes to the "magento-toolbox" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [1.7.1] - 2026-05-15

- Fixed: Type definitions for virtual types
- Fixed: XML catalog generation failed if .vscode directory does not exist

## [1.7.0] - 2026-04-19

- Added: Layout & page_layout XML support — go-to-definition, hover, completion, find-references, and rename for referenceBlock, referenceContainer, update handle, move element, move destination. Area-scoped (frontend/adminhtml + base).
- Added: Theme support — ThemeIndexer + navigation and hover for in theme.xml.
- Added: Diagnostics engine with 13 rules across layout, DI, ACL, plugins, observers, modules, preferences, virtual types, and Web API. Each toggleable via settings.
- Added: Quick fixes — fix module name, make method public, remove cacheable="false".
- Added: Incremental class indexing — new PHP classes are picked up immediately without a full reindex.
- Changed: Module XML generator rewritten on Handlebars templates with test coverage.
- Fixed: Theme template overrides (app/design/.../{Module_Name}/templates/...) are now indexed and navigable.
- Fixed: Decorations (plugin/observer/cron inlays) refresh on file save.
- Fixed: File watcher now fires on create + delete, and covers all matching files.
- Fixed: Empty system list in XML catalog.
- Fixed: Multiline XML definitions matched correctly.
- Fixed: / accept either element kind, matching Magento's runtime.
- Changed: Simplified indexer registration — IndexerDefinition + registry tuple + derived IndexerDataMap.
- Changed: Standardized hover formatting via HoverBuilder.
- Changed: Renamed ActiveTextEditorChangeObserver → ActiveEditorRefreshObserver.
- Changed: Dependency bumps including tar-fs security fix.

## [1.6.1] - 2025-08-11

- Fixed: Issue [#92](https://github.com/magebitcom/magento-toolbox/issues/92) (Definitions and hovers dont work on element content values that are on a new line)
- Changed: Indexer now stores index files on disk instead of using Extension Context state

## [1.6.0] - 2025-04-09

- Added: Event name autocomplete
- Added: Hovering CRON job schedules will show a human readable version
- Added: Cron job indexer and instance class decorations
- Changed: Implemented batching for the indexer to reduce load

## [1.5.0] - 2025-04-06
- Added: Class namespace autocomplete in XML files
- Added: Module name autocomplete in module.xml files
- Added: Module hover information
- Added: Added extension config fields for enabling/disabling completions, definitions and hovers
- Added: acl.xml indexer, definitions, autocomplete and hovers
- Added: template file indexer, definitions and autocomplete
- Added: Index data persistance
- Changed: Adjusted namespace indexer logic

## [1.4.0] - 2025-04-04
- Added: Generator command for a ViewModel class
- Added: Generator command for data patches
- Added: Generator command for cron jobs
- Added: Jump-to-definition for magento modules (in module.xml and routes.xml)
- Fixed: Method plugin hover messages are now grouped and include a link to di.xml

## [1.3.1] - 2025-03-23
- Fixed: Generated plugin class arguments contain an incorrect namespace

## [1.3.0] - 2025-03-17

- Added: Jump to module command
- Changed: All dropdown inputs now support searching
- Changed: Migrated ejs templates to handlebars

## [1.2.0] - 2025-03-13

- Added: Generator command for sample Layout XML file
- Added: Generator command for sample page_types.xml file
- Added: Generator command for sample crontab.xml file
- Added: Generator command for sample email_templates.xml file
- Added: Generator command for sample sections.xml file
- Added: Generator command for sample fieldset.xml file
- Added: Generator command for sample view.xml file
- Added: Generator command for sample indexer.xml file
- Added: Generator command for sample mview.xml file
- Added: Generator command for sample widget.xml file
- Added: Generator command for sample extension_attributes.xml file
- Added: Generator command for sample system.xml file
- Added: Generator command for sample config.xml file

## [1.1.3] - 2025-03-12

- Fixed: Block, observer, plugin and preference class generation fails if class name includes backslashes
- Fixed: Composer.json license is not capitalized
- Fixed: Module generation module.xml sequence elements are not added
- Fixed: Observer XML generation fails if file header comment is not configured
- Fixed: Preference type attribute does not include full class namespace
- Chore: Added unit tests for generator commands

## [1.1.2] - 2025-02-27

- Fixed: Module generator creates an invalid registration.php file

## [1.1.1] - 2025-02-27

- Fixed: urn catalog not generated in dockerized environments
- Fixed: codegen fails in multi-folder workspaces

## [1.1.0] - 2025-02-25

- Added preference generation command

## [1.0.0] - 2025-02-24

- Initial release
