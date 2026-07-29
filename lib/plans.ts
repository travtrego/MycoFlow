export type Disposition = "accept" | "revert";

export type Eco = {
  id: string;
  severity: "Critical" | "Major" | "Minor" | "Correction";
  decision: Disposition;
  title: string;
  finding: string;
  spec: string;
};

export type PlanChapter = {
  num: string;
  name: string;
  role: string;
  intro: string;
  items: Eco[];
};

export const PLAN_META = {
  program: "Dreamer Systems",
  document: "Engineering Disposition",
  revision: "Revision C",
  date: "29 July 2026",
  headline: "Keep the physics. Drop the overreach.",
  deck:
    "Revision B contained strong engineering criticism, but it also overstated several risks and prescribed four fixes that would make the system less efficient, more complex, or no more sanitary. This disposition reviews all nineteen proposed ECOs against the source portfolio and keeps only the changes that improve the prototype.",
  stats: [
    { label: "Reviewed", value: "19", tone: "neutral" },
    { label: "Accepted", value: "15", tone: "good" },
    { label: "Reverted", value: "4", tone: "bad" },
  ] as { label: string; value: string; tone: "neutral" | "good" | "bad" }[],
  status: "Prototype revision — approved for analytical gates and one-chamber fabrication.",
  rules:
    "An edit is accepted when its defect is real and its final action improves testability, safety, serviceability, or energy performance. It is reverted when the diagnosis is overstated, the prescribed remedy introduces a worse failure mode, or the source package does not contain enough measured data to support the claim.",
};

export const CROSS_CUTTING: Eco[] = [
  {
    id: "ECO-001",
    severity: "Critical",
    decision: "accept",
    title: "Add a real thermal design and operating envelope",
    finding:
      "The source concepts define humidity and airflow far more precisely than temperature control. That is acceptable for an indoor Phase 1 test, but not for a cabinet claiming year-round outdoor operation. The exact heating load cannot be declared until the enclosure, ambient range, fresh-air rate, and humidifier duty are measured.",
    spec:
      "Publish an indoor prototype envelope first. Before outdoor testing, calculate envelope loss, ventilation load, evaporative cooling, fan heat, and substrate heat. Size any heater from that balance and heat supply air or chamber air — not the underside of the grow pan.",
  },
  {
    id: "ECO-002",
    severity: "Critical",
    decision: "revert",
    title: "Do not install a generic polypropylene “enthalpy core” in every design",
    finding:
      "The conflict between fresh-air exchange and climate retention is real. The proposed universal remedy is not. Ordinary corrugated polypropylene or HDPE can exchange sensible heat, but moisture recovery requires a vapor-permeable membrane. A wet, spore-laden exhaust stream also creates fouling and sanitation questions that Revision B did not resolve.",
    spec:
      "Quantify the ventilation energy term first. Consider a removable, washable sensible heat exchanger only for the outdoor Cube if that term dominates. Treat true energy-recovery ventilation as a later tested module, not a baseline requirement.",
  },
  {
    id: "ECO-003",
    severity: "Major",
    decision: "accept",
    title: "Declare the biological design point",
    finding:
      "“Mushrooms” is not a specification. Temperature, fresh-air exchange, canopy clearance, and moisture behavior vary enough by species that the engineering pass criteria need a named operating profile.",
    spec:
      "Select one primary species/profile for prototype validation and one secondary tolerance profile. Put the temperature band, RH band, fresh-air target, cassette clearance, and allowable recovery time on the cover sheet.",
  },
  {
    id: "ECO-004",
    severity: "Major",
    decision: "accept",
    title: "Calibrate before using a five-point RH uniformity criterion",
    finding:
      "Commodity digital RH sensors can have individual errors comparable to the proposed chamber spread. Nine uncorrected sensors can manufacture a gradient or hide one.",
    spec:
      "Use a single-sensor nine-position traverse for formal mapping, or cross-calibrate all sensors in one stable reference environment and store offsets. State the sensor model, settling time, and measurement method beside every pass criterion.",
  },
];

