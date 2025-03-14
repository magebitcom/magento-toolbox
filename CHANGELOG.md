# Change Log

All notable changes to the "magento-toolbox" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [1.2.0]

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

## [1.1.3] - 3/12/2025

- Fixed: Block, observer, plugin and preference class generation fails if class name includes backslashes
- Fixed: Composer.json license is not capitalized
- Fixed: Module generation module.xml sequence elements are not added
- Fixed: Observer XML generation fails if file header comment is not configured
- Fixed: Preference type attribute does not include full class namespace
- Chore: Added unit tests for generator commands

## [1.1.2] - 2/27/2025

- Fixed: Module generator creates an invalid registration.php file

## [1.1.1] - 2/27/2025

- Fixed: urn catalog not generated in dockerized environments
- Fixed: codegen fails in multi-folder workspaces

## [1.1.0] - 2/25/2025

- Added preference generation command

## [1.0.0] - 2/24/2025

- Initial release
