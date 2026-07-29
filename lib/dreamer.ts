export type Figure = {
  src: string;
  caption: string;
  note: string;
};

export type Block =
  | { kind: "facts"; title: string; items: { k: string; v: string }[] }
  | { kind: "list"; title: string; items: string[]; note?: string }
  | { kind: "table"; title: string; head: string[]; rows: string[][] }
  | { kind: "steps"; title: string; items: { t: string; d: string }[] };

export type Approach = {
  num: string;
  name: string;
  approach: string;
  tagline: string;
  optimizes: string[];
  figures: Figure[];
  blocks: Block[];
};

export const PORTFOLIO_META = {
  program: "Dreamer Systems",
  doc: "Concept Portfolio",
  date: "July 2026",
  headline: "One system. Three levels of ambition.",
  deck:
    "The Cube defines the destination. The Airframe proves the mechanisms. The 3-Chamber Platform proves the operating model.",
  sequence: "Prove one airframe → validate a live cycle → replicate to three chambers → package as the finished Cube.",
  files: [
    { href: "/dreamer/three-approaches-portfolio.pdf", label: "Three Approaches Portfolio", note: "34 pages · full concept portfolio · 573 KB" },
    { href: "/dreamer/phase-1-build-guide.pdf", label: "Phase 1 Build Guide", note: "6 pages · Cube prototype build · 148 KB" },
  ],
};

