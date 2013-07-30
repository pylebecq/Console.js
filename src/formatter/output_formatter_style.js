OutputFormatterStyle = function(foreground, background, options) {
    this._availableForegroundColors = {
        black: 30,
        red: 31,
        green: 32,
        yellow: 33,
        blue: 34,
        magenta: 35,
        cyan: 36,
        white: 37
    };
    this._availableBackgroundColors = {
        black: 40,
        red: 41,
        green: 42,
        yellow: 43,
        blue: 44,
        magenta: 45,
        cyan: 46,
        white: 47
    };
    this._availableOptions = {
        bold: 1,
        underscore: 4,
        blink: 5,
        reverse: 7,
        conceal: 8
    };

    foreground = typeof foreground === 'undefined' ? null : foreground;
    background = typeof background === 'undefined' ? null : background;
    options = typeof options === 'undefined' ? [] : options;

    this._options = [];
    if (null !== foreground) {
        this.setForeground(foreground);
    };
    if (null !== background) {
        this.setBackground(background);
    };
    if (options.length) {
        this.setOptions(options);
    };
};

OutputFormatterStyle.prototype.setForeground = function(color) {
    color = typeof color === 'undefined' ? null : color;

    if (null === color) {
        this._foreground = null;

        return;
    };

    if (undefined === this._availableForegroundColors[color]) {
        throw new Error('Invalid foreground color specified: "'+color+'". Expected one of ('+this._availableForegroundColors.join(', ')+')');
    };

    this._foreground = this._availableForegroundColors[color];
};

OutputFormatterStyle.prototype.setBackground = function(color) {
    color = typeof color === 'undefined' ? null : color;

    if (null === color) {
        this._background = null;

        return;
    };

    if (undefined === this._availableBackgroundColors[color]) {
        throw new Error('Invalid background color specified: "'+color+'". Expected one of ('+this._availableBackgroundColors.join(', ')+')');
    };

    this._foreground = this._availableBackgroundColors[color];
};

OutputFormatterStyle.prototype.setOption = function(option) {
    if (undefined === this._availableOptions[option]) {
        throw new Error('Invalid option specified: "'+option+'". Expected one of ('+this._availableOptions.join(', ')+')');
    };

    if (-1 === this._options.indexOf(this._availableOptions[option])) {
        this._options.push(this._availableOptions[option]);
    };
};

OutputFormatterStyle.prototype.unsetOption = function(option) {
    if (undefined === this._availableOptions[option]) {
        throw new Error('Invalid option specified: "'+option+'". Expected one of ('+this._availableOptions.join(', ')+')');
    };

    if (this._options.indexOf(this._availableOptions[option]) > -1) {
        this._options.slice(this._options.indexOf(this._availableOptions[option]), 1);
    };
};

OutputFormatterStyle.prototype.setOptions = function(options) {
    this._options = [];

    for (var i = options.length - 1; i >= 0; i--) {
        this.setOption(options[i]);
    };
};

OutputFormatterStyle.prototype.apply = function(text) {
    var codes = [];

    if (null !== this._foreground) {
        codes.push(this._foreground);
    };
    if (null !== this._background) {
        codes.push(this._background);
    };
    if (this._options.length) {
        codes = codes.concat(this._options);
    };

    if (0 === codes.length) {
        return text;
    };

    return '['+codes.join(';')+'m'+text+'[0m';
};
