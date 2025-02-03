export abstract class Command {
  constructor(protected command: string) {}

  public abstract execute(...args: any[]): Promise<void>;

  public getCommand(): string {
    return this.command;
  }
}
