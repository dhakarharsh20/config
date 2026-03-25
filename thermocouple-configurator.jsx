import { useState, useEffect, useRef } from "react";
import * as THREE from "three";

/* ═══════════════════════════════════════════ CATALOG ══ */
const CAT = {
  tcTypes: [
    { code:"K", name:"Chromel / Alumel",        alloy:"Ni-Cr / Ni-Al",  range:"-200 to 1250°C", app:"Oxidizing / inert",               noble:false, refrac:false, col:0xE07030 },
    { code:"J", name:"Iron / Constantan",        alloy:"Fe / Cu-Ni",     range:"0 to 750°C",     app:"Vacuum, oxidizing, reducing",      noble:false, refrac:false, col:0x4477EE },
    { code:"N", name:"Nicrosil / Nisil",          alloy:"Ni-Cr-Si/Ni-Si", range:"-270 to 1300°C", app:"Oxidizing / inert",               noble:false, refrac:false, col:0xEEAA00 },
    { code:"T", name:"Copper / Constantan",       alloy:"Cu / Cu-Ni",     range:"-200 to 350°C",  app:"Inert, oxidizing, reducing",       noble:false, refrac:false, col:0xCC7733 },
    { code:"E", name:"Chromel / Constantan",      alloy:"Ni-Cr / Cu-Ni",  range:"-200 to 900°C",  app:"Oxidizing / inert (max EMF)",      noble:false, refrac:false, col:0x44AA44 },
    { code:"R", name:"Pt-13%Rh / Pure Pt",        alloy:"Pt-Rh / Pt",     range:"0 to 1450°C",    app:"Inert / oxidizing",               noble:true,  refrac:false, col:0xDDDDD0 },
    { code:"S", name:"Pt-10%Rh / Pure Pt",        alloy:"Pt-Rh / Pt",     range:"0 to 1450°C",    app:"Inert / oxidizing",               noble:true,  refrac:false, col:0xE0E0D8 },
    { code:"B", name:"Pt-30%Rh / Pt-6%Rh",        alloy:"Pt-Rh / Pt-Rh",  range:"0 to 1700°C",    app:"Inert / oxidizing",               noble:true,  refrac:false, col:0xEEDDBB },
    { code:"C", name:"W-5%Re / W-26%Re",           alloy:"W-Re / W-Re",    range:"0 to 2320°C",    app:"Vacuum / inert / H2 ONLY",        noble:false, refrac:true,  col:0x9999BB },
    { code:"D", name:"W-3%Re / W-25%Re",           alloy:"W-Re / W-Re",    range:"0 to 2320°C",    app:"Vacuum / inert / H2 ONLY",        noble:false, refrac:true,  col:0x7799AA },
  ],
  elements: [
    { code:"S", label:"Simplex (Single Element)" },
    { code:"D", label:"Duplex (Dual Element)" },
    { code:"M", label:"Multipoint" },
  ],
  junctions: [
    { code:"GN", name:"Grounded",   desc:"Welded to sheath tip — fastest MI response, high-pressure rated" },
    { code:"UN", name:"Ungrounded", desc:"Floating in MgO — full electrical isolation, standard industrial" },
    { code:"EX", name:"Exposed",    desc:"Extends beyond sheath — fastest response, non-corrosive gas only" },
  ],
  sheaths: [
    { code:"316", name:"SS 316",        maxT:900,  col:0xBBBBCC },
    { code:"310", name:"SS 310",        maxT:1150, col:0xAAAAAC },
    { code:"600", name:"Inconel-600",   maxT:1150, col:0x888870 },
    { code:"800", name:"Incoloy-800",   maxT:1000, col:0x909090 },
    { code:"446", name:"HRS-446",       maxT:1100, col:0xA0A0A8 },
    { code:"Pt",  name:"Platinum",      maxT:1600, col:0xE8E4D8 },
    { code:"Mo",  name:"Molybdenum",    maxT:1900, col:0x909098 },
  ],
  diameters: [1, 1.5, 3, 4.5, 6, 8],
  heads: [
    { code:"C",    name:"Connection Head",   ip:"IP 67", atex:"—",          col:0xAAAAAA },
    { code:"D",    name:"Double Entry Head", ip:"IP 65", atex:"—",          col:0x999999 },
    { code:"EB",   name:"Ex-D IIB Head",     ip:"IP 65+",atex:"Zone 1 & 2", col:0x888888 },
    { code:"EC",   name:"Ex-D IIC Head",     ip:"IP 65+",atex:"Zone 1 & 2", col:0x808080 },
    { code:"M",    name:"Miniature Head",    ip:"IP 40", atex:"—",          col:0x8899AA },
    { code:"P",    name:"Plastic Head",      ip:"IP 54", atex:"—",          col:0x556644 },
    { code:"None", name:"No Head (Cable)",   ip:"—",     atex:"—",          col:0x555555 },
  ],
  thermowells: [
    { code:"None",       name:"No Thermowell",            model:"",      shape:"none"     },
    { code:"Straight",   name:"Straight Thermowell",      model:"A-100", shape:"straight" },
    { code:"Tapered",    name:"Tapered Thermowell",       model:"A-103", shape:"tapered"  },
    { code:"Stepped",    name:"Stepped Thermowell",       model:"A-105", shape:"stepped"  },
    { code:"HeavyWall",  name:"Heavy Duty Thick Wall",    model:"A-109", shape:"straight" },
    { code:"Flanged",    name:"Straight TW + Flange",     model:"A-110", shape:"straight" },
    { code:"TaperFlange",name:"Tapered TW + Flange",      model:"A-111", shape:"tapered"  },
  ],
  twMaterials: [
    { code:"316", name:"SS 316",          maxT:900  },
    { code:"310", name:"SS 310",          maxT:1150 },
    { code:"304", name:"SS 304",          maxT:850  },
    { code:"600", name:"Inconel-600",     maxT:1150 },
    { code:"800", name:"Incoloy-800",     maxT:1000 },
    { code:"446", name:"HRS-446",         maxT:1100 },
    { code:"WC",  name:"Tungsten Carbide",maxT:800  },
  ],
  connections: [
    { code:"BSP",    name:"BSP Thread" },
    { code:"NPT",    name:"NPT Thread" },
    { code:"M20",    name:"M-Thread M20x1.5" },
    { code:"M27",    name:"M-Thread M27x2" },
    { code:"Nipple", name:"Nipple 1/2\" SCH 80" },
    { code:"NUN",    name:"Nipple-Union-Nipple (N/U/N)" },
    { code:"F150",   name:"ANSI Flange #150 RF" },
    { code:"F300",   name:"ANSI Flange #300 RF" },
    { code:"F600",   name:"ANSI Flange #600 RF" },
    { code:"Bayonet",name:"Bayonet (Spring-loaded)" },
    { code:"WeldPad",name:"Weld Pad (Surface Mount)" },
  ],
  cables: [
    { code:"A",    name:"Teflon/Teflon insulated + Teflon jacket",  maxT:260, col:0xEEEEEE },
    { code:"B",    name:"Teflon insulated + SS316 wire braid",       maxT:260, col:0x909090 },
    { code:"C",    name:"FG/FG insulated flexible cable",            maxT:600, col:0xDDBB99 },
    { code:"D",    name:"PVC/PVC insulated flexible cable",          maxT:105, col:0x222222 },
    { code:"E",    name:"FG/FG insulated + SS wire braided",         maxT:600, col:0x777060 },
    { code:"None", name:"No Extension Cable",                        maxT:0,   col:0xAAAAAA },
  ],
  fittingThreads: ["1/4\"","3/8\"","1/2\"","3/4\"","1\"","1-1/4\"","1-1/2\"","2\"","M18x1.5","M20x1.5","M27x2","M33x2"],
};

