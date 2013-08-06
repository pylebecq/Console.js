var ARGUMENT_REQUIRED = 1;
var ARGUMENT_OPTIONAL = 2;
var ARGUMENT_IS_ARRAY = 4;

function InputArgument(name, mode, description, defaultValue) {
    mode = typeof mode === 'undefined' ? ARGUMENT_OPTIONAL : parseInt(mode);
    if (isNaN(mode) || mode > 7 || mode < 1) {
        throw new Error('Argument mode "'+mode+'" is not valid.');
    };

    this._name = name;
    this._mode = mode;
    this._description = (undefined === description || null === description ? '' : description);

    this.setDefault(defaultValue);
};

InputArgument.prototype.getName = function() {
    return this._name;
};

InputArgument.prototype.isRequired = function() {
    return ARGUMENT_REQUIRED === (ARGUMENT_REQUIRED & this._mode);
};

InputArgument.prototype.isArray = function() {
    return ARGUMENT_IS_ARRAY === (ARGUMENT_IS_ARRAY & this._mode);
};

InputArgument.prototype.setDefault = function(defaultValue) {
    defaultValue = typeof defaultValue === 'undefined' ? null : defaultValue;
    if (self.REQUIRED === this._mode && null !== defaultValue) {
        throw new Error('Cannot set a default value except for ARGUMENT_OPTIONAL mode.');
    };

    if (this.isArray()) {
        if (null === defaultValue) {
            defaultValue = [];
        } else if (typeof defaultValue !== 'Array') {
            throw new Error('A default value for an array argument must be an array.');
        };
    };

    this._default = defaultValue;
};

InputArgument.prototype.getDefault = function() {
    return this._default;
};

InputArgument.prototype.getDescription = function() {
    return this._description;
};
