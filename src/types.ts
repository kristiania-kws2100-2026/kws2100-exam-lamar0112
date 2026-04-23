export interface FjelltoppInfo {
  navn: string;
  høyde: number;
  koordinater: [number, number];
}

export interface ZoomMal {
  koordinater: [number, number];
  zoom: number;
  id: number;
  erTilbake: boolean;
}
