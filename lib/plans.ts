export type Level = "Critical" | "Major" | "Minor";

export type Spec = {
  ref: string;
  level: Level;
  title: string;
  spec: string;
  why: string;
};

export type PlanSection = {
  num: string;
  name: string;
  role: string;
  intro: string;
  items: Spec[];
};

export const PLAN_META = {
  program: "Dreamer Systems",
  revision: "Revision C",
  date: "29 July 2026",
  headline: "Keep the physics. Drop the overreach.",
  deck:
    "The working specification for the Dreamer chamber program: what each system has to do, what has to be measured before it can claim to do it, and the order the hardware gets built in.",
  stats: [
    { label: "Systems", value: "3" },
    { label: "Specs", value: "19" },
    { label: "Build steps", value: "9" },
  ],
  status: "Prototype revision — approved for analytical gates and one-chamber fabrication.",
};

export const PROGRAM_WIDE: Spec[] = [
  {
    ref: "001",
    level: "Critical",
    title: "Thermal design and operating envelope",
    spec:
      "Publish an indoor prototype envelope first. Before outdoor testing, calculate envelope loss, ventilation load, evaporative cooling, fan heat, and substrate heat. Size any heater from that balance and heat supply air or chamber air — not the underside of the grow pan.",
    why:
      "The concepts define humidity and airflow far more precisely than temperature control. That is acceptable for an indoor Phase 1 test, but not for a cabinet claiming year-round outdoor operation. The exact heating load cannot be declared until the enclosure, ambient range, fresh-air rate, and humidifier duty are measured.",
  },
  {
    ref: "002",
    level: "Critical",
    title: "Ventilation energy before any heat-recovery core",
    spec:
      "Quantify the ventilation energy term first. Consider a removable, washable sensible heat exchanger only for the outdoor Cube if that term dominates. Treat true energy-recovery ventilation as a later tested module, not a baseline requirement.",
    why:
      "The conflict between fresh-air exchange and climate retention is real, but a generic plastic core is not the fix. Ordinary corrugated polypropylene or HDPE can exchange sensible heat; moisture recovery requires a vapor-permeable membrane. A wet, spore-laden exhaust stream also creates fouling and sanitation questions.",
  },
  {
    ref: "003",
    level: "Major",
    title: "Declared biological design point",
    spec:
      "Select one primary species/profile for prototype validation and one secondary tolerance profile. Put the temperature band, RH band, fresh-air target, cassette clearance, and allowable recovery time on the cover sheet.",
    why:
      "“Mushrooms” is not a specification. Temperature, fresh-air exchange, canopy clearance, and moisture behavior vary enough by species that the engineering pass criteria need a named operating profile.",
  },
  {
    ref: "004",
    level: "Major",
    title: "Sensor calibration before any uniformity claim",
    spec:
      "Use a single-sensor nine-position traverse for formal mapping, or cross-calibrate all sensors in one stable reference environment and store offsets. State the sensor model, settling time, and measurement method beside every pass criterion.",
    why:
      "Commodity digital RH sensors can have individual errors comparable to the chamber spread being measured. Nine uncorrected sensors can manufacture a gradient or hide one.",
  },
];

