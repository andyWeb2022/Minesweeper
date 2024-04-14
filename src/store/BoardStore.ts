import { makeAutoObservable } from "mobx";
import { TILE_STATUS } from "../components/type";
interface ITile {
  x: number;
  y: number;
  isMine: boolean;

  status: TILE_STATUS;
  text: string;
}
interface IPosition {
  x: number;
  y: number;
}
class BoardStore {
  board: ITile[][] = [];
  mineList: IPosition[] = [];
  gameStatus = "";
  constructor() {
    makeAutoObservable(this);
  }
  setUp = ({ size }: { size: number; numberOfMines: number }) => {
    for (let i = 0; i < size; i++) {
      const row = [];
      for (let j = 0; j < size; j++) {
        const tile: ITile = {
          x: i,
          y: j,
          isMine: false,
          status: TILE_STATUS.HIDDEN,
          text: "",
        };
        row.push(tile);
      }
      this.board = [...this.board, row];
    }
  };
  setMinePositions = (size: number, numberOfMines: number, tile: ITile) => {
    while (this.mineList.length < numberOfMines) {
      const x = this.generateRandomNumber(size);
      const y = this.generateRandomNumber(size);
      const minePosition: IPosition = { x, y };
      if (
        !this.mineList.some((position) =>
          this.positionMatch(minePosition, position),
        ) &&
        tile.x !== x &&
        tile.y !== y
      ) {
        this.board[x][y].isMine = true;
        this.mineList = [...this.mineList, minePosition];
      }
    }
  };

  onClick = (clickedTile: ITile) => {
    this.revealTile(clickedTile);
    if (clickedTile.isMine) {
      this.gameStatus = "You lose";
      this.board.forEach((row) => {
        row.forEach((tile) => {
          if (tile.isMine && tile.status === TILE_STATUS.HIDDEN)
            tile.status = TILE_STATUS.SHOW;
        });
      });
    } else {
      if (this.checkWin()) {
        this.gameStatus = "You win";
        this.board.forEach((data) => {
          data.forEach((data) => {
            if (data.isMine === true) {
              data.status = TILE_STATUS.MARKED;
            }
          });
        });
      }
    }
  };

  checkWin = () => {
    return this.board.every((row) =>
      row.every(
        (tile) =>
          tile.status === TILE_STATUS.SHOW ||
          (tile.isMine && tile.status === TILE_STATUS.MARKED) ||
          (tile.isMine && tile.status === TILE_STATUS.HIDDEN),
      ),
    );
  };

  revealTile = (tile: ITile) => {
    if (tile.isMine) {
      return;
    }

    const nearByTileList = this.getNearByTiles(tile);

    const mineCount = nearByTileList.filter((tile) => tile.isMine).length;
    if (mineCount === 0) {
      nearByTileList.forEach((nearByTile) => {
        if (nearByTile.status !== TILE_STATUS.MARKED) {
          nearByTile.status = TILE_STATUS.SHOW;
        }
        this.revealTile(nearByTile);
      });
    } else {
      tile.text = mineCount.toString();
    }
  };
  getNearByTiles = (tile: ITile) => {
    const tileList: ITile[] = [];
    for (let xOffset = -1; xOffset <= 1; xOffset++) {
      for (let yOffset = -1; yOffset <= 1; yOffset++) {
        const nearByTile = this.board[tile.x + xOffset]?.[tile.y + yOffset];
        if (
          nearByTile &&
          nearByTile.status !== TILE_STATUS.SHOW &&
          (nearByTile.x !== tile.x || nearByTile.y !== tile.y)
        ) {
          tileList.push(nearByTile);
        }
      }
    }
    return tileList;
  };

  positionMatch = (a: IPosition, b: IPosition) => a.x === b.x && a.y === b.y;
  generateRandomNumber = (range: number) => Math.floor(Math.random() * range);
}
const store = new BoardStore();
export default store;
