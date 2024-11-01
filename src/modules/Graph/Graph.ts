import Point from "../Math3D/entities/Point";

export type TWIN2D = {
    LEFT: number;
    BOTTOM: number;
    WIDTH: number;
    HEIGHT: number;
}

export type TWIN3D = TWIN2D & {
    CENTER: Point;
    CAMERA: Point;
}

export type TWIN = TWIN2D;

export type TGraph = {
    id?: string;
    WIN: TWIN,
    width?: number;
    height?: number;
    callbacks: {
        wheel: (event: WheelEvent) => void;
        mousemove: (event: MouseEvent) => void;
        mousedown: (event: MouseEvent) => void;
        mouseup: () => void;
        mouseout: () => void;
    }
}

class Graph {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    canvasV: HTMLCanvasElement;
    ctxV: CanvasRenderingContext2D;
    WIN: TWIN;
    PI2 = Math.PI * 2;

    constructor({
        id = 'canvas',
        WIN,
        width = 500,
        height = 500,
        callbacks
    }: TGraph) {
        if (id) {
            this.canvas = document.getElementById(id) as HTMLCanvasElement;
        } else {
            this.canvas = document.createElement('canvas');
            document.querySelector('body')?.appendChild(this.canvas);
        }
        this.WIN = WIN;
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;

        if (callbacks) {
            this.canvas.addEventListener('wheel', callbacks.wheel);
            this.canvas.addEventListener('mousemove', callbacks.mousemove);
            this.canvas.addEventListener('mousedown', callbacks.mousedown);
            this.canvas.addEventListener('mouseup', callbacks.mouseup);
            this.canvas.addEventListener('mouseout', callbacks.mouseout);
        }
        this.canvas.addEventListener('contextmenu', (event) => event.preventDefault());

        this.canvasV = document.createElement('canvas');
        this.canvasV.width = width;
        this.canvasV.height = height;
        this.ctxV = this.canvasV.getContext('2d') as CanvasRenderingContext2D;
    }

    xs(x: number): number {
        return (this.canvas.width * (x - this.WIN.LEFT) / this.WIN.WIDTH);
    }
    ys(y: number): number {
        return (this.canvas.height - (this.canvas.height * (y - this.WIN.BOTTOM) / this.WIN.HEIGHT));
    }

    sx(x: number): number {
        return x * this.WIN.WIDTH / this.canvas.width;
    }
    sy(y: number): number {
        return -y * this.WIN.HEIGHT / this.canvas.height;
    }

    clear(): void {
        this.ctxV.fillStyle = 'white';
        this.ctxV.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    line(
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        color = 'black',
        width = 0.5,
        isDash = false
    ): void {
        this.ctxV.beginPath();
        this.ctxV.strokeStyle = color;
        this.ctxV.lineWidth = width || 3;
        if (isDash) {
            this.ctxV.setLineDash([10, 10]);
        } else {
            this.ctxV.setLineDash([0, 0]);
        }
        this.ctxV.moveTo(this.xs(x1), this.ys(y1));
        this.ctxV.lineTo(this.xs(x2), this.ys(y2));
        this.ctxV.closePath();
        this.ctxV.stroke();
    }

    text(
        text: string,
        x: number,
        y: number,
        color = 'black',
        size = '12',
        font = 'Arial'
    ): void {
        this.ctxV.beginPath();
        this.ctxV.font = `${size}px ${font}`;
        this.ctxV.fillStyle = color;
        this.ctxV.closePath();
        this.ctxV.fillText(text, this.xs(x), this.ys(y));
    }

    point(x: number, y: number, color = 'black', size = 1): void {
        this.ctxV.beginPath();
        this.ctxV.lineWidth = size;
        this.ctxV.strokeStyle = color;
        this.ctxV.arc(this.xs(x), this.ys(y), size, 0, this.PI2);
        this.ctxV.closePath();
        this.ctxV.stroke();
    }

    pointLite(x: number, y: number, color = 'black', size = 1.8): void {
        this.ctxV.beginPath();
        this.ctxV.lineWidth = size;
        this.ctxV.strokeStyle = color;
        this.ctxV.moveTo(this.xs(x) - size / 2, this.ys(y) - size / 2);
        this.ctxV.lineTo(this.xs(x) + size / 2, this.ys(y) - size / 2);
        this.ctxV.lineTo(this.xs(x) + size / 2, this.ys(y) + size / 2);
        this.ctxV.lineTo(this.xs(x) - size / 2, this.ys(y) + size / 2);
        this.ctxV.lineTo(this.xs(x) - size / 2, this.ys(y) - size / 2);
        this.ctxV.closePath();
        this.ctxV.stroke();
    }

    polygon(points: Omit<Point,'z'>[], color = '#000000', id?: string): void {
        this.ctxV.beginPath();
        this.ctxV.strokeStyle = color;
        this.ctxV.fillStyle = color;
        this.ctxV.lineWidth = 1;
        if (points.length > 2) {
            this.ctxV.moveTo(this.xs(points[0].x), this.ys(points[0].y));
            for (let i = 1; i < points.length; i++) {
                this.ctxV.lineTo(this.xs(points[i].x), this.ys(points[i].y));
            }
            this.ctxV.lineTo(this.xs(points[0].x), this.ys(points[0].y));
        }
        this.ctxV.closePath();
        this.ctxV.fill();
        this.ctxV.stroke();

        if (id) {
            const centerX = points.reduce((sum, point) => sum + point.x, 0) / points.length;
            const centerY = points.reduce((sum, point) => sum + point.y, 0) / points.length;
            this.text(id, centerX, centerY, 'red', '10', 'Arial');
        }
    }
    


    renderFrame() {
        this.ctx.drawImage(this.canvasV, 0, 0);
    }
}

export default Graph;