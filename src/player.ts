import Vector2 from './vector';
import Engine from './engine';
import { lerp } from './utils';
import Tiles from './tiles';

export default class Player {
  public width = 32;

  public height = 32;

  public color = 'red';

  public speed = 500;

  public velGoal = 0;

  public velocity: Vector2 = new Vector2(0, 0);

  public gravity: Vector2 = new Vector2(0, 5);

  public state = {
    falling: false,
    jumping: false,
  };

  constructor(
    private ctx: CanvasRenderingContext2D,
    private engine: Engine,
    public pos: Vector2,
  ) {}

  // update player
  update(dt: number): void {
    this.velocity.x = lerp(this.velGoal, this.velocity.x, dt * 550);

    // collision in x axis
    let colx = false;
    if (this.velocity.x !== 0) {
      const w = this.velocity.x < 0 ? 0 : this.width;
      colx =
        this.checkCollision(
          new Vector2(this.pos.x + this.velocity.x * dt + w, this.pos.y),
        ) ||
        this.checkCollision(
          new Vector2(
            this.pos.x + this.velocity.x * dt + w,
            this.pos.y + this.height,
          ),
        );
    }

    if (colx) this.velocity.x = 0;

    if (this.engine.controls.control.up && !this.state.jumping) {
      this.velocity.y = -300;
      this.state.jumping = true;
    }

    this.velocity.y += this.gravity.y;

    // collision in y axis
    let coly = false;
    if (this.velocity.y !== 0) {
      const h = this.velocity.y < 0 ? 0 : this.height;
      coly =
        this.checkCollision(
          new Vector2(this.pos.x, this.pos.y + this.velocity.y * dt + h),
        ) ||
        this.checkCollision(
          new Vector2(
            this.pos.x + this.width,
            this.pos.y + this.velocity.y * dt + h,
          ),
        );
    }

    if (coly) {
      this.velocity.y = 0;
      this.state.jumping = false;
    }

    this.pos.add(new Vector2(this.velocity.x * dt, this.velocity.y * dt));
  }

  draw(): void {
    this.ctx.save();
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(
      this.pos.x - this.engine.camera.pos.x,
      this.pos.y - this.engine.camera.pos.y,
      this.width,
      this.height,
    );
    this.ctx.restore();
  }

  // Axis Aligned Bounding box collision
  checkCollision(pos: Vector2): boolean {
    const tilepos = new Vector2(
      Math.floor(pos.x / Tiles.TilesWidth) * Tiles.TilesWidth,
      Math.floor(pos.y / Tiles.TilesHeight) * Tiles.TilesHeight,
    );
    const tile =
      typeof this.engine.map.level.map[tilepos.y / Tiles.TilesWidth] ===
        'undefined' ||
      typeof this.engine.map.level.map[tilepos.y / Tiles.TilesWidth][
        tilepos.x / Tiles.TilesHeight
      ] === 'undefined'
        ? 0
        : this.engine.map.level.map[tilepos.y / Tiles.TilesWidth][
            tilepos.x / Tiles.TilesHeight
          ];
    if (tile === 1) {
      if (
        pos.x < tilepos.x + Tiles.TilesWidth &&
        pos.x + this.width > tilepos.x &&
        pos.y < tilepos.y + Tiles.TilesHeight &&
        pos.y + this.height > tilepos.y
      ) {
        return true;
      }
    }
    return false;
  }
}
