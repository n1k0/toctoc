#!/usr/bin/env node

var yargs = require("yargs");
var fs = require("fs");
var marked = require("marked");
var glob = require("glob");
var isGlob = require("is-glob");

function removeTags(str) {
  return str.replace(/(<([^>]+)>)/g, "");
}

function slugify(str) {
  return removeTags(str.toLowerCase())
    // remove html entities
    .replace(/&\w+;/g, "")
    // generate a github compatible anchor slug
    .replace(/[ $&+,:;=?@#|'<>.^*()%!-]+/g, "-")
    // remove trailing escaped characters
    .replace(/^-/, "")
    .replace(/-$/, "");
}

function generateToc(source, title, maxDepth) {
  var toc = "";
  var renderer = new marked.Renderer();
  function addToToc(text, anchor, level) {
    if (level === 1 || maxDepth && level > maxDepth + 1) return;
    const spaces = new Array(level * 3 - 3).map(x => x).join(" ");
    toc += `${spaces}- [${text}](#${anchor})\n`;
  }
  renderer.heading = function (text, level) {
    if (text === title) return;
    addToToc(removeTags(text), slugify(text), level);
    return "";
  }
  marked(source, {renderer});
  return toc;
}

function transform(source, title, maxDepth, soft) {
  var tocPattern = new RegExp(`## ${title}([\\s\\S])+\\n---\\n`);
  if (!tocPattern.test(source) && !soft) {
    console.error(`Couldn't find expected TOC pattern: ${tocPattern}`);
    process.exit(1);
  }
  var toc = generateToc(source, title, maxDepth);
  return source.replace(tocPattern, `## ${title}\n\n${toc}\n---\n`);
}

function readFile(file) {
  return fs.readFileSync(file).toString();
}

function updateFile(file, title, maxDepth, soft) {
  fs.writeFileSync(file, transform(readFile(file), title, maxDepth, soft));
}

var argv = yargs
  .usage("Usage: $0 <file> [options]")
  .demand(1)
  .help("h")
  .alias("h", "help")
  .option("w", {
    alias: "write",
    describe: "Write TOC contents into the file.",
    default: false
  })
  .option("t", {
    alias: "title",
    describe: "The TOC title to use.",
    default: "Table of Contents",
  })
  .option("d", {
    alias: "max-depth",
    describe: "The max document tree depth to generate the TOC for (0 = all).",
    default: 0,
  })
  .option("s", {
    alias: "soft",
    describe: "Soft mode prevent quit on error when TOC is not found.",
    default: false,
  })
  .option("e", {
    alias: "extension",
    describe: "Default file extension used when scanning a directory.",
    default: ".md",
  })
  .argv;

var pattern = argv._[0];

var options = {
  nonull: true,
};

try {
  if (!isGlob(pattern) && fs.lstatSync(pattern).isDirectory()) {
    pattern = `${pattern}/**/*${argv.extension}`;
  }
} catch (e) {
  console.error(`Couldn't find: ${pattern}`);
  process.exit(1);
}

glob(pattern, options, (err, files) => {
  files.forEach((file) => {
    if (argv.write) {
      updateFile(file, argv.title, argv.maxDepth, argv.soft);
      console.log("Updated " + file);
    } else {
      console.log(transform(readFile(file), argv.title, argv.maxDepth, argv.soft));
    }
  });
});
