"use client";

import { useState, useRef, forwardRef } from "react";
import jsPDF from "jspdf";
import Quality from "@/components/Quality";
// import Material from "@/components/material";

/* ---------- SAFE SVG → PNG ---------- */
function svgToPng(svgEl, scale = 4) {
  return new Promise((resolve, reject) => {
    try {
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgEl);

      const encoded = encodeURIComponent(svgString);
      const base64 = btoa(unescape(encoded));

      const img = new Image();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const width = svgEl.clientWidth;
      const height = svgEl.clientHeight;

      canvas.width = width * scale;
      canvas.height = height * scale;

      ctx.scale(scale, scale);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/png"));
      };

      img.onerror = reject;
      img.src = `data:image/svg+xml;base64,${base64}`;
    } catch (err) {
      reject(err);
    }
  });
}

/* ---------- SVG PREVIEW (NO ARROWS) ---------- */
const PanelSVG = forwardRef(function PanelSVG(
  { widthMM, heightMM, label },
  ref
) {
  const SCALE = 0.12;
  const width = Number(widthMM) * SCALE;
  const height = Number(heightMM) * SCALE;

  if (!widthMM || !heightMM) {
    return (
      <div className="flex items-center justify-center text-sm text-gray-400">
        Enter dimensions to preview
      </div>
    );
  }

  const padding = 30;
  const svgWidth = width + padding * 2;
  const svgHeight = height + padding * 2;

  return (
    <svg
      ref={ref}
      width={svgWidth}
      height={svgHeight}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      xmlns="http://www.w3.org/2000/svg"
      className="border bg-gray-50"
    >
      {/* Panel label */}
      {/* <text x={padding} y={18} fontSize="12" fontWeight="bold">
        {label || "Panel"}
      </text> */}

      {/* Glass */}
      <rect
        x={padding}
        y={30}
        width={width}
        height={height}
        fill="#93c5fd"
        stroke="#1e3a8a"
        strokeWidth="1"
      />

      {/* Width text */}
      <text
        x={padding + width / 2}
        y={30 + height + 20}
        fontSize="8"
        textAnchor="middle"
      >
        W {widthMM} mm
      </text>

      {/* Height text */}
      <text
        x={padding - 10}
        y={30 + height / 2}
        fontSize="11"
        textAnchor="middle"
        dominantBaseline="middle"
        transform={`rotate(-90 ${padding - 10} ${30 + height / 2})`}
      >
        H {heightMM} mm
      </text>
    </svg>
  );
});

