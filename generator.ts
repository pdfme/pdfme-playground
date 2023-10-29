import { Template, checkTemplate } from "@pdfme/common"
import { generate } from "@pdfme/generator";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const templateJsonString = readFileSync("./template.json", "utf8");
const font = {
  "NotoSerifJP-Regular": {
    data: readFileSync("public/fonts/NotoSerifJP-Regular.otf"),
    fallback: true,
  },
  "NotoSansJP-Regular": {
    data: readFileSync("public/fonts/NotoSansJP-Regular.otf"),
  },
  "NotoSansSC-Regular": {
    data: readFileSync("public/fonts/NotoSansSC-Regular.otf"),
  },
  "ZenKurenaido-Regular": {
    data: readFileSync("public/fonts/ZenKurenaido-Regular.ttf"),
  },
};

try {
  const templateJson = JSON.parse(templateJsonString);
  checkTemplate(templateJson);
  const template: Template = templateJson;
  generate({
    template,
    inputs: [
      {
        name: "田中太郎 轟", // NotoSansJP-Regular
        age: "English 中国产品", // NotoSansSC-Regular
        sex: "男", // ZenKurenaido-Regular
        weight: "33パウンド",
        breed: "マット",
        owner: "https://pdfme.com/",
      },
    ],
    options: { font },
  }).then((pdf) => {
    writeFileSync(join(__dirname, "generated.pdf"), pdf);
    console.info("Done!");
  });
} catch (e) {
  console.error(e);
}
