Application = function(name, version) {
    this._name = typeof name === 'undefined' ? 'UNKNOWN' : name;
    this._version = typeof version === 'undefined' ? 'UNKNOWN' : version;
    this._commands = {};
    this._helperSet = this.getDefaultHelperSet();
    this._definition = this.getDefaultInputDefinition();
    this._runningCommand = null;

    var defaultCommands = this.getDefaultCommands();
    for (var i = defaultCommands.length - 1; i >= 0; i--) {
        this.addCommand(defaultCommands[i]);
    };
};

Application.prototype.run = function(input, output) {
    if (typeof input === 'undefined' || typeof output === 'undefined') {
        throw new Error('input and output must be defined.');
    };

    try {
        var statusCode = this.doRun(input, output);
    } catch (e) {
        this.renderException(e, output);
        this._runningCommand = null;
    };

    return statusCode;
};

Application.prototype.doRun = function(input, output) {
    var name = this.getCommandName(input);

    if (true === input.hasParameterOption('--ansi')) {
        output.setDecorated(true);
    } else if (true === input.hasParameterOption('--no-ansi')) {
        output.setDecorated(false);
    };

    if (true === input.hasParameterOption(['--help', '-h'])) {
        if (!name) {
            name = 'help';
            input = new StringInput(name);
        } else {
            this._wantsHelp = true;
        };
    };

    if (true === input.hasParameterOption(['--quiet', '-q'])) {
        output.setVerbosity(output.VERBOSITY_QUIET);
    } else if (true === input.hasParameterOption(['--verbose', '-v'])) {
        output.setVerbosity(output.VERBOSITY_VERBOSE);
    };

    if (true === input.hasParameterOption(['--version', '-V'])) {
        output.writeln(this.getLongVersion());
    };

    if (!name) {
        name = 'list';
        input = new StringInput(name);
    };

    var command = this.find(name);

    this._runningCommand = command;
    var statusCode = command.run(input, output);
    this._runningCommand = null;

    return statusCode;
};

Application.prototype.setHelperSet = function(helperSet) {
    this._helperSet = helperSet;
};

Application.prototype.getHelperSet = function() {
    return this._helperSet;
};

Application.prototype.setDefinition = function(definition) {
    this._definition = definition;
};

Application.prototype.getDefinition = function() {
    return this._definition;
};

Application.prototype.getHelp = function() {
    var messages = [
        this.getLongVersion(),
        '',
        '<comment>Usage:</comment>',
        '  [options] command [arguments]',
        '',
        '<comment>Options:</comment>'
    ];

    for (var option in this._definition.getOptions()) {
        option = this._definition.getOption(option);
        var name = '<info>--'+option.getName()+'</info>';
        var length = 29 - name.length;
        var spaceString = '';
        for (var i = length - 1; i >= 0; i--) {
            spaceString += ' ';
        };

        messages.push('  '+name+spaceString+' '+(option.getShortcut() ? '<info>-'+option.getShortcut()+'</info>' : '  ')+' '+option.getDescription());
    };

    return messages.join('\n');
};

Application.prototype.getName = function() {
    return this._name;
};

Application.prototype.getVersion = function() {
    return this._version;
};

Application.prototype.setVersion = function(version) {
    this._version = version;
};

Application.prototype.getLongVersion = function() {
    if ('UNKNOWN' !== this.getName() && 'UNKNOWN' !== this.getVersion()) {
        return '<info>'+this.getName()+'</info> version <comment>'+this.getVersion()+'</comment>';
    };
};

Application.prototype.register = function(name) {
    return this.addCommand(new Command(name));
};

Application.prototype.addCommands = function(commands) {
    for (var i = commands.length - 1; i >= 0; i--) {
        this.addCommand(commands[i]);
    };
};

Application.prototype.addCommand = function(command) {
    command.setApplication(this);

    if (!command.isEnabled()) {
        command.setApplication(null);

        return;
    };

    this._commands[command.getName()] = command;

    for (var i = command.getAliases().length - 1; i >= 0; i--) {
        this._commands[command.getAliases()[i]] = command;
    };

    return command;
};

Application.prototype.get = function(name) {
    if (undefined === this._commands[name]) {
        throw new Error('The command "'+name+'" does not exist.');
    };

    var command = this._commands[name];

    if (this._wantsHelp) {
        this._wantsHelp = false;

        var helpCommand = this.get('help');
        helpCommand.setCommand(command);

        return helpCommand;
    };

    return command;
};

