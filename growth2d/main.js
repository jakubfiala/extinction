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
    const r = Math.floor(Math.random() * 100);
    const g = Math.floor(Math.random() * 50 + 165);
    const b = Math.floor(Math.random() * 100);
    return `rgb(${r}, ${g}, ${b})`;
};

const randomGrowthNormal = () => {
    return {
        x: Math.random() * 1.3 - 0.65,
        y: -1,
    };
};

const BENDINESS = 6;

const randomGrowth = (c, x, y) => {
    const normal = randomGrowthNormal();
    const bendNormal = randomGrowthNormal();
    const growthSize = randomGrowthSize();
    const x1 = x + normal.x * growthSize;
    const y1 = y + normal.y * growthSize;

    c.beginPath();
    c.moveTo(x, y);
    c.lineWidth = 1;
    c.quadraticCurveTo(
        lerp1d(x, x1, 0.5) + bendNormal.x * BENDINESS,
        lerp1d(y, y1, 0.5) + bendNormal.y * BENDINESS,
        x1, y1);
    c.stroke();

    const x2 = x1 + normal.x * growthSize;
    const y2 = y1 + normal.y * growthSize;

    c.beginPath();
    c.moveTo(x1, y1);
    c.lineWidth = 2;
    c.quadraticCurveTo(
        lerp1d(x1, x2, 0.5) - bendNormal.x * BENDINESS,
        lerp1d(y1, y2, 0.5) - bendNormal.y * BENDINESS,
        x2, y2);
    c.stroke();

    return [ x2, y2 ];
}

const randomGrowthSize = () => Math.random() * 20 + 20;

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
        if (value > 0 && Math.random() > 0.995) {
            const x = p / 4 % canvas.width;
            const y = Math.floor(p / 4 / canvas.width);

            c.strokeStyle = randomGreen();
            randomGrowth(c, x, y);

            symbolPixelCoords.push({ x, y });
        }
    }

    requestAnimationFrame(render);
});
symbolImage.src = './extinctionsymbol.svg';
