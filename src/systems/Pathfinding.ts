
export interface Point {
  x: number;
  y: number;
}

export class Pathfinding {
  private grid: boolean[][]; // true = walkable, false = obstacle
  private gridWidth: number;
  private gridHeight: number;
  private cellSize: number;

  constructor(width: number, height: number, cellSize: number) {
    this.gridWidth = Math.floor(width / cellSize);
    this.gridHeight = Math.floor(height / cellSize);
    this.cellSize = cellSize;
    this.grid = Array(this.gridHeight).fill(null).map(() => Array(this.gridWidth).fill(true));
  }

  public setObstacle(x: number, y: number, width: number, height: number) {
    const startX = Math.floor(x / this.cellSize);
    const startY = Math.floor(y / this.cellSize);
    const endX = Math.min(this.gridWidth - 1, Math.floor((x + width) / this.cellSize));
    const endY = Math.min(this.gridHeight - 1, Math.floor((y + height) / this.cellSize));

    for (let iy = startY; iy <= endY; iy++) {
      for (let ix = startX; ix <= endX; ix++) {
        if (iy >= 0 && iy < this.gridHeight && ix >= 0 && ix < this.gridWidth) {
          this.grid[iy][ix] = false;
        }
      }
    }
  }

  public findPath(start: Point, end: Point): Point[] {
    const startX = Math.floor(start.x / this.cellSize);
    const startY = Math.floor(start.y / this.cellSize);
    const endX = Math.floor(end.x / this.cellSize);
    const endY = Math.floor(end.y / this.cellSize);

    if (startX === endX && startY === endY) return [end];

    const openSet: Node[] = [{ x: startX, y: startY, g: 0, h: this.heuristic(startX, startY, endX, endY), f: 0 }];
    const closedSet = new Set<string>();
    const parents = new Map<string, Node>();

    while (openSet.length > 0) {
      openSet.sort((a, b) => (a.f || 0) - (b.f || 0));
      const current = openSet.shift()!;
      const currentKey = `${current.x},${current.y}`;

      if (current.x === endX && current.y === endY) {
        return this.reconstructPath(parents, current, end);
      }

      closedSet.add(currentKey);

      const neighbors = [
        { x: current.x + 1, y: current.y }, { x: current.x - 1, y: current.y },
        { x: current.x, y: current.y + 1 }, { x: current.x, y: current.y - 1 }
      ];

      for (const neighbor of neighbors) {
        if (neighbor.x < 0 || neighbor.x >= this.gridWidth || neighbor.y < 0 || neighbor.y >= this.gridHeight) continue;
        if (!this.grid[neighbor.y][neighbor.x] || closedSet.has(`${neighbor.x},${neighbor.y}`)) continue;

        const gScore = current.g + 1;
        let neighborNode = openSet.find(n => n.x === neighbor.x && n.y === neighbor.y);

        if (!neighborNode) {
          neighborNode = { 
            x: neighbor.x, 
            y: neighbor.y, 
            g: gScore, 
            h: this.heuristic(neighbor.x, neighbor.y, endX, endY),
            f: 0
          };
          neighborNode.f = neighborNode.g + neighborNode.h;
          openSet.push(neighborNode);
          parents.set(`${neighbor.x},${neighbor.y}`, current);
        } else if (gScore < neighborNode.g) {
          neighborNode.g = gScore;
          neighborNode.f = neighborNode.g + neighborNode.h;
          parents.set(`${neighbor.x},${neighbor.y}`, current);
        }
      }
    }

    return [end]; // Fallback if no path found
  }

  private heuristic(x1: number, y1: number, x2: number, y2: number): number {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  }

  private reconstructPath(parents: Map<string, Node>, current: Node, end: Point): Point[] {
    const path: Point[] = [end];
    let curr = current;
    while (parents.has(`${curr.x},${curr.y}`)) {
      curr = parents.get(`${curr.x},${curr.y}`)!;
      path.unshift({ x: curr.x * this.cellSize + this.cellSize / 2, y: curr.y * this.cellSize + this.cellSize / 2 });
    }
    return path;
  }
}

interface Node {
  x: number;
  y: number;
  g: number;
  h: number;
  f: number;
}