function deriveModel(c) {
  const tc = CAT.tcTypes.find(t=>t.code===c.tcType);
  if (tc?.noble) {
    if (c.thermowell!=="None") return c.connection?.startsWith("F")?"T-805":"T-804";
    return c.head!=="None"?"T-803":"T-800";
  }
  if (tc?.refrac) return c.cable!=="None"?"T-988":"T-990";
  if (c.thermowell!=="None") {
    if (c.connection==="NUN")    return ["Tapered","TaperFlange"].includes(c.thermowell)?"T-651":"T-653";
    if (c.connection==="Nipple") return ["Tapered","TaperFlange"].includes(c.thermowell)?"T-650":"T-652";
    if (c.connection?.startsWith("F")) {
      if (["Tapered","TaperFlange"].includes(c.thermowell)) return c.connection==="F150"?"T-726":"T-727";
      if (c.thermowell==="Stepped") return "T-732";
      return "T-729";
    }
    if (["Tapered","TaperFlange"].includes(c.thermowell)) return "T-503";
    if (c.cable!=="None") return "T-504";
    return "T-501";
  }
  if (c.head==="None") {
    if (c.connection==="Bayonet") return "T-203";
    if (c.connection==="WeldPad") return "T-206";
    return c.cable!=="None"?"T-201":"T-200";
  }
  if (c.connection==="WeldPad") return "T-104";
  if (c.connection==="Nipple")  return "T-105";
  if (c.connection==="NUN")     return "T-106";
  return "T-101";
}

function validate(c) {
  const E=[],W=[],I=[];
  const tc=CAT.tcTypes.find(t=>t.code===c.tcType);
  const sh=CAT.sheaths.find(s=>s.code===c.sheath);
  const cb=CAT.cables.find(x=>x.code===c.cable);
  const twm=CAT.twMaterials.find(m=>m.code===c.twMaterial);
  const pT=parseInt(c.processTemp)||0;
  if(tc?.refrac) E.push("Type C/D: NEVER expose to oxidising atmosphere above 300°C. Use vacuum, inert gas, or H2 only (ASTM E696).");
  if(tc?.noble)  I.push("Noble metal (R/S/B): ceramic protection tubes Ker-610/Ker-710 mandatory. Use TC-alloy terminal lugs to prevent parasitic EMF.");
  if(c.junction==="EX"&&c.thermowell!=="None") E.push("Exposed (EX) junction incompatible with thermowell — open tip cannot seat inside bore.");
  if(c.junction==="EX") W.push("Exposed junction: fast-transient non-corrosive gas only. Not rated for pressure or corrosive media.");
  if(c.element==="D"&&c.junction==="GN") W.push("Grounded junction + duplex element: risk of ground loops in multi-point systems. Prefer Ungrounded (UN).");
  if(sh&&pT&&sh.maxT<pT) W.push(`Sheath max temp ${sh.maxT}°C is below specified process temp ${pT}°C. Upgrade sheath material.`);
  if(cb&&cb.code!=="None"&&sh&&cb.maxT<sh.maxT) W.push(`Cable Type-${c.cable} rated to ${cb.maxT}°C but sheath rated to ${sh.maxT}°C. Cable may limit assembly performance.`);
  if(c.thermowell!=="None"&&(c.connection==="WeldPad"||c.connection==="Bayonet")) E.push(`${c.connection==="WeldPad"?"Weld Pad":"Bayonet"} connection incompatible with thermowell assemblies.`);
  if((c.head==="EB"||c.head==="EC")&&!["BSP","NPT"].includes(c.connection)) W.push("Explosion-proof heads (EB/EC) use 1/2\" NPT or BSP cable gland entries only.");
  if(c.connection==="WeldPad") I.push("Weld Pad: specify pipe OD — underside radius must match pipe OD for accurate surface temperature reading.");
  if(c.thermowell!=="None"&&twm&&sh&&twm.maxT<sh.maxT) W.push(`Thermowell material max ${twm.maxT}°C lower than sheath max ${sh.maxT}°C.`);
  if(c.element==="D"&&c.cable!=="None") I.push("Duplex element with cable: use 4-conductor compensating cable. Both elements terminate at same head.");
  if(c.thermowell!=="None") I.push("Compression spring recommended — maintains tip contact and improves response time by 15-30%.");
  return {E,W,I};
}

function makeBOM(c) {
  const tc=CAT.tcTypes.find(t=>t.code===c.tcType);
  const sh=CAT.sheaths.find(s=>s.code===c.sheath);
  const hd=CAT.heads.find(h=>h.code===c.head);
  const jx=CAT.junctions.find(j=>j.code===c.junction);
  const tw=CAT.thermowells.find(t=>t.code===c.thermowell);
  const twm=CAT.twMaterials.find(m=>m.code===c.twMaterial);
  const cb=CAT.cables.find(x=>x.code===c.cable);
  const cn=CAT.connections.find(x=>x.code===c.connection);
  const el=CAT.elements.find(e=>e.code===c.element);
  return [
    {no:"01",item:"TC Element",        spec:`Type ${c.tcType} — ${tc?.name} (${tc?.alloy})`,                                  qty:c.element==="D"?"2 pcs":"1 pc"},
    {no:"02",item:"Configuration",     spec:el?.label,                                                                        qty:"—"},
    {no:"03",item:"Junction Type",     spec:`${jx?.name} (${c.junction})`,                                                    qty:"1 pc"},
    {no:"04",item:"MI Sheath",         spec:`${sh?.name} · O${c.diameter}mm OD · L=${c.length}mm`,                            qty:"1 pc"},
    c.head!=="None"&&{no:"05",item:"Connection Head",  spec:`Type ${c.head} — ${hd?.name} · ${hd?.ip}${hd?.atex!=="—"?" · ATEX "+hd?.atex:""}`,qty:"1 pc"},
    {no:"06",item:"Process Connection",spec:`${cn?.name}${c.fittingThread?" · Thread: "+c.fittingThread:""}`,                 qty:"1 pc"},
    c.thermowell!=="None"&&{no:"07",item:`Thermowell (${tw?.model})`,spec:`${tw?.name} · ${twm?.name} · I.L.=${c.insertionLen}mm`,qty:"1 pc"},
    c.thermowell!=="None"&&{no:"08",item:"Compression Spring",       spec:"SS 316 · Tip-to-well contact · +15-30% response",  qty:"1 pc"},
    cb?.code!=="None"&&{no:"09",item:`Cable Type-${c.cable}`,        spec:`${cb?.name} · ${c.cableLen}m · max ${cb?.maxT}°C`, qty:`${c.cableLen}m`},
    {no:"10",item:"Tag Plate",         spec:"SS 316 · Laser engraved: Tag no., Loop no., TC type",                            qty:"1 pc"},
  ].filter(Boolean);
}