export const APPROACHES: Approach[] = [
  {
    num: "01",
    name: "Integrated Cube",
    approach: "Product-vision approach",
    tagline:
      "A premium autonomous chamber presented as a finished product vision, supported by a buildable Phase 1 climate prototype.",
    optimizes: [
      "System integration",
      "Off-grid operation",
      "Product-level enclosure",
      "User-facing controls",
      "Prototype-first risk reduction",
    ],
    figures: [
      {
        src: "/dreamer/cube-overview.jpg",
        caption: "Dreamer Cube — full system sheet",
        note: "System overview, mechanical architecture, power & control, and Dreamer OS integration.",
      },
    ],
    blocks: [
      {
        kind: "facts",
        title: "System highlights",
        items: [
          { k: "Grow cassettes", v: "3×" },
          { k: "Humidity control", v: "40–95%" },
          { k: "Temperature range", v: "60–80 °F" },
          { k: "Noise", v: "<35 dBA" },
          { k: "Power", v: "Solar + battery, 24/7" },
          { k: "Weather rating", v: "IP55 (target)" },
          { k: "Exterior", v: "27.5 in H × 22.5 in W" },
          { k: "Weight", v: "95 lb empty / 145 lb operating" },
        ],
      },
      {
        kind: "list",
        title: "Mechanical architecture",
        items: [
          "Insulated gasket lid — marine-grade seal, compression latches",
          "Removable grow cassette — slide-out, adjustable rails",
          "Perforated air plenum — distributes conditioned air across all cassettes",
          "Air distribution manifold — balanced airflow to each cassette level",
          "Drainage system — sloped floor channels, rear trap and quick-drain port",
          "Utility spine — houses all mechanical, electrical and plumbing components",
          "Service access panel — tool-less, for electronics and system maintenance",
          "Base isolation feet — adjustable, anti-vibration",
        ],
      },
      {
        kind: "table",
        title: "Power budget (typical)",
        head: ["Component", "Power"],
        rows: [
          ["Circulation fans", "8 W"],
          ["Humidifier", "12 W"],
          ["Electronics", "3 W"],
          ["Sensors", "1 W"],
          ["Heater (avg)", "10 W"],
          ["Total average", "34 W"],
          ["Peak (heater on)", "75 W"],
        ],
      },
      {
        kind: "facts",
        title: "Battery runtime (AC70)",
        items: [
          { k: "Battery", v: "Bluetti AC70 · 768 Wh LiFePO₄" },
          { k: "Average load 34 W", v: "~22.5 hrs" },
          { k: "Peak load 75 W", v: "~10.5 hrs" },
          { k: "Solar", v: "400 W panels ×2, Victron MPPT 250/70" },
          { k: "AC output (optional)", v: "1000 W continuous / 2000 W surge" },
        ],
      },
      {
        kind: "list",
        title: "Phase 1 prototype — finished result",
        items: [
          "One 80-quart gasketed tub in front-opening sideways orientation",
          "One removable grow tray or cassette with a raised internal shelf",
          "One low-speed circulation fan plus passive fresh-air openings",
          "External ultrasonic humidifier controlled by an Inkbird IHC-200",
          "Bluetti AC70 battery power with solar charging capability",
          "Basic temperature, humidity and energy logging",
          "Measured battery runtime and daily energy use before scaling",
        ],
        note: "Objective: prove the climate system before building the finished cabinet.",
      },
      {
        kind: "list",
        title: "Phase 1 success criteria",
        items: [
          "Stable humidity without direct fog striking the substrate",
          "Gentle air movement without excessive surface drying",
          "Controlled condensate and dry electrical connections",
          "Overnight battery coverage and measurable solar recovery",
          "Automatic restart after power interruption",
          "At least 24 hours of safe unattended operation",
          "Easy cleaning, tray removal and component access",
        ],
      },
      {
        kind: "steps",
        title: "Phase 1 build — 17 steps",
        items: [
          { t: "Choose the test location", d: "Roughly 36 × 30 × 48 in. Solar access, dry shaded spot for the AC70, battery outside the humidified chamber." },
          { t: "Buy the Phase 1 hardware", d: "Chamber, airflow, humidity, power and monitoring subsystems only — enough to prove one chamber." },
          { t: "Bench-test every electrical component", d: "Charge the AC70, test the fan at lowest setting, confirm the humidifier auto-restarts, meter each component." },
          { t: "Rotate and support the tub", d: "Set the tote on its side so the gasket lid opens toward you. Check for shell bowing before adding load." },
          { t: "Install the internal shelf", d: "3–5 in above the new bottom. Smallest practical holes, load-spreading washers, silicone-sealed penetrations." },
          { t: "Create passive fresh-air openings", d: "About eight filtered openings, roughly two per side near tray height. Spaced, not clustered." },
          { t: "Install the circulation fan", d: "Mount high on rear or side wall; aim along a wall, not at the substrate. Sealed cable gland, lowest practical speed." },
          { t: "Install the humidity inlet", d: "Low on one side or below the shelf, directed at a wall or under-shelf plenum. No hose loops, dips or low spots." },
          { t: "Place the humidity probe", d: "Near tray height, toward center, several inches from the fog inlet, out of direct fan flow." },
          { t: "Add basic drainage", d: "Removable drip tray under the shelf. Inspect corners, hose entry, gasket and shelf mounts after several hours." },
          { t: "Assemble the power system", d: "Battery outside the chamber, elevated AC connections, drip loops in every cord, protected solar cables." },
          { t: "Run a 24-hour empty-chamber test", d: "Record humidity rise and overshoot, condensation points, airflow hot spots, battery % and solar recovered." },
          { t: "Measure the real energy budget", d: "Fan, humidifier, controller and idle watts; humidifier runtime; overnight battery %; solar Wh produced." },
          { t: "Tune airflow and humidity", d: "One variable at a time. Too wet, surface drying and top-to-bottom variation each have a defined adjustment sequence." },
          { t: "Perform simulated failure tests", d: "Disconnect solar, kill humidification, stop the fan, fault the probe, simulate battery shutdown — confirm safe restart." },
          { t: "Run a one-week biological test", d: "One grow tray, observed twice daily: temp/RH, battery, duty cycle, condensation, drying, contamination, maintenance time." },
          { t: "Decide whether Phase 1 passed", d: "Freeze the Phase 2 cabinet specifications only after the prototype meets all success criteria." },
        ],
      },
      {
        kind: "table",
        title: "Recommended build schedule",
        head: ["Timing", "Work package"],
        rows: [
          ["Day 1", "Finalize parts and bench-test electrical equipment"],
          ["Day 2", "Rotate the tub and install the internal shelf"],
          ["Day 3", "Drill passive openings and install the fan"],
          ["Day 4", "Install humidity plumbing and probe"],
          ["Day 5", "Assemble battery and solar power"],
          ["Day 6", "Run the empty 24-hour test"],
          ["Days 7–10", "Tune airflow, humidity and drainage"],
          ["Days 11–17", "Run one live grow tray and collect data"],
          ["Day 18", "Review results and freeze Phase 2 specifications"],
        ],
      },
      {
        kind: "list",
        title: "Dreamer OS — Cube integration",
        items: [
          "Live dashboard: temperature, humidity, airflow, CO₂, VPD, light, battery, solar input, daily yield",
          "AI environment control: auto setpoint tuning, VPD optimization, adaptive airflow, predictive humidification",
          "Harvest prediction from computer-vision growth tracking",
          "Contamination detection for early crop-loss warning",
          "Scalable ecosystem: multiple Cubes managed from a single dashboard",
        ],
        note: "Phase 1 rule: keep AI control disabled. First learn what normal operation looks like.",
      },
    ],
  },
  {
    num: "02",
    name: "AX-80 Adaptive Airframe",
    approach: "Engineering-first approach",
    tagline:
      "A hardware-first brief for a pressure-balanced, serviceable and failure-tolerant 80-quart fruiting platform. Separate biological space from mechanical space.",
    optimizes: [
      "Airflow and moisture mechanics",
      "Serviceability",
      "Failure tolerance",
      "Repeatable geometry",
      "Mechanism proof before automation",
    ],
    figures: [
      { src: "/dreamer/ax80-overview.jpg", caption: "Executive design", note: "Design thesis and the system in one view: service spine → floor plenum → grow cassette." },
      { src: "/dreamer/ax80-architecture.jpg", caption: "Physical architecture", note: "Exploded side elevation, interface boundaries, and the recommended envelope." },
      { src: "/dreamer/ax80-airflow.jpg", caption: "Airflow engine", note: "Low-velocity displacement with a reversible purge path." },
      { src: "/dreamer/ax80-cassette.jpg", caption: "Grow cassette", note: "A removable biological payload, not a permanent interior." },
      { src: "/dreamer/ax80-moisture.jpg", caption: "Moisture management", note: "Condition vapor, reject droplets, recover condensate." },
      { src: "/dreamer/ax80-failure.jpg", caption: "Controls & failure modes", note: "Hardware should degrade gracefully before software intervenes." },
    ],
    blocks: [
      {
        kind: "facts",
        title: "Design thesis",
        items: [
          { k: "3 zones", v: "Service / plenum / grow, one chassis" },
          { k: "0 jets", v: "Diffused delivery only, no direct fog" },
          { k: "2 modes", v: "Powered + passive, graceful failure" },
        ],
      },
      {
        kind: "list",
        title: "The system in one view",
        items: [
          "Service spine — filter, fan + humidity, drain + bypass",
          "Floor plenum — pressure equalization, tapered outlet array, reversible airflow",
          "Grow cassette — slide-in pan frame, clean crop volume, tool-free removal",
        ],
        note: "Central innovation: a reversible plenum permits upward displacement in normal operation and cross-sweep purge during recovery.",
      },
      {
        kind: "table",
        title: "Recommended envelope",
        head: ["Element", "Dimension"],
        rows: [
          ["External shell", "80 qt gasket tote, approx. 32 × 19 × 17 in"],
          ["Service spine", "4.0–5.0 in deep, full rear width"],
          ["Plenum height", "1.75–2.25 in below grow cassette"],
          ["Cassette clearance", "2.0 in minimum around pan perimeter"],
          ["Drain pitch", "1–2° toward external trap"],
        ],
      },
      {
        kind: "list",
        title: "Airflow engine",
        items: [
          "Normal mode — upward displacement through the tapered plenum with controlled bleed",
          "Purge mode — a four-position damper reverses the fan path for 2–5 minutes, sweeping laterally above the substrate to clear CO₂ and excess moisture",
          "Large outlet area reduces local air speed and protects the moist boundary layer around developing fruits",
          "Increasing perforation area with distance counteracts pressure loss and improves distribution uniformity",
        ],
      },
      {
        kind: "list",
        title: "Three-stage humidity path",
        items: [
          "Fog knockdown — humidifier output enters an expansion cup where large droplets settle",
          "Wick equalization — air crosses a replaceable capillary panel that smooths output between cycles",
          "Ceiling-free delivery — humid air enters below the crop and rises without visible mist",
        ],
        note: "Design intent: control relative humidity without treating airborne liquid water as the target.",
      },
      {
        kind: "table",
        title: "Failure response",
        head: ["Failure", "Hardware response", "Result"],
        rows: [
          ["Power loss", "Gravity flaps open", "Passive FAE"],
          ["Fan stall", "Bypass port opens", "No sealed chamber"],
          ["Drain blockage", "Sight trap rises", "Visible warning"],
          ["Humidifier stuck", "Wick limits droplets", "Reduced overshoot"],
          ["Sensor fault", "Manual dial remains", "Operable offline"],
        ],
      },
      {
        kind: "table",
        title: "Prototype bill of materials",
        head: ["Component", "Qty", "Function"],
        rows: [
          ["80 qt gasket tote", "1", "Structural shell"],
          ["HDPE or polypropylene sheet", "2", "Plenum + cassette"],
          ["12 V EC blower, speed controlled", "1", "Air mover"],
          ["4-position rotary damper", "1", "Normal / purge / passive"],
          ["Mist expansion cup + drain nipple", "1", "Droplet knockdown"],
          ["Capillary wick cassette", "1", "Humidity equalizer"],
          ["Silicone gravity flaps", "2", "Power-loss ventilation"],
          ["Bulkhead fittings + clear tubing", "set", "Drain and humid air"],
          ["External condensate trap", "1", "Visible recovery bottle"],
          ["Drawer rails (stainless or polymer)", "2", "Grow cassette support"],
        ],
      },
      {
        kind: "list",
        title: "Prototype sequence",
        items: [
          "Build shell and spine",
          "Bench-test plenum",
          "Add wet path",
          "Smoke-test distribution",
          "Load cassette",
        ],
        note: "Critical test: use theatrical smoke or chilled vapor to verify even rise and absence of stagnant corners before biological use.",
      },
      {
        kind: "list",
        title: "A/B validation — pass criteria",
        items: [
          "RH spread ≤ control",
          "CO₂ peaks lower",
          "Visible mist: none",
          "Water use not higher",
          "Cleaning time 25% lower",
          "Yield non-inferior",
        ],
        note: "Minimum 3 cycles per configuration, holding culture, spawn ratio, substrate, light and temperature constant. Decision: build the airframe first — no AI, cameras or automation until smoke testing and passive-failure testing pass.",
      },
    ],
  },
  {
    num: "03",
    name: "3-Chamber Platform",
    approach: "Scalable operations approach",
    tagline:
      "Three isolated chambers sharing power, humidity distribution and monitoring — a scalable off-grid operating architecture.",
    optimizes: [
      "Modular throughput",
      "Independent branch isolation",
      "Rack-integrated utilities",
      "Low-voltage distribution",
      "Repeatable validation and scale-out",
    ],
    figures: [
      {
        src: "/dreamer/tub-system-c.jpg",
        caption: "3-Chamber system + Tub OS — current",
        note: "Seven panels: inside view, rack layout, humidity system, fan & environment, power & control, solar + battery, top-down layout. Right half is the Tub OS monitoring stack.",
      },
      {
        src: "/dreamer/tub-system-b.jpg",
        caption: "3-Chamber system + Tub OS — prior iteration",
        note: "Six panels left, nine right. Adds AI vision and the wiring block diagram.",
      },
      {
        src: "/dreamer/tub-system-a.jpg",
        caption: "3-Chamber system + Tub OS — first pass",
        note: "Power system, chamber layout and humidity system at concept level.",
      },
    ],
    blocks: [
      {
        kind: "list",
        title: "Core differentiators",
        items: [
          "Sealed rear service spine",
          "Tapered underfloor supply plenum",
          "Slide-out grow cassette",
          "Controlled recirculation + fresh-air bleed",
          "Gravity passive mode during outage",
        ],
      },
      {
        kind: "facts",
        title: "Air + water + power topology",
        items: [
          { k: "Humidity", v: "One humidifier → rigid 3-port manifold → three branches" },
          { k: "Isolation", v: "Three independent balance / shutoff valves" },
          { k: "Power", v: "Bluetti AC70P → 24 VDC bus → controller + sensors" },
          { k: "Condensate", v: "External return; hoses slope away from manifold" },
          { k: "Internal loads", v: "Low voltage only; mains stays outside the humid zone" },
        ],
      },
      {
        kind: "facts",
        title: "Hardware in the current build",
        items: [
          { k: "Chambers", v: "3 × 80-qt gasket totes, front-opening sideways" },
          { k: "Humidifier", v: "AC Infinity Cloudline S6, auto-restart" },
          { k: "Controller", v: "Inkbird IHC-200 — setpoint 93%, differential 5%" },
          { k: "Fans", v: "10-speed, one per tub, lowest setting 24/7 default" },
          { k: "FAE", v: "8 passive holes per tub, 2 per side at container-lip height" },
          { k: "Disconnects", v: "Eden 95210 quick-disconnect per tub" },
          { k: "Gateway", v: "ESP32 over Wi-Fi, temp/RH sensor per tub" },
          { k: "Power", v: "2 × Bluetti AC70P (active + charging swap), 200 W solar" },
          { k: "Target", v: "RH 90–95%, temp 72–78 °F, gentle FAE via fan + passive holes" },
        ],
      },
      {
        kind: "list",
        title: "Performance hypothesis",
        items: [
          "Uniformity — reduced local wetting because air enters below the cassette through many small outlets",
          "Stability — recirculated air lowers RH oscillation and reduces unnecessary humidifier duty",
          "Serviceability — the cassette and service spine come out without disturbing fixed tub penetrations",
        ],
        note: "Validation targets: <5% RH spread across nine points · no visible droplet strike · <10 min cassette removal · passive exchange after power loss.",
      },
      {
        kind: "table",
        title: "Three-chamber hardware list",
        head: ["Item", "Qty", "Purpose"],
        rows: [
          ["HDPE sheet, 3 mm (~24 × 48 in)", "1", "Spines, plenums, diffusers"],
          ["EC axial fans, 120 mm PWM", "3", "Internal recirculation"],
          ["Humid-air hose, smooth wall ¾–1 in ID", "1", "Distribution branches"],
          ["Rigid manifold, three valves + disconnects", "1", "Balancing / isolation"],
          ["Washable polypropylene mesh demister", "3", "Droplet capture"],
          ["Cassette rails, stainless or polymer", "6", "Slide-out grow frame"],
          ["Grow pans, species dependent", "3", "Biological payload"],
          ["Drain fittings — bulkhead + trap + bottle", "3", "Condensate recovery"],
          ["RH/T sensors, optional CO₂", "3", "Environment verification"],
          ["24 VDC power hub, fused branches", "1", "Low-voltage distribution"],
          ["Rack, 36–48 in wide, leveling feet", "1", "Structural support"],
        ],
      },
      {
        kind: "steps",
        title: "Build sequence",
        items: [
          { t: "Mock the tote interior", d: "Cardboard templates before any cutting." },
          { t: "Fit the rear spine", d: "Without cutting the tub." },
          { t: "Build plenum and diffuser", d: "As one removable unit." },
          { t: "Fit cassette rails", d: "Verify front extraction." },
          { t: "Add one fan, one drain, one humid-air inlet", d: "Single chamber only." },
          { t: "Instrument a nine-point grid", d: "Validate one tub." },
          { t: "Only then replicate", d: "To tubs 2 and 3." },
        ],
      },
      {
        kind: "list",
        title: "Do not overbuild V1",
        items: [
          "Include — fan, plenum, cassette, drain, RH/T logging",
          "Defer — heater, camera, AI control, motorized dampers",
        ],
        note: "Air and moisture distribution must be proven before automation adds complexity. Prototype success is a stable climate map and easy service, not maximum feature count.",
      },
      {
        kind: "facts",
        title: "Estimated prototype effort",
        items: [
          { k: "Fabrication", v: "1–2 weekends — cut, heat-bend, drill, gasket, test-fit" },
          { k: "Commissioning", v: "2–4 days — map RH, tune valves, confirm drain behavior" },
          { k: "Validation", v: "One complete fruiting cycle against an unchanged control tub" },
        ],
      },
      {
        kind: "list",
        title: "Tub OS — monitoring stack",
        items: [
          "Chain: 3 chambers → temp/RH sensors → ESP32 gateway → Wi-Fi → database → web/mobile app",
          "Only the middle tub's Inkbird probe controls the humidifier; the other sensors monitor and compare",
          "Live dashboard per tub: RH, temperature, fan speed, humidifier state, battery, alerts",
          "Historical charts: live / 1H / 24H / 7D / 30D / all",
          "Grow journal: species, spawn date, substrate recipe, casing date, fruiting date, harvest log, photos",
          "Smart alerts: humidity imbalance, drying near fan, frequent cycling, conditions good, system health",
        ],
        note: "Roadmap: automated fan control, ambient air quality (CO₂/VOC/PM), image classification, multi-rack support, data export, voice/chat interface.",
      },
    ],
  },
];

export const DECISION_LENS = {
  head: ["", "Cube", "Airframe", "3-Chamber"],
  rows: [
    ["Primary objective", "Finished autonomous product", "Prove airflow and moisture mechanics", "Scale independent grow capacity"],
    ["Complexity", "High", "Medium", "Medium-high"],
    ["Best first build", "Phase 1 tote prototype", "One instrumented chamber", "Only after one chamber passes"],
    ["Strongest advantage", "Integration and presentation", "Uniformity and serviceability", "Modularity and throughput"],
    ["Main risk", "Overbuilding before validation", "Fabrication and tuning effort", "Shared-utility imbalance"],
    ["Recommended role", "North-star product vision", "Core R&D platform", "Scale-out operating architecture"],
  ],
};

export const CLOSER = ["Build the airframe.", "Measure the air.", "Then scale."];
