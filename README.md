# dasm language support for VSCode

**[Documentation](https://github.com/Settis/dasm-vscode/wiki)**

This is a VSCode extension for programming in dasm.
Only 6502 is supported.

*Note:* you still need a separate dasm assembler to generate binaries.

## Features
- syntax highlighting
- error checking
- include & incdir support
- navigating by labels (like go to definition)
- autocompletion

## Known limitations
The plugin does not assemble the code.
It parses the source in order to extract variable definition and usage, but does not compute expressions.

Directives are also partially supported: 
- macros are not parsed at all, only global variables are extracted on each macro usage
- for if - only, the `true` branch is evaluated
- for repeat, it shows an error in case global constants are defined inside, assuming the section is repeated several times

## Plans
- outline view
- show listing of applied macros
- hovering
- docstring support
- assembling
- 65c816 support
