InputDefinition = function(definition) {
    this._arguments = {};
    this._requiredCount = null;
    this._hasAnArrayArgument = false;
    this._hasOptional = null;
    this._options = {};
    this._shortcuts = {};

    this.setDefinition(definition);
};

InputDefinition.prototype.setDefinition = function(definition) {
    definition = typeof definition === 'undefined' ? [] : definition;
    var arguments = [];
    var options = [];

    for (var i = definition.length - 1; i >= 0; i--) {
        var item = definition[i];
        if (item instanceof InputOption) {
            options.push(item);
        } else {
            arguments.push(item);
        };
    };

    this.setArguments(arguments);
    this.setOptions(options);
};

InputDefinition.prototype.setArguments = function(arguments) {
    this._arguments = {};
    this._requiredCount = 0;
    this._hasOptional = false;
    this._hasAnArrayArgument = false;
    this.addArguments(arguments);
};

InputDefinition.prototype.addArguments = function(arguments) {
    if (undefined !== arguments && null !== arguments) {
        for (var i in arguments) {
            this.addArgument(arguments[i]);
        };
    };
};

InputDefinition.prototype.addArgument = function(argument) {
    if (undefined !== this._arguments[argument.getName()]) {
        throw new Error('An argument with name "'+argument.getName()+'" already exists.');
    };

    if (this._hasAnArrayArgument) {
        throw new Error('Cannot add an argument after an array argument.');
    };

    if (argument.isRequired() && this._hasOptional) {
        throw new Error('Cannot add a required argument after an optional one.');
    };

    if (argument.isArray()) {
        this._hasAnArrayArgument = true;
    };

    if (argument.isRequired()) {
        ++this._requiredCount;
    } else {
        this._hasOptional = true;
    };

    this._arguments[argument.getName()] = argument;
};

InputDefinition.prototype.getArgument = function(name) {
    if (!isNaN(parseInt(name))) {
        name = Object.getOwnPropertyNames(this._arguments)[parseInt(name)];
    };

    if (!this.hasArgument(name)) {
        throw new Error('The "'+name+'" argument does not exist.')
    };

    return this._arguments[name];
};

InputDefinition.prototype.hasArgument = function(name) {
    if (!isNaN(parseInt(name))) {
        name = Object.getOwnPropertyNames(this._arguments)[parseInt(name)];
    };

    return undefined !== this._arguments[name];
};

InputDefinition.prototype.getArguments = function() {
    return this._arguments;
};

InputDefinition.prototype.getArgumentCount = function() {
    return this._hasAnArrayArgument ? Number.MAX_VALUE : this._arguments.length;
};

InputDefinition.prototype.getArgumentRequiredCount = function() {
    return this._requiredCount;
};

InputDefinition.prototype.getArgumentDefaults = function() {
    var values = {};
    for (var argument in this.getArguments()) {
        argument = this.getArgument(argument);
        values[argument.getName()] = argument.getDefault();
    };

    return values;
};

InputDefinition.prototype.setOptions = function(options) {
    this._options = {};
    this._shortcuts = {};
    this.addOptions(options);
};

InputDefinition.prototype.addOptions = function(options) {
    for (var i in options) {
        this.addOption(options[i]);
    };
};

InputDefinition.prototype.addOption = function(option) {
    if (undefined !== this._options[option.getName()] && !option.equals(this._options[option.getName()])) {
        throw new Error('An option named "'+option.getName()+'" already exists.');
    } else if (undefined !== this._shortcuts[option.getShortcut()] && !option.equals(this._options[this._shortcuts[option.getShortcut()]])) {
        throw new Error('An option with shortcut "'+option.getShortcut()+'" already exists.');
    };

    this._options[option.getName()] = option;
    if (option.getShortcut()) {
        this._shortcuts[option.getShortcut()] = option.getName();
    };
};

InputDefinition.prototype.getOption = function(name) {
    if (!this.hasOption(name)) {
        throw new Error('The "--'+name+'" option does not exist.');
    };

    return this._options[name];
};

InputDefinition.prototype.hasOption = function(name) {
    return undefined !== this._options[name];
};

