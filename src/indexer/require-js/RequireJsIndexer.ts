import { RelativePattern, Uri } from 'vscode';
import { Indexer } from 'indexer/Indexer';
import { IndexerKey } from 'types/indexer';
import FileSystem from 'util/FileSystem';
import {
  AssignmentProperty,
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
    const configVariableDeclarator = await this.findConfigVariableDeclarator(ast);

    if (!configVariableDeclarator) {
      return undefined;
    }

    const config: RequireJsConfig = {
      map: {},
      paths: {},
    };

    await this.processMaps(config, configVariableDeclarator);
    await this.processPaths(config, configVariableDeclarator);

    return config;
  }

  private async processMaps(config: RequireJsConfig, configVariableDeclarator: VariableDeclarator) {
    const mapProperty = await this.findProperty(configVariableDeclarator, 'map');

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

  private async processPaths(
    config: RequireJsConfig,
    configVariableDeclarator: VariableDeclarator
  ) {
    const pathsProperty = await this.findProperty(configVariableDeclarator, 'paths');

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

  private findConfigVariableDeclarator(ast: Node): Promise<VariableDeclarator | undefined> {
    return new Promise((resolve, reject) => {
      walk.simple(ast, {
        VariableDeclaration(node: VariableDeclaration) {
          node.declarations.forEach(declarator => {
            if (declarator.id.type === 'Identifier' && declarator.id.name === 'config') {
              resolve(declarator);
            }
          });
        },
      });

      resolve(undefined);
    });
  }

  private findProperty(
    variableDeclarator: VariableDeclarator,
    key: string
  ): Promise<Property | AssignmentProperty | undefined> {
    return new Promise(resolve => {
      const objectExpression = variableDeclarator.init as ObjectExpression;

      walk.simple(objectExpression, {
        Property(node: Property | AssignmentProperty) {
          if (node.key.type === 'Identifier' && node.key.name === key) {
            resolve(node);
          }
        },
      });

      resolve(undefined);
    });
  }
}
