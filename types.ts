
export interface ColorState {
  hex: string;
  id: string;
  isLocked: boolean;
  name: string;
}

export interface Palette {
  colors: ColorState[];
}

export interface AIPaletteResponse {
  colors: {
    hex: string;
    name: string;
    reason: string;
  }[];
  paletteName: string;
}