/* ═══════════════════════════════════════════ PDF via Blob download ══ */
function downloadDatasheet(c) {
  const mc=deriveModel(c);
  const tc=CAT.tcTypes.find(t=>t.code===c.tcType);
  const sh=CAT.sheaths.find(s=>s.code===c.sheath);
  const hd=CAT.heads.find(h=>h.code===c.head);
  const jx=CAT.junctions.find(j=>j.code===c.junction);
  const tw=CAT.thermowells.find(t=>t.code===c.thermowell);
  const twm=CAT.twMaterials.find(m=>m.code===c.twMaterial);
  const cb=CAT.cables.find(x=>x.code===c.cable);
  const cn=CAT.connections.find(x=>x.code===c.connection);
  const el=CAT.elements.find(e=>e.code===c.element);
  const bom=makeBOM(c);
  const val=validate(c);
  const date=new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"long",year:"numeric"});

  const cfgRows=[
    ["Model Code",`<b style="color:#1E3A7A;font-size:15px">${mc}</b>`],
    ["TC Type",`Type ${c.tcType} — ${tc?.name}`],
    ["Alloy (+ / -)",tc?.alloy||"—"],
    ["Temperature Range",tc?.range||"—"],
    ["Application",tc?.app||"—"],
    ["Configuration",el?.label||"—"],
    ["Junction Style",`${c.junction} — ${jx?.name}`],
    ["Sheath Material",`${sh?.name} (max ${sh?.maxT}°C)`],
    ["Sheath OD",`Ø${c.diameter} mm`],
    ["Overall TC Length (L)",`${c.length} mm`],
    ["Connection Head",c.head==="None"?"None (Cable Assembly)":`Type ${c.head} — ${hd?.name} · ${hd?.ip}${hd?.atex!=="—"?" · ATEX "+hd?.atex:""}`],
    ["Process Connection",cn?.name||"—"],
    ["Fitting Thread",c.fittingThread||"N/A"],
    ["Thermowell",c.thermowell==="None"?"None":`${tw?.name} (${tw?.model})`],
    ["Thermowell Material",c.thermowell!=="None"?`${twm?.name} (max ${twm?.maxT}°C)`:"N/A"],
    ["Insertion Length (I.L.)",c.thermowell!=="None"?`${c.insertionLen} mm`:"N/A"],
    ["Extension Cable",cb?.code==="None"?"None":`Type ${c.cable} — ${cb?.name}`],
    ["Cable Length",cb?.code!=="None"?`${c.cableLen} m`:"N/A"],
    ["Process Temperature",c.processTemp?`${c.processTemp}°C`:"Not specified"],
  ];

  const valBlock=(items,type)=>{
    if(!items.length) return "";
    const s={E:{bg:"#fff5f5",bl:"#e53e3e",label:"ERROR",lc:"#c53030"},W:{bg:"#fffbeb",bl:"#d69e2e",label:"WARNING",lc:"#b7791f"},I:{bg:"#ebf8ff",bl:"#3182ce",label:"INFO",lc:"#2b6cb0"}}[type];
    return items.map(m=>`<div style="background:${s.bg};border-left:4px solid ${s.bl};padding:8px 14px;margin:0 0 6px;border-radius:0 6px 6px 0;font-size:12px;color:#2d3748"><b style="color:${s.lc};font-family:monospace">${s.label}</b> &nbsp;${m}</div>`).join("");
  };

  const html=`<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<title>${mc} Tempsens Datasheet</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',Arial,sans-serif;color:#2d3748;background:#fff;font-size:13px;line-height:1.5}
.page{max-width:900px;margin:0 auto;padding:32px}
h2{font-size:11px;font-weight:800;color:#1E3A7A;text-transform:uppercase;letter-spacing:.16em;margin:26px 0 10px;padding-bottom:5px;border-bottom:2.5px solid #1E3A7A}
table{width:100%;border-collapse:collapse}
th{background:#1E3A7A;color:#fff;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;padding:7px 11px;border:1px solid #163060;text-align:left}
td{padding:7px 11px;border:1px solid #e2e8f0;vertical-align:top}
tr:nth-child(even) td{background:#f7fafc}
.lbl{width:210px;background:#f7fafc!important;font-weight:600;color:#4a5568;font-size:12px}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.no-print{display:none}@page{margin:18mm}}
</style></head><body><div class="page">

<div style="background:linear-gradient(135deg,#1E3A7A,#2563EB);border-radius:10px;padding:24px 28px;color:#fff;display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:22px">
  <div>
    <div style="font-size:9px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;opacity:.7;margin-bottom:6px">Tempsens Instruments (I) Pvt. Ltd.</div>
    <div style="font-size:22px;font-weight:800">Thermocouple Assembly</div>
    <div style="font-size:13px;opacity:.8;margin-top:4px">T-Series Product Configuration &amp; Datasheet</div>
  </div>
  <div style="text-align:right">
    <div style="font-family:monospace;font-size:38px;font-weight:700;color:#FCD34D;line-height:1">${mc}</div>
    <div style="font-size:11px;opacity:.65;margin-top:4px">Generated: ${date}</div>
  </div>
</div>

<div class="no-print" style="background:#fef9c3;border:1.5px solid #fde68a;border-radius:7px;padding:9px 15px;margin-bottom:18px;font-size:12px;color:#78350f;display:flex;align-items:center;gap:10px">
  <span style="font-size:20px">📄</span>
  <span><b>To save as PDF:</b> Press <kbd style="background:#fff;border:1px solid #ccc;padding:1px 5px;border-radius:3px;font-family:monospace">Ctrl+P</kbd> (Mac: <kbd style="background:#fff;border:1px solid #ccc;padding:1px 5px;border-radius:3px;font-family:monospace">Cmd+P</kbd>) &rarr; set Destination to <b>"Save as PDF"</b> &rarr; Save.</span>
</div>

<h2>Configuration Summary</h2>
<table style="margin-bottom:22px">
  ${cfgRows.map(([l,v],i)=>`<tr><td class="lbl">${l}</td><td style="font-size:12px;color:#1a202c">${v}</td></tr>`).join("")}
</table>

<h2>Bill of Materials</h2>
<table style="margin-bottom:22px">
  <thead><tr><th style="width:36px;text-align:center">No.</th><th style="width:160px">Item</th><th>Specification</th><th style="width:64px;text-align:center">Qty</th></tr></thead>
  <tbody>
  ${bom.map((r,i)=>`<tr style="background:${i%2===0?"#f7fafc":"#fff"}">
    <td style="text-align:center;color:#718096;font-weight:600;font-size:11px">${r.no}</td>
    <td style="font-weight:600;font-size:12px">${r.item}</td>
    <td style="font-size:11.5px;color:#4a5568">${r.spec}</td>
    <td style="text-align:center;font-weight:700;font-size:11.5px;color:#1E3A7A">${r.qty}</td>
  </tr>`).join("")}
  </tbody>
</table>

<h2>Engineering Validation &amp; Notes</h2>
<div style="margin-bottom:22px">
${val.E.length===0&&val.W.length===0&&val.I.length===0
  ?`<div style="background:#f0fff4;border-left:4px solid #48bb78;padding:10px 16px;border-radius:0 6px 6px 0;font-size:12px;color:#276749;font-weight:600">&#x2713; Configuration is valid — no engineering issues detected.</div>`
  :valBlock(val.E,"E")+valBlock(val.W,"W")+valBlock(val.I,"I")}
</div>

<h2>TC Type Reference (IEC 584 / ASTM E230)</h2>
<table style="margin-bottom:26px">
  <thead><tr><th style="width:44px">Type</th><th>Name</th><th>Alloy</th><th style="width:120px">Range</th><th>Application</th></tr></thead>
  <tbody>
  ${CAT.tcTypes.map((t,i)=>`<tr style="background:${t.code===c.tcType?"#ebf8ff":i%2===0?"#f7fafc":"#fff"}">
    <td style="font-weight:${t.code===c.tcType?700:400};color:${t.code===c.tcType?"#1E3A7A":"#2d3748"};text-align:center">${t.code}</td>
    <td style="font-size:11px">${t.name}</td>
    <td style="font-size:11px">${t.alloy}</td>
    <td style="font-size:11px">${t.range}</td>
    <td style="font-size:11px">${t.app}</td>
  </tr>`).join("")}
  </tbody>
</table>

<h2>Applicable Standards</h2>
<div style="background:#f7fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px 18px;margin-bottom:26px;display:grid;grid-template-columns:1fr 1fr;gap:3px 20px;font-size:11px;color:#4a5568">
${["ASTM E 235 — Sheathed TC Types K &amp; N (nuclear)","ASTM E 839 — Test methods for sheathed TCs","ASTM E 220 — Calibration by comparison techniques","ASTM E 230 — Temperature-EMF tables for TCs","ASTM E 585 — Compacted MI base metal TC cables","ASTM E 608 — Compacted MI base metal thermocouples","ASTM E 696 — Tungsten-Rhenium alloy TC wire","ASTM E 1652 — MgO &amp; Al2O3 insulators","IS 12579 — Base metal MI TC cables","IEC 584 — International TC standard"].map(s=>`<div>• ${s}</div>`).join("")}
</div>

