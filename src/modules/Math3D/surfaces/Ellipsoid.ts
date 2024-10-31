import Point from "../entities/Point";
import Edge from "../entities/Edge";
import Polygon from "../entities/Polygon";
import Surface from "../entities/Surface";

class Ellipsoid extends Surface {
    constructor({
        a = 10, b = 5, c = 7, count = 20, color = "#00ffd5", x = 0, y = 0, z = 0
    } = {}) {
        Polygon.resetIdCounter();
        super();
        const points = [];
        const edges = [];
        const polygons = [];

        // Создание точек эллипсоида
        for (let i = 0; i <= count; i++) {
            const T = (Math.PI / count) * i; 
            for (let j = 0; j <= count; j++) { // Увеличиваем диапазон до count включительно
                const p = ((2 * Math.PI) / count) * j;
                points.push(new Point(
                    a * Math.sin(T) * Math.cos(p) + x, 
                    c * Math.cos(T) + y, 
                    b * Math.sin(T) * Math.sin(p) + z
                ));
            }
        }

        // Создание рёбер эллипсоида
        for (let i = 0; i < points.length; i++) {
            if ((i + 1) % (count + 1) !== 0) { // Учёт нового диапазона
                edges.push(new Edge(i, i + 1));
            } else {
                edges.push(new Edge(i, i + 1 - (count + 1)));
            }
            if (i + (count + 1) < points.length) {
                edges.push(new Edge(i, i + (count + 1)));
            }
        }

        // Создание полигонов эллипсоида
        for (let i = 0; i < points.length - (count + 1); i++) {
            if ((i + 1) % (count + 1) !== 0) {
                polygons.push(new Polygon(
                    [i, i + 1, i + 1 + (count + 1), i + (count + 1)],
                    color
                ));
            }
        }

        this.points = points;
        this.edges = edges;
        this.polygons = polygons;
    }
}

export default Ellipsoid;
