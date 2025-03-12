import FileSystem from 'util/FileSystem';
import fs from 'fs';
import path from 'path';
import { Uri } from 'vscode';

export function getReferenceFilePath(filePath: string) {
  const resourcePath = FileSystem.getExtensionPath('test-resources');
  return path.resolve(resourcePath, 'reference', filePath);
}

export function getReferenceFile(filePath: string) {
  const refFilePath = getReferenceFilePath(filePath);
  return fs.readFileSync(refFilePath, 'utf8');
}

export function getTestWorkspaceUri() {
  return Uri.file(FileSystem.getExtensionPath('test-resources/workspace'));
}
