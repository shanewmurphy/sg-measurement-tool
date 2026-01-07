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
  const SCALE = 0.1;
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

  const totalPanels = panels.reduce(
    (sum, panel) => sum + Number(panel.quantity || 1),
    0
  );

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

  /*-------Helper Function-------*/
  const calculateTotalAreaM2 = (panels) => {
    return panels.reduce((total, panel) => {
      const w = Number(panel.widthMM);
      const h = Number(panel.heightMM);
      const qty = Number(panel.quantity || 1);

      if (!w || !h) return total;

      const areaM2 = (w * h) / 1_000_000; // mm² → m²
      return total + areaM2 * qty;
    }, 0);
  };

  /* ---------- summary values ---------- */
  // const totalPanels = panels.length;

  const totalCutCopies = panels.reduce(
    (sum, panel) => sum + Number(panel.quantity || 0),
    0
  );

  const generatePDF = async () => {
    try {
      const pdf = new jsPDF();
      let y = 20;

      pdf.setFontSize(14);
      pdf.text(jobTitle || "Window Film Re-Cut Measurements", 20, y);
      y += 10;

      // ✅ TOTAL AREA
      const totalArea = calculateTotalAreaM2(panels);
      pdf.setFontSize(11);
      pdf.text(`Total Area: ${totalArea.toFixed(2)} m²`, 20, y);
      y += 12;

      /*--- Panels Copies -----*/
      pdf.setFontSize(11);
      pdf.text(`Total panels: ${totalPanels}`, 20, y);
      y += 6;

      pdf.text(`Total cut copies: ${totalCutCopies}`, 20, y);
      y += 10;

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
        pdf.text(panel.label || `Panel ${i + 1}`, x, yFinal);

        pdf.setFontSize(9);
        pdf.text(`W: ${panel.widthMM} mm`, x, yFinal + 5);
        pdf.text(`H: ${panel.heightMM} mm`, x, yFinal + 10);
        pdf.text(`Qty: ${panel.quantity}`, x, yFinal + 15);

        pdf.addImage(image, "PNG", x, yFinal + 20, CELL_WIDTH, CELL_WIDTH);

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
      <div className="flex items-center justify-start">
        <div>
          <LogoIcon />
        </div>
        <div>
          <h1 className="text-xl font-semibold pl-2">Measurement Recorder</h1>
        </div>
      </div>
      <input
        value={jobTitle}
        onChange={(e) => setJobTitle(e.target.value)}
        className="border p-2 w-full rounded"
        placeholder="Job title"
      />
      <div className="flex justify-end items-center bg-gray-100 rounded-md p-4">
        {/* <div>Panels: {panels.length}</div> */}
        <div>
          {panels.length > 0 && (
            <div className="font-bold text-gray-600 text-xl">
              <div className="text-sm font-medium inline-block pr-1">
                Total Area:
              </div>
              {totalM2.toFixed(2)} m²
            </div>
          )}
        </div>
      </div>
      {panels.map((panel, index) => (
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
                  className="text-sm font-semibold rounded-md py-1 px-3.5 bg-red-600 text-white hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>

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
          </div>
          <div className="lg:mx-auto">
            <PanelSVG
              ref={(el) => (svgRefs.current[panel.id] = el)}
              widthMM={panel.widthMM}
              heightMM={panel.heightMM}
            />
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

function LogoIcon() {
  return (
    <svg
      id="Layer_2"
      data-name="Layer 2"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32.71 29.46"
      className="h-14 w-14"
    >
      <defs>
        <style>{`
      .cls-1 { fill: #1d1d1b; }
      .cls-2 { fill: #e83368; }
    `}</style>
      </defs>
      <g id="Art">
        <g>
          <polygon
            className="cls-2"
            points="24.36 9.96 24.36 13.24 29.42 13.24 29.42 18.3 32.71 15.02 32.71 9.96 24.36 9.96"
          />
          <path
            className="cls-1"
            d="M13.54,27.94c0,.56-.32.89-.89.89s-.89-.33-.89-.89v-2.45h-.68v2.51c0,.9.58,1.46,1.56,1.46s1.57-.56,1.57-1.46v-2.51h-.68v2.45ZM16.07,29.39h.68v-3.33l-.68.68v2.65ZM8.85,25.49h-.68v3.9h2.27v-.57h-1.58v-3.33ZM5.21,25.42c-1.15,0-2.02.9-2.02,2.02s.87,2.02,2.02,2.02,2.02-.88,2.02-2.02-.88-2.02-2.02-2.02ZM5.21,28.84c-.77,0-1.34-.6-1.34-1.39s.56-1.39,1.34-1.39,1.33.61,1.33,1.39-.56,1.39-1.33,1.39ZM1.47,27.18c-.59-.22-.8-.4-.8-.68,0-.3.3-.48.74-.48.35,0,.72.11.95.23v-.64c-.23-.1-.61-.2-1-.2-.79,0-1.36.41-1.36,1.09,0,.63.38.94,1.09,1.19.6.21.82.38.82.69,0,.21-.17.35-.44.42-.11.03-.25.04-.39.04-.39-.01-.76-.14-1.04-.28v.67c.27.11.69.22,1.14.22.87,0,1.39-.41,1.39-1.09,0-.62-.39-.92-1.1-1.19ZM27.71,27.95l-.19-.18-2.27-2.33h-.02v3.96h.67v-2.45c.06.05.13.12.19.17l2.28,2.34h.02v-3.96h-.67v2.45ZM22.27,25.42c-1.15,0-2.02.9-2.02,2.02s.87,2.02,2.02,2.02,2.02-.88,2.02-2.02-.88-2.02-2.02-2.02ZM22.27,28.84c-.77,0-1.34-.6-1.34-1.39s.56-1.39,1.34-1.39,1.33.61,1.33,1.39-.56,1.39-1.33,1.39ZM30.83,27.18c-.59-.22-.8-.4-.8-.68,0-.3.3-.48.74-.48.35,0,.72.11.95.23v-.64c-.23-.1-.61-.2-1-.2-.79,0-1.36.41-1.36,1.09,0,.63.38.94,1.09,1.19.6.21.82.38.82.69,0,.21-.17.35-.44.42-.11.03-.25.04-.39.04-.39-.01-.76-.14-1.04-.28v.67c.27.11.69.22,1.14.22.87,0,1.39-.41,1.39-1.09,0-.62-.39-.92-1.1-1.19ZM14.94,26.07h2.95v-.57h-2.95v.57ZM18.64,29.39h.68v-3.9h-.68v3.9ZM26.81,21.59h0s2.61,0,2.61,0v-3.35h-2.61c-4.11,0-7.45-3.34-7.45-7.45h0c0-4.11,3.34-7.45,7.45-7.45h2.61V0h-2.61c-5.95,0-10.8,4.84-10.8,10.8h0c0,5.95,4.84,10.8,10.8,10.8ZM13.23,0h-2.72l-3.29,3.29h6.01V0ZM8.23,9.56c-3.37-1.17-4.63-2.19-4.63-3.77s1.39-2.32,3.61-2.5V0c-2.04.07-3.79.6-5.08,1.56C.74,2.6,0,4.09,0,5.84c0,3.57,2.36,5.09,6.16,6.39,3.53,1.19,4.72,2.16,4.72,3.83,0,1.15-.92,1.98-2.6,2.36-.58.16-1.32.24-2.24.24-2.48-.07-4.67-.93-5.83-1.48v3.41c1.87.74,4.26,1.18,6.41,1.18,4.9,0,7.83-2.19,7.83-5.85,0-3.46-2.38-4.99-6.23-6.36Z"
          />
        </g>
      </g>
    </svg>
  );
}
