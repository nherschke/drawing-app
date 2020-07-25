class Point2D {
  readonly x: number;
  readonly y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

interface Shape {
  readonly id: number;
  draw(ctx: CanvasRenderingContext2D): void;
}

abstract class AbstractShape implements Shape {
  static counter: number;
  readonly id: number;

  constructor() {
    this.id = AbstractShape.counter++;
  }

  draw(ctx: CanvasRenderingContext2D) {}
}

class Line extends AbstractShape implements Shape {
  constructor(readonly from: Point2D, readonly to: Point2D) {
    super();
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.moveTo(this.from.x, this.from.y);
    ctx.lineTo(this.to.x, this.to.y);
    ctx.stroke();
  }
}

class Circle extends AbstractShape implements Shape {
  constructor(readonly center: Point2D, readonly radius: number) {
    super();
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.center.x, this.center.y, this.radius, 0, 2 * Math.PI);
    ctx.stroke();
  }
}

class Rectangle extends AbstractShape implements Shape {
  readonly width: number;
  readonly height: number;

  constructor(readonly from: Point2D, readonly to: Point2D) {
    super();
    this.width = to.x - from.x;
    this.height = to.y - from.y;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.strokeRect(this.from.x, this.from.y, this.width, this.height);
  }
}

class Triangle extends AbstractShape implements Shape {
  constructor(
    readonly p1: Point2D,
    readonly p2: Point2D,
    readonly p3: Point2D
  ) {
    super();
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.moveTo(this.p1.x, this.p1.y);
    ctx.lineTo(this.p2.x, this.p2.y);
    ctx.lineTo(this.p3.x, this.p3.y);
    ctx.lineTo(this.p1.x, this.p1.y);
    ctx.stroke();
  }
}

class TextShape extends AbstractShape implements Shape {
  constructor(readonly from: Point2D, readonly text: string) {
    super();
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillText(this.text, this.from.x, this.from.y);
  }
}

interface ShapeManager {
  addShape(shape: Shape, redraw?: boolean): this;
  removeShape(shape: Shape, redraw?: boolean): this;
  removeShapeById(id: number, redraw?: boolean): this;
}

class Canvas implements ShapeManager {
  ctx: CanvasRenderingContext2D;
  shapes: Shape[];

  constructor(readonly canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d');
    this.shapes = [];
  }

  addShape(shape: Shape, redraw?: boolean): this {
    this.shapes.push(shape);
    if (redraw) {
      this.draw();
    } else {
      return this;
    }
  }

  removeShape(shape: Shape, redraw?: boolean): this {
    this.shapes.splice(this.shapes.indexOf(shape), 1);
    if (redraw) {
      this.draw();
    } else {
      return this;
    }
  }

  removeShapeById(id: number, redraw?: boolean): this {
    let index: number;
    for (let i = 0; i < this.shapes.length; i++) {
      if (this.shapes[i].id === id) {
        index = i;
        break;
      }
    }
    this.shapes.splice(index, 1);
    if (redraw) {
      this.draw();
    } else {
      return this;
    }
  }

  draw(): this {
    // Reset canvas
    this.ctx.beginPath();
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    this.ctx.stroke();

    this.ctx.font = '42px Consolas';

    // Draw shapes
    this.ctx.fillStyle = 'black';
    for (let id in this.shapes) {
      this.shapes[id].draw(this.ctx);
    }
    return this;
  }
}

interface ShapeFactory {
  label: string;
  handleMouseDown(x: number, y: number): void;
  handleMouseUp(x: number, y: number): void;
  handleMouseMove(x: number, y: number): void;
}

abstract class AbstractFactory<T extends Shape> {
  private from: Point2D;
  private tmpTo: Point2D;
  private tmpShape: T;

  constructor(readonly shapeManager: ShapeManager) {}

  abstract createShape(from: Point2D, to: Point2D): T;

  handleMouseDown(x: number, y: number) {
    this.from = new Point2D(x, y);
  }

  handleMouseUp(x: number, y: number) {
    // Remove temporary line
    if (this.tmpShape) {
      this.shapeManager.removeShapeById(this.tmpShape.id, false);
    }

    this.shapeManager.addShape(
      this.createShape(this.from, new Point2D(x, y)),
      true
    );
    this.from = undefined;
  }

