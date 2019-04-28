import Constants from './constants.js';
import { extinctionSymbolPath } from './extinction.js';
import { parsePath } from './path.js';

const lerp1d = (a, b, t) => {
    return a + (b - a) * t;
};

const lerpv = (a, b, t) => {
    const lerped = a.slice();
    for (let i = 0; i < a.length; i++) {
        lerped[i] = lerp1d(a[i], b[i], t);
    }
    return lerped;
};

const lerpBezier = (p0, p1, p2, p3, t) => {
    const a = lerpv(p0, p1, t);
    const b = lerpv(p1, p2, t);
    const c = lerpv(p2, p3, t);
    const d = lerpv(a, b, t);
    const e = lerpv(b, c, t);
    const pointOnCurve = lerpv(d, e, t);

    const c1 = a;
    const c2 = d;

    return [...c1, ...c2, ...pointOnCurve];
};

const SUBDIVISIONS = 20;

const preprocessPath = (path) => {
    for (let i = path.length - 1; i >= 1; i--) {
        const currentCommand = path[i];
        const prevCommand = path[i - 1];
        const nextCommand = i < path.length - 1 ? path[i + 1] : null;
        const prevValues = prevCommand.values.slice(-2);
        const newCommands = [];

        if (currentCommand.commandName === 'closePath') {
            path.splice(i, 1);
        } else if (currentCommand.commandName === 'lineTo') {
            for (let l = 1/SUBDIVISIONS; l < 1; l += 1/SUBDIVISIONS) {
                newCommands.push({
                    commandName: 'lineTo',
                    values: lerpv(prevValues, currentCommand.values, l)
                });
            }
        } else if (currentCommand.commandName === 'bezierCurveTo') {
            for (let l = 1/SUBDIVISIONS, i = 0; l < 1; l += 1/SUBDIVISIONS, i++) {

                newCommands.push({
                    commandName: 'moveTo',
                    values: prevValues
                });

                newCommands.push({
                        commandName: 'bezierCurveTo',
                        values: lerpBezier(prevValues,
                                        currentCommand.values.slice(0, 2),
                                        currentCommand.values.slice(2, 4),
                                        currentCommand.values.slice(4, 6), l)
                });
            }

            newCommands.push({
                commandName: 'moveTo',
                values: prevValues
            });
        }

        path.splice(i, 0, ...newCommands);
    }

    return path;
}

const XRSymbol = preprocessPath(parsePath(extinctionSymbolPath));
console.info(XRSymbol);

const canvas = document.getElementById('canvas');
canvas.width = Constants.H;
canvas.height = Constants.W;

const c = canvas.getContext('2d');
c.fillStyle = 'white';

const SPEED = 1e-1;

const main = (time) => {
    c.clearRect(0, 0, canvas.width, canvas.height);

    const progress = (time * SPEED) % XRSymbol.length;
    const level = Math.floor(progress);

    c.strokeStyle = 'white';
    c.lineWidth = 5;
    c.beginPath();
    XRSymbol.slice(0, level).forEach(command => c[command.commandName](...command.values));
    c.stroke();

    // c.fillStyle = `rgba(255, 255, 255, ${progress / XRSymbol.length})`;
    // c.fill('evenodd');
};

const render = t => (main(t), requestAnimationFrame(render));
requestAnimationFrame(render);