<div style="border-top:2px solid #e2e8f0;padding-top:12px;display:flex;justify-content:space-between;align-items:center">
  <div style="font-size:10px;color:#a0aec0"><b style="color:#1E3A7A">Tempsens Instruments (I) Pvt. Ltd.</b> · Udaipur, India · www.tempsens.com<br/>Auto-generated from Tempsens T-Series Product Guide. Consult factory for final specifications.</div>
  <div style="font-size:10px;color:#a0aec0;text-align:right">Model: <b style="color:#1E3A7A">${mc}</b><br/>Rev. ${date}</div>
</div>

</div></body></html>`;

  // ── Blob download — no popup needed ──
  const blob = new Blob([html], { type:"text/html;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `${mc}_Tempsens_Datasheet.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(()=>URL.revokeObjectURL(url), 5000);
}

/* ═══════════════════════════════════════════ 3D VIEWER ══ */
function buildDomeHead(g, add, hC, headBaseY, sR, cableCode, cabDef, wireColors) {
  // ── Threaded hex base ──────────────────────────────────────
  const baseH = 0.55;
  const hexBase = new THREE.CylinderGeometry(0.62, 0.62, baseH, 6);
  add(hexBase, 0x888898, 0.75, 0.25).position.y = headBaseY + baseH/2;

  // ── Process connector collar ───────────────────────────────
  const collarH = 0.3;
  add(new THREE.CylinderGeometry(0.52, 0.52, collarH, 24), 0x808088, 0.72, 0.28).position.y = headBaseY + baseH + collarH/2;

  // ── Main body (wide cylinder lower half) ───────────────────
  const bodyH = 0.8;
  const bodyY = headBaseY + baseH + collarH + bodyH/2;
  add(new THREE.CylinderGeometry(0.72, 0.68, bodyH, 32), hC, 0.65, 0.3).position.y = bodyY;

  // ── Side cable entry port (circular boss on left) ──────────
  const portY = bodyY + 0.1;
  const bossR = 0.22;
  // Boss cylinder sticking out
  const boss = add(new THREE.CylinderGeometry(bossR, bossR+0.04, 0.35, 20), hC, 0.6, 0.35);
  boss.rotation.z = Math.PI/2;
  boss.position.set(-0.72 - 0.17, portY, 0);
  // Bore hole (dark disc)
  const bore = add(new THREE.CylinderGeometry(bossR-0.06, bossR-0.06, 0.08, 18), 0x111111, 0.1, 0.9);
  bore.rotation.z = Math.PI/2;
  bore.position.set(-0.92 - 0.04, portY, 0);

  // ── Brass knurled cable gland ──────────────────────────────
  const glandR = 0.19;
  const gland = add(new THREE.CylinderGeometry(glandR, glandR+0.02, 0.38, 20), 0xB8922A, 0.55, 0.3);
  gland.rotation.z = Math.PI/2;
  gland.position.set(-0.72 - 0.55, portY, 0);
  // Knurl rings on gland
  for (let i=0;i<5;i++){
    const kr = add(new THREE.TorusGeometry(glandR+0.01, 0.018, 6, 18), 0x906818, 0.6, 0.35);
    kr.rotation.x = Math.PI/2;
    kr.position.set(-0.72 - 0.38 - i*0.065, portY, 0);
  }

  // ── Wire bundle visible inside port (colorful) ────────────
  wireColors.forEach((wc,i)=>{
    const angle = (i/wireColors.length)*Math.PI*1.5 - Math.PI*0.3;
    const r = 0.06;
    const wr = add(new THREE.CylinderGeometry(0.018,0.018,0.18,6), wc, 0.1, 0.7);
    wr.rotation.z = Math.PI/2;
    wr.position.set(-0.88, portY + Math.sin(angle)*r, Math.cos(angle)*r);
  });

  // ── Dome lid (hemisphere top) ──────────────────────────────
  const domeY = bodyY + bodyH/2;
  const domeR = 0.72;
  // Lid lower ring
  const lidRingH = 0.12;
  add(new THREE.CylinderGeometry(domeR+0.01, domeR+0.01, lidRingH, 32), hC, 0.65, 0.28).position.y = domeY + lidRingH/2;
  // Dome hemisphere
  const dome = add(new THREE.SphereGeometry(domeR, 36, 24, 0, Math.PI*2, 0, Math.PI/2), hC, 0.6, 0.3);
  dome.position.y = domeY + lidRingH;

  // ── Flame-path grooves on dome lid (lathe-turned rings) ────
  const grooveY = domeY + lidRingH;
  // Horizontal groove rings at increasing angles up the dome
  const grooveAngles = [0.18, 0.35, 0.52, 0.68, 0.82];
  grooveAngles.forEach(phi=>{
    const y   = domeR * Math.sin(phi);
    const r   = domeR * Math.cos(phi) + 0.005;
    const gr  = add(new THREE.TorusGeometry(r, 0.022, 6, 36), 0x555566, 0.7, 0.4);
    gr.rotation.x = Math.PI/2;
    gr.position.y = grooveY + y;
  });

  // ── Lid screws (2 on top ring) ─────────────────────────────
  [-1,1].forEach(side=>{
    const sc = add(new THREE.CylinderGeometry(0.035,0.035,0.1,8), 0x999999, 0.7, 0.25);
    sc.position.set(side*0.35, domeY+lidRingH+0.04, 0.35);
    // Screw head disc
    const sh2 = add(new THREE.CylinderGeometry(0.055,0.055,0.04,8), 0xAAAAAA, 0.7, 0.3);
    sh2.position.set(side*0.35, domeY+lidRingH+0.10, 0.35);
  });

  // ── Chain tether (brass links) ─────────────────────────────
  const chainLinkCount = 12;
  const chainStartX = 0.58;
  const chainStartY = domeY + lidRingH + 0.05;
  // Eyelet on dome
  const eyelet = add(new THREE.TorusGeometry(0.042, 0.018, 8, 12), 0xB8922A, 0.55, 0.3);
  eyelet.position.set(chainStartX, chainStartY, 0);
  // Chain links
  for(let i=0;i<chainLinkCount;i++){
    const t = i/chainLinkCount;
    const cx = chainStartX + Math.sin(t*2.2)*0.18 + t*0.12;
    const cy = chainStartY - t*0.7;
    const cz = Math.sin(t*3)*0.08;
    const link = add(new THREE.TorusGeometry(0.038, 0.014, 6, 10), 0xB8922A, 0.55, 0.3);
    link.position.set(cx, cy, cz);
    link.rotation.y = i%2===0 ? Math.PI/2 : 0;
  }
  // Chain ball end
  const ball = add(new THREE.SphereGeometry(0.06, 12, 12), 0xB8922A, 0.45, 0.3);
  ball.position.set(chainStartX+0.22, chainStartY-0.72, 0);

  // ── Cable exit from gland ──────────────────────────────────
  if (cableCode!=="None" && cabDef) {
    const cCol = cabDef.col;
    const cR = 0.09;
    const startX = -0.72 - 0.74;
    // Horizontal cable exiting gland
    const hLen = 2.2;
    const ch = add(new THREE.CylinderGeometry(cR, cR, hLen, 12), cCol, 0.05, 0.9);
    ch.rotation.z = Math.PI/2;
    ch.position.set(startX - hLen/2, portY, 0);
    // Cable end cap
    const ec = add(new THREE.SphereGeometry(cR, 8, 8), cCol, 0.05, 0.9);
    ec.position.set(startX - hLen, portY, 0);
    // Braid rings for Type B and E
    if (cableCode==="B"||cableCode==="E") {
      for(let i=0;i<6;i++){
        const br = add(new THREE.TorusGeometry(cR*1.25, 0.018, 6, 14), 0x888888, 0.65, 0.3);
        br.rotation.x = Math.PI/2;
        br.position.set(startX - 0.2 - i*0.32, portY, 0);
      }
    }
  }
}

