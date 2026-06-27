import React from "react";

/**
 * Renderizador de Markdown leve, sem dependências pesadas (Mermaid/Shiki/WASM).
 * Substitui o Streamdown para o conteúdo dos protocolos, que usa apenas:
 * cabeçalhos (#..######), listas (-, *, 1.), **negrito**, *itálico*, `código`,
 * links [texto](url), tabelas GFM (| a | b |) e blockquotes (>).
 *
 * Objetivo principal: reduzir drasticamente o tamanho do bundle e o pico de
 * memória do build de produção, mantendo a renderização visual equivalente.
 */

type Props = { children?: string; className?: string };

// --- Inline parser: **bold**, *italic*, `code`, [text](url) ---
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Regex combinada para os formatos inline suportados.
  const pattern = /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(`([^`]+)`)|(\[([^\]]+)\]\(([^)]+)\))/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = pattern.exec(text)) !== null) {
    if (m.index > lastIndex) {
      nodes.push(text.slice(lastIndex, m.index));
    }
    const key = `${keyPrefix}-i${i++}`;
    if (m[1]) {
      nodes.push(<strong key={key}>{m[2]}</strong>);
    } else if (m[3]) {
      nodes.push(<em key={key}>{m[4]}</em>);
    } else if (m[5]) {
      nodes.push(
        <code key={key} className="px-1 py-0.5 rounded bg-muted text-sm font-mono">
          {m[6]}
        </code>,
      );
    } else if (m[7]) {
      nodes.push(
        <a
          key={key}
          href={m[9]}
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-primary break-words"
        >
          {m[8]}
        </a>,
      );
    }
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes;
}

function splitTableRow(line: string): string[] {
  // Remove pipes das bordas e divide por pipe (sem suportar escape de pipe — não usado nos dados).
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return trimmed.split("|").map(c => c.trim());
}

function isTableSeparator(line: string): boolean {
  return /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?\s*$/.test(line);
}

export default function MarkdownLite({ children, className }: Props) {
  const src = children ?? "";
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const blocks: React.ReactNode[] = [];

  let i = 0;
  let key = 0;
  const nextKey = () => `md-${key++}`;

  while (i < lines.length) {
    const line = lines[i];

    // Linha em branco
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Tabela GFM: linha com pipe seguida de separador
    if (line.includes("|") && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      const header = splitTableRow(line);
      i += 2; // pula header + separador
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes("|") && lines[i].trim() !== "") {
        rows.push(splitTableRow(lines[i]));
        i++;
      }
      blocks.push(
        <div key={nextKey()} className="overflow-x-auto my-3">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {header.map((h, hi) => (
                  <th
                    key={hi}
                    className="border border-border bg-muted px-3 py-2 text-left font-semibold"
                  >
                    {renderInline(h, `th-${hi}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr key={ri}>
                  {r.map((c, ci) => (
                    <td key={ci} className="border border-border px-3 py-2 align-top">
                      {renderInline(c, `td-${ri}-${ci}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    // Cabeçalhos
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      const content = renderInline(h[2], `h-${i}`);
      const sizes = ["text-2xl", "text-xl", "text-lg", "text-base", "text-base", "text-sm"];
      const cls = `font-bold mt-4 mb-2 ${sizes[level - 1]}`;
      const k = nextKey();
      switch (level) {
        case 1: blocks.push(<h1 key={k} className={cls}>{content}</h1>); break;
        case 2: blocks.push(<h2 key={k} className={cls}>{content}</h2>); break;
        case 3: blocks.push(<h3 key={k} className={cls}>{content}</h3>); break;
        case 4: blocks.push(<h4 key={k} className={cls}>{content}</h4>); break;
        case 5: blocks.push(<h5 key={k} className={cls}>{content}</h5>); break;
        default: blocks.push(<h6 key={k} className={cls}>{content}</h6>); break;
      }
      i++;
      continue;
    }

    // Blockquote
    if (/^\s*>\s?/.test(line)) {
      const quoteLines: string[] = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        quoteLines.push(lines[i].replace(/^\s*>\s?/, ""));
        i++;
      }
      blocks.push(
        <blockquote
          key={nextKey()}
          className="border-l-4 border-primary/40 pl-4 italic my-3 text-muted-foreground"
        >
          {renderInline(quoteLines.join(" "), `bq-${i}`)}
        </blockquote>,
      );
      continue;
    }

    // Lista não ordenada
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ""));
        i++;
      }
      blocks.push(
        <ul key={nextKey()} className="list-disc pl-6 my-2 space-y-1">
          {items.map((it, ii) => (
            <li key={ii}>{renderInline(it, `li-${ii}`)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    // Lista ordenada
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
        i++;
      }
      blocks.push(
        <ol key={nextKey()} className="list-decimal pl-6 my-2 space-y-1">
          {items.map((it, ii) => (
            <li key={ii}>{renderInline(it, `oli-${ii}`)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    // Parágrafo: agrupa linhas consecutivas que não iniciam outro bloco
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^(#{1,6})\s+/.test(lines[i]) &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !/^\s*>\s?/.test(lines[i]) &&
      !(lines[i].includes("|") && i + 1 < lines.length && isTableSeparator(lines[i + 1]))
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push(
        <p key={nextKey()} className="my-2 leading-relaxed">
          {renderInline(paraLines.join(" "), `p-${i}`)}
        </p>,
      );
    }
  }

  return <div className={className}>{blocks}</div>;
}
