const { cd, exec, echo, touch } = require("shelljs");
const fs = require("fs");
const url = require("url");

let repoUrl;
let pckg = JSON.parse(fs.readFileSync("package.json") as any);
if (typeof pckg.repository === "object") {
    if (!pckg.repository.hasOwnProperty("url")) {
        throw new Error("URL does not exist in repository section");
    }
    repoUrl = pckg.repository.url;
} else {
    repoUrl = pckg.repository;
}

let parsedUrl = url.parse(repoUrl);
let repository = (parsedUrl.host || "") + (parsedUrl.path || "");
let ghToken = process.env.GH_TOKEN;

echo("Deploying docs!!!");
cd("docs");
touch(".nojekyll");
exec("git init");
exec("git add .");
exec(`git config user.name "Sean Ryan"`);
exec(`git config user.email "mr.sean.ryan(at)gmail.com"`);
exec(`git commit -m "docs(docs): update gh-pages"`);
exec(`git push --force --quiet "https://${ghToken}@${repository}" master:gh-pages`);
echo("Docs deployed!!");
