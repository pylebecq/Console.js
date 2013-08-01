// Constructor. Could be used to set some properties in the object.
function HelloWorldCommand () {
    // Call the parent constructor
    Command.call(this);
};

// Inherit from the Command object.
HelloWorldCommand.prototype = Object.create(Command.prototype);

// Configure method.
HelloWorldCommand.prototype.configure = function() {
    this
        .setName('hello:world')
        .setDescription('Says hello world.')
        .addOption('yell', 'y', OPTION_VALUE_NONE)
        .setHelp('The <info>%command.name%</info> command says hello world:\n\
\n\
  <info>hello:world</info>\n\
\n\
You can also display hello world in caps lock using the yell option:\n\
\n\
  <info>hello:world --yell</info>')
    ;
};

// Execute method.
HelloWorldCommand.prototype.execute = function(input, output) {
    if (input.getOption('yell')) {
        output.writeln('HELLO WORLD !');
    } else {
        output.writeln('Hello world !');
    };
};
