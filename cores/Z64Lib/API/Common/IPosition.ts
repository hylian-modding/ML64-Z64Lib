import Vector3 from "modloader64_api/math/Vector3";

export interface IPosition {
  x: number;
  y: number;
  z: number;
  getRawPos(): Buffer;
  setRawPos(pos: Buffer): void;
  getVec3(): Vector3;
}
