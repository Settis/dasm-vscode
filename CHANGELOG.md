# Changelog
## [2.1.0] - 2024-01-27

### Added 

- Work with segment names: autocompletion, usage, renaming
- Evaluate ifconst and ifnconst and process them accordingly

## [2.0.0] - 2024-01-21
### Braking change

- deleted configuration for completely hiding labels from autocompletion

### Added

- Added configuration for the current file only label autocompletion
- Autocompletion from indirect including files
- Renaming

## [1.4.1] - 2023-12-16

### Fixed

- Excluding structure macros names from suggestion

## [1.4.0] - 2023-12-10

### Added 

- Structure macros support
- Open file from include directive
- Outline view & document symbols

### Fixed

- disable autocompletion for addressing mode
- disable autocompletion for hex digits
- no more crashes on recovered parse result
- correct handling of using '=' sign in expressions
- work with untitled (unsaved) documents

## [1.3.1] - 2023-07-11

### Fixed

- do not stop processing the source after the first syntax error

## [1.3.0] - 2023-06-27

### Added

- configuration for hiding labels from autocompletion

### Fixed

- disabled word based suggestions
- label navigation for macros args
- label autocompletion for second and other macros args

## [1.2.0] - 2023-05-21

### Added

- completion for preprocessor keywords
- completion for macros
- completion for labels

### Fixed

- nested directives are parsed correctly
- dynamic variables definition and usage do not show any error
- keep all INCDIR while resolving INCLUDE in macros

## [1.1.5] - 2023-03-13

### Fixed

- Windows line endings in macro definition are parsed correctly
- include directive: more accurate check if file is exists

## [1.1.4] - 2023-03-04

### Fixed

- label name with dot is properly highlighted
- file does not show errors if it is included in a correct program
- RORG keyword is properly recognized

## [1.1.3] - 2023-02-26

### Fixed
- label name can contain a dot in the middle
- include directives works without quotes
- include directives works on Windows

## [1.1.2] - 2023-01-15

### Fixed
- dynamic labels parsing

## [1.1.1] - 2022-12-30
### Fixed
- macros name can have a directive prefix

## [1.1.0] - 2022-12-29
### Added
- hovering on asm mnemonics
- completion for asm mnemonics

## [1.0.0] - 2022-09-09
### Added
- extension description

## [0.1.0] - 2022-07-26
### Added
- syntax highlighting
- error checking
- include & include dir support
- navigating by lables (like go to definition)
