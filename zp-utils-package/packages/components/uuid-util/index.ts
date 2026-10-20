export class UuidUtil {
  /**
   * 生成uuid
   */
  public static uuid32(): string {
    return this.s4() + this.s4() + this.s4() + this.s4() + this.s4() + this.s4() + this.s4() + this.s4();
  }

  /**
   * 生成4位十六进制随机数
   */
  private static s4(): string {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
}