Application.prototype.has = function(name) {
    return undefined !== this._commands[name];
};

Application.prototype.getNamespaces = function() {
    var namespaces = [];

    for (var command in this._commands) {
        command = this._commands[command];
        var namespace = this.extractNamespace(command.getName());
        if (namespace.length) {
            namespaces.push(namespace);
        }

        for (var i = command.getAliases().length - 1; i >= 0; i--) {
            var namespace = this.extractNamespace(command.getAliases()[i]);
            if (namespace.length) {
                namespaces.push(namespace);
            }
        };
    };

    return namespaces.reverse().filter(function (e, i, arr) {
        return false !== e && arr.indexOf(e, i+1) === -1;
    }).reverse();
};

Application.prototype.findNamespace = function(namespace) {
    var ns = this.getNamespaces();
    var allNamespaces = {};
    for (var i = ns.length - 1; i >= 0; i--) {
        var n = ns[i];
        allNamespaces[n] = n.split(':');
    };
    var found = [];

    var parts = namespace.split(':');
    for (var i = 0; i <= parts.length - 1; i++) {
        var part = parts[i];

        // Construct
        var abbrevs = {};
        for (var index in allNamespaces) { // array_map
            var value = allNamespaces[index];
            if (value[i] != undefined) {
                abbrevs[index] = value[i];
            } else {
                abbrevs[index] = '';
            };
        };
        for (var index in abbrevs) { // array_filter
            var value = abbrevs[index];
            if (!value) {
                abbrevs.splice(index, 1);
            };
        };
        var _abbrevs = [];
        for (var index in abbrevs) { // array_values
            _abbrevs.push(abbrevs[index]);
        };
        abbrevs = _abbrevs;
        var _abbrevs = [];
        for (var index in abbrevs) { // array_unique
            if (_abbrevs.indexOf(abbrevs[index]) == -1) {
                _abbrevs.push(abbrevs[index]);
            };
        };
        abbrevs = _abbrevs;
        abbrevs = this.getAbbreviations(abbrevs);

        if (undefined === abbrevs[part]) {
            var message = 'There are no commands defined in the '+namespace+' namespace.';

            if (1 <= i) {
                part = found+':'+part;
            };

            var alternatives = this.findAlternativeNamespace(part, abbrevs);
            if (alternatives && Object.getOwnPropertyNames(alternatives).length > 0) {
                if (1 === Object.getOwnPropertyNames(alternatives).length) {
                    message += '\n\nDid you mean this?\n    ';
                } else {
                    message += '\n\nDid you mean one of these?\n    ';
                };

                message += Object.getOwnPropertyNames(alternatives).join('\n    ');
            };

            throw new Error(message);
        };

        if (abbrevs[part].indexOf(part) >= 0) {
            abbrevs[part] = [part];
        };

        if (abbrevs[part].length > 1) {
            throw new Error('The namespace "'+namespace+'" is ambiguous ('+this.getAbbreviationSuggestions(abbrevs[part])+').');
        };

        found.push(abbrevs[part][0]);
    };

    return found.join(':');
};

