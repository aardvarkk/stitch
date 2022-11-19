import { DMC } from "./colors";

export enum ClothCount {
  A11 = 11,
  A14 = 14,
  A18 = 18,
  A28 = 28,
}

export type PaletteIndex = number;

export type Palette = DMC[];

export type Crosses = (PaletteIndex | null)[][];

export type Save = {
  clothCount: number;
  palette: Palette;
  crosses: Crosses;
};

export enum Tool {
  CLEAR,
  CROSS,
  PICKER,
  HIGHLIGHT,
}
