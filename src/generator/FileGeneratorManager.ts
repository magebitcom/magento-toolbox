import { commands, window } from 'vscode';
import { Uri } from 'vscode';
import FileGenerator from './FileGenerator';
import GeneratedFile from './GeneratedFile';

export default class FileGeneratorManager {
  private generatedFiles: GeneratedFile[] = [];
  public constructor(private generators: FileGenerator[] = []) {}

  public addGenerator(generator: FileGenerator): void {
    this.generators.push(generator);
  }

  public async generate(workspaceUri: Uri): Promise<GeneratedFile[]> {
    this.generatedFiles = await Promise.all(
      this.generators.map(generator => generator.generate(workspaceUri))
    );
    return this.generatedFiles;
  }

  public getGeneratedFiles(): GeneratedFile[] {
    return this.generatedFiles;
  }

  public async writeFiles(showMessage: boolean = true): Promise<void> {
    await Promise.all(this.generatedFiles.map(file => file.write()));
    await this.refreshFiles();

    if (showMessage) {
      window.showInformationMessage(`${this.generatedFiles.length} files generated`);
    }
  }

  public async refreshFiles(): Promise<void> {
    await commands.executeCommand('workbench.files.action.refreshFilesExplorer');
  }

  public openAllFiles(): void {
    this.generatedFiles.forEach(file => {
      file.open();
    });
  }

  public openFirstFile(): void {
    if (this.generatedFiles.length > 0) {
      this.generatedFiles[0].open();
    }
  }

  public openLastFile(): void {
    if (this.generatedFiles.length > 0) {
      this.generatedFiles[this.generatedFiles.length - 1].open();
    }
  }

  public openFile(index: number): void {
    if (index >= 0 && index < this.generatedFiles.length) {
      this.generatedFiles[index].open();
    }
  }
}