export const SECTIONS: PlanSection[] = [
  {
    num: "01",
    name: "Integrated Cube",
    role: "Product vision",
    intro:
      "The north-star product. Industrial design, service spine, cassette architecture, and solar-ready intent are retained; autonomy and intelligence claims are held back until measured.",
    items: [
      {
        ref: "101",
        level: "Critical",
        title: "Seasonal energy budgets, not one average number",
        spec:
          "Publish summer and winter load cases with stated ambient conditions, duty cycles, inverter state, battery reserve, and solar assumptions. The product claim is “grid-optional with measured ride-through” until winter tests prove more.",
        why:
          "A 10 W heater, a 34 W average load, and operation across an extreme outdoor temperature range cannot all hold without an enclosure heat-loss calculation. The battery also cannot accept charge below its specified charging temperature, so cold-weather solar operation needs a protected battery compartment or a narrower scope.",
      },
      {
        ref: "102",
        level: "Major",
        title: "Native DC internal bus",
        spec:
          "Use a fused 24 VDC distribution bus and local DC-DC conversion where required. Reserve the inverter for an optional service outlet or a legacy AC humidifier during Phase 1 testing.",
        why:
          "Low-power fans, sensors, valves, lighting, and small ultrasonic modules do not need an inverter running continuously. An AC-first architecture wastes battery energy in conversion and standby losses.",
      },
      {
        ref: "103",
        level: "Major",
        title: "Ingress protection qualified at the assembled-system level",
        spec:
          "Use downward-facing baffled air ports, drained low points, suitable hydrophobic media, and sealed cable glands. Do not print IP55 on the product sheet until the complete assembly is tested; use “weather-shielded prototype” beforehand.",
        why:
          "Ventilation ports do not automatically invalidate an ingress rating, but the complete cabinet has to earn it. The current design shows air openings without enough detail to support IP55.",
      },
      {
        ref: "104",
        level: "Minor",
        title: "Per-shelf air balancing and inter-shelf drip control",
        spec:
          "Give every shelf a defined plenum takeoff or balance orifice, its own drip eave and drain path, and a mapped sensor position. Validate top-to-bottom temperature and RH spread under full biological load.",
        why:
          "Three stacked cassettes on one vertical path will not receive identical air by default, and upper-shelf condensate must not fall onto lower crops.",
      },
      {
        ref: "105",
        level: "Minor",
        title: "Data capture ships before predictive AI",
        spec:
          "Phase 1 provides environment logging, fixed-view timelapse, batch records, threshold alerts, and simple anomaly flags. Prediction models stay roadmap items until repeated labeled cycles support validation.",
        why:
          "Harvest prediction and contamination classification require labeled chamber-specific data that does not exist yet. Presenting them as delivered features confuses the roadmap with the prototype.",
      },
    ],
  },
  {
    num: "02",
    name: "AX-80 Adaptive Airframe",
    role: "Core R&D platform — build first",
    intro:
      "The strongest engineering concept in the portfolio because it separates crop handling from the wet mechanical path. The airflow engine is simplified and two failure-prone elements are removed.",
    items: [
      {
        ref: "201",
        level: "Critical",
        title: "No permanently wet capillary wick in the supply path",
        spec:
          "Start with an expansion chamber, inert impingement baffles, and a drained, removable polymer demister. Any media must be non-nutritive, bleach-compatible, tool-free, and assigned a documented cleaning or replacement interval.",
        why:
          "A continuously wet medium in the supply path creates sanitation and maintenance burdens. The concept only needs droplet knockdown and pulse smoothing; it does not require an absorbent biological surface.",
      },
      {
        ref: "202",
        level: "Major",
        title: "Unidirectional wet-path flow",
        spec:
          "Use one unidirectional supply blower and a separate high-mounted purge exhaust fan or purge valve. The purge path must never reverse through the moisture separator.",
        why:
          "Reversing flow through a demister and condensate zone risks carrying collected water back toward the crop and adds a complex damper in a wet, spore-bearing duct.",
      },
      {
        ref: "203",
        level: "Major",
        title: "Passive vents, not a powered hold-closed damper",
        spec:
          "Use permanently open filtered passive vents sized for minimum survival exchange, with the powered airflow system providing optimization rather than basic breathability. Where a flap is necessary, use a spring or weighted rigid flap with a low-adhesion seat and a documented monthly exercise test.",
        why:
          "Holding a fail-open damper shut with a continuously energized solenoid consumes constant power, generates heat, and creates another actuator dependency in an off-grid system.",
      },
      {
        ref: "204",
        level: "Minor",
        title: "Plenum published as a fabrication schedule",
        spec:
          "Publish a removable diffuser schedule by zone: length, plenum depth, hole count, diameter, and open area. Begin conservatively, smoke-test, then enlarge only measured low-flow zones. Keep hole diameters large enough to resist water bridging and easy enough to clean.",
        why:
          "The taper and increasing open area are explained in principle but not specified as a repeatable prototype pattern.",
      },
      {
        ref: "205",
        level: "Minor",
        title: "Filter and drain trap sized from the fan curve",
        spec:
          "Select filtration from the fan curve and measured pressure drop: washable prefilter plus a replaceable fine or hydrophobic intake element appropriate to the biological goal. Size the trap from maximum system static pressure with margin, keep it visible, and include a priming and cleaning procedure.",
        why:
          "“Filter” and “trap” are incomplete specifications. A true HEPA element may impose unnecessary pressure drop on a low-static-pressure fan, and a shallow condensate trap can become an uncontrolled air bypass.",
      },
    ],
  },
  {
    num: "03",
    name: "Three-Chamber Platform",
    role: "Scale-out architecture",
    intro:
      "The rack and isolation hardware carry forward. Humidification stays centralized for the first prototype, control authority moves local, and battery capacity is treated as unmeasured until tested.",
    items: [
      {
        ref: "301",
        level: "Critical",
        title: "Central humidifier retained, with explicit sanitation controls",
        spec:
          "Retain the central humidifier for the first three-chamber test with sanitation made explicit: closed removable reservoir, distilled or otherwise controlled water, scheduled cleaning, smooth drain-back plumbing, individual branch isolation, and no stagnant low points. Compare central versus per-chamber generation only after measured data.",
        why:
          "A dirty ultrasonic reservoir can aerosolize microorganisms, so a centralized source is a common-mode sanitation risk. That does not make three separate reservoirs safer, cheaper, or simpler — three tanks triple cleaning points, refill points, leak points, and ultrasonic modules.",
      },
      {
        ref: "302",
        level: "Major",
        title: "Active branch control, not one-time manual balancing",
        spec:
          "Give each branch a repeatable indexed restriction and an independently controllable shutoff or valve. Use per-chamber RH data to sequence or trim branches. The central humidifier can stay shared while control authority becomes local.",
        why:
          "Branch resistance changes with hose condition, filter loading, chamber state, and valve position. A steady-state balance session cannot guarantee equal delivery during every humidifier pulse.",
      },
      {
        ref: "303",
        level: "Major",
        title: "Closed-loop control inside each chamber",
        spec:
          "Use one local node and one fused branch per chamber. Each node retains safe setpoints and runs its own fan, sensing, and branch valve. A coordinator provides logging and dashboard functions only; losing it must not stop basic chamber operation.",
        why:
          "A single controller undermines the mechanical isolation strategy and makes one electronics failure capable of disabling the full rack.",
      },
      {
        ref: "304",
        level: "Major",
        title: "Measure duty cycle before declaring runtime",
        spec:
          "Classify the AC70/AC70P as a prototype power source and ride-through reserve. Measure 24-hour energy use in empty and loaded tests, then publish runtime. Add winter heating only after the thermal requirement is established.",
        why:
          "Without measured fan draw, humidifier power, duty cycle, inverter loss, and thermal load, any claim about daily capacity — short or sufficient — is unsupported.",
      },
      {
        ref: "305",
        level: "Minor",
        title: "Contaminated-batch removal procedure",
        spec:
          "Close the branch, stop the local fan, seal the chamber or cassette before removal, move it out of the grow area, and open it only in the designated cleaning location. Service clean chambers first and suspect chambers last. Do not add rack-level negative pressure to V1 unless testing shows it is needed.",
        why:
          "Mechanical branch isolation does not protect nearby chambers if a contaminated tub is opened on the rack. This is primarily an operating-procedure gap.",
      },
    ],
  },
];

