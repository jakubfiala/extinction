import Constants from './constants.js';

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

const randomGreen = () => {
    const r = Math.floor(Math.random() * 50 + 10);
    const g = Math.floor(Math.random() * 50 + 105);
    const b = Math.floor(Math.random() * 50 + 10);
    return `rgb(${r}, ${g}, ${b})`;
};

const randomGrowthNormal = () => {
    return {
        x: Math.random() * 1.5 - 0.75,
        y: -1,
    };
};

const randomGrowthSize = () => Math.random() * 30 + 7;

const BENDINESS = 10;

const smoothQuadCurveTo = (c, x0, y0, cx, cy, x, y, lw1, lw2) => {
    const lwmid = lerp1d(lw1, lw2, 0.5);
    c.moveTo(x0 + lw1, y0 + lw1);
    c.quadraticCurveTo(
        cx + lwmid,
        cy + lwmid,
        x + lw2, y + lw2);
    c.lineTo(x - lw2 * 2, y - lw2 * 2);
    c.quadraticCurveTo(
        cx - lwmid * 2,
        cy - lwmid * 2,
        x0 - lw1, y0 - lw1);
    c.closePath();
    c.fill();
};

const randomGrowth = (c, x, y) => {
    c.fillStyle = randomGreen();
    c.beginPath();

    const normal = randomGrowthNormal();
    const bendNormal = randomGrowthNormal();
    const growthSize = randomGrowthSize();
    const x1 = x + normal.x * growthSize;
    const y1 = y + normal.y * growthSize;

    smoothQuadCurveTo(c, x, y,
        lerp1d(x, x1, 0.5) + bendNormal.x * BENDINESS,
        lerp1d(y, y1, 0.5) + bendNormal.y * BENDINESS,
        x1, y1, 0.5, 1);

    const x2 = x1 + normal.x * growthSize;
    const y2 = y1 + normal.y * growthSize;

    smoothQuadCurveTo(c, x1, y1,
        lerp1d(x1, x2, 0.5) - bendNormal.x * BENDINESS,
        lerp1d(y1, y2, 0.5) - bendNormal.y * BENDINESS,
        x2, y2, 1, 2);

    const x3 = x2 + normal.x * growthSize / 2;
    const y3 = y2 + normal.y * growthSize / 2;

    smoothQuadCurveTo(c, x2, y2,
        lerp1d(x2, x3, 0.5) + bendNormal.x * BENDINESS / 2,
        lerp1d(y2, y3, 0.5) + bendNormal.y * BENDINESS / 2,
        x3, y3, 2, 0.5);

    return [ x2, y2 ];
}

const symbolImage = new Image();

const canvas = document.getElementById('canvas');
canvas.width = Constants.H;
canvas.height = Constants.W;

const c = canvas.getContext('2d');

const main = (time) => {
    // c.clearRect(0, 0, canvas.width, canvas.height);
};

const render = t => (main(t), requestAnimationFrame(render));

symbolImage.addEventListener('load', () => {
    c.drawImage(symbolImage, 50, 75);
    const pixels = c.getImageData(0, 0, canvas.width, canvas.height).data;

    const symbolPixelCoords = [];
    for (let p = 0; p < pixels.length; p += 4) {
        const value = pixels[p + 3];
        if (value > 0 && Math.random() > 0.99) {
            const x = p / 4 % canvas.width;
            const y = Math.floor(p / 4 / canvas.width);
            randomGrowth(c, x, y);

            symbolPixelCoords.push({ x, y });
        }
    }

    requestAnimationFrame(render);
});
symbolImage.src = './extinctionsymbol.svg';
