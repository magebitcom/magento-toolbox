import { RelativePattern, Uri } from 'vscode';
import { Indexer } from 'indexer/Indexer';
import { IndexerKey } from 'types/indexer';
import FileSystem from 'util/FileSystem';
import {
  Identifier,
  Literal,
  Node,
  ObjectExpression,
  Property,
  VariableDeclaration,
  VariableDeclarator,
  parse,
} from 'acorn';
import * as walk from 'acorn-walk';
import { RequireJsConfig } from './types';

export default class RequireJsIndexer extends Indexer<RequireJsConfig> {
  public static readonly KEY = 'require-js';

  public getVersion(): number {
    return 1;
  }

  public getId(): IndexerKey {
    return RequireJsIndexer.KEY;
  }

  public getName(): string {
    return 'requirejs-config.js';
  }

  public getPattern(uri: Uri): RelativePattern {
    return new RelativePattern(uri, '**/view/**/requirejs-config.js');
  }

  public async indexFile(uri: Uri): Promise<RequireJsConfig | undefined> {
    const js = await FileSystem.readFile(uri);
    const ast = parse(js, { ecmaVersion: 2020 });

    // Find config identifier
    const configVariableDeclarator = this.findConfigVariableDeclarator(ast);

    if (!configVariableDeclarator) {
      return undefined;
    }

    const config: RequireJsConfig = {
      map: {},
      paths: {},
    };

    this.processMaps(config, configVariableDeclarator);
    this.processPaths(config, configVariableDeclarator);

    return config;
  }

  private processMaps(config: RequireJsConfig, configVariableDeclarator: VariableDeclarator) {
    const mapProperty = this.findProperty(configVariableDeclarator, 'map');

    if (!mapProperty) {
      return config;
    }

    const objectExpression = mapProperty.value as ObjectExpression;
    const properties = objectExpression.properties as Property[];

    for (const property of properties) {
      const group = (property.key as Literal).value as string;
      const mappings = this.getGroupMappings(property);

      config.map[group] = mappings;
    }
  }

  private processPaths(config: RequireJsConfig, configVariableDeclarator: VariableDeclarator) {
    const pathsProperty = this.findProperty(configVariableDeclarator, 'paths');

    if (!pathsProperty) {
      return config;
    }

    const objectExpression = pathsProperty.value as ObjectExpression;
    const properties = objectExpression.properties as Property[];

    for (const property of properties) {
      const key = (property.key as Literal).value as string;
      const value = (property.value as Literal).value as string;

      config.paths[key] = value;
    }
  }

  private getGroupMappings(property: Property): Record<string, string> {
    const objectExpression = property.value as ObjectExpression;
    const properties = objectExpression.properties as Property[];

    const mappings: Record<string, string> = {};

    for (const property of properties) {
      const key =
        property.key.type === 'Literal'
          ? (property.key as Literal).value
          : (property.key as Identifier).name;
      const value =
        property.value.type === 'Literal'
          ? (property.value as Literal).value
          : (property.value as Identifier).name;

      mappings[key as string] = value as string;
    }

    return mappings;
  }

  private findConfigVariableDeclarator(ast: Node): VariableDeclarator | undefined {
    const found = walk.findNodeAfter(ast, 0, (type: string, node: Node) => {
      if (type !== 'VariableDeclaration') {
        return false;
      }

      const variableDeclaration = node as VariableDeclaration;

      for (const declarator of variableDeclaration.declarations) {
        if (declarator.id.type === 'Identifier' && declarator.id.name === 'config') {
          return true;
        }
      }

      return false;
    });

    return found?.node as VariableDeclarator;
  }

  private findProperty(variableDeclarator: VariableDeclarator, key: string): Property | undefined {
    const found = walk.findNodeAfter(variableDeclarator, 0, (type: string, node: Node) => {
      if (type !== 'Property') {
        return false;
      }

      const property = node as Property;

      if (property.key.type === 'Identifier' && property.key.name === key) {
        return true;
      }

      return false;
    });

    return found?.node as Property;
  }
}
