const COMMAND_MAP = {
    M: 'moveTo',
    L: 'lineTo',
    C: 'bezierCurveTo',
    Z: 'closePath'
};

const commandRegexp = /[A-Z]([^A-Z]*)/gi;

const commandForCode = (commandCode) => {
    return COMMAND_MAP[commandCode.toUpperCase()];
};

const matchToCommand = (match) => {
    const commandCode = match[0];
    const commandName = commandForCode(commandCode);

    if (['Z', 'z'].includes(commandCode)) return { commandName, values: [] };

    const values = match
        .slice(1)
        .split(' ')
        .flatMap(pair => pair.split(',').map(num => parseFloat(num)).filter(num => !isNaN(num)));

    return { commandName, values };
};

const parsePath = (path) => {
    const commands = [];
    const re = new RegExp(commandRegexp);

    let match;
    do {
        match = re.exec(path);
        if (match) commands.push(matchToCommand(match[0]));
    } while(match);

    return commands;
};

export { parsePath };
