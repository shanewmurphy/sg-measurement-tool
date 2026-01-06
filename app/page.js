"use client";

import { useState, useRef, forwardRef } from "react";
import jsPDF from "jspdf";
import Quality from "@/components/Quality";

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

/* ---------- SVG PREVIEW ---------- */
const PanelSVG = forwardRef(function PanelSVG({ widthMM, heightMM }, ref) {
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
      className="border bg-gray-50"
    >
      <rect
        x={padding}
        y={30}
        width={width}
        height={height}
        fill="#93c5fd"
        stroke="#1e3a8a"
        strokeWidth="1"
      />

      <text
        x={padding + width / 2}
        y={30 + height + 20}
        fontSize="8"
        textAnchor="middle"
      >
        W {widthMM} mm
      </text>

      <text
        x={padding - 10}
        y={30 + height / 2}
        fontSize="10"
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
        quantity: 1,
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

  /* ---------- m² CALCULATIONS ---------- */
  const calcPanelM2 = (panel) =>
    (Number(panel.widthMM) / 1000) *
    (Number(panel.heightMM) / 1000) *
    panel.quantity;

  const totalM2 = panels.reduce((sum, p) => sum + calcPanelM2(p), 0);

  /* ---------- PDF ---------- */
  const generatePDF = async () => {
    try {
      const pdf = new jsPDF();
      let y = 20;

      pdf.setFontSize(14);
      pdf.text(jobTitle || "Window Film Re-Cut Measurements", 105, y, {
        align: "center",
      });
      y += 10;

      const COLS = 2;
      const CELL_WIDTH = 60;
      const CELL_HEIGHT = 90;
      const START_X = 30;
      const START_Y = y;

      let col = 0;
      let row = 0;

      for (let i = 0; i < panels.length; i++) {
        const panel = panels[i];
        const svgEl = svgRefs.current[panel.id];
        if (!svgEl) continue;

        const yPos = START_Y + row * (CELL_HEIGHT + 25);
        if (yPos + CELL_HEIGHT > 280) {
          pdf.addPage();
          col = 0;
          row = 0;
        }

        const x = START_X + col * (CELL_WIDTH + 20);
        const yFinal = START_Y + row * (CELL_HEIGHT + 25);

        const image = await svgToPng(svgEl);
        const panelM2 = calcPanelM2(panel);

        pdf.setFontSize(9);
        pdf.text(panel.label || `Panel ${i + 1}`, x, yFinal);
        pdf.text(`W: ${panel.widthMM} mm`, x, yFinal + 5);
        pdf.text(`H: ${panel.heightMM} mm`, x, yFinal + 10);
        pdf.text(`Qty: ${panel.quantity}`, x, yFinal + 15);
        pdf.text(`Area: ${panelM2.toFixed(2)} m²`, x, yFinal + 20);

        pdf.addImage(image, "PNG", x, yFinal + 24, CELL_WIDTH, CELL_WIDTH);

        col++;
        if (col === COLS) {
          col = 0;
          row++;
        }
      }

      pdf.setFontSize(12);
      pdf.text(`Total Area: ${totalM2.toFixed(2)} m²`, 105, 290, {
        align: "center",
      });

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
      <h1 className="text-xl font-semibold">
        SG Solutions Glass Measurement Recorder
      </h1>

      <input
        value={jobTitle}
        onChange={(e) => setJobTitle(e.target.value)}
        className="border p-2 w-full rounded"
        placeholder="Job title"
      />
      <div>
        {panels.length > 0 && (
          <div className="font-medium bg-gray-100 rounded-md p-4">
            Total Area: {totalM2.toFixed(2)} m²
          </div>
        )}
      </div>
      {panels.map((panel, index) => (
        <div
          key={panel.id}
          className="border-2 rounded-xl p-4 grid md:grid-cols-2 gap-4"
        >
          <div className="space-y-3">
            <h2 className="font-medium">Panel {index + 1}</h2>

            <input
              placeholder="Panel label"
              value={panel.label}
              onChange={(e) => updatePanel(panel.id, "label", e.target.value)}
              className="border p-2 w-full rounded"
            />

            <div className="flex gap-3">
              <input
                type="number"
                placeholder="Width (mm)"
                value={panel.widthMM}
                onChange={(e) =>
                  updatePanel(panel.id, "widthMM", e.target.value)
                }
                className="border p-2 w-full rounded"
              />
              <input
                type="number"
                placeholder="Height (mm)"
                value={panel.heightMM}
                onChange={(e) =>
                  updatePanel(panel.id, "heightMM", e.target.value)
                }
                className="border p-2 w-full rounded"
              />
            </div>

            <Quality
              value={panel.quantity}
              onChange={(val) => updatePanel(panel.id, "quantity", val)}
            />

            {panel.widthMM && panel.heightMM && (
              <p className="text-sm text-gray-600">
                Area: {calcPanelM2(panel).toFixed(2)} m²
              </p>
            )}

            <button
              onClick={() => deletePanel(panel.id)}
              className="text-sm text-red-600"
            >
              Delete Panel
            </button>
          </div>

          <PanelSVG
            ref={(el) => (svgRefs.current[panel.id] = el)}
            widthMM={panel.widthMM}
            heightMM={panel.heightMM}
          />
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
