import Constants from './constants.js';
import { extinctionSymbolPath } from './extinction.js';
import { parsePath } from './path.js';

const lerp1d = (a, b, t) => {
    return a + (b - a) * t;
};

const SUBDIVISIONS = 20;

const preprocessPath = (path) => {
    for (let i = path.length - 1; i >= 0; i--) {
        const currentCommand = path[i];
        const prevCommand = path[i - 1];

        if (currentCommand.commandName === 'lineTo') {
            const curX = currentCommand.values[currentCommand.values.length - 2];
            const curY = currentCommand.values[currentCommand.values.length - 1];
            const prevX = prevCommand.values[prevCommand.values.length - 2];
            const prevY = prevCommand.values[prevCommand.values.length - 1];
            if (isNaN(curY)) {
                console.log(currentCommand);
            }

            const newCommands = [];
            for (let l = 1/SUBDIVISIONS; l < 1; l += 1/SUBDIVISIONS) {
                newCommands.push({
                    commandName: 'lineTo',
                    values: [
                        lerp1d(prevX, curX, l),
                        lerp1d(prevY, curY, l)
                    ]
                });
            }
            path.splice(i, 0, ...newCommands);
        }
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

const SPEED = 1e-2;

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
