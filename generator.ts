import { Template, generate, checkTemplate } from "@pdfme/generator";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const templateJsonString = readFileSync("./template.json", "utf8");

try {
  const templateJson = JSON.parse(templateJsonString);
  checkTemplate(templateJson);
  const template: Template = templateJson;
  generate({ template, inputs: template.sampledata ?? [{}] }).then((pdf) => {
    writeFileSync(join(__dirname, "generated.pdf"), pdf);
    console.info("Done!");
  });
} catch (e) {
  console.error(e);
}