export const BUILD_ORDER: { title: string; detail: string; gate?: string }[] = [
  { title: "Freeze the primary biological profile", detail: "Temperature, RH, FAE, cassette clearance, and ambient operating assumptions." },
  {
    title: "Write the thermal and electrical budget",
    detail: "Include ventilation and humidification duty.",
    gate: "No outdoor-product claims before this exists.",
  },
  { title: "Calibrate the measurement system", detail: "One traverse sensor or corrected multi-sensor array." },
  {
    title: "Build one revised AX-80",
    detail: "Unidirectional supply, separate purge path, inert demister, fixed passive vents, dimensioned removable diffuser.",
  },
  { title: "Run dry airflow and water tests", detail: "Smoke map, pressure check, condensate routing, trap operation, leak cutoff." },
  {
    title: "Run the empty 24-hour climate test",
    detail: "RH spread, recovery, duty cycle, water use, and actual battery draw.",
    gate: "Uniformity and safe failure must pass.",
  },
  { title: "Run one matched biological A/B cycle", detail: "Current Dreamer tub versus revised AX-80 under the same culture and room conditions." },
  { title: "Replicate to three chambers", detail: "Central sanitized humidifier, active branch controls, and one local controller node per chamber." },
  { title: "Revisit productization", detail: "Use measured seasonal data to freeze the Cube enclosure, solar array, battery capacity, and feature claims." },
];

export const SOURCES: { source: string; note: string }[] = [
  {
    source: "Dreamer source portfolio",
    note: "Phase 1 Build Guide, AX-80 Adaptive Airframe briefs, and the three-chamber engineering package.",
  },
  {
    source: "BLUETTI AC70 manual and support specifications",
    note: "Charging is specified for 32–104 °F, while discharge is permitted over a wider range. This supports narrowing cold-weather autonomy claims.",
  },
  {
    source: "U.S. Department of Energy ventilation guidance",
    note: "Heat-recovery ventilators transfer heat; energy-recovery systems require materials designed to transfer moisture. A generic plastic plate core is not automatically an enthalpy core.",
  },
  {
    source: "Sensirion SHT4x documentation",
    note: "Individual RH accuracy is large enough relative to a five-point spread target that calibration or a single-sensor traverse is necessary for a defensible uniformity test.",
  },
  {
    source: "U.S. EPA humidifier guidance",
    note: "Ultrasonic humidifiers can aerosolize microorganisms and minerals from standing water, supporting explicit water-system sanitation.",
  },
  {
    source: "Fan and drainage engineering guidance",
    note: "Filter selection and condensate-trap geometry must be matched to system static pressure and the actual fan curve.",
  },
];

export const CLOSER = [
  "Accept what makes the prototype measurable.",
  "Revert what only sounds more engineered.",
  "Build one chamber. Prove the air.",
];
