import { PhpClass } from 'parser/php/PhpClass';
import { PhpFile } from 'parser/php/PhpFile';
import { PhpInterface } from 'parser/php/PhpInterface';
import { PhpMethod } from 'parser/php/PhpMethod';
import PositionUtil from 'util/Position';
import { MarkdownString, Range } from 'vscode';

export class ClasslikeInfo {
  public constructor(public readonly phpFile: PhpFile) {}

  public getDefinition(): PhpClass | PhpInterface {
    return this.phpFile.classes[0] || this.phpFile.interfaces[0];
  }

  public getNameRange(): Range | undefined {
    const classlikeNode = this.getDefinition();

    if (!classlikeNode) {
      return;
    }

    const classlikeName = classlikeNode.ast.name;

    if (typeof classlikeName === 'string' || !classlikeName.loc) {
      return;
    }

    return new Range(
      PositionUtil.phpAstPositionToVsCodePosition(classlikeName.loc.start),
      PositionUtil.phpAstPositionToVsCodePosition(classlikeName.loc.end)
    );
  }

  public getMethodByName(
    phpClasslike: PhpClass | PhpInterface,
    name: string
  ): PhpMethod | undefined {
    return phpClasslike.methods?.find(method => method.name === name);
  }

  public getNamespace(): string {
    const classlikeNode = this.getDefinition();
    return `${this.phpFile.namespace}\\${classlikeNode.name}`;
  }

  public getName(): string {
    const classlikeNode = this.getDefinition();
    return classlikeNode.name;
  }

  public isClass(): boolean {
    return this.phpFile.classes.length > 0;
  }

  public getExtends(): string[] {
    const classlikeNode = this.getDefinition();

    if (this.isClass()) {
      return (classlikeNode as PhpClass).extends ? [(classlikeNode as PhpClass).extends!] : [];
    }

    return (classlikeNode as PhpInterface).extends;
  }

  public getImplements(): string[] {
    const classlikeNode = this.getDefinition();

    if (this.isClass()) {
      return (classlikeNode as PhpClass).implements;
    }

    return [];
  }

  public getComments(): string[] {
    const classlikeNode = this.getDefinition();

    if (classlikeNode.ast.leadingComments && classlikeNode.ast.leadingComments.length > 0) {
      return classlikeNode.ast.leadingComments.map(comment => comment.value);
    }

    return [];
  }

  public getHover(): MarkdownString {
    const hover = new MarkdownString();
    hover.appendMarkdown(`**${this.getNamespace()}**\n\n`);

    let codeBlock = '<?php\n';

    if (this.getComments().length > 0) {
      codeBlock += this.getComments().join('\n') + '\n';
    }

    if (this.isClass()) {
      codeBlock += `class `;
    } else {
      codeBlock += `interface `;
    }

    codeBlock += this.getName();

    if (this.getExtends().length > 0) {
      codeBlock += ` extends ${this.getExtends().join(', ')}`;
    }

    if (this.getImplements().length > 0) {
      codeBlock += ` implements ${this.getImplements().join(', ')}`;
    }

    hover.appendCodeblock(codeBlock, 'php');
    return hover;
  }
}
