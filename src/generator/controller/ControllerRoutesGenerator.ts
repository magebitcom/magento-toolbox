import indentString from 'indent-string';
import { Uri } from 'vscode';
import AbstractXmlFragmentGenerator from 'generator/xml/AbstractXmlFragmentGenerator';
import FindOrCreateXml, { XmlFileSpec } from 'generator/xml/FindOrCreateXml';
import GeneratedFile from 'generator/GeneratedFile';
import HandlebarsTemplateRenderer from 'generator/HandlebarsTemplateRenderer';
import Magento from 'util/Magento';
import { ControllerWizardData } from 'wizard/ControllerWizard';
import { MagentoScope } from 'types/global';
import { TemplatePath } from 'types/handlebars';
import { findOpeningTagWithId, walkBackToLineStart } from 'generator/systemConfig/xmlHelpers';

export default class ControllerRoutesGenerator extends AbstractXmlFragmentGenerator<ControllerWizardData> {
  protected getTarget(): XmlFileSpec {
    return {
      filename: 'routes.xml',
      blankTemplate: TemplatePath.XmlBlankRoutesShell,
      area: this.data.area === 'adminhtml' ? MagentoScope.Adminhtml : MagentoScope.Frontend,
    };
  }

  /**
   * Override to short-circuit when the route id is already present anywhere
   * in the file — the base class's wrap-in-newlines behaviour would otherwise
   * introduce spurious blank lines.
   */
  public async generate(workspaceUri: Uri): Promise<GeneratedFile> {
    const { vendor, module } = Magento.splitModule(this.data.module);
    const target = this.getTarget();
    const existing = await FindOrCreateXml.execute(workspaceUri, vendor, module, target);
    const uri = FindOrCreateXml.getUri(workspaceUri, vendor, module, target);

    if (findOpeningTagWithId(existing, 'route', this.data.routeId)) {
      return new GeneratedFile(uri, existing, false);
    }

    return super.generate(workspaceUri);
  }

  protected computeInsertPosition(xml: string): number {
    const router = findOpeningTagWithId(xml, 'router', this.expectedRouterId());
    if (router) {
      // Position just before the matching </router> so the new <route> lands
      // as the last child — respects any existing routes.
      const closeIdx = xml.indexOf('</router>', router.endIndex);
      if (closeIdx !== -1) {
        return walkBackToLineStart(xml, closeIdx);
      }
    }
    return walkBackToLineStart(xml, xml.indexOf('</config>'));
  }

  protected async renderFragment(
    renderer: HandlebarsTemplateRenderer,
    { existingXml }: { existingXml: string }
  ): Promise<string> {
    const routeXml = await renderer.render(TemplatePath.XmlRoutesRoute, {
      routeId: this.data.routeId,
      frontName: this.data.frontName,
      moduleName: this.data.module,
    });

    const router = findOpeningTagWithId(existingXml, 'router', this.expectedRouterId());
    if (router) {
      // Inside existing <router> at col 4 → want <route> at col 8.
      // Base class will add 4 during insert, so pre-indent by 4 here.
      return indentString(routeXml, 4);
    }

    return renderer.render(
      TemplatePath.XmlRoutesRouter,
      { routerId: this.expectedRouterId() },
      { routesContent: routeXml }
    );
  }

  private expectedRouterId(): string {
    return this.data.area === 'adminhtml' ? 'admin' : 'standard';
  }
}
