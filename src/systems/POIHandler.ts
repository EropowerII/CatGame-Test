
export interface POI {
  id: string;
  x: number;
  y: number;
  radius: number;
  onInteract: () => void;
  label: string;
}

export class POIHandler {
  private pois: POI[] = [];

  public addPOI(poi: POI) {
    this.pois.push(poi);
  }

  public checkClick(x: number, y: number): POI | null {
    for (const poi of this.pois) {
      const dist = Math.sqrt(Math.pow(x - poi.x, 2) + Math.pow(y - poi.y, 2));
      if (dist <= poi.radius) {
        return poi;
      }
    }
    return null;
  }

  public getPOIs() {
    return this.pois;
  }
}