export const CHAPTERS: PlanChapter[] = [
  {
    num: "01",
    name: "Integrated Cube",
    role: "Product vision — retained and narrowed",
    intro:
      "The Cube remains the north-star product. Revision C removes unsupported autonomy and intelligence claims while preserving the industrial design, service spine, cassette architecture, and solar-ready intent.",
    items: [
      {
        id: "ECO-101",
        severity: "Critical",
        decision: "accept",
        title: "Replace the single average power number with seasonal budgets",
        finding:
          "A 10 W heater, a 34 W average load, and operation across an extreme outdoor temperature range cannot all be accepted without an enclosure heat-loss calculation. The battery also cannot accept charge below its specified charging temperature, so cold-weather solar operation needs a protected battery compartment or a different scope.",
        spec:
          "Publish summer and winter load cases with stated ambient conditions, duty cycles, inverter state, battery reserve, and solar assumptions. Change the product claim to “grid-optional with measured ride-through” until winter tests prove more.",
      },
      {
        id: "ECO-102",
        severity: "Major",
        decision: "accept",
        title: "Use a native DC internal bus",
        finding:
          "Low-power fans, sensors, valves, lighting, and small ultrasonic modules do not need an inverter running continuously. The original AC architecture wastes battery energy in conversion and standby losses.",
        spec:
          "Use a fused 24 VDC distribution bus and local DC-DC conversion where required. Reserve the inverter for an optional service outlet or a legacy AC humidifier during Phase 1 testing.",
      },
      {
        id: "ECO-103",
        severity: "Major",
        decision: "accept",
        title: "Qualify ingress protection at the assembled-system level",
        finding:
          "Ventilation ports do not automatically invalidate an ingress rating, but the complete cabinet must earn the rating. The current render shows air openings without enough detail to support IP55.",
        spec:
          "Use downward-facing baffled air ports, drained low points, suitable hydrophobic media, and sealed cable glands. Do not print IP55 on the product sheet until the complete assembly is tested; use “weather-shielded prototype” beforehand.",
      },
      {
        id: "ECO-104",
        severity: "Minor",
        decision: "accept",
        title: "Add per-shelf air balancing and inter-shelf drip control",
        finding:
          "Three stacked cassettes on one vertical path will not receive identical air by default, and upper-shelf condensate must not fall onto lower crops.",
        spec:
          "Give every shelf a defined plenum takeoff or balance orifice, its own drip eave and drain path, and a mapped sensor position. Validate top-to-bottom temperature and RH spread under full biological load.",
      },
      {
        id: "ECO-105",
        severity: "Minor",
        decision: "accept",
        title: "Ship data capture before predictive AI",
        finding:
          "Harvest prediction and contamination classification require labeled chamber-specific data that does not exist yet. Presenting them as delivered features confuses the roadmap with the prototype.",
        spec:
          "Phase 1 provides environment logging, fixed-view timelapse, batch records, threshold alerts, and simple anomaly flags. Prediction models remain roadmap items until repeated labeled cycles support validation.",
      },
    ],
  },
  {
    num: "02",
    name: "AX-80 Adaptive Airframe",
    role: "Core R&D platform — build first",
    intro:
      "The AX-80 remains the strongest engineering concept because it separates crop handling from the wet mechanical path. Revision C simplifies the airflow engine and removes two failure-prone elements.",
    items: [
      {
        id: "ECO-201",
        severity: "Critical",
        decision: "accept",
        title: "Remove the permanently wet capillary wick from the baseline",
        finding:
          "A continuously wet medium in the supply path creates sanitation and maintenance burdens. The concept only needs droplet knockdown and pulse smoothing; it does not require an absorbent biological surface.",
        spec:
          "Start with an expansion chamber, inert impingement baffles, and a drained, removable polymer demister. Any media must be non-nutritive, bleach-compatible, tool-free, and assigned a documented cleaning or replacement interval.",
      },
      {
        id: "ECO-202",
        severity: "Major",
        decision: "accept",
        title: "Keep wet-path flow unidirectional",
        finding:
          "Reversing flow through a demister and condensate zone risks carrying collected water back toward the crop and adds a complex damper in a wet, spore-bearing duct.",
        spec:
          "Use one unidirectional supply blower and a separate high-mounted purge exhaust fan or purge valve. The purge path must never reverse through the moisture separator.",
      },
      {
        id: "ECO-203",
        severity: "Major",
        decision: "revert",
        title: "Do not hold a fail-open damper closed with a continuously powered solenoid",
        finding:
          "The sticking risk deserves attention, but the proposed remedy consumes continuous power, generates heat, and creates another actuator dependency in an off-grid system.",
        spec:
          "Use permanently open filtered passive vents sized for minimum survival exchange, with the powered airflow system providing optimization rather than basic breathability. Where a flap is necessary, use a spring or weighted rigid flap with a low-adhesion seat and a documented monthly exercise test.",
      },
      {
        id: "ECO-204",
        severity: "Minor",
        decision: "accept",
        title: "Turn the plenum principle into a fabrication schedule",
        finding:
          "The portfolio explains the taper and increasing open area but does not specify a repeatable prototype pattern.",
        spec:
          "Publish a removable diffuser schedule by zone: length, plenum depth, hole count, diameter, and open area. Begin conservatively, smoke-test, then enlarge only measured low-flow zones. Keep hole diameters large enough to resist water bridging and easy enough to clean.",
      },
      {
        id: "ECO-205",
        severity: "Minor",
        decision: "accept",
        title: "Specify the filter and drain trap — but do not default blindly to HEPA",
        finding:
          "“Filter” and “trap” are incomplete specifications. A true HEPA element may impose unnecessary pressure drop on a low-static-pressure fan, while a shallow condensate trap can become an uncontrolled air bypass.",
        spec:
          "Select filtration from the fan curve and measured pressure drop: washable prefilter plus a replaceable fine or hydrophobic intake element appropriate to the biological goal. Size the trap from maximum system static pressure with margin, keep it visible, and include a priming and cleaning procedure.",
      },
    ],
  },
  {
    num: "03",
    name: "Three-Chamber Platform",
    role: "Scale-out architecture — preserve the rack, improve control",
    intro:
      "The rack and isolation hardware remain useful. Revision C retains centralized humidification for the first prototype, adds active per-branch control, and removes unsupported battery conclusions.",
    items: [
      {
        id: "ECO-301",
        severity: "Critical",
        decision: "revert",
        title: "Do not automatically replace one maintained humidifier with three wet reservoirs",
        finding:
          "A dirty ultrasonic reservoir can aerosolize microorganisms, so the centralized source is a common-mode sanitation risk. That does not prove three separate reservoirs are safer, cheaper, or simpler. Three tanks triple cleaning points, refill points, leak points, and ultrasonic modules.",
        spec:
          "Retain the central humidifier for the first three-chamber test, but make sanitation explicit: closed removable reservoir, distilled or otherwise controlled water, scheduled cleaning, smooth drain-back plumbing, individual branch isolation, and no stagnant low points. Compare central versus per-chamber generation only after measured data.",
      },
      {
        id: "ECO-302",
        severity: "Major",
        decision: "accept",
        title: "Do not rely on one-time manual balancing of pulsed branches",
        finding:
          "Branch resistance changes with hose condition, filter loading, chamber state, and valve position. A steady-state balance session cannot guarantee equal delivery during every humidifier pulse.",
        spec:
          "Give each branch a repeatable indexed restriction and an independently controllable shutoff or valve. Use per-chamber RH data to sequence or trim branches. The central humidifier can remain shared while control authority becomes local.",
      },
      {
        id: "ECO-303",
        severity: "Major",
        decision: "accept",
        title: "Move closed-loop control into each chamber",
        finding:
          "A single controller undermines the mechanical isolation strategy and makes one electronics failure capable of disabling the full rack.",
        spec:
          "Use one local node and one fused branch per chamber. Each node retains safe setpoints and runs its own fan, sensing, and branch valve. A coordinator provides logging and dashboard functions only; losing it must not stop basic chamber operation.",
      },
      {
        id: "ECO-304",
        severity: "Major",
        decision: "revert",
        title: "Do not declare the battery a day short before measuring duty cycle",
        finding:
          "The existing documents intentionally call for watt-meter testing and report approximate runtime ranges. Without measured fan draw, humidifier power, duty cycle, inverter loss, and thermal load, the statement that the AC70P is already “well over” daily capacity is not established.",
        spec:
          "Classify the AC70/AC70P as a prototype power source and ride-through reserve. Measure 24-hour energy use in empty and loaded tests, then publish runtime. Add winter heating only after ECO-001 establishes the thermal requirement.",
      },
      {
        id: "ECO-305",
        severity: "Minor",
        decision: "accept",
        title: "Add an actual contaminated-batch removal procedure",
        finding:
          "Mechanical branch isolation does not protect nearby chambers if a contaminated tub is opened on the rack. This is primarily an operating-procedure gap.",
        spec:
          "Close the branch, stop the local fan, seal the chamber or cassette before removal, move it out of the grow area, and open it only in the designated cleaning location. Service clean chambers first and suspect chambers last. Do not add rack-level negative pressure to V1 unless testing shows it is needed.",
      },
    ],
  },
];