/* ---------- MAIN APP ---------- */
export default function GlassMeasureApp() {
  const [jobTitle, setJobTitle] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [panels, setPanels] = useState([]);
  const svgRefs = useRef({});

  const addPanel = () => {
    setPanels((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        label: "",
        widthMM: "",
        heightMM: "",
        quantity: 1, // ✅ per-panel quantity
      },
    ]);
  };

  const deletePanel = (id) => {
    setPanels((prev) => prev.filter((p) => p.id !== id));
    delete svgRefs.current[id];
  };

  const updatePanel = (id, field, value) => {
    setPanels((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  /* ---------- PDF (3 COLUMN GRID) ---------- */
  const generatePDF = async () => {
    try {
      const pdf = new jsPDF();
      let y = 20;

      pdf.setFontSize(14);
      pdf.text(jobTitle || "Window Film Re-Cut Measurements", 20, y);
      y += 12;

      const COLS = 2;
      const CELL_WIDTH = 60;
      const CELL_HEIGHT = 90;
      const START_X = 20;
      const START_Y = y;

      let col = 0;
      let row = 0;

      for (let i = 0; i < panels.length; i++) {
        const panel = panels[i];
        const svgEl = svgRefs.current[panel.id];
        if (!svgEl) continue;

        const yPos = START_Y + row * (CELL_HEIGHT + 20);

        if (yPos + CELL_HEIGHT > 280) {
          pdf.addPage();
          col = 0;
          row = 0;
        }

        const x = START_X + col * (CELL_WIDTH + 10);
        const yFinal = START_Y + row * (CELL_HEIGHT + 20);

        const image = await svgToPng(svgEl);

        pdf.setFontSize(10);
        pdf.text(panel.label || `Panel ${i + 1}`, x, yFinal + 20);

        pdf.setFontSize(9);
        pdf.text(`W: ${panel.widthMM} mm`, x, yFinal + 5);
        pdf.text(`H: ${panel.heightMM} mm`, x, yFinal + 10);

        pdf.setFontSize(10);
        pdf.text(`Qty: ${panel.quantity}`, x, yFinal);
        y += 8;

        pdf.addImage(image, "PNG", x, yFinal + 14, CELL_WIDTH, CELL_WIDTH);

        col++;
        if (col === COLS) {
          col = 0;
          row++;
        }
      }

      const safeFileName = (jobTitle || "glass-measurements")
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase();

      pdf.save(`${safeFileName}.pdf`);
    } catch (err) {
      console.error(err);
      alert("PDF generation failed");
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-xl text-slate-700 font-semibold">
        SG Solutions Glass Measurement Recorder
      </h1>
      <div className="space-y-2">
        <label className="block text-base text-gray-900 font-semibold">
          Job Title
        </label>
        <input
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          className="border p-2 w-full rounded-lg border-gray-900"
          placeholder="e.g. Job Name or Customer Name"
        />
      </div>

      {panels.map((panel, index) => (
        <div>
          <div
            key={panel.id}
            className="border-2 rounded-xl p-4 grid md:grid-cols-2 gap-4"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-medium">Panel {index + 1}</h2>
                </div>
                <div>
                  <button
                    onClick={() => deletePanel(panel.id)}
                    className="text-xs p-2 rounded-sm bg-red-600 text-white hover:bg-red-700"
                  >
                    Delete Panel
                  </button>
                  <button>
                    <DeleteLogo />
                  </button>
                </div>
              </div>
              <input
                placeholder="Panel label"
                value={panel.label}
                onChange={(e) => updatePanel(panel.id, "label", e.target.value)}
                className="border p-2 w-full rounded border-gray-600"
              />

              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder="Width (mm)"
                  value={panel.widthMM}
                  onChange={(e) =>
                    updatePanel(panel.id, "widthMM", e.target.value)
                  }
                  className="border p-2 w-full rounded border-gray-600"
                />
                <input
                  type="number"
                  placeholder="Height (mm)"
                  value={panel.heightMM}
                  onChange={(e) =>
                    updatePanel(panel.id, "heightMM", e.target.value)
                  }
                  className="border p-2 w-full rounded border-gray-600"
                />
              </div>
              <div>
                <Quality
                  value={panel.quantity}
                  onChange={(val) => updatePanel(panel.id, "quantity", val)}
                />
              </div>
            </div>
            <div className="lg:mx-auto">
              <PanelSVG
                ref={(el) => (svgRefs.current[panel.id] = el)}
                widthMM={panel.widthMM}
                heightMM={panel.heightMM}
                label={panel.label}
              />
            </div>
          </div>
        </div>
      ))}

      <div className="flex gap-4">
        <button
          onClick={addPanel}
          className="px-4 py-2 bg-gray-800 text-white rounded"
        >
          + Add Panel
        </button>

        {panels.length > 0 && (
          <button
            onClick={generatePDF}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Download PDF
          </button>
        )}
      </div>
    </div>
  );
}

function DeleteLogo() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      viewBox="-5.0 -10.0 110.0 135.0"
    >
      <path d="m50 6.25c-24.125 0-43.75 19.625-43.75 43.75s19.625 43.75 43.75 43.75 43.75-19.625 43.75-43.75-19.625-43.75-43.75-43.75zm17.844 57.156c1.2188 1.2188 1.2188 3.2188 0 4.4375-0.625 0.59375-1.4062 0.90625-2.2188 0.90625s-1.5938-0.3125-2.2188-0.90625l-13.406-13.438-13.406 13.438c-0.625 0.59375-1.4062 0.90625-2.2188 0.90625s-1.5938-0.3125-2.2188-0.90625c-1.2188-1.2188-1.2188-3.2188 0-4.4375l13.438-13.406-13.438-13.406c-1.2188-1.2188-1.2188-3.2188 0-4.4375s3.2188-1.2188 4.4375 0l13.406 13.438 13.406-13.438c1.2188-1.2188 3.2188-1.2188 4.4375 0s1.2188 3.2188 0 4.4375l-13.438 13.406z" />
    </svg>
  );
}
