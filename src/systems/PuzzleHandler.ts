
export interface Puzzle {
  id: string;
  isSolved: boolean;
  solve: () => void;
}

export class PuzzleHandler {
  private puzzles: Record<string, Puzzle> = {};

  public registerPuzzle(puzzle: Puzzle) {
    this.puzzles[puzzle.id] = puzzle;
  }

  public isSolved(id: string): boolean {
    return this.puzzles[id]?.isSolved || false;
  }

  public solve(id: string) {
    if (this.puzzles[id]) {
      this.puzzles[id].solve();
    }
  }
}
