import { JORNADAS } from "../shared/jornadas.ts";
import fs from "node:fs";

const out = {};
for (const j of JORNADAS) {
  out[j.id] = {
    nome: j.nome,
    resumo: j.resumo,
    seguimento: j.seguimento,
    alertas: j.alertas,
    fontes: j.fontes,
  };
}
fs.writeFileSync("/home/ubuntu/jornadas_export.json", JSON.stringify(out, null, 2));
console.log("Exported", Object.keys(out).length, "jornadas");
