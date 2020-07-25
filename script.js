var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Point2D = /** @class */ (function () {
    function Point2D(x, y) {
        this.x = x;
        this.y = y;
    }
    return Point2D;
}());
var AbstractShape = /** @class */ (function () {
    function AbstractShape() {
        this.id = AbstractShape.counter++;
    }
    AbstractShape.prototype.draw = function (ctx) { };
    return AbstractShape;
}());
var Line = /** @class */ (function (_super) {
    __extends(Line, _super);
    function Line(from, to) {
        var _this = _super.call(this) || this;
        _this.from = from;
        _this.to = to;
        return _this;
    }
    Line.prototype.draw = function (ctx) {
        ctx.moveTo(this.from.x, this.from.y);
        ctx.lineTo(this.to.x, this.to.y);
        ctx.stroke();
    };
    return Line;
}(AbstractShape));
var Circle = /** @class */ (function (_super) {
    __extends(Circle, _super);
    function Circle(center, radius) {
        var _this = _super.call(this) || this;
        _this.center = center;
        _this.radius = radius;
        return _this;
    }
    Circle.prototype.draw = function (ctx) {
        ctx.beginPath();
        ctx.arc(this.center.x, this.center.y, this.radius, 0, 2 * Math.PI);
        ctx.stroke();
    };
    return Circle;
}(AbstractShape));
var Rectangle = /** @class */ (function (_super) {
    __extends(Rectangle, _super);
    function Rectangle(from, to) {
        var _this = _super.call(this) || this;
        _this.from = from;
        _this.to = to;
        _this.width = to.x - from.x;
        _this.height = to.y - from.y;
        return _this;
    }
    Rectangle.prototype.draw = function (ctx) {
        ctx.beginPath();
        ctx.strokeRect(this.from.x, this.from.y, this.width, this.height);
    };
    return Rectangle;
}(AbstractShape));
var Triangle = /** @class */ (function (_super) {
    __extends(Triangle, _super);
    function Triangle(p1, p2, p3) {
        var _this = _super.call(this) || this;
        _this.p1 = p1;
        _this.p2 = p2;
        _this.p3 = p3;
        return _this;
    }
    Triangle.prototype.draw = function (ctx) {
        ctx.beginPath();
        ctx.moveTo(this.p1.x, this.p1.y);
        ctx.lineTo(this.p2.x, this.p2.y);
        ctx.lineTo(this.p3.x, this.p3.y);
        ctx.lineTo(this.p1.x, this.p1.y);
        ctx.stroke();
    };
    return Triangle;
}(AbstractShape));
var TextShape = /** @class */ (function (_super) {
    __extends(TextShape, _super);
    function TextShape(from, text) {
        var _this = _super.call(this) || this;
        _this.from = from;
        _this.text = text;
        return _this;
    }
    TextShape.prototype.draw = function (ctx) {
        ctx.fillText(this.text, this.from.x, this.from.y);
    };
    return TextShape;
}(AbstractShape));
var Canvas = /** @class */ (function () {
    function Canvas(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.shapes = [];
    }
    Canvas.prototype.addShape = function (shape, redraw) {
        this.shapes.push(shape);
        if (redraw) {
            this.draw();
        }
        else {
            return this;
        }
    };
    Canvas.prototype.removeShape = function (shape, redraw) {
        this.shapes.splice(this.shapes.indexOf(shape), 1);
        if (redraw) {
            this.draw();
        }
        else {
            return this;
        }
    };
    Canvas.prototype.removeShapeById = function (id, redraw) {
        var index;
        for (var i = 0; i < this.shapes.length; i++) {
            if (this.shapes[i].id === id) {
                index = i;
                break;
            }
        }
        this.shapes.splice(index, 1);
        if (redraw) {
            this.draw();
        }
        else {
            return this;
        }
    };
    Canvas.prototype.draw = function () {
        // Reset canvas
        this.ctx.beginPath();
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        this.ctx.stroke();
        this.ctx.font = '42px Consolas';
        // Draw shapes
        this.ctx.fillStyle = 'black';
        for (var id in this.shapes) {
            this.shapes[id].draw(this.ctx);
        }
        return this;
    };
    return Canvas;
}());
var AbstractFactory = /** @class */ (function () {
    function AbstractFactory(shapeManager) {
        this.shapeManager = shapeManager;
    }
    AbstractFactory.prototype.handleMouseDown = function (x, y) {
        this.from = new Point2D(x, y);
    };
    AbstractFactory.prototype.handleMouseUp = function (x, y) {
        // Remove temporary line
        if (this.tmpShape) {
            this.shapeManager.removeShapeById(this.tmpShape.id, false);
        }
        this.shapeManager.addShape(this.createShape(this.from, new Point2D(x, y)), true);
        this.from = undefined;
    };
    AbstractFactory.prototype.handleMouseMove = function (x, y) {
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
    };
    return AbstractFactory;
}());
var LineFactory = /** @class */ (function (_super) {
    __extends(LineFactory, _super);
    function LineFactory(shapeManager) {
        var _this = _super.call(this, shapeManager) || this;
        _this.label = 'Linie';
        return _this;
    }
    LineFactory.prototype.createShape = function (from, to) {
        return new Line(from, to);
    };
    return LineFactory;
}(AbstractFactory));
var CircleFactory = /** @class */ (function (_super) {
    __extends(CircleFactory, _super);
    function CircleFactory(shapeManager) {
        var _this = _super.call(this, shapeManager) || this;
        _this.label = 'Kreis';
        return _this;
    }
    CircleFactory.prototype.createShape = function (from, to) {
        return new Circle(from, Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2)));
    };
    return CircleFactory;
}(AbstractFactory));
var RectangleFactory = /** @class */ (function (_super) {
    __extends(RectangleFactory, _super);
    function RectangleFactory(shapeManager) {
        var _this = _super.call(this, shapeManager) || this;
        _this.label = 'Rechteck';
        return _this;
    }
    RectangleFactory.prototype.createShape = function (from, to) {
        return new Rectangle(from, to);
    };
    return RectangleFactory;
}(AbstractFactory));
var TriangleFactory = /** @class */ (function () {
    function TriangleFactory(shapeManager) {
        this.shapeManager = shapeManager;
        this.label = 'Dreieck';
        this.p1 = undefined;
        this.p2 = undefined;
    }
    TriangleFactory.prototype.handleMouseDown = function (x, y) { };
    TriangleFactory.prototype.handleMouseUp = function (x, y) {
        if (!this.p1) {
            this.p1 = new Point2D(x, y);
        }
        else if (!this.p2) {
            this.p2 = new Point2D(x, y);
        }
        else {
            this.shapeManager.addShape(new Triangle(this.p1, this.p2, new Point2D(x, y)), true);
            this.p1 = undefined;
            this.p2 = undefined;
        }
    };
    TriangleFactory.prototype.handleMouseMove = function (x, y) { };
    return TriangleFactory;
}());
var TextFactory = /** @class */ (function () {
    function TextFactory(shapeManager) {
        this.shapeManager = shapeManager;
        this.label = 'Text';
    }
    TextFactory.prototype.handleMouseDown = function (x, y) { };
    TextFactory.prototype.handleMouseUp = function (x, y) {
        this.shapeManager.addShape(new TextShape(new Point2D(x, y), textInput.value), true);
    };
    TextFactory.prototype.handleMouseMove = function (x, y) { };
    return TextFactory;
}());
var ToolArea = /** @class */ (function () {
    function ToolArea(toolSelector, menu) {
        var _this = this;
        this.selectedTool = undefined;
        var domElems = [];
        toolSelector.forEach(function (tool) {
            var domSelectionElem = document.createElement('li');
            domSelectionElem.innerText = tool.label;
            menu.appendChild(domSelectionElem);
            domElems.push(domSelectionElem);
            domSelectionElem.addEventListener('click', function () {
                selectFactory.call(_this, tool, domSelectionElem);
            });
        });
        function selectFactory(tool, domElem) {
            this.selectedTool = tool;
            domElems.forEach(function (element) {
                if (element.classList.contains('selected')) {
                    element.classList.remove('selected');
                }
            });
            domElem.classList.add('selected');
        }
    }
    ToolArea.prototype.getSelectedTool = function () {
        return this.selectedTool;
    };
    return ToolArea;
}());
var canvas = (document.getElementById('canvas'));
var canvasWidth = canvas.width;
var canvasHeight = canvas.height;
var textInput = document.getElementById('textInput');
var app = new Canvas(canvas);
var toolArea = new ToolArea([
    new LineFactory(app),
    new CircleFactory(app),
    new RectangleFactory(app),
    new TriangleFactory(app),
    new TextFactory(app),
], document.getElementById('toolArea'));
canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('mouseup', handleMouseUp);
function handleMouseDown(ev) {
    toolArea
        .getSelectedTool()
        .handleMouseDown(ev.pageX - canvas.offsetLeft, ev.pageY - canvas.offsetTop);
}
function handleMouseUp(ev) {
    toolArea
        .getSelectedTool()
        .handleMouseUp(ev.pageX - canvas.offsetLeft, ev.pageY - canvas.offsetTop);
}