function Viewer3D({ cfg }) {
  const mountRef = useRef(null);
  const S = useRef({ scene:null,ren:null,cam:null,grp:null,frame:null,mx:0,my:0,rotX:0.15,rotY:0.55,drag:false });

  useEffect(()=>{
    const el=mountRef.current; if(!el) return;
    const R=S.current;
    const W=el.clientWidth, H=el.clientHeight;
    R.scene=new THREE.Scene();
    R.scene.background=new THREE.Color(0xF2F5FB);
    R.cam=new THREE.PerspectiveCamera(34,W/H,0.1,200);
    R.cam.position.set(1.5,1.5,16);
    R.ren=new THREE.WebGLRenderer({antialias:true});
    R.ren.setSize(W,H);
    R.ren.setPixelRatio(Math.min(devicePixelRatio,2));
    R.ren.shadowMap.enabled=true;
    R.ren.shadowMap.type=THREE.PCFSoftShadowMap;
    el.appendChild(R.ren.domElement);

    // Lights
    R.scene.add(new THREE.AmbientLight(0xffffff,0.5));
    const d1=new THREE.DirectionalLight(0xffffff,1.0); d1.position.set(6,12,8); d1.castShadow=true; d1.shadow.mapSize.width=2048; d1.shadow.mapSize.height=2048; R.scene.add(d1);
    const d2=new THREE.DirectionalLight(0xCCDDFF,0.4); d2.position.set(-8,4,-6); R.scene.add(d2);
    const d3=new THREE.PointLight(0xFFEECC,0.5,30); d3.position.set(4,-3,8); R.scene.add(d3);
    const d4=new THREE.PointLight(0xCCEEFF,0.3,20); d4.position.set(-5,8,3); R.scene.add(d4);

    // Ground
    const gp=new THREE.Mesh(new THREE.PlaneGeometry(40,40),new THREE.MeshStandardMaterial({color:0xE8ECF5,roughness:1}));
    gp.rotation.x=-Math.PI/2; gp.position.y=-10; gp.receiveShadow=true; R.scene.add(gp);

    R.grp=new THREE.Group(); R.scene.add(R.grp);

    const md=e=>{R.drag=true;R.mx=e.clientX;R.my=e.clientY;};
    const mu=()=>{R.drag=false;};
    const mm=e=>{if(!R.drag)return;R.rotY+=(e.clientX-R.mx)*0.01;R.rotX+=(e.clientY-R.my)*0.01;R.rotX=Math.max(-0.9,Math.min(0.9,R.rotX));R.mx=e.clientX;R.my=e.clientY;};
    const mw=e=>{R.cam.position.z=Math.max(6,Math.min(26,R.cam.position.z+e.deltaY*0.014));};
    el.addEventListener("mousedown",md);window.addEventListener("mouseup",mu);window.addEventListener("mousemove",mm);el.addEventListener("wheel",mw);

    const loop=()=>{R.frame=requestAnimationFrame(loop);if(!R.drag)R.rotY+=0.003;if(R.grp){R.grp.rotation.y=R.rotY;R.grp.rotation.x=R.rotX;}R.ren.render(R.scene,R.cam);};
    loop();

    const onR=()=>{const W=el.clientWidth,H=el.clientHeight;R.cam.aspect=W/H;R.cam.updateProjectionMatrix();R.ren.setSize(W,H);};
    window.addEventListener("resize",onR);
    return ()=>{cancelAnimationFrame(R.frame);el.removeEventListener("mousedown",md);window.removeEventListener("mouseup",mu);window.removeEventListener("mousemove",mm);el.removeEventListener("wheel",mw);window.removeEventListener("resize",onR);R.ren.dispose();if(el.contains(R.ren.domElement))el.removeChild(R.ren.domElement);};
  },[]);

  useEffect(()=>{
    const R=S.current; const g=R.grp; if(!g) return;
    while(g.children.length){const o=g.children[0];o.geometry?.dispose();if(Array.isArray(o.material))o.material.forEach(m=>m.dispose());else o.material?.dispose();g.remove(o);}

    const tcDef=CAT.tcTypes.find(t=>t.code===cfg.tcType);
    const shDef=CAT.sheaths.find(s=>s.code===cfg.sheath);
    const cabDef=CAT.cables.find(c=>c.code===cfg.cable);

    const add=(geo,col,met=0.65,rgh=0.28,emv=0)=>{
      const mat=new THREE.MeshStandardMaterial({color:col,metalness:met,roughness:rgh});
      if(emv){mat.emissive=new THREE.Color(emv);mat.emissiveIntensity=0.28;}
      const m=new THREE.Mesh(geo,mat); m.castShadow=true; g.add(m); return m;
    };

    const sR=Math.max(0.1,cfg.diameter/28);
    const sL=5.5;
    const sC=shDef?.col??0xBBBBCC;
    const tC=tcDef?.col??0xE07030;

    // ── MI Sheath ──────────────────────────────────────────────
    add(new THREE.CylinderGeometry(sR,sR,sL,32),sC,0.82,0.18);
    // Inner element wire
    add(new THREE.CylinderGeometry(sR*0.28,sR*0.28,sL*0.97,8),tC,0.4,0.55);
    // Hot junction tip
    const tip=add(new THREE.SphereGeometry(sR*1.02,22,22),cfg.junction==="EX"?tC:sC,0.55,0.3,cfg.junction==="EX"?tC:0);
    tip.position.y=-sL/2;
    if(cfg.junction==="EX"){const gl=add(new THREE.SphereGeometry(sR*0.48,12,12),tC,0.2,0.5,tC);gl.position.y=-sL/2-0.14;}

    // ── Compression fitting at top ─────────────────────────────
    const fitH=0.48;
    const fitMesh=add(new THREE.CylinderGeometry(sR*2.5,sR*2.5,fitH,24),0x888898,0.72,0.26);
    fitMesh.position.y=sL/2-fitH*0.5;

    // ── Flange ─────────────────────────────────────────────────
    if(cfg.connection?.startsWith("F")){
      const fR=cfg.connection==="F600"?1.65:cfg.connection==="F300"?1.42:1.22;
      const fl=add(new THREE.CylinderGeometry(fR,fR,0.34,40),0x8888A0,0.62,0.34);fl.position.y=-(sL/2);
      for(let i=0;i<8;i++){const a=(i/8)*Math.PI*2;const bt=add(new THREE.CylinderGeometry(0.07,0.07,0.38,8),0x404040,0.5,0.4);bt.position.set(Math.cos(a)*fR*0.78,-sL/2,Math.sin(a)*fR*0.78);bt.rotation.x=Math.PI/2;}
    }

    // ── Nipple / NUN ───────────────────────────────────────────
    if(cfg.connection==="Nipple"||cfg.connection==="NUN"){
      const nL=cfg.connection==="NUN"?2.2:1.1, nRad=sR*2.2;
      const nip=add(new THREE.CylinderGeometry(nRad,nRad,nL,22),0x909098,0.72,0.28);
      nip.position.y=sL/2+fitH+nL/2;
      if(cfg.connection==="NUN"){const u=add(new THREE.TorusGeometry(nRad*1.55,0.09,8,24),0x686870,0.65,0.35);u.position.y=nip.position.y;u.rotation.x=Math.PI/2;}
    }

    // ── Weld pad / Bayonet ─────────────────────────────────────
    if(cfg.connection==="WeldPad"){const wp=add(new THREE.BoxGeometry(0.9,0.15,0.6),0x808088,0.6,0.4);wp.position.y=-(sL/2+0.1);}
    if(cfg.connection==="Bayonet"){const bn=add(new THREE.CylinderGeometry(sR*2.8,sR*2.8,0.35,6),0x707078,0.65,0.35);bn.position.y=sL/2+fitH+0.18;}

    // ── Thermowell ─────────────────────────────────────────────
    if(cfg.thermowell!=="None"){
      const twL=4.0, twRroot=sR*4.2;
      const shape=CAT.thermowells.find(t=>t.code===cfg.thermowell)?.shape;
      const twRtip=shape==="tapered"?sR*2.5:shape==="stepped"?sR*3.1:twRroot;
      const twCol=cfg.twMaterial==="WC"?0x6A6840:0xA8A8B8;
      const tw=add(new THREE.CylinderGeometry(twRtip,twRroot,twL,30),twCol,0.78,0.22);
      tw.position.y=-(sL/2)-twL/2+0.2;
      add(new THREE.CylinderGeometry(sR*1.06,sR*1.06,twL-0.28,14),0x606068,0.3,0.8).position.y=tw.position.y;
    }

    // ── Connection Head ────────────────────────────────────────
    const headBaseY = sL/2 + fitH;
    if(cfg.head!=="None"){
      const hCol = 0xA4A4AE; // Cast aluminium/SS silver-grey
      const wireColors=[0xEE4444,0x44AA44,0x4444EE,0xFFAA00,0xAA44EE,0xEEEE44];
      buildDomeHead(g, add, hCol, headBaseY, sR, cfg.cable, cabDef, wireColors);
    } else {
      // No head — cable exits straight up then bends
      if(cfg.cable!=="None"&&cabDef){
        const cCol=cabDef.col, cR=0.085;
        const upLen=1.5;
        const up=add(new THREE.CylinderGeometry(cR,cR,upLen,10),cCol,0.05,0.9);up.position.y=headBaseY+upLen/2;
        const sideLen=1.6;
        const side=add(new THREE.CylinderGeometry(cR,cR,sideLen,10),cCol,0.05,0.9);side.position.set(-sideLen/2,headBaseY+upLen,0);side.rotation.z=Math.PI/2;
        const downLen=2.6;
        const down=add(new THREE.CylinderGeometry(cR,cR,downLen,10),cCol,0.05,0.9);down.position.set(-sideLen,headBaseY+upLen-downLen/2,0);
        add(new THREE.SphereGeometry(cR,8,8),cCol,0.05,0.9).position.set(-sideLen,headBaseY+upLen-downLen,0);
        if(cfg.cable==="B"||cfg.cable==="E"){for(let i=0;i<4;i++){const br=add(new THREE.TorusGeometry(cR*1.25,0.02,6,12),0x888888,0.65,0.3);br.rotation.z=Math.PI/2;br.position.set(-0.2-i*0.36,headBaseY+upLen,0);}}
      }
    }
  },[cfg]);

  return(
    <div ref={mountRef} style={{width:"100%",height:"100%",position:"relative",cursor:"grab"}}>
      <div style={{position:"absolute",bottom:10,left:10,fontSize:10,color:"#8899BB",fontFamily:"monospace",letterSpacing:"0.05em",pointerEvents:"none"}}>Drag · rotate &nbsp;|&nbsp; Scroll · zoom</div>
    </div>
  );
}

