var yargs = require("yargs");
var fs = require("fs");
var marked = require("marked");

function generateToc(source, title) {
  var toc = "";
  var renderer = new marked.Renderer();
  function addToToc(text, anchor, level) {
    if (level === 1) return;
    const spaces = new Array(level * 3 - 3).map(x => x).join(" ");
    toc += `${spaces}- [${text}](#${anchor})\n`;
  }
  renderer.heading = function (text, level) {
    if (text === title) return;
    var anchor = text.toLowerCase().replace(/[^\w]+/g, '-');
    addToToc(text, anchor, level);
    return "";
  }
  marked(source, {renderer});
  return toc;
}

function transform(source, title) {
  var tocPattern = new RegExp(`## ${title}\\n([\\s\\S])+\\n---`);
  if (!tocPattern.test(source)) {
    console.error("Couldn't find expected TOC pattern: " + tocPattern);
    process.exit(1);
  }
  var toc = generateToc(source, title);
  return source.replace(tocPattern, `## ${title}\n\n${toc}\n---`);
}

function readFile(file) {
  return fs.readFileSync(file).toString();
}

function updateFile(file, title) {
  fs.writeFileSync(file, transform(readFile(file), title));
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
  .argv;

var file = argv._[0];
if (argv.write) {
  updateFile(file, argv.title);
  console.log("Updated " + file);
} else {
  console.log(transform(readFile(file), argv.title));
}
