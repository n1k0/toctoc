#!/usr/bin/env node

var yargs = require("yargs");
var fs = require("fs");
var marked = require("marked");

function removeTags(str) {
  return str.replace(/(<([^>]+)>)/g, "");
}

function slugify(str) {
  return removeTags(str.toLowerCase())
    // remove html entities
    .replace(/&\w+;/g, "")
    // generate a github compatible anchor slug
    .replace(/[^\w]+/g, "-")
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

function transform(source, title, maxDepth) {
  var tocPattern = new RegExp(`## ${title}([\\s\\S])+\\n---`);
  if (!tocPattern.test(source)) {
    console.error("Couldn't find expected TOC pattern: " + tocPattern);
    process.exit(1);
  }
  var toc = generateToc(source, title, maxDepth);
  return source.replace(tocPattern, `## ${title}\n\n${toc}\n---`);
}

function readFile(file) {
  return fs.readFileSync(file).toString();
}

function updateFile(file, title, maxDepth) {
  fs.writeFileSync(file, transform(readFile(file), title, maxDepth));
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
  .argv;

var file = argv._[0];
if (argv.write) {
  updateFile(file, argv.title, argv.maxDepth);
  console.log("Updated " + file);
} else {
  console.log(transform(readFile(file), argv.title, argv.maxDepth));
}