/* ═══════════════════════════════════════════ UI HELPERS ══ */
const LS={
  lbl:{fontSize:10,fontWeight:700,color:"#1E3A7A",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4,marginTop:12,display:"block"},
  sel:{width:"100%",background:"#fff",border:"1.5px solid #CBD5E1",borderRadius:6,padding:"7px 10px",fontSize:12,color:"#1E293B",outline:"none",cursor:"pointer"},
  inp:{width:"100%",background:"#fff",border:"1.5px solid #CBD5E1",borderRadius:6,padding:"7px 10px",fontSize:12,color:"#1E293B",outline:"none"},
};
function Box({title,icon,children}){return(<div style={{background:"#fff",borderRadius:10,border:"1.5px solid #E2E8F0",marginBottom:10,overflow:"hidden",boxShadow:"0 1px 4px rgba(30,60,130,0.06)"}}><div style={{background:"linear-gradient(90deg,#1E3A7A,#2563EB)",padding:"7px 12px",display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:14}}>{icon}</span><span style={{fontSize:10,fontWeight:800,color:"#fff",textTransform:"uppercase",letterSpacing:"0.15em"}}>{title}</span></div><div style={{padding:"2px 12px 12px"}}>{children}</div></div>);}
function SRow({label,value,accent}){return(<div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"5px 0",borderBottom:"1px solid #F1F5F9",gap:8}}><span style={{fontSize:11,color:"#94A3B8",flexShrink:0,minWidth:116}}>{label}</span><span style={{fontSize:accent?15:12,color:accent?"#1E3A7A":"#1E293B",fontFamily:accent?"'JetBrains Mono',monospace":"inherit",fontWeight:accent?800:500,textAlign:"right"}}>{value}</span></div>);}