Application.prototype.find = function(name) {
    var namespace = '';
    var searchName = name;

    var pos = name.lastIndexOf(':');
    if (pos >= 0) {
        namespace = this.findNamespace(name.slice(0, pos));
        searchName = namespace+name.slice(pos);
    }

    var commands = [];
    for (var command in this._commands) {
        command = this._commands[command];
        var extractedNamespace = this.extractNamespace(command.getName());
        if (extractedNamespace === namespace || !namespace.length && 0 === namespace.indexOf(extractedNamespace)) {
            commands.push(command.getName());
        };
    };

    var abbrevs = this.getAbbreviations(commands.reverse().filter(function (e, i, arr) {
        return arr.indexOf(e, i+1) === -1;
    }).reverse());
    if (undefined !== abbrevs[searchName] && 1 == abbrevs[searchName].length) {
        return this.get(abbrevs[searchName][0]);
    };

    if (undefined !== abbrevs[searchName] && abbrevs[searchName].indexOf(searchName) >= 0) {
        return this.get(searchName);
    };

    if (undefined !== abbrevs[searchName] && abbrevs[searchName].length > 1) {
        var suggestions = this.getAbbreviationSuggestions(abbrevs[searchName]);

        throw new Error('Command "'+name+'" is ambiguous ('+suggestions+').')
    };

    var aliases = [];
    for (var command in this._commands) {
        command = this._commands[command];
        for (var i = command.getAliases().length - 1; i >= 0; i--) {
            var alias = command.getAliases()[i];
            var extractedNamespace = this.extractNamespace(alias);
            if (extractedNamespace === namespace || !namespace.length && 0 === namespace.indexOf(extractedNamespace)) {
                aliases.push(alias);
            };
        };
    };

    var aliases = this.getAbbreviations(aliases.reverse().filter(function (e, i, arr) {
        return arr.indexOf(e, i+1) === -1;
    }).reverse());
    if (undefined === aliases[searchName]) {
        var message = 'Command "'+name+'" is not defined.';
        var alternatives = this.findAlternativeCommands(searchName, abbrevs);
        if (Object.getOwnPropertyNames(alternatives).length) {
            if (1 == Object.getOwnPropertyNames(alternatives).length) {
                message += '\n\nDid you mean this?\n    ';
            } else {
                message += '\n\nDid you mean one of these?\n    ';
            };
            message += Object.getOwnPropertyNames(alternatives).join('\n    ');
        };

        throw new Error(message);
    };

    if (aliases[searchName].length > 1) {
        throw new Error('Command "'+name+'" is ambiguous ('+this.getAbbreviationSuggestions(aliases[searchName])+').');
    };

    return this.get(aliases[searchName][0]);
};

Application.prototype.all = function(namespace) {
    namespace = typeof namespace === 'undefined' ? null : namespace;
    if (null === namespace) {
        return this._commands;
    };

    var commands = {};
    for (var name in this._commands) {
        var command = this._commands[name];
        if (namespace === this.extractNamespace(name, namespace.split(':').length + 1)) {
            commands[name] = command;
        };
    };

    return commands;
};

Application.prototype.getAbbreviations = function(names) {
    var abbrevs = {};
    for (var i = 0; i < names.length; i++) {
        var name = names[i];
        for (var len = name.length; len > 0; len--) {
            var abbrev = name.slice(0, len);
            if (undefined === abbrevs[abbrev]) {
                abbrevs[abbrev] = [];
            };
            abbrevs[abbrev].push(name);
        };
    };

    return abbrevs;
};

Application.prototype.asText = function(namespace, raw) {
    namespace = typeof namespace === 'undefined' ? null : namespace;
    raw = typeof raw === 'undefined' ? false : raw;

    var commands = namespace ? this.all(this.findNamespace(namespace)) : this._commands;
    var width = 0;
    for (var name in commands) {
        var command = commands[name];
        width = command.getName().length > width ? command.getName().length : width;
    };
    width += 2;

    if (raw) {
        var messages = [];
        var sortedCommands = this.sortCommands(commands);
        for (var space in sortedCommands) {
            var commands = sortedCommands[space];
            for (var name in commands) {
                var command = commands[name];
                var spaceString = '';
                for (var i = 0; i < width - name.length; i++) {
                    spaceString += ' ';
                };
                messages.push(spaceString+command.getName()+' '+command.getDescription());
            };
        };

        return messages.join('\n');
    };

    var messages = [this.getHelp(), ''];
    if (namespace) {
        messages.push('<comment>Available commands for the "'+namespace+'" namespace:</comment>');
    } else {
        messages.push('<comment>Available commands:</comment>');
    };

    var sortedCommands = this.sortCommands(commands);
    for (var space in sortedCommands) {
        var commands = sortedCommands[space];
        if (!namespace && '_global' !== space) {
            messages.push('<comment>'+space+'</comment>');
        };

        for (var name in commands) {
            var command = commands[name];
            var spaceString = '';
            for (var i = 0; i < width - name.length; i++) {
                spaceString += ' ';
            };
            messages.push('  <info>'+name+'</info>'+spaceString+' '+command.getDescription());
        };
    };

    return messages.join('\n');
};

