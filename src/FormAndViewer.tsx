import { useEffect, useRef, useState } from "react";
import { Form, Viewer, Template, checkTemplate } from "@pdfme/ui";
import { generate } from "@pdfme/generator";
import {
  getFontsData,
  getTemplate,
  getTemplateFromJsonFile,
  isJsonString,
} from "./helper";

type Mode = "form" | "viewer";

const initTemplate = () => {
  let template: Template = getTemplate();
  try {
    const templateString = localStorage.getItem("template");
    const templateJson = templateString
      ? JSON.parse(templateString)
      : getTemplate();
    checkTemplate(templateJson);
    template = templateJson as Template;
  } catch {
    localStorage.removeItem("template");
  }
  return template;
};

function App() {
  const uiRef = useRef<HTMLDivElement | null>(null);
  const ui = useRef<Form | Viewer | null>(null);

  const [mode, setMode] = useState<Mode>(
    (localStorage.getItem("mode") as Mode) ?? "form"
  );

  useEffect(() => {
    const template = initTemplate();
    let inputs = template.sampledata ?? [{}];
    try {
      const inputsString = localStorage.getItem("inputs");
      const inputsJson = inputsString
        ? JSON.parse(inputsString)
        : template.sampledata ?? [{}];
      inputs = inputsJson;
    } catch {
      localStorage.removeItem("inputs");
    }

    getFontsData().then((font) => {
      if (uiRef.current) {
        ui.current = new (mode === "form" ? Form : Viewer)({
          domContainer: uiRef.current,
          template,
          inputs,
          options: { font },
        });
      }
    });

    return () => {
      if (ui.current) {
        ui.current.destroy();
      }
    };
  }, [uiRef, mode]);

  const onChangeMode = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value as Mode;
    setMode(value);
    localStorage.setItem("mode", value);
  };

  const onLoadTemplate = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target && e.target.files) {
      getTemplateFromJsonFile(e.target.files[0])
        .then((t) => {
          if (ui.current) {
            ui.current.updateTemplate(t);
          }
        })
        .catch((e) => {
          alert(`Invalid template file.
--------------------------
${e}`);
        });
    }
  };

  const onGetInputs = () => {
    if (ui.current) {
      const inputs = ui.current.getInputs();
      alert(JSON.stringify(inputs, null, 2));
      alert("Dumped as console.log");
      console.log(inputs);
    }
  };

  const onSetInputs = () => {
    if (ui.current) {
      const prompt = window.prompt("Enter Inputs JSONString") || "";
      try {
        const json = isJsonString(prompt) ? JSON.parse(prompt) : [{}];
        ui.current.setInputs(json);
      } catch (e) {
        alert(e);
      }
    }
  };

  const onSaveInputs = () => {
    if (ui.current) {
      const inputs = ui.current.getInputs();
      localStorage.setItem("inputs", JSON.stringify(inputs));
      alert("Saved!");
    }
  };

  const onResetInputs = () => {
    localStorage.removeItem("inputs");
    if (ui.current) {
      const template = initTemplate();
      ui.current.setInputs(template.sampledata ?? [{}]);
    }
  };

  const onGeneratePDF = async () => {
    if (ui.current) {
      const template = ui.current.getTemplate();
      const inputs = ui.current.getInputs();
      const font = await getFontsData();
      const pdf = await generate({ template, inputs, options: { font } });
      const blob = new Blob([pdf.buffer], { type: "application/pdf" });
      window.open(URL.createObjectURL(blob));
    }
  };

  return (
    <div>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <strong>Form, Viewer</strong>
        <span style={{ margin: "0 1rem" }}>:</span>
        <div>
          <input
            type="radio"
            onChange={onChangeMode}
            id="form"
            value="form"
            checked={mode === "form"}
          />
          <label htmlFor="form">Form</label>
          <input
            type="radio"
            onChange={onChangeMode}
            id="viewer"
            value="viewer"
            checked={mode === "viewer"}
          />
          <label htmlFor="viewer">Viewer</label>
        </div>
        <label style={{ width: 180 }}>
          Load Template
          <input
            type="file"
            accept="application/json"
            onChange={onLoadTemplate}
          />
        </label>
        <span style={{ margin: "0 1rem" }}>/</span>
        <button onClick={onGetInputs}>Get Inputs</button>
        <span style={{ margin: "0 1rem" }}>/</span>
        <button onClick={onSetInputs}>Set Inputs</button>
        <span style={{ margin: "0 1rem" }}>/</span>
        <button onClick={onSaveInputs}>Save Inputs</button>
        <span style={{ margin: "0 1rem" }}>/</span>
        <button onClick={onResetInputs}>Reset Inputs</button>
        <span style={{ margin: "0 1rem" }}>/</span>
        <button onClick={onGeneratePDF}>Generate PDF</button>
      </header>
      <div ref={uiRef} />
    </div>
  );
}

export default App;