/* ═══════════════════════════════════════════ APP ══ */
export default function App(){
  const [cfg,setCfg]=useState({tcType:"K",element:"S",junction:"UN",sheath:"316",diameter:6,length:300,head:"C",thermowell:"None",twMaterial:"316",connection:"BSP",fittingThread:'1/2"',insertionLen:150,cable:"D",cableLen:1.5,processTemp:""});
  const [tab,setTab]=useState("bom");
  const [downloading,setDownloading]=useState(false);
  const set=(k,v)=>setCfg(p=>({...p,[k]:v}));
  const mc=deriveModel(cfg);
  const val=validate(cfg);
  const bom=makeBOM(cfg);
  const tc=CAT.tcTypes.find(t=>t.code===cfg.tcType);
  const issueCount=val.E.length+val.W.length;

  const handleDownload=()=>{
    setDownloading(true);
    try { downloadDatasheet(cfg); }
    catch(e){ console.error(e); }
    setTimeout(()=>setDownloading(false),1500);
  };

  return(
    <div style={{display:"flex",height:"100vh",overflow:"hidden",background:"#F0F4FA",fontFamily:"'DM Sans','Inter',system-ui,sans-serif",color:"#1E293B"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');*{box-sizing:border-box;margin:0;padding:0;}select:focus,input:focus{border-color:#2563EB!important;box-shadow:0 0 0 3px rgba(37,99,235,0.1)!important;outline:none!important;}::-webkit-scrollbar{width:5px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:#CBD5E1;border-radius:3px;}select option{background:#fff;color:#1E293B;}`}</style>

      {/* LEFT PANEL */}
      <div style={{width:274,background:"#F8FAFF",borderRight:"1.5px solid #E2E8F0",display:"flex",flexDirection:"column",flexShrink:0}}>
        <div style={{padding:"14px 14px 10px",borderBottom:"1.5px solid #E2E8F0",background:"#fff"}}>
          <div style={{fontSize:9,color:"#2563EB",fontWeight:800,letterSpacing:"0.22em",textTransform:"uppercase"}}>Tempsens Instruments</div>
          <div style={{fontSize:17,fontWeight:800,color:"#1E3A7A",lineHeight:1.3,marginTop:2}}>TC Configurator</div>
          <div style={{fontSize:10,color:"#94A3B8",marginTop:1}}>T-Series · Tempsens Product Guide</div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"10px 10px 16px"}}>
          <Box title="Thermocouple Element" icon="⚡">
            <label style={LS.lbl}>TC Type</label>
            <select style={LS.sel} value={cfg.tcType} onChange={e=>set("tcType",e.target.value)}>
              {CAT.tcTypes.map(t=><option key={t.code} value={t.code}>Type {t.code} — {t.name}</option>)}
            </select>
            {tc&&<div style={{marginTop:6,background:"#EFF6FF",borderRadius:6,padding:"5px 8px",fontSize:10,color:"#1E40AF",lineHeight:1.5}}><b>{tc.range}</b> · {tc.app}</div>}
            <label style={LS.lbl}>Configuration</label>
            <select style={LS.sel} value={cfg.element} onChange={e=>set("element",e.target.value)}>
              {CAT.elements.map(e=><option key={e.code} value={e.code}>{e.label}</option>)}
            </select>
            <label style={LS.lbl}>Junction Type</label>
            <select style={LS.sel} value={cfg.junction} onChange={e=>set("junction",e.target.value)}>
              {CAT.junctions.map(j=><option key={j.code} value={j.code}>{j.code} — {j.name}</option>)}
            </select>
          </Box>
          <Box title="Sheath / MI Cable" icon="🔩">
            <label style={LS.lbl}>Sheath Material</label>
            <select style={LS.sel} value={cfg.sheath} onChange={e=>set("sheath",e.target.value)}>
              {CAT.sheaths.map(m=><option key={m.code} value={m.code}>{m.name} · max {m.maxT}°C</option>)}
            </select>
            <label style={LS.lbl}>Sheath OD</label>
            <select style={LS.sel} value={cfg.diameter} onChange={e=>set("diameter",parseFloat(e.target.value))}>
              {CAT.diameters.map(d=><option key={d} value={d}>Ø{d} mm</option>)}
            </select>
            <label style={LS.lbl}>Overall Length L (mm)</label>
            <input style={LS.inp} type="number" value={cfg.length} onChange={e=>set("length",parseInt(e.target.value)||0)} min={50} max={6000} step={25}/>
          </Box>
          <Box title="Connection Head" icon="🔧">
            <label style={LS.lbl}>Head Type</label>
            <select style={LS.sel} value={cfg.head} onChange={e=>set("head",e.target.value)}>
              {CAT.heads.map(h=><option key={h.code} value={h.code}>{h.code==="None"?"No Head (Cable Assembly)":`Type ${h.code} — ${h.name} · ${h.ip}`}</option>)}
            </select>
          </Box>
          <Box title="Process Connection" icon="🔗">
            <label style={LS.lbl}>Connection Type</label>
            <select style={LS.sel} value={cfg.connection} onChange={e=>set("connection",e.target.value)}>
              {CAT.connections.map(c=><option key={c.code} value={c.code}>{c.name}</option>)}
            </select>
            <label style={LS.lbl}>Fitting Thread</label>
            <select style={LS.sel} value={cfg.fittingThread} onChange={e=>set("fittingThread",e.target.value)}>
              {CAT.fittingThreads.map(t=><option key={t}>{t}</option>)}
            </select>
          </Box>
          <Box title="Thermowell" icon="🏭">
            <label style={LS.lbl}>Thermowell Type</label>
            <select style={LS.sel} value={cfg.thermowell} onChange={e=>set("thermowell",e.target.value)}>
              {CAT.thermowells.map(t=><option key={t.code} value={t.code}>{t.model?`${t.model} — `:""}{t.name}</option>)}
            </select>
            {cfg.thermowell!=="None"&&<>
              <label style={LS.lbl}>TW Material</label>
              <select style={LS.sel} value={cfg.twMaterial} onChange={e=>set("twMaterial",e.target.value)}>
                {CAT.twMaterials.map(m=><option key={m.code} value={m.code}>{m.name} · max {m.maxT}°C</option>)}
              </select>
              <label style={LS.lbl}>Insertion Length I.L. (mm)</label>
              <input style={LS.inp} type="number" value={cfg.insertionLen} onChange={e=>set("insertionLen",parseInt(e.target.value)||0)} min={50} max={3000} step={25}/>
            </>}
          </Box>
          <Box title="Extension Cable" icon="🔌">
            <label style={LS.lbl}>Cable Type</label>
            <select style={LS.sel} value={cfg.cable} onChange={e=>set("cable",e.target.value)}>
              {CAT.cables.map(c=><option key={c.code} value={c.code}>{c.code==="None"?"None — No Cable":`Type ${c.code} · ${c.name} · max ${c.maxT}°C`}</option>)}
            </select>
            {cfg.cable!=="None"&&<>
              <label style={LS.lbl}>Cable Length (m)</label>
              <input style={LS.inp} type="number" value={cfg.cableLen} onChange={e=>set("cableLen",parseFloat(e.target.value)||1)} min={0.5} max={200} step={0.5}/>
            </>}
          </Box>
          <Box title="Process Conditions" icon="🌡️">
            <label style={LS.lbl}>Process Temperature (°C)</label>
            <input style={LS.inp} type="number" placeholder="e.g. 600" value={cfg.processTemp} onChange={e=>set("processTemp",e.target.value)}/>
          </Box>
        </div>
      </div>

      {/* CENTER */}
      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
        <div style={{height:50,background:"#fff",borderBottom:"1.5px solid #E2E8F0",display:"flex",alignItems:"center",padding:"0 18px",gap:16,flexShrink:0,boxShadow:"0 1px 4px rgba(30,60,130,0.06)"}}>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:22,fontWeight:800,color:"#1E3A7A"}}>{mc}</div>
          <div style={{width:1,height:22,background:"#E2E8F0"}}/>
          <div style={{fontSize:12,color:"#64748B"}}>Type {cfg.tcType} — {tc?.name}</div>
          <div style={{width:1,height:22,background:"#E2E8F0"}}/>
          <div style={{fontSize:12,color:"#64748B"}}>Ø{cfg.diameter}mm · {CAT.sheaths.find(s=>s.code===cfg.sheath)?.name}{cfg.thermowell!=="None"?` · ${cfg.thermowell} TW`:""}{cfg.cable!=="None"?` · Cable-${cfg.cable}`:""}</div>
          <div style={{marginLeft:"auto",display:"flex",gap:8}}>
            {val.E.length>0&&<div style={{background:"#FEF2F2",border:"1.5px solid #FECACA",color:"#DC2626",padding:"3px 12px",borderRadius:20,fontSize:10,fontWeight:700}}>{val.E.length} Error{val.E.length>1?"s":""}</div>}
            {val.W.length>0&&<div style={{background:"#FFFBEB",border:"1.5px solid #FDE68A",color:"#D97706",padding:"3px 12px",borderRadius:20,fontSize:10,fontWeight:700}}>{val.W.length} Warn{val.W.length>1?"ings":""}</div>}
            {issueCount===0&&<div style={{background:"#F0FDF4",border:"1.5px solid #BBF7D0",color:"#16A34A",padding:"3px 12px",borderRadius:20,fontSize:10,fontWeight:700}}>✓ Valid</div>}
          </div>
        </div>
        <div style={{flex:1,position:"relative"}}>
          <Viewer3D cfg={cfg}/>
          {/* Dimension badge */}
          <div style={{position:"absolute",top:14,left:14,background:"rgba(255,255,255,0.95)",border:"1.5px solid #E2E8F0",borderRadius:10,padding:"10px 14px",boxShadow:"0 2px 10px rgba(30,60,130,0.1)"}}>
            <div style={{fontSize:9,fontWeight:800,color:"#2563EB",textTransform:"uppercase",letterSpacing:"0.15em",marginBottom:6}}>Dimensions</div>
            {[["Sheath OD",`Ø${cfg.diameter} mm`],["Length (L)",`${cfg.length} mm`],cfg.thermowell!=="None"&&["Insertion L.",`${cfg.insertionLen} mm`],cfg.cable!=="None"&&["Cable",`${cfg.cableLen} m`]].filter(Boolean).map(([k,v])=>(
              <div key={k} style={{display:"flex",gap:18,justifyContent:"space-between",fontSize:11,marginTop:3}}>
                <span style={{color:"#94A3B8"}}>{k}</span>
                <span style={{color:"#1E3A7A",fontFamily:"'JetBrains Mono',monospace",fontWeight:700}}>{v}</span>
              </div>
            ))}
          </div>
          {/* Head reference badge */}
          {cfg.head!=="None"&&<div style={{position:"absolute",top:14,right:14,background:"rgba(255,255,255,0.95)",border:"1.5px solid #E2E8F0",borderRadius:10,padding:"10px 14px",boxShadow:"0 2px 10px rgba(30,60,130,0.1)"}}>
            <div style={{fontSize:9,fontWeight:800,color:"#2563EB",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:5}}>Connection Head</div>
            <div style={{fontSize:11,fontWeight:700,color:"#1E293B"}}>{CAT.heads.find(h=>h.code===cfg.head)?.name}</div>
            <div style={{fontSize:10,color:"#64748B"}}>{CAT.heads.find(h=>h.code===cfg.head)?.ip} · Dome style</div>
            {cfg.cable!=="None"&&<div style={{fontSize:10,color:"#64748B",marginTop:2}}>Cable Type-{cfg.cable} · Brass gland exit</div>}
          </div>}
          {/* TC legend */}
          <div style={{position:"absolute",bottom:14,right:14,background:"rgba(255,255,255,0.95)",border:"1.5px solid #E2E8F0",borderRadius:10,padding:"10px 14px",boxShadow:"0 2px 10px rgba(30,60,130,0.1)"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:13,height:13,borderRadius:"50%",background:"#"+(tc?.col??0xE07030).toString(16).padStart(6,"0"),border:"2px solid #E2E8F0",flexShrink:0}}/>
              <div>
                <div style={{fontSize:10,color:"#94A3B8"}}>TC Element</div>
                <div style={{fontSize:11,fontWeight:700,color:"#1E293B"}}>Type {cfg.tcType} · {CAT.junctions.find(j=>j.code===cfg.junction)?.name}</div>
                <div style={{fontSize:10,color:"#64748B"}}>{tc?.range}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{width:300,background:"#fff",borderLeft:"1.5px solid #E2E8F0",display:"flex",flexDirection:"column",flexShrink:0}}>
        <div style={{display:"flex",borderBottom:"1.5px solid #E2E8F0"}}>
          {[["bom","📋 BOM"],["validation","⚠️ Rules"],["specs","📐 Specs"]].map(([id,lbl])=>(
            <button key={id} onClick={()=>setTab(id)} style={{flex:1,padding:"11px 0",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",background:tab===id?"#EFF6FF":"transparent",color:tab===id?"#1E3A7A":"#94A3B8",border:"none",borderBottom:tab===id?"2.5px solid #2563EB":"2.5px solid transparent",cursor:"pointer"}}>{lbl}</button>
          ))}
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"14px 14px 8px"}}>
          {tab==="bom"&&<>
            <div style={{fontSize:10,color:"#94A3B8",marginBottom:10}}>Bill of Materials — {mc}</div>
            {bom.map((r,i)=>(
              <div key={i} style={{background:i%2===0?"#F8FAFF":"#fff",borderRadius:6,padding:"7px 10px",marginBottom:4,border:"1px solid #F1F5F9"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:9,color:"#2563EB",fontWeight:800,textTransform:"uppercase",letterSpacing:"0.1em"}}>{r.item}</span>
                  <span style={{fontSize:9,color:"#2563EB",background:"#EFF6FF",padding:"1px 7px",borderRadius:10,fontWeight:700}}>{r.qty}</span>
                </div>
                <div style={{fontSize:11,color:"#475569",marginTop:3,lineHeight:1.5}}>{r.spec}</div>
              </div>
            ))}
          </>}
          {tab==="validation"&&<>
            {val.E.map((e,i)=><div key={i} style={{background:"#FEF2F2",border:"1.5px solid #FECACA",borderRadius:8,padding:"8px 11px",marginBottom:8,fontSize:11,color:"#991B1B",lineHeight:1.6}}><b style={{color:"#DC2626",fontFamily:"monospace"}}>ERR </b>{e}</div>)}
            {val.W.map((w,i)=><div key={i} style={{background:"#FFFBEB",border:"1.5px solid #FDE68A",borderRadius:8,padding:"8px 11px",marginBottom:8,fontSize:11,color:"#92400E",lineHeight:1.6}}><b style={{color:"#D97706",fontFamily:"monospace"}}>WRN </b>{w}</div>)}
            {val.I.map((n,i)=><div key={i} style={{background:"#EFF6FF",border:"1.5px solid #BFDBFE",borderRadius:8,padding:"8px 11px",marginBottom:8,fontSize:11,color:"#1E40AF",lineHeight:1.6}}><b style={{color:"#2563EB",fontFamily:"monospace"}}>INF </b>{n}</div>)}
            {!val.E.length&&!val.W.length&&!val.I.length&&<div style={{textAlign:"center",color:"#16A34A",padding:"32px 0",fontSize:13,fontWeight:700}}>✓ Configuration valid</div>}
          </>}
          {tab==="specs"&&<>
            <SRow label="Model Code"    value={mc} accent/>
            <SRow label="TC Type"       value={`${cfg.tcType} — ${tc?.name}`}/>
            <SRow label="Range"         value={tc?.range}/>
            <SRow label="Config."       value={CAT.elements.find(e=>e.code===cfg.element)?.label}/>
            <SRow label="Junction"      value={`${cfg.junction} — ${CAT.junctions.find(j=>j.code===cfg.junction)?.name}`}/>
            <SRow label="Sheath"        value={`${CAT.sheaths.find(s=>s.code===cfg.sheath)?.name} · Ø${cfg.diameter}mm`}/>
            <SRow label="Length (L)"    value={`${cfg.length} mm`}/>
            <SRow label="Head"          value={cfg.head==="None"?"None":`Type ${cfg.head} · ${CAT.heads.find(h=>h.code===cfg.head)?.ip}`}/>
            <SRow label="Connection"    value={CAT.connections.find(c=>c.code===cfg.connection)?.name}/>
            <SRow label="Thread"        value={cfg.fittingThread}/>
            <SRow label="Thermowell"    value={cfg.thermowell==="None"?"None":`${cfg.thermowell} · ${CAT.twMaterials.find(m=>m.code===cfg.twMaterial)?.name}`}/>
            {cfg.thermowell!=="None"&&<SRow label="Insertion L." value={`${cfg.insertionLen} mm`}/>}
            <SRow label="Cable"         value={cfg.cable==="None"?"None":`Type ${cfg.cable} — ${cfg.cableLen}m`}/>
            {cfg.processTemp&&<SRow label="Process Temp" value={`${cfg.processTemp}°C`}/>}
          </>}
        </div>
        <div style={{padding:"12px 14px 14px",borderTop:"1.5px solid #E2E8F0",display:"flex",flexDirection:"column",gap:8}}>
          <button onClick={handleDownload} disabled={downloading}
            style={{width:"100%",padding:"11px 0",background:downloading?"#64748B":"linear-gradient(135deg,#1E3A7A,#2563EB)",color:"#fff",fontWeight:800,fontSize:12,border:"none",borderRadius:8,cursor:downloading?"not-allowed":"pointer",letterSpacing:"0.1em",textTransform:"uppercase",boxShadow:"0 3px 12px rgba(37,99,235,0.3)",transition:"all 0.18s"}}
            onMouseOver={e=>{if(!downloading){e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 6px 18px rgba(37,99,235,0.4)";}}}
            onMouseOut={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 3px 12px rgba(37,99,235,0.3)";}}>
            {downloading?"⏳ Downloading...":"📄 Download Datasheet"}
          </button>
          <div style={{fontSize:10,color:"#94A3B8",textAlign:"center",lineHeight:1.6}}>
            Downloads as <code style={{background:"#F1F5F9",padding:"1px 4px",borderRadius:3,fontSize:10}}>.html</code> · Open it → <kbd style={{background:"#F1F5F9",border:"1px solid #CBD5E1",borderRadius:3,padding:"0 4px",fontFamily:"monospace",fontSize:10}}>Ctrl+P</kbd> → Save as PDF
          </div>
        </div>
      </div>
    </div>
  );
}
