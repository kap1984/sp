import React, { useRef, useEffect, useState } from "react";
import Math3D from "../../modules/Math3D/Math3D";
import useGraph from "../../modules/Graph/useGraph";
import Graph, { TWIN3D } from "../../modules/Graph/Graph";
import Point from "../../modules/Math3D/entities/Point";
import Light from "../../modules/Math3D/entities/Light";
import Sphere from "../../modules/Math3D/surfaces/sphere";
import Torus from "../../modules/Math3D/surfaces/torus";
import Ellipsoid from "../../modules/Math3D/surfaces/Ellipsoid";
import EllipticalCylinder from "../../modules/Math3D/surfaces/EllipticalCylinder";
import EllipticalParaboloid from "../../modules/Math3D/surfaces/EllipticalParaboloid";
import HyperbolicParaboloid from "../../modules/Math3D/surfaces/HyperbolicParaboloid";
import Cone from "../../modules/Math3D/surfaces/cone";
import HyperbolicCylinder from "../../modules/Math3D/surfaces/HyperbolicCylinder";
import OneWayHyperboloid from "../../modules/Math3D/surfaces/OneWayHyperboloid";
import TwoSheetHyperboloid from "../../modules/Math3D/surfaces/TwoSheetHyperboloid";
import Cube from "../../modules/Math3D/surfaces/cube";
import ParabolidCylinder from "../../modules/Math3D/surfaces/ParabolidCylinder";
import Surface from "../../modules/Math3D/entities/Surface";
import Polygon, { EDistance } from "../../modules/Math3D/entities/Polygon";

import './Graph3D.css';