  handleMouseMove(x: number, y: number) {
    if (!this.from) {
      return;
    }

    if (!this.tmpTo || this.tmpTo.x !== x || this.tmpTo.y !== y) {
      this.tmpTo = new Point2D(x, y);

      if (this.tmpShape) {
        this.shapeManager.removeShapeById(this.tmpShape.id, false);
      }

      // Add new temporary shape
      this.tmpShape = this.createShape(this.from, new Point2D(x, y));
      this.shapeManager.addShape(this.tmpShape);
    }
  }
}

class LineFactory extends AbstractFactory<Line> implements ShapeFactory {
  public label: string = 'Linie';

  constructor(shapeManager: ShapeManager) {
    super(shapeManager);
  }

  createShape(from: Point2D, to: Point2D): Line {
    return new Line(from, to);
  }
}

class CircleFactory extends AbstractFactory<Circle> implements ShapeFactory {
  public label: string = 'Kreis';

  constructor(shapeManager: ShapeManager) {
    super(shapeManager);
  }

  createShape(from: Point2D, to: Point2D): Circle {
    return new Circle(
      from,
      Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2))
    );
  }
}

class RectangleFactory extends AbstractFactory<Rectangle>
  implements ShapeFactory {
  public label: string = 'Rechteck';

  constructor(shapeManager: ShapeManager) {
    super(shapeManager);
  }

  createShape(from: Point2D, to: Point2D): Rectangle {
    return new Rectangle(from, to);
  }
}

class TriangleFactory implements ShapeFactory {
  public label: string = 'Dreieck';
  private p1: Point2D = undefined;
  private p2: Point2D = undefined;

  constructor(readonly shapeManager: ShapeManager) {}

  handleMouseDown(x: number, y: number): void {}

  handleMouseUp(x: number, y: number): void {
    if (!this.p1) {
      this.p1 = new Point2D(x, y);
    } else if (!this.p2) {
      this.p2 = new Point2D(x, y);
    } else {
      this.shapeManager.addShape(
        new Triangle(this.p1, this.p2, new Point2D(x, y)),
        true
      );
      this.p1 = undefined;
      this.p2 = undefined;
    }
  }

  handleMouseMove(x: number, y: number): void {}
}

class TextFactory implements ShapeFactory {
  public label: string = 'Text';

  constructor(readonly shapeManager: ShapeManager) {}

  handleMouseDown(x: number, y: number): void {}

  handleMouseUp(x: number, y: number): void {
    this.shapeManager.addShape(
      new TextShape(new Point2D(x, y), (textInput as HTMLInputElement).value),
      true
    );
  }

  handleMouseMove(x: number, y: number): void {}
}

class ToolArea {
  private selectedTool: ShapeFactory = undefined;

  constructor(toolSelector: ShapeFactory[], menu: Element) {
    const domElems = [];

    toolSelector.forEach((tool) => {
      const domSelectionElem = document.createElement('li');
      domSelectionElem.innerText = tool.label;
      menu.appendChild(domSelectionElem);
      domElems.push(domSelectionElem);

      domSelectionElem.addEventListener('click', () => {
        selectFactory.call(this, tool, domSelectionElem);
      });
    });

    function selectFactory(tool: ShapeFactory, domElem: HTMLElement) {
      this.selectedTool = tool;

      domElems.forEach((element) => {
        if (element.classList.contains('selected')) {
          element.classList.remove('selected');
        }
      });

      domElem.classList.add('selected');
    }
  }

  getSelectedTool(): ShapeFactory {
    return this.selectedTool;
  }
}

const canvas: HTMLCanvasElement = <HTMLCanvasElement>(
  document.getElementById('canvas')
);
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
const textInput = document.getElementById('textInput');

const app = new Canvas(canvas);
const toolArea = new ToolArea(
  [
    new LineFactory(app),
    new CircleFactory(app),
    new RectangleFactory(app),
    new TriangleFactory(app),
    new TextFactory(app),
  ],
  document.getElementById('toolArea')
);

canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('mouseup', handleMouseUp);

function handleMouseDown(ev: MouseEvent): void {
  toolArea
    .getSelectedTool()
    .handleMouseDown(ev.pageX - canvas.offsetLeft, ev.pageY - canvas.offsetTop);
}

function handleMouseUp(ev: MouseEvent): void {
  toolArea
    .getSelectedTool()
    .handleMouseUp(ev.pageX - canvas.offsetLeft, ev.pageY - canvas.offsetTop);
}
