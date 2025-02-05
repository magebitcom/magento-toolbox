export default class Common {
  private static isDev = process.env.NODE_ENV !== 'production';

  public static startStopwatch(name: string) {
    if (!this.isDev) {
      return;
    }

    console.time(name);
  }

  public static stopStopwatch(name: string) {
    if (!this.isDev) {
      return;
    }

    console.timeEnd(name);
  }
}