const Graph3D: React.FC = () => {
    const graph3DViewPointsRef = useRef<HTMLInputElement>(null);
    const graph3DViewEdgesRef = useRef<HTMLInputElement>(null);
    const polygonsOnly = useRef<HTMLInputElement>(null);
    const graph3DRotateLightRef = useRef<HTMLInputElement>(null);
    const showPolygonIdsRef = useRef<HTMLInputElement>(null);
    const WIN: TWIN3D = {
        LEFT: -5,
        BOTTOM: -5,
        WIDTH: 10,
        HEIGHT: 10,
        CENTER: new Point(0, 0, -40),
        CAMERA: new Point(0, 0, -50),
    };

    let graph: Graph | null = null;
    const [getGraph, cancelGraph] = useGraph(renderScene);
    const graphRef = useRef<Graph | null>(null);
    const math3D = new Math3D(WIN);
    const LIGHT = new Light(-30, 20, -30, 1500);
    const gradus = Math.PI / 180 / 4;
    const zoomStep = 0.1;
    const moveStep = 4;
    let canMove = false;
    let mouseButton: number;
    let dx = 0;
    let dy = 0;
    let viewShadows = false;
    let initialRotationOX = math3D.rotateOX(0);
    let initialRotationOY = math3D.rotateOY(0);

    const [scene, setScene] = useState<Surface[]>([new Sphere({})]);
    const [viewPoints, setViewPoints] = React.useState(true);
    const [viewEdges, setViewEdges] = React.useState(true);
    const [viewPolygons, setViewPolygons] = React.useState(true);
    const [showPolygonIds, setShowPolygonIds] = useState(false);
    const [polygonIdInput, setPolygonIdInput] = useState<string>('');
    const [selectedForm, setSelectedForm] = useState("sphere");
    const [highlightedPolygonIds, setHighlightedPolygonIds] = useState<number[]>([]);


    const transformationsRef = useRef<any>(null);

    function saveTransformations() {
        transformationsRef.current = scene.map(surface => {
            const pointsCopy = surface.points.map(point => ({ ...point }));
            const centerCopy = { ...surface.center };
            return { points: pointsCopy, center: centerCopy };
        });
    }

    function applyTransformations() {
        if (!transformationsRef.current) return;
        scene.map((surface, index) => { const savedTransform = transformationsRef.current[index];
            if (savedTransform) {
                surface.points.forEach((point, i) => {
                    point.x = savedTransform.points[i].x;
                    point.y = savedTransform.points[i].y;
                    point.z = savedTransform.points[i].z;
                });
                surface.center.x = savedTransform.center.x;
                surface.center.y = savedTransform.center.y;
                surface.center.z = savedTransform.center.z;
            }
            return surface;
        });
    }
    
    function updateScene(type: string) {
        const previousForm = selectedForm;
        setSelectedForm(type);

        if (previousForm !== type) {
            transformationsRef.current = null;
            setScene([createSurface(type)]);
        } else {
            saveTransformations();
            applyTransformations();
            math3D.rotateOX = () => initialRotationOX;
            math3D.rotateOY = () => initialRotationOY;
            setScene([...scene]);
        }
        
    }

    function createSurface(type: string): Surface {
        switch (type) {
            case "sphere":
                return new Sphere({});
            case "torus":
                return new Torus({});
            case "Ellipsoid":
                return new Ellipsoid({});
            case "EllipticalCylinder":
                return new EllipticalCylinder({});
            case "EllipticalParaboloid":
                return new EllipticalParaboloid({});
            case "HyperbolicParaboloid":
                return new HyperbolicParaboloid({});
            case "cone":
                return new Cone({});
            case "HyperbolicCylinder":
                return new HyperbolicCylinder({});
            case "OneWayHyperboloid":
                return new OneWayHyperboloid({});
            case "TwoSheetHyperboloid":
                return new TwoSheetHyperboloid({});
            case "cube":
                return new Cube({});
            case "ParabolidCylinder":
                return new ParabolidCylinder({});
            default:
                return new Sphere({});
        }
    }
    
    

    function wheelHandler(event: WheelEvent) {
        event.preventDefault();
        const delta = event.deltaY > 0 ? 1 - zoomStep : 1 + zoomStep;
        const T = math3D.zoom(delta);
        scene.forEach(surface => {
            surface.points.forEach(point => math3D.transform(point, T));
            math3D.transform(surface.center, T);
        });
    }

    function mouseupHandler() {
        canMove = false;
    }

    function mousedownHandler(event: MouseEvent) {
        event.preventDefault();
        canMove = true;
        mouseButton = event.button;
    }

    function mousemoveHandler(event: MouseEvent) {
        event.preventDefault();
        if (canMove) {
            switch (mouseButton) {
                case 0: {
                    let alphaY = 0, alphaX = 0;
                    if (dy !== event.offsetY) {
                        alphaX = (dy - event.offsetY) * gradus;
                    }
                    if (dx !== event.offsetX) {
                        alphaY = (dx - event.offsetX) * gradus;
                    }
                    const T1 = math3D.rotateOX(alphaX);
                    const T2 = math3D.rotateOY(alphaY);
                    const T = math3D.getTransform(T1, T2);
                    scene.forEach(surface => {
                        surface.points.forEach(point => math3D.transform(point, T));
                        math3D.transform(surface.center, T);
                    });
                    if (graph3DRotateLightRef?.current?.checked) {
                        math3D.transform(LIGHT, T);
                    }
                    break;
                }
                case 1: {
                    if (!graph) {
                        return;
                    }
                    const T = math3D.move(0, graph.sy(event.movementY) * moveStep);
                    scene.forEach(surface => {
                        surface.points.forEach(point => math3D.transform(point, T));
                        math3D.transform(surface.center, T);
                    });
                    if (graph3DRotateLightRef?.current?.checked) {
                        math3D.transform(LIGHT, T);
                    }
                    break;
                }
                case 2: {
                    if (!graph) {
                        return;
                    }
                    const T = math3D.move(graph.sx(event.movementX) * moveStep);
                    scene.forEach(surface => {
                        surface.points.forEach(point => math3D.transform(point, T));
                        math3D.transform(surface.center, T);
                    });
                    if (graph3DRotateLightRef?.current?.checked) {
                        math3D.transform(LIGHT, T);
                    }
                    break;
                }
            }
        }
        dy = event.offsetY;
        dx = event.offsetX;
    }

    function mouseoutHandler() {
        canMove = false;
    }

    function renderScene(FPS = 0) {
        const graph = graphRef.current;
        if (!graph) {
            return;
        }
        graph.clear();
        scene.forEach((surface) => {
            if (polygonsOnly?.current?.checked) {
                const polygons: Polygon[] = [];
                scene.forEach((surface, index) => {
                    math3D.calcCenter(surface);
                    math3D.calcDistance(surface, WIN.CAMERA, EDistance.distance);
                    math3D.calcDistance(surface, LIGHT, EDistance.lumen);
                    surface.polygons.forEach(polygon => {
                        polygon.index = index;
                        polygons.push(polygon);
                    })
                });
                math3D.sortByArtistAlgorithm(polygons);
                polygons.forEach(polygon => {
                    if (polygon.visibility) {
                        const points = polygon.points.map(index => new Point(
                            math3D.xs(scene[polygon.index].points[index]),
                            math3D.ys(scene[polygon.index].points[index])
                        ));
                        let { r, g, b } = polygon.color;
                        const { isShadow, dark } = (viewShadows) ?
                            math3D.calcShadow(polygon, scene, LIGHT) :
                            { isShadow: false, dark: 1 };
                        const lumen = math3D.calcIllumination(polygon.lumen,
                            LIGHT.lumen) * (isShadow && dark ? dark : 1);
                        r = Math.round(r * lumen);
                        g = Math.round(g * lumen);
                        b = Math.round(b * lumen);
                        const isMatchingId = highlightedPolygonIds.includes(Number(polygon.id));
                        graph && graph.polygon(points, polygon.rgbToHex(isMatchingId ? 0 : r, isMatchingId ? 0 : g, isMatchingId ? 0 : b));

                        if (showPolygonIdsRef?.current?.checked) {
                            const centerX = math3D.xs(polygon.center);
                            const centerY = math3D.ys(polygon.center);
                            graph && graph.text(polygon.id, centerX, centerY, 'black', '11');
                        }
                    }
                });
            }
            
            if (graph3DViewEdgesRef?.current?.checked) {
                surface.edges.forEach(edge => {
                    const point1 = surface.points[edge.p1];
                    const point2 = surface.points[edge.p2];
                    graph && graph.line(
                        math3D.xs(point1), math3D.ys(point1),
                        math3D.xs(point2), math3D.ys(point2)
                    );
                });
            }

            if (graph3DViewPointsRef?.current?.checked) {
                graph && graph.pointLite(math3D.xs(surface.center), math3D.ys(surface.center), 'red')
                surface.points.forEach(
                    point => graph && graph.pointLite(math3D.xs(point), math3D.ys(point))
                );
            }
        });
        graph.text(`fps: ${FPS}`, WIN.LEFT, WIN.BOTTOM - 1, 'black', '25');
        graph.renderFrame();
    }

    function parsePolygonIds(input: string): number[] {
        const ids = new Set<number>();
    
        input.split(',').forEach(part => {
            const trimmedPart = part.trim();
    
            if (trimmedPart.includes('-')) {
                const [start, end] = trimmedPart.split('-').map(Number);
                if (!isNaN(start) && !isNaN(end)) {
                    for (let i = start; i <= end; i++) {
                        ids.add(i);
                    }
                }
            } else {
                const id = parseInt(trimmedPart, 10);
                if (!isNaN(id)) {
                    ids.add(id);
                }
            }
        });
    
        return Array.from(ids);
    }
    
    useEffect(() => {
        graphRef.current = getGraph({
            id: 'Graph3D',
            WIN,
            width: 600,
            height: 600,
            callbacks: {
                wheel: wheelHandler,
                mousemove: mousemoveHandler,
                mouseup: mouseupHandler,
                mousedown: mousedownHandler,
                mouseout: mouseoutHandler,
            }
        });
        return () => {
            cancelGraph();
        };
    }, [scene]);

    const handleFormChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedForm(event.target.value);
        updateScene(event.target.value);
    };

    function handleIdInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        setPolygonIdInput(event.target.value);
        const ids = parsePolygonIds(event.target.value);
        setHighlightedPolygonIds(ids);
        updateScene(selectedForm);
    }

    return (<>
        <canvas id = "Graph3D"></canvas>
        <div id = 'css'>
            <label>
            <input 
                ref={graph3DViewPointsRef} 
                type="checkbox" 
                checked={viewPoints} 
                onChange={() => setViewPoints(!viewPoints)} 
            /> Отображать точки
            </label><br />
            <label>
            <input 
                ref={graph3DViewEdgesRef} 
                type="checkbox" 
                checked={viewEdges} 
                onChange={() => setViewEdges(!viewEdges)} 
            /> Отображать ребра
            </label><br />
            <label>
            <input 
                ref={polygonsOnly} 
                type="checkbox" 
                checked={viewPolygons} 
                onChange={() => setViewPolygons(!viewPolygons)} 
            /> Отображать полигоны
            </label><br />
            <label>
                    <input 
                        ref={showPolygonIdsRef} 
                        type="checkbox" 
                        checked={showPolygonIds} 
                        onChange={() => setShowPolygonIds(!showPolygonIds)} 
                    /> Отображать ID полигонов
            </label><br />
            <label>
            ᅠ   Закрасить полигон:
                    <input
                        type="text"
                        value={polygonIdInput}
                        onChange={handleIdInputChange}
                        placeholder="1, 2, 3... или 1-3"
                    /> 
            </label><br />
            <label>
                ᅠВыбор формы:
                <select onChange={handleFormChange} value={selectedForm}>
                    <option value="sphere">Сфера</option>
                    <option value="torus">Торус</option>
                    <option value="cone">Конус</option>
                    <option value="cube">Куб</option>
                    <option value="Ellipsoid">Эллипсоид</option>
                    <option value="EllipticalCylinder">Эллептический Цилиндр</option>
                    <option value="EllipticalParaboloid">Эллептический Парабалоид</option>
                    <option value="HyperbolicParaboloid">Гиперболический Парабалоид</option>
                    <option value="HyperbolicCylinder">Гиперболический Цилиндр</option>
                    <option value="OneWayHyperboloid">Однополостный Гиперболоид</option>
                    <option value="ParabolidCylinder">Параболический Цилиндр</option>
                    <option value="TwoSheetHyperboloid">Двуполостный Гиперболоид</option>
                </select>
            </label><br />
        </div>
    </>);
};
export default Graph3D;