Application.prototype.renderException = function(e, output) {
    var title = '   '+e.name+'   ';
    var len = title.length;
    var width = 80;
    var lines = [];

    var splittedMessage = e.message.split('\n');
    for (var i = 0; i < splittedMessage.length; i++) {
        var line = splittedMessage[i];
        var splittedLine = str_split(line, width - 4);
        for (var j = 0; j < splittedLine.length; j++) {
            var line2 = splittedLine[j];
            lines.push('  '+line2+'  ');
            len = Math.max(line2.length + 4, len);
        };
    };

    var messages = [str_repeat(' ', len), title+str_repeat(' ', Math.max(0, len - title.length))];
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        messages.push(line+str_repeat(' ', len - line.length));
    };

    messages.push(str_repeat(' ', len));

    output.writeln('');
    output.writeln('');
    for (var i = 0; i < messages.length; i++) {
        var message = messages[i];
        output.writeln('<error>'+message+'</error>');
    };
    output.writeln('');
    output.writeln('');

    if (output.getVerbosity() === output.VERBOSITY_VERBOSE) {
        output.writeln(' at <info>'+e.fileName+':'+e.lineNumber+'</info>');
        output.writeln('');
        output.writeln('');
    };

    if (null !== this._runningCommand) {
        output.writeln('<info>'+this._runningCommand.getSynopsis()+'</info>');
        output.writeln('');
        output.writeln('');
    };
};

Application.prototype.getCommandName = function(input) {
    return input.getFirstArgument();
};

Application.prototype.getDefaultInputDefinition = function() {
    return new InputDefinition([
        new InputArgument('command', ARGUMENT_REQUIRED, 'The command to execute'),
        new InputOption('--help',           '-h', OPTION_VALUE_NONE, 'Display this help message.'),
        new InputOption('--quiet',          '-q', OPTION_VALUE_NONE, 'Do not output any message.'),
        new InputOption('--verbose',        '-v', OPTION_VALUE_NONE, 'Increase verbosity of messages.'),
        new InputOption('--version',        '-V', OPTION_VALUE_NONE, 'Display this application version.'),
        new InputOption('--ansi',           null,   OPTION_VALUE_NONE, 'Force ANSI output.'),
        new InputOption('--no-ansi',        null,   OPTION_VALUE_NONE, 'Disable ANSI output.'),
    ]);
};

Application.prototype.getDefaultCommands = function() {
    return [new HelpCommand(), new ListCommand()];
};

Application.prototype.getDefaultHelperSet = function() {
    return null;
};

Application.prototype.sortCommands = function(commands) {
    var namespacedCommands = {};
    for (var name in commands) {
        var command = commands[name];
        var key = this.extractNamespace(name, 1);
        if (!key) {
            key = '_global';
        };

        if (undefined === namespacedCommands[key]) {
            namespacedCommands[key] = {};
        };
        namespacedCommands[key][name] = command;
    };
    ksort(namespacedCommands);

    for (var i in namespacedCommands) {
        var commands = namespacedCommands[i];
        ksort(commands);
    };

    return namespacedCommands;
};

Application.prototype.getAbbreviationSuggestions = function(abbrevs) {
    return abbrevs[0]+', '+abbrevs[1]+(abbrevs.length > 2 ? ' and '+abbrevs.length+' more' : '');
};

Application.prototype.extractNamespace = function(name, limit) {
    var parts = name.split(':');
    parts.pop();

    return (undefined === limit ? parts.join(':') : parts.slice(0, limit).join(':'));
};

Application.prototype.findAlternativeCommands = function(name, abbrevs) {
    var callback = function (item) {
        return item.getName();
    };

    return this.findAlternatives(name, this._commands, abbrevs, callback);
};

Application.prototype.findAlternativeNamespace = function(name, abbrevs) {
    return this.findAlternatives(name, this.getNamespaces(), abbrevs);
};

Application.prototype.findAlternatives = function(name, collection, abbrevs, callback) {
    callback = typeof callback === 'undefined' ? null : callback;

    var alternatives = {};
    for (var index in collection) {
        var item = collection[index];

        if (null !== callback) {
            item = callback.call(this, item);
        };

        var lev = levenshtein(name, item);
        if (lev <= name.length / 3 || item.indexOf(name) >= 0) {
            alternatives[item] = lev;
        };
    };

    if (!Object.getOwnPropertyNames(alternatives).length) {
        for (var key in abbrevs) {
            var abbrev = abbrevs[key];
            var lev = levenshtein(name, key);
            if (lev <= name.length / 3 || key.indexOf(name) >= 0) {
                for (var i = 0; i < abbrev.length; i++) {
                    var abbr = abbrev[i];
                    alternatives[abbr] = lev;
                };
            };
        };
    };

    asort(alternatives, 'SORT_NUMERIC');

    return alternatives;
};