InputDefinition.prototype.getOptions = function() {
    return this._options;
};

InputDefinition.prototype.hasShortcut = function(shortcut) {
    return undefined !== this._shortcuts[shortcut];
};

InputDefinition.prototype.getOptionForShortcut = function(shortcut) {
    return this.getOption(this.shortcutToName(shortcut));
};

InputDefinition.prototype.getOptionDefaults = function() {
    var values = {};
    for (var option in this.getOptions()) {
        option = this.getOption(option);
        values[option.getName()] = option.getDefault();
    };

    return values;
};

InputDefinition.prototype.shortcutToName = function(shortcut) {
    if (undefined === this._shortcuts[shortcut]) {
        throw new Error('The "-'+shortcut+'" option does not exist.');
    };

    return this._shortcuts[shortcut];
};

InputDefinition.prototype.getSynopsis = function() {
    var elements = [];
    for (var option in this.getOptions()) {
        option = this.getOption(option);
        var shortcut = option.getShortcut() ? '-'+option.getShortcut()+'|' : '';
        if (option.isValueRequired()) {
            elements.push('['+shortcut+'--'+option.getName()+'="..."]');
        } else if (option.isValueOptional()) {
            elements.push('['+shortcut+'--'+option.getName()+'[="..."]]');
        } else {
            elements.push('['+shortcut+'--'+option.getName()+']');
        };
    };

    for (var argument in this.getArguments()) {
        argument = this.getArgument(argument);
        if (argument.isRequired()) {
            elements.push(argument.getName()+(argument.isArray() ? '1' : ''));
        } else {
            elements.push('['+argument.getName()+(argument.isArray() ? '1' : '')+']');
        };

        if (argument.isArray()) {
            elements.push('... ['+argument.getName()+'N]');
        };
    };

    return elements.join(' ');
};

InputDefinition.prototype.asText = function() {
    var max = 0;
    for (var option in this.getOptions()) {
        option = this.getOption(option);
        var nameLength = option.getName().length + 2;
        if (option.getShortcut()) {
            nameLength += option.getShortcut().length + 3;
        };

        max = Math.max(max, nameLength);
    };

    for (var argument in this.getArguments()) {
        argument = this.getArgument(argument);
        max = Math.max(max, argument.getName().length);
    };
    ++max;

    var text = [];

    if (Object.getOwnPropertyNames(this._arguments).length) {
        text.push('<comment>Arguments:</comment>');

        for (var argument in this.getArguments()) {
            argument = this.getArgument(argument);
            if (null !== argument.getDefault() && (typeof argument.getDefault() !== 'Array' || argument.getDefault().length)) {
                var defaultValue = '<comment> (default: '+this.formatDefaultValue(argument.getDefault())+')</comment>';
            } else {
                var defaultValue = '';
            };

            var description = argument.getDescription().replace('\n', '\n'+str_repeat(' ', max + 2));

            text.push(' <info>'+argument.getName()+str_repeat(' ', max - argument.getName().length)+'</info> '+description+defaultValue);
        };

        text.push('');
    };

    if (Object.getOwnPropertyNames(this._options).length) {
        text.push('<comment>Options:</comment>');

        for (var option in this.getOptions()) {
            option = this.getOption(option);
            if (option.acceptValue() && null !== option.getDefault() && (typeof option.getDefault() !== 'Array' || option.getDefault().length)) {
                var defaultValue = '<comment> (default: '+this.formatDefaultValue(option.getDefault())+')</comment>';
            } else {
                var defaultValue = '';
            };

            var multiple = option.isArray() ? '<comment> (multiple values allowed)</comment>' : '';
            var description = option.getDescription().replace('\n', '\n'+str_repeat(' ', max + 2));
            var optionMax = max - option.getName().length - 2;
            var shortcut = option.getShortcut() ? '(-'+option.getShortcut()+')' : '';

            text.push(' <info>--'+option.getName()+'</info> '+shortcut+str_repeat(' ', optionMax - shortcut.length)+description+defaultValue+multiple);
        };

        text.push('');
    };

    return text.join('\n');
};

InputDefinition.prototype.formatDefaultValue = function(value) {
    return JSON.stringify(value);
};
