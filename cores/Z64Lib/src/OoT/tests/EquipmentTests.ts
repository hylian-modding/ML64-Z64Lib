import { ILogger } from 'modloader64_api/IModLoaderAPI';
import * as Z64API from '../../../API/imports';

export class EquipmentTests {
  logger: ILogger;
  core: Z64API.OoT.IOOTCore;
  tests: Function[] = new Array<Function>();
  tick!: any;
  isTicking = false;

  constructor(logger: ILogger, core: Z64API.OoT.IOOTCore) {
      this.logger = logger;
      this.core = core;
      let fn: Function = (field: string) => {
          this.tests.push(() => {
              (this.core.save.inventory as any)[field] = Z64API.Z64.AmmoUpgrade.BASE;
              this.logger.info(field + ' 1');
          });
          this.tests.push(() => {
              (this.core.save.inventory as any)[field] = Z64API.Z64.AmmoUpgrade.UPGRADED;
              this.logger.info(field + ' 2');
          });
          this.tests.push(() => {
              (this.core.save.inventory as any)[field] = Z64API.Z64.AmmoUpgrade.MAX;
              this.logger.info(field + ' 3');
          });
          this.tests.push(() => {
              (this.core.save.inventory as any)[field] = Z64API.Z64.AmmoUpgrade.NONE;
              this.logger.info(field + ' 0');
          });
      };

      fn('bombBag');
      fn('bulletBag');
      fn('dekuNutsCapacity');
      fn('dekuSticksCapacity');
      fn('quiver');
      fn('strength');
      fn('swimming');
      fn('wallet');
  }

  startTicking() {
      this.tick = setInterval(() => {
          if (this.tests.length > 0) {
              let test: Function = this.tests.shift() as Function;
              test();
          }
      }, 10 * 1000);
      this.isTicking = true;
  }
}