export const MATRIX: { item: string; decision: string; tone: Disposition; action: string }[] = [
  { item: "ECO-001", decision: "Accept", tone: "accept", action: "Thermal balance and defined operating envelope" },
  { item: "ECO-002", decision: "Revert", tone: "revert", action: "Quantify ventilation load; optional tested heat recovery only" },
  { item: "ECO-003", decision: "Accept", tone: "accept", action: "Primary species/profile plus secondary tolerance profile" },
  { item: "ECO-004", decision: "Accept", tone: "accept", action: "Calibrated sensors or single-sensor traverse" },
  { item: "ECO-101–105", decision: "Accept all 5", tone: "accept", action: "Seasonal energy, DC bus, qualified weather rating, shelf control, honest AI roadmap" },
  { item: "ECO-201–202", decision: "Accept", tone: "accept", action: "Inert demister and unidirectional wet path" },
  { item: "ECO-203", decision: "Revert", tone: "revert", action: "Permanent passive vents; no continuously energized hold-closed solenoid" },
  { item: "ECO-204–205", decision: "Accept", tone: "accept", action: "Dimensioned plenum; pressure-matched filter and trap" },
  { item: "ECO-301", decision: "Revert", tone: "revert", action: "Retain central humidifier for prototype with explicit sanitation controls" },
  { item: "ECO-302–303", decision: "Accept", tone: "accept", action: "Active branch control and independent local nodes" },
  { item: "ECO-304", decision: "Revert", tone: "revert", action: "Measure duty cycle before declaring runtime failure" },
  { item: "ECO-305", decision: "Accept", tone: "accept", action: "Sealed removal and quarantine SOP; no negative-pressure rack in V1" },
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
    note: "Phase 1 Build Guide, AX-80 Adaptive Airframe briefs, and the three-chamber engineering package supplied with Revision A.",
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
    note: "Ultrasonic humidifiers can aerosolize microorganisms and minerals from standing water, supporting explicit water-system sanitation without proving that three reservoirs are superior to one.",
  },
  {
    source: "Fan and drainage engineering guidance",
    note: "Filter selection and condensate-trap geometry must be matched to system static pressure and the actual fan curve.",
  },
];
