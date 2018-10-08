toctoc
======

Generates and maintain a Table of Content for any Markdown document, especially `README.md` files hosted on github.

## Table of Contents

  - [Installation](#installation)
     - [Globally](#globally)
     - [Locally](#locally)
  - [Setup](#setup)
  - [Usage](#usage)
     - [Custom TOC heading](#custom-toc-heading)
     - [Max TOC depth](#max-toc-depth)
     - [Soft TOC](#soft-toc)
     - [Directory](#directory)
     - [For the adventurous](#for-the-adventurous)
  - [License](#license)

---
## Installation

### Globally

```
$ npm install -g toctoc
```

### Locally

```
$ npm install toctoc --save-dev
```

## Setup

The program will scan the passed file contents and look for TOC placeholder, which must follow this format:

```markdown
  ## Table of Contents

  ---
```

Note the `<hr/>` tag (`---` in Markdown) at the end of the block.

## Usage

```
$ toctoc README.md
```

By default, this command outputs the modified file contents with the TOC markdown added. You can overwrite the original file by using the `-w` option:

```
$ toctoc README.md -w
```

If a TOC was previously generated for this file, its previous version will be replaced with the new one.

```
$ toctoc docs/**/*.md -w 
```

You can use a [glob](http://pubs.opengroup.org/onlinepubs/9699919799/functions/glob.html) pattern or a directory to match multiple files at once.

```
$ toctoc doc -w -e MD
```

If you use a directory, the file extensions searched is `.md`, if you wish to use a different file extension for markdown, use `-e` option. 


### Custom TOC heading

By default the TOC is generated using the `Table of Contents` heading. You can specify a custom one by using the `-t` option:

```
$ toctoc -w README.md -t="My custom TOC title"
```

Just ensure to update your source file to use this new heading, so the executable can find and replace the appropriate TOC section.

### Max TOC depth

By default, the generated TOC will expose links to the deepest subsections of the document; to limit the maximum crawling depth, use the `-d` option:

```
$ toctoc README.md -w -d 2
```

### Soft TOC

By default, it will fail with an error if the targeted file(s) do not have any TOC. To remove this limitation, use `-s` option:

```
$ toctoc docs/**/*.md -w -s
```

### Directory 

By default, toctoc will use a `.md` extension if used with a directory. You can customise the extension to be founds by passing `-e` option.


```
$ toctoc docs -w -s -e .MD
```


### For the adventurous

It's possible to automate updating the README in a `package.json` `prepublish` command, so you're sure your npm package homepage is always updated with the right TOC when released:

```json
  "scripts": {
    "prepublish": "./node_modules/.bin/toctoc README.md -d 2 -w"
  },
```

## License

MIT.
