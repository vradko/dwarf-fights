// ── CONSTANTS & DATA ──────────────────────────────────────

const MAX_PARTICIPANTS = 50;
const STORAGE_ROSTER = "dwarf-fights-roster-v2";
const STORAGE_CHAMPION = "dwarf-fights-champion-v2";

const WORLD_WIDTH = 1000;
const WORLD_HEIGHT = 620;
const CENTER_X = WORLD_WIDTH / 2;
const CENTER_Y = WORLD_HEIGHT * 0.56;
const ARENA_RX = 300;
const ARENA_RY = 176;
const PROFILE_CACHE = new Map();

// ── ISOMETRIC PROJECTION ─────────────────────────────────
const ISO_SCALE = 0.55; // Y-axis compression for isometric perspective
function isoY(wy) { return CENTER_Y + (wy - CENTER_Y) * ISO_SCALE; }
function createIsoPolygon(cx, cy, radius, sides, rotation) {
  const points = [];
  for (let i = 0; i < sides; i++) {
    const angle = rotation + (Math.PI * 2 * i) / sides;
    points.push({
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius * ISO_SCALE
    });
  }
  return points;
}

const SPEED_PRESETS = {
  custom: { label: "Custom", timeScale: 1.0, logGap: 430 }
};

const ARCHETYPES = [
  {
    key: "butcher",
    label: "Butcher",
    bodyScale: 1.16,
    shoulderScale: 1.3,
    headScale: 0.98,
    beardScale: 1.14,
    hatStyle: "point",
    torsoStyle: "apron",
    weaponBias: ["knife", "axe", "mug", "pan"],
    mass: 1.4,
  },
  {
    key: "stabber",
    label: "Stabber",
    bodyScale: 0.94,
    shoulderScale: 0.98,
    headScale: 1.04,
    beardScale: 0.94,
    hatStyle: "point",
    torsoStyle: "rag",
    weaponBias: ["knife", "wrench", "chain", "pan"],
    mass: 0.75,
  },
  {
    key: "tavern",
    label: "Tavern Rat",
    bodyScale: 1.08,
    shoulderScale: 1.08,
    headScale: 1.02,
    beardScale: 1.24,
    hatStyle: "none",
    torsoStyle: "vest",
    weaponBias: ["mug", "bat", "chair", "shovel"],
    mass: 1.1,
  },
];

const WELCOME_MESSAGES = [
  "The cage lights are hot, the crowd is loud, and tonight fate will absolutely make a terrible decision.",
  "The octagon is ready for tiny beards, flying furniture, and the full collapse of good judgment.",
  "No one here has a plan, which is exactly why this show has real championship energy.",
  "The announcer has already lost control of the room and the fight has not even started yet.",
  "Tonight the laws of probability put on steel boots and walk directly into the octagon.",
  "Every name becomes a dwarf, every dwarf gets a weapon, and the crowd will pretend this was destiny.",
];

const ROUND_LINES = [
  "The cage closes. The air smells like iron and bad decisions.",
  "The crowd feels a chain reaction coming and no one is backing away.",
  "Too many beards, too few exits. This is going to be beautiful.",
];

const AMBIENT_LINES = [
  "{fighter} is running on adrenaline, floor dust, and zero self-preservation.",
  "{fighter} is somehow still standing despite being held together by anger and belt buckles.",
  "{fighter} just spat on the floor and the crowd took it as a declaration of war.",
  "The crowd is convinced {fighter} knows what they are doing. The blood says otherwise.",
  "{fighter} is circling like a predator who forgot what the plan was three hits ago.",
  "{fighter} wipes blood off their beard and grins. The crowd loses it.",
  "Something cracked. Could be the floor. Could be {fighter}'s last shred of mercy.",
  "{fighter} is breathing like a furnace and swinging like one too.",
];

const ATTACK_LINES = [
  "{attacker} drives the {weapon} into {defender}'s face with zero hesitation.",
  "{attacker} barrels forward and introduces the {weapon} to {defender}'s skull.",
  "{attacker} lands a vicious crack and {defender} staggers sideways.",
  "{attacker} swings from the hips and the {weapon} connects with a wet crunch.",
  "{attacker} slams the {weapon} down and {defender}'s knees buckle.",
  "{attacker} catches {defender} off guard with a savage backhand from the {weapon}.",
  "{attacker} drives an elbow followed by the {weapon} straight into {defender}'s ribs.",
  "{attacker} whips the {weapon} overhead and brings it down like a verdict.",
];

const CRIT_LINES = [
  "{attacker} DETONATES a critical hit — {defender} is seeing stars and tasting iron.",
  "{attacker} finds the sweet spot and the {weapon} cracks like thunder on {defender}'s jaw.",
  "{attacker} winds up from the basement and OBLITERATES {defender}. The crowd goes feral.",
  "{attacker} delivers a hit so clean it echoes twice. {defender} doesn't know what year it is.",
  "CRITICAL. {attacker} channels pure violence through the {weapon}. {defender} folds like paper.",
];

const KO_LINES = [
  "{winner} DESTROYS {loser}. Body hits the floor like a sack of wet gravel.",
  "{loser} crumples and {winner} doesn't even look back. Cold-blooded.",
  "{winner} ends {loser}'s entire career with one final, devastating blow.",
  "{loser} goes down hard and the octagon shakes. {winner} roars at the crowd.",
  "{winner} puts {loser} face-first into the floor. That beard will never be the same.",
  "{loser} drops like their soul left early. {winner} spits and moves on.",
  "{winner} folds {loser} in half. The crowd can't believe what it just witnessed.",
  "{loser} is now a permanent part of the floor. {winner} claims another body.",
];

const CHAMPION_MESSAGES = [
  "One dwarf stands in a ring of bodies, soaked in someone else's blood, wearing what can only be described as a smile.",
  "The last one standing. Not the cleanest fighter, but definitely the most brutal.",
  "The crowd is silent. Then the roar comes. This is what violence looks like when it wins.",
  "Against all odds and most medical advice, a champion has emerged from the carnage.",
];

const SAMPLE_NAMES = [
  "Maya",
  "Liam",
  "Nora",
  "Theo",
  "Ivy",
  "Owen",
  "Lena",
  "Jude",
];

const DWARF_PREFIXES = [
  "Iron",
  "Brick",
  "Saint",
  "Riot",
  "Captain",
  "Mad",
  "Duke",
  "Basement",
  "Thunder",
  "Steel",
  "Brawl",
  "Rust",
];

const DWARF_BASE_NAMES = [
  "Beardclap",
  "Panbreaker",
  "Cageboot",
  "Shovelthane",
  "Chaingrin",
  "Dustjaw",
  "Hammergob",
  "Kettlemaul",
  "Curbforge",
  "Pipefist",
  "Rumblemug",
  "Crowdsmack",
];

const DWARF_SUFFIXES = [
  "of Stairwell Nine",
  "the Loud",
  "of Parking Lot Glory",
  "After Payday",
  "the Uninvited",
  "of the Side Alley Throne",
  "the Last Receipt",
  "of Cold Concrete",
  "the Overcommitted",
  "from the Wrong Entrance",
];

const WEAPONS = [
  { name: "Ancestral Frying Pan", type: "pan", power: 8, reach: 28, tint: "#d6dde5" },
  { name: "District Axe", type: "axe", power: 9, reach: 34, tint: "#dde4ef" },
  { name: "Landlord Shovel", type: "shovel", power: 7, reach: 30, tint: "#bec7d4" },
  { name: "Socket Wrench 32", type: "wrench", power: 8, reach: 30, tint: "#bfc9d7" },
  { name: "Sacred Folding Chair", type: "chair", power: 10, reach: 38, tint: "#976949" },
  { name: "Midnight Carving Knife", type: "knife", power: 7, reach: 25, tint: "#eff4fa" },
  { name: "Basement Hammer", type: "hammer", power: 9, reach: 30, tint: "#cbd1d8" },
  { name: "Community Bat", type: "bat", power: 8, reach: 36, tint: "#b98857" },
  { name: "Glory Chain", type: "chain", power: 9, reach: 42, tint: "#acb4c1" },
  { name: "Iron Beer Mug", type: "mug", power: 8, reach: 26, tint: "#d7b06a" },
];

const SKIN_TONES = ["#f5d7be", "#efc7a8", "#dbb08a", "#c78b6d", "#9b684f"];
const HAT_COLORS = ["#c22118", "#a51d16", "#d13424", "#7c1815", "#b1261b", "#8a2018"];
const COAT_COLORS = ["#5d7b36", "#61753d", "#876b26", "#7c3f2d", "#6d4a2a", "#6b3844", "#465a37"];
const PANTS_COLORS = ["#4f5f33", "#5b4b2a", "#463a57", "#5a3b2d", "#3d5a63"];
const BEARD_COLORS = ["#e7ddc7", "#d6c9ab", "#b9a17f", "#c8c7c1", "#9b8e79", "#d9d0c4"];

const BLOOD_COLORS = ["#8a1a15", "#6b1210", "#a02218", "#701815", "#5e0f0c"];

// Kill feed lines
const KILL_FEED_VERBS = [
  "destroyed", "annihilated", "obliterated", "crushed", "ended",
  "eliminated", "wrecked", "demolished", "finished", "butchered",
];

// ── DOM REFERENCES ────────────────────────────────────────

const dom = {
  welcomeMessage: document.querySelector("#welcomeMessage"),
  refreshGreetingBtn: document.querySelector("#refreshGreetingBtn"),
  addForm: document.querySelector("#addForm"),
  nameInput: document.querySelector("#nameInput"),
  bulkBox: null,
  bulkInput: null,
  bulkAddBtn: null,
  seedNamesBtn: document.querySelector("#seedNamesBtn"),
  rerollDwarfsBtn: document.querySelector("#rerollDwarfsBtn"),
  soundToggleBtn: document.querySelector("#soundToggleBtn"),
  clearNamesBtn: document.querySelector("#clearNamesBtn"),
  startTournamentBtn: document.querySelector("#startTournamentBtn"),
  rosterCount: document.querySelector("#rosterCount"),
  rosterList: document.querySelector("#rosterList"),
  rosterEmptyState: document.querySelector("#rosterEmptyState"),
  arenaHeadline: document.querySelector("#arenaHeadline"),
  arenaMeta: document.querySelector("#arenaMeta"),
  arenaStatus: document.querySelector("#arenaStatus"),
  aliveCount: document.querySelector("#aliveCount"),
  koCount: document.querySelector("#koCount"),
  intensityFill: document.querySelector("#intensityFill"),
  intensityValue: document.querySelector("#intensityValue"),
  eventLog: document.querySelector("#eventLog"),
  championEmptyState: document.querySelector("#championEmptyState"),
  championCard: document.querySelector("#championCard"),
  victoryOverlay: document.querySelector("#victoryOverlay"),
  victoryWinner: document.querySelector("#victoryWinner"),
  victoryAlias: document.querySelector("#victoryAlias"),
  victoryTagline: document.querySelector("#victoryTagline"),
  speedSlider: document.querySelector("#speedSlider"),
  speedLabel: document.querySelector("#speedLabel"),
  battleCanvas: document.querySelector("#battleCanvas"),
  killFeed: null,
};

// ── STATE ─────────────────────────────────────────────────

const state = {
  participants: normalizeParticipants(loadRoster()),
  champion: loadChampion(),
  welcome: "",
  speed: "custom",
  speedMultiplier: 1.0,
  isRunning: false,
  fighters: [],
  particles: [],
  decals: [],
  killFeed: [],
  logs: [],
  sound: {
    enabled: true,
    context: null,
    master: null,
  },
  victory: {
    visible: false,
  },
  arena: {
    headline: "Octagon on standby",
    meta: "No fighters moving yet",
    status:
      "Waiting for names, noise, and a deeply questionable decision to press the button.",
    intensity: 0,
    aliveCount: 0,
    knockedOut: 0,
  },
  camera: {
    zoom: 1,
    targetZoom: 1,
    offsetX: 0,
    offsetY: 0,
    targetOffsetX: 0,
    targetOffsetY: 0,
    slowMo: 0,
    flashAlpha: 0,
    traumaShake: 0,
  },
  battle: {
    rafId: 0,
    lastFrame: 0,
    lastLogAt: 0,
    lastAmbientAt: 0,
    lastFireworkAt: 0,
    finishedAt: 0,
    lastDustAt: 0,
  },
  pixi: {
    app: null,
    camera: null,
    bgLayer: null,
    arenaLayer: null,
    decalLayer: null,
    underParticleGfx: null,
    fighterLayer: null,
    overParticleGfx: null,
    glowGfx: null,
    flashGfx: null,
    vignetteGfx: null,
    idleText: null,
    idleSubText: null,
    spotlights: [],
    octagonBorderGfx: null,
    arenaTextGfx: null,
  },
  physics: {
    engine: null,
    walls: [],
  },
};

// ── HELPERS ───────────────────────────────────────────────

function hexToNum(hex) {
  return parseInt(hex.replace("#", ""), 16);
}

function lerpColor(a, b, t) {
  const ar = (a >> 16) & 0xff, ag = (a >> 8) & 0xff, ab = a & 0xff;
  const br = (b >> 16) & 0xff, bg = (b >> 8) & 0xff, bb = b & 0xff;
  const rr = ar + (br - ar) * t, rg = ag + (bg - ag) * t, rb = ab + (bb - ab) * t;
  return (Math.round(rr) << 16) | (Math.round(rg) << 8) | Math.round(rb);
}

function cssColorToNum(color) {
  if (typeof color === "number") return color;
  if (typeof color !== "string") return 0xffffff;
  if (color.startsWith("#")) return hexToNum(color);
  // Handle rgba/rgb - just return white for transparency-based colors
  const m = color.match(/rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)/);
  if (m) return (parseInt(m[1]) << 16) | (parseInt(m[2]) << 8) | parseInt(m[3]);
  return 0xffffff;
}

function cssAlpha(color) {
  if (typeof color !== "string") return 1;
  const m = color.match(/rgba?\([^)]*,\s*([\d.]+)\s*\)/);
  return m ? parseFloat(m[1]) : 1;
}

// ── PIXI + MATTER SETUP ──────────────────────────────────

function createOctagonWalls() {
  const WALL_R = 220;
  const WALL_THICKNESS = 30;
  const walls = [];

  for (let i = 0; i < 8; i++) {
    const a1 = Math.PI / 8 + (Math.PI * 2 * i) / 8;
    const a2 = Math.PI / 8 + (Math.PI * 2 * (i + 1)) / 8;
    const x1 = CENTER_X + Math.cos(a1) * WALL_R;
    const y1 = CENTER_Y + Math.sin(a1) * WALL_R;
    const x2 = CENTER_X + Math.cos(a2) * WALL_R;
    const y2 = CENTER_Y + Math.sin(a2) * WALL_R;
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const len = Math.hypot(x2 - x1, y2 - y1);
    const angle = Math.atan2(y2 - y1, x2 - x1);

    const wall = Matter.Bodies.rectangle(mx, my, len + 4, WALL_THICKNESS, {
      isStatic: true,
      angle,
      restitution: 0.5,
      friction: 0.1,
      label: "wall",
    });
    walls.push(wall);
  }

  Matter.Composite.add(state.physics.engine.world, walls);
  state.physics.walls = walls;
}

function drawBackground() {
  const layer = state.pixi.bgLayer;
  const isoCenterY = isoY(CENTER_Y);

  // Overcast grey-purple twilight sky
  const bg = new PIXI.Graphics();
  bg.beginFill(0x4a3a5a, 1);
  bg.drawRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  bg.endFill();
  // Sky gradient bands
  bg.beginFill(0x5a4a6a, 0.5);
  bg.drawRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT * 0.25);
  bg.endFill();
  bg.beginFill(0x3a2a4a, 0.4);
  bg.drawRect(0, WORLD_HEIGHT * 0.25, WORLD_WIDTH, WORLD_HEIGHT * 0.15);
  bg.endFill();

  // Ground plane - grey-brown dirt/asphalt
  bg.beginFill(0x2a2620, 1);
  bg.drawRect(0, WORLD_HEIGHT * 0.32, WORLD_WIDTH, WORLD_HEIGHT * 0.68);
  bg.endFill();
  bg.beginFill(0x32302a, 0.5);
  bg.drawRect(0, WORLD_HEIGHT * 0.32, WORLD_WIDTH, WORLD_HEIGHT * 0.12);
  bg.endFill();

  layer.addChild(bg);

  // Soviet apartment buildings (khrushchyovkas) in background
  const buildings = new PIXI.Graphics();
  const buildingData = [
    { x: 40, w: 220, h: 140, color: 0x3a3a42 },
    { x: 380, w: 260, h: 160, color: 0x2e2e36 },
    { x: 740, w: 230, h: 130, color: 0x363640 },
  ];

  for (const b of buildingData) {
    const topY = WORLD_HEIGHT * 0.32 - b.h;
    // Building body
    buildings.beginFill(b.color, 0.95);
    buildings.drawRect(b.x, topY, b.w, b.h + 10);
    buildings.endFill();
    // Roof line
    buildings.lineStyle(2, 0x2a2a32, 0.8);
    buildings.moveTo(b.x, topY);
    buildings.lineTo(b.x + b.w, topY);
    buildings.lineStyle(0);
    // Building edge shadow
    buildings.beginFill(0x222228, 0.6);
    buildings.drawRect(b.x + b.w - 8, topY, 8, b.h + 10);
    buildings.endFill();

    // Windows - rows of small lit/dark rectangles
    const winW = 8, winH = 10, winGapX = 18, winGapY = 22;
    const winStartX = b.x + 12, winStartY = topY + 14;
    const cols = Math.floor((b.w - 24) / winGapX);
    const rows = Math.floor((b.h - 20) / winGapY);
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const wx = winStartX + col * winGapX;
        const wy = winStartY + row * winGapY;
        const lit = Math.random() > 0.45;
        if (lit) {
          buildings.beginFill(0xddaa44, 0.4 + Math.random() * 0.3);
        } else {
          buildings.beginFill(0x1a1a20, 0.7);
        }
        buildings.drawRect(wx, wy, winW, winH);
        buildings.endFill();
      }
    }
  }
  layer.addChild(buildings);

  // Bare/sparse trees
  const trees = new PIXI.Graphics();
  const treePositions = [
    { x: 320, y: WORLD_HEIGHT * 0.34 },
    { x: 720, y: WORLD_HEIGHT * 0.36 },
  ];
  for (const t of treePositions) {
    // Trunk
    trees.beginFill(0x3a3020, 0.8);
    trees.drawRect(t.x - 3, t.y - 60, 6, 60);
    trees.endFill();
    // Bare branches
    trees.lineStyle(2, 0x3a3020, 0.6);
    trees.moveTo(t.x, t.y - 40); trees.lineTo(t.x - 18, t.y - 65);
    trees.moveTo(t.x, t.y - 45); trees.lineTo(t.x + 20, t.y - 70);
    trees.moveTo(t.x, t.y - 55); trees.lineTo(t.x - 12, t.y - 78);
    trees.moveTo(t.x + 20, t.y - 70); trees.lineTo(t.x + 30, t.y - 80);
    trees.moveTo(t.x - 18, t.y - 65); trees.lineTo(t.x - 28, t.y - 78);
    trees.lineStyle(0);
  }
  layer.addChild(trees);

  // Parked cars (simple boxy shapes)
  const cars = new PIXI.Graphics();
  const carData = [
    { x: 80, y: WORLD_HEIGHT * 0.42, color: 0x4a2020, w: 50, h: 22 },
    { x: 870, y: WORLD_HEIGHT * 0.50, color: 0x2a3a2a, w: 55, h: 24 },
    { x: 900, y: WORLD_HEIGHT - 80, color: 0x3a3040, w: 48, h: 20 },
  ];
  for (const c of carData) {
    // Car body
    cars.beginFill(c.color, 0.8);
    cars.drawRect(c.x, c.y, c.w, c.h);
    cars.endFill();
    // Car roof (smaller rectangle on top)
    cars.beginFill(c.color, 0.6);
    cars.drawRect(c.x + c.w * 0.2, c.y - c.h * 0.5, c.w * 0.55, c.h * 0.55);
    cars.endFill();
    // Wheels
    cars.beginFill(0x111111, 0.8);
    cars.drawCircle(c.x + 10, c.y + c.h, 5);
    cars.drawCircle(c.x + c.w - 10, c.y + c.h, 5);
    cars.endFill();
  }
  layer.addChild(cars);

  // Bench and dumpster
  const props = new PIXI.Graphics();
  // Bench
  props.beginFill(0x5a4a30, 0.7);
  props.drawRect(140, WORLD_HEIGHT * 0.48, 40, 8);
  props.endFill();
  props.beginFill(0x4a3a20, 0.7);
  props.drawRect(144, WORLD_HEIGHT * 0.48 + 8, 4, 10);
  props.drawRect(172, WORLD_HEIGHT * 0.48 + 8, 4, 10);
  props.endFill();
  // Dumpster
  props.beginFill(0x2a4a2a, 0.7);
  props.drawRect(820, WORLD_HEIGHT * 0.38, 35, 25);
  props.endFill();
  props.beginFill(0x1a3a1a, 0.6);
  props.drawRect(818, WORLD_HEIGHT * 0.38 - 3, 39, 5);
  props.endFill();
  layer.addChild(props);

  // Streetlights (dim yellow) - replacing spotlights
  const streetlightData = [
    { x: WORLD_WIDTH * 0.15, baseAlpha: 0.05, freq: 0.4 },
    { x: WORLD_WIDTH * 0.5, baseAlpha: 0.06, freq: 0.3 },
    { x: WORLD_WIDTH * 0.85, baseAlpha: 0.05, freq: 0.5 },
  ];

  state.pixi.spotlights = [];

  for (const spot of streetlightData) {
    const poleY = WORLD_HEIGHT * 0.32;
    const sg = new PIXI.Graphics();
    // Lamp pole
    sg.beginFill(0x555555, 0.6);
    sg.drawRect(spot.x - 2, poleY - 110, 4, 110);
    sg.endFill();
    // Lamp arm
    sg.beginFill(0x555555, 0.6);
    sg.drawRect(spot.x - 12, poleY - 112, 24, 4);
    sg.endFill();
    // Lamp bulb
    sg.beginFill(0xccaa55, 0.7);
    sg.drawCircle(spot.x, poleY - 115, 5);
    sg.endFill();
    // Light cone (dim yellow, downward)
    sg.beginFill(0xccaa55, spot.baseAlpha);
    sg.moveTo(spot.x - 8, poleY - 108);
    sg.lineTo(spot.x + 8, poleY - 108);
    sg.lineTo(spot.x + 80, poleY + 200);
    sg.lineTo(spot.x - 80, poleY + 200);
    sg.closePath();
    sg.endFill();
    layer.addChild(sg);
    state.pixi.spotlights.push({ gfx: sg, baseAlpha: spot.baseAlpha, freq: spot.freq });
  }

  // Scattered gopnik spectators around the edges
  const crowd = new PIXI.Graphics();

  // Helper: draw standing person silhouette
  function drawStanding(gfx, cx, cy, alpha) {
    gfx.beginFill(0x1a1a1e, alpha);
    gfx.drawCircle(cx, cy - 22, 6); // head
    gfx.drawRect(cx - 5, cy - 16, 10, 20); // body
    gfx.drawRect(cx - 6, cy + 4, 5, 14); // left leg
    gfx.drawRect(cx + 1, cy + 4, 5, 14); // right leg
    gfx.endFill();
  }

  // Helper: draw squatting gopnik (slavic squat)
  function drawSquatting(gfx, cx, cy, alpha) {
    gfx.beginFill(0x1a1a1e, alpha);
    gfx.drawCircle(cx, cy - 10, 5); // head
    gfx.drawRect(cx - 5, cy - 5, 10, 10); // torso (compressed)
    // Squatting legs (wider, bent)
    gfx.drawRect(cx - 9, cy + 5, 7, 5);
    gfx.drawRect(cx + 2, cy + 5, 7, 5);
    // Arms on knees
    gfx.drawRect(cx - 10, cy - 2, 6, 3);
    gfx.drawRect(cx + 4, cy - 2, 6, 3);
    gfx.endFill();
  }

  // Helper: draw person holding phone
  function drawWithPhone(gfx, cx, cy, alpha) {
    gfx.beginFill(0x1a1a1e, alpha);
    gfx.drawCircle(cx, cy - 22, 6);
    gfx.drawRect(cx - 5, cy - 16, 10, 20);
    gfx.drawRect(cx - 6, cy + 4, 5, 14);
    gfx.drawRect(cx + 1, cy + 4, 5, 14);
    gfx.endFill();
    // Arm raised with phone
    gfx.beginFill(0x1a1a1e, alpha);
    gfx.drawRect(cx + 5, cy - 18, 3, 12);
    gfx.endFill();
    // Phone glow
    gfx.beginFill(0x88aacc, alpha * 0.6);
    gfx.drawRect(cx + 5, cy - 21, 4, 5);
    gfx.endFill();
  }

  // Back crowd (behind arena, spaced out)
  const backSpectators = [
    { x: 160, type: 'stand' }, { x: 210, type: 'squat' }, { x: 280, type: 'stand' },
    { x: 350, type: 'phone' }, { x: 440, type: 'stand' }, { x: 520, type: 'squat' },
    { x: 590, type: 'stand' }, { x: 660, type: 'phone' }, { x: 740, type: 'stand' },
    { x: 810, type: 'squat' }, { x: 870, type: 'stand' },
  ];
  for (const s of backSpectators) {
    const cy = WORLD_HEIGHT * 0.34 + Math.random() * 15;
    if (s.type === 'squat') drawSquatting(crowd, s.x, cy + 10, 0.5);
    else if (s.type === 'phone') drawWithPhone(crowd, s.x, cy, 0.45);
    else drawStanding(crowd, s.x, cy, 0.45);
  }

  // Side spectators
  const sideSpectators = [
    { x: 60, y: WORLD_HEIGHT * 0.52, type: 'squat' },
    { x: 75, y: WORLD_HEIGHT * 0.62, type: 'stand' },
    { x: 55, y: WORLD_HEIGHT * 0.72, type: 'phone' },
    { x: 940, y: WORLD_HEIGHT * 0.50, type: 'stand' },
    { x: 950, y: WORLD_HEIGHT * 0.60, type: 'squat' },
    { x: 935, y: WORLD_HEIGHT * 0.72, type: 'stand' },
  ];
  for (const s of sideSpectators) {
    if (s.type === 'squat') drawSquatting(crowd, s.x, s.y, 0.4);
    else if (s.type === 'phone') drawWithPhone(crowd, s.x, s.y, 0.4);
    else drawStanding(crowd, s.x, s.y, 0.4);
  }

  // Front spectators (below arena)
  const frontSpectators = [
    { x: 200, type: 'stand' }, { x: 300, type: 'squat' }, { x: 420, type: 'phone' },
    { x: 550, type: 'stand' }, { x: 650, type: 'squat' }, { x: 770, type: 'stand' },
    { x: 860, type: 'phone' },
  ];
  for (const s of frontSpectators) {
    const cy = WORLD_HEIGHT - 40 + Math.random() * 10;
    if (s.type === 'squat') drawSquatting(crowd, s.x, cy, 0.35);
    else if (s.type === 'phone') drawWithPhone(crowd, s.x, cy, 0.35);
    else drawStanding(crowd, s.x, cy, 0.35);
  }

  layer.addChild(crowd);

  // Ground haze / dust at floor level
  const fog = new PIXI.Graphics();
  fog.beginFill(0x2a2620, 0.06);
  fog.drawEllipse(CENTER_X, isoCenterY + 40, 380, 60);
  fog.endFill();
  fog.beginFill(0x1a1810, 0.04);
  fog.drawEllipse(CENTER_X - 80, isoCenterY + 55, 280, 40);
  fog.endFill();
  fog.beginFill(0x1a1810, 0.04);
  fog.drawEllipse(CENTER_X + 100, isoCenterY + 50, 260, 35);
  fog.endFill();
  layer.addChild(fog);
}

function drawOctagon() {
  const layer = state.pixi.arenaLayer;
  const isoCY = isoY(CENTER_Y);

  // Court dimensions (rectangular, isometric)
  const courtHalfW = 230;
  const courtHalfH = 230;
  const courtCorners = [
    { x: CENTER_X - courtHalfW, y: isoCY - courtHalfH * ISO_SCALE },
    { x: CENTER_X + courtHalfW, y: isoCY - courtHalfH * ISO_SCALE },
    { x: CENTER_X + courtHalfW, y: isoCY + courtHalfH * ISO_SCALE },
    { x: CENTER_X - courtHalfW, y: isoCY + courtHalfH * ISO_SCALE },
  ];

  // Border rectangle (slightly larger for outer edge)
  const outerPad = 16;
  const outerCorners = [
    { x: CENTER_X - courtHalfW - outerPad, y: isoCY - (courtHalfH + outerPad) * ISO_SCALE },
    { x: CENTER_X + courtHalfW + outerPad, y: isoCY - (courtHalfH + outerPad) * ISO_SCALE },
    { x: CENTER_X + courtHalfW + outerPad, y: isoCY + (courtHalfH + outerPad) * ISO_SCALE },
    { x: CENTER_X - courtHalfW - outerPad, y: isoCY + (courtHalfH + outerPad) * ISO_SCALE },
  ];

  const g = new PIXI.Graphics();

  // Outer dirt/gravel border
  g.beginFill(0x323236, 0.95);
  g.lineStyle(0);
  g.drawPolygon(outerCorners.flatMap((p) => [p.x, p.y]));
  g.endFill();

  // Main court surface - cracked asphalt
  g.beginFill(0x2a2a2e, 0.98);
  g.drawPolygon(courtCorners.flatMap((p) => [p.x, p.y]));
  g.endFill();

  // Asphalt patches (slightly different shade)
  const patches = [
    { x: CENTER_X - 60, y: isoCY + 30, w: 80, h: 40 },
    { x: CENTER_X + 40, y: isoCY - 50, w: 60, h: 35 },
    { x: CENTER_X - 100, y: isoCY - 20, w: 50, h: 50 },
  ];
  for (const p of patches) {
    g.beginFill(0x2e2e34, 0.4);
    g.drawEllipse(p.x, p.y, p.w, p.h * ISO_SCALE);
    g.endFill();
  }

  // Cracks in the asphalt
  g.lineStyle(1, 0x1a1a1e, 0.3);
  // Crack 1 - long diagonal
  g.moveTo(CENTER_X - 120, isoCY - 40 * ISO_SCALE);
  g.lineTo(CENTER_X - 80, isoCY + 10 * ISO_SCALE);
  g.lineTo(CENTER_X - 60, isoCY + 50 * ISO_SCALE);
  g.lineTo(CENTER_X - 30, isoCY + 80 * ISO_SCALE);
  // Crack 2
  g.moveTo(CENTER_X + 50, isoCY - 70 * ISO_SCALE);
  g.lineTo(CENTER_X + 70, isoCY - 20 * ISO_SCALE);
  g.lineTo(CENTER_X + 90, isoCY + 30 * ISO_SCALE);
  // Crack 3 - branching
  g.moveTo(CENTER_X - 20, isoCY - 90 * ISO_SCALE);
  g.lineTo(CENTER_X + 10, isoCY - 30 * ISO_SCALE);
  g.lineTo(CENTER_X + 5, isoCY + 20 * ISO_SCALE);
  // Branch
  g.moveTo(CENTER_X + 10, isoCY - 30 * ISO_SCALE);
  g.lineTo(CENTER_X + 50, isoCY - 10 * ISO_SCALE);
  // Crack 4
  g.lineStyle(0.7, 0x1a1a1e, 0.2);
  g.moveTo(CENTER_X + 100, isoCY + 10 * ISO_SCALE);
  g.lineTo(CENTER_X + 130, isoCY + 60 * ISO_SCALE);
  g.moveTo(CENTER_X - 150, isoCY + 30 * ISO_SCALE);
  g.lineTo(CENTER_X - 120, isoCY + 70 * ISO_SCALE);
  g.lineTo(CENTER_X - 90, isoCY + 100 * ISO_SCALE);
  g.lineStyle(0);

  // Faded basketball court markings
  // Center circle
  g.lineStyle(2, 0xffffff, 0.06);
  g.drawEllipse(CENTER_X, isoCY, 50, 50 * ISO_SCALE);
  // Half court line
  g.moveTo(CENTER_X - courtHalfW + 10, isoCY);
  g.lineTo(CENTER_X + courtHalfW - 10, isoCY);
  // Free throw circles
  g.drawEllipse(CENTER_X, isoCY - 140 * ISO_SCALE, 40, 40 * ISO_SCALE);
  g.drawEllipse(CENTER_X, isoCY + 140 * ISO_SCALE, 40, 40 * ISO_SCALE);
  // Key/lane lines
  g.moveTo(CENTER_X - 30, isoCY - courtHalfH * ISO_SCALE + 5);
  g.lineTo(CENTER_X - 30, isoCY - 100 * ISO_SCALE);
  g.moveTo(CENTER_X + 30, isoCY - courtHalfH * ISO_SCALE + 5);
  g.lineTo(CENTER_X + 30, isoCY - 100 * ISO_SCALE);
  g.moveTo(CENTER_X - 30, isoCY + courtHalfH * ISO_SCALE - 5);
  g.lineTo(CENTER_X - 30, isoCY + 100 * ISO_SCALE);
  g.moveTo(CENTER_X + 30, isoCY + courtHalfH * ISO_SCALE - 5);
  g.lineTo(CENTER_X + 30, isoCY + 100 * ISO_SCALE);
  // Three point arcs (partial)
  g.lineStyle(1.5, 0xffffcc, 0.04);
  for (let a = -1.2; a <= 1.2; a += 0.15) {
    const r = 80;
    g.moveTo(CENTER_X + Math.cos(a) * r, isoCY - 140 * ISO_SCALE + Math.sin(a) * r * ISO_SCALE);
    g.lineTo(CENTER_X + Math.cos(a + 0.15) * r, isoCY - 140 * ISO_SCALE + Math.sin(a + 0.15) * r * ISO_SCALE);
  }
  for (let a = Math.PI - 1.2; a <= Math.PI + 1.2; a += 0.15) {
    const r = 80;
    g.moveTo(CENTER_X + Math.cos(a) * r, isoCY + 140 * ISO_SCALE + Math.sin(a) * r * ISO_SCALE);
    g.lineTo(CENTER_X + Math.cos(a + 0.15) * r, isoCY + 140 * ISO_SCALE + Math.sin(a + 0.15) * r * ISO_SCALE);
  }
  g.lineStyle(0);

  // Puddles (dark reflective ellipses)
  const puddles = [
    { x: CENTER_X - 90, y: isoCY + 40, rx: 25, ry: 12 },
    { x: CENTER_X + 110, y: isoCY - 30, rx: 20, ry: 10 },
    { x: CENTER_X + 30, y: isoCY + 80, rx: 18, ry: 8 },
  ];
  for (const p of puddles) {
    g.beginFill(0x1a1a2e, 0.3);
    g.drawEllipse(p.x, p.y, p.rx, p.ry * ISO_SCALE);
    g.endFill();
    // Slight highlight on puddle edge
    g.beginFill(0x3a3a5e, 0.1);
    g.drawEllipse(p.x + 3, p.y - 2, p.rx * 0.6, p.ry * 0.4 * ISO_SCALE);
    g.endFill();
  }

  // Graffiti color splotches on ground
  const graffiti = [
    { x: CENTER_X - 70, y: isoCY - 50, color: 0xcc3333, r: 12 },
    { x: CENTER_X + 80, y: isoCY + 20, color: 0x3366cc, r: 10 },
    { x: CENTER_X + 20, y: isoCY - 80, color: 0x33aa33, r: 8 },
  ];
  for (const s of graffiti) {
    g.beginFill(s.color, 0.08);
    g.drawEllipse(s.x, s.y, s.r, s.r * ISO_SCALE * 0.7);
    g.endFill();
  }

  // Trash on the ground (small colored rectangles)
  const trash = [
    { x: CENTER_X - 140, y: isoCY + 60, color: 0xcc4444, w: 5, h: 3 },
    { x: CENTER_X + 160, y: isoCY - 20, color: 0x44aa44, w: 4, h: 6 },
    { x: CENTER_X - 50, y: isoCY + 100, color: 0xcccccc, w: 6, h: 4 },
    { x: CENTER_X + 90, y: isoCY + 70, color: 0x886622, w: 3, h: 8 },
    { x: CENTER_X - 110, y: isoCY - 60, color: 0x4444cc, w: 5, h: 5 },
    { x: CENTER_X + 30, y: isoCY - 40, color: 0xaaaa44, w: 4, h: 3 },
  ];
  for (const t of trash) {
    g.beginFill(t.color, 0.25);
    g.drawRect(t.x, t.y, t.w, t.h);
    g.endFill();
  }

  layer.addChild(g);

  // Chain-link fence and fence posts
  const fenceHeight = 30;
  const pillarPositions = [];
  const pillarContainer = new PIXI.Container();
  const pillarHeight = fenceHeight;

  // Fence post positions - corners and midpoints of the rectangular court
  const fencePostPositions = [];
  for (let i = 0; i < 4; i++) {
    const c1 = courtCorners[i];
    const c2 = courtCorners[(i + 1) % 4];
    fencePostPositions.push(c1);
    fencePostPositions.push({ x: (c1.x + c2.x) / 2, y: (c1.y + c2.y) / 2 });
  }

  for (let index = 0; index < fencePostPositions.length; index++) {
    const fp = fencePostPositions[index];
    const px = fp.x;
    const py = fp.y;
    pillarPositions.push({ x: px, y: py, angle: (Math.PI * 2 * index) / fencePostPositions.length });

    const pg = new PIXI.Graphics();
    // Post shadow
    pg.beginFill(0x000000, 0.2);
    pg.drawEllipse(px, py + 3, 4, 2);
    pg.endFill();
    // Metal post body
    const postW = 6;
    pg.beginFill(0x666666, 0.9);
    pg.drawRect(px - postW / 2, py - fenceHeight, postW, fenceHeight);
    pg.endFill();
    // Rust patches
    if (index % 3 === 0) {
      pg.beginFill(0x8b4513, 0.4);
      pg.drawRect(px - 2, py - fenceHeight * 0.6, 4, 8);
      pg.endFill();
    }
    // Post cap
    pg.beginFill(0x777777, 0.9);
    pg.drawRect(px - postW / 2 - 1, py - fenceHeight - 2, postW + 2, 3);
    pg.endFill();

    pillarContainer.addChild(pg);
  }

  // Chain-link fence between posts (diamond pattern)
  const fenceGfx = new PIXI.Graphics();
  for (let i = 0; i < 4; i++) {
    const c1 = courtCorners[i];
    const c2 = courtCorners[(i + 1) % 4];

    // Draw chain-link diamond pattern between each pair of corners
    const segLen = Math.sqrt((c2.x - c1.x) ** 2 + (c2.y - c1.y) ** 2);
    const diamonds = Math.floor(segLen / 10);
    const dx = (c2.x - c1.x) / diamonds;
    const dy = (c2.y - c1.y) / diamonds;

    fenceGfx.lineStyle(0.6, 0x888888, 0.3);
    for (let d = 0; d < diamonds; d++) {
      const bx = c1.x + dx * d;
      const by = c1.y + dy * d;
      // Diamond shapes going up the fence
      for (let h = 0; h < 3; h++) {
        const hOff = -fenceHeight + h * 10;
        fenceGfx.moveTo(bx + dx * 0.5, by + dy * 0.5 + hOff);
        fenceGfx.lineTo(bx + dx, by + dy + hOff - 5);
        fenceGfx.moveTo(bx + dx * 0.5, by + dy * 0.5 + hOff);
        fenceGfx.lineTo(bx, by + hOff - 5);
      }
    }

    // Top rail
    fenceGfx.lineStyle(1.5, 0x777777, 0.5);
    fenceGfx.moveTo(c1.x, c1.y - fenceHeight);
    fenceGfx.lineTo(c2.x, c2.y - fenceHeight);
    // Bottom rail
    fenceGfx.lineStyle(1.2, 0x666666, 0.4);
    fenceGfx.moveTo(c1.x, c1.y);
    fenceGfx.lineTo(c2.x, c2.y);
  }
  fenceGfx.lineStyle(0);
  pillarContainer.addChild(fenceGfx);

  // Basketball hoop (bent/rusty) on one side
  const hoopGfx = new PIXI.Graphics();
  const backboardX = CENTER_X;
  const backboardY = isoCY - courtHalfH * ISO_SCALE + 5;
  // Pole
  hoopGfx.beginFill(0x6b3410, 0.8);
  hoopGfx.drawRect(backboardX - 3, backboardY - 50, 6, 50);
  hoopGfx.endFill();
  // Backboard
  hoopGfx.beginFill(0x555555, 0.7);
  hoopGfx.drawRect(backboardX - 22, backboardY - 55, 44, 30);
  hoopGfx.endFill();
  hoopGfx.lineStyle(1.5, 0x444444, 0.6);
  hoopGfx.drawRect(backboardX - 22, backboardY - 55, 44, 30);
  // Hoop ring (slightly bent)
  hoopGfx.lineStyle(2, 0x8b4513, 0.7);
  hoopGfx.drawEllipse(backboardX + 2, backboardY - 22, 12, 5 * ISO_SCALE);
  // Remnants of net (a few dangling lines)
  hoopGfx.lineStyle(0.8, 0xaaaaaa, 0.25);
  for (let n = -8; n <= 8; n += 4) {
    hoopGfx.moveTo(backboardX + 2 + n, backboardY - 20);
    hoopGfx.lineTo(backboardX + 2 + n * 0.7, backboardY - 10);
  }
  hoopGfx.lineStyle(0);
  pillarContainer.addChild(hoopGfx);

  layer.addChild(pillarContainer);

  // Store pillar positions for streetlight animation
  state.pixi.pillars = pillarPositions;
  state.pixi.pillarHeight = pillarHeight;
  // Initialize streetlight glow state (repurposed from torches)
  state.pixi.torches = pillarPositions.filter((_, i) => i % 2 === 0).map((p, i) => ({
    x: p.x,
    y: p.y - pillarHeight - 4,
    phase: i * 1.2,
    flicker: 0
  }));

  // Streetlight glow on floor (cold yellow)
  const torchGlowGfx = new PIXI.Graphics();
  layer.addChild(torchGlowGfx);
  state.pixi.torchGlowGfx = torchGlowGfx;

  // Streetlight flicker graphics (updated each frame)
  const torchFlameGfx = new PIXI.Graphics();
  layer.addChild(torchFlameGfx);
  state.pixi.torchFlameGfx = torchFlameGfx;

  // "DWARF FIGHTS" graffiti text in center
  const textGfx = new PIXI.Text("DWARF FIGHTS", {
    fontFamily: "Impact, Arial Black",
    fontSize: 52,
    fontWeight: "900",
    fill: 0xdddddd,
    align: "center",
    letterSpacing: 4,
  });
  textGfx.anchor.set(0.5);
  textGfx.position.set(CENTER_X, isoCY + 6);
  textGfx.rotation = -0.08;
  textGfx.alpha = 0.06;
  textGfx.scale.set(1, ISO_SCALE);

  layer.addChild(textGfx);

  // Pulsing border (separate graphics updated each frame) - uses court rectangle
  const borderGfx = new PIXI.Graphics();
  layer.addChild(borderGfx);
  state.pixi.octagonBorderGfx = borderGfx;
  // Store court rectangle polygon for reuse (replaces middle octagon)
  state.pixi._middlePoly = courtCorners;
}

function drawVignette() {
  const g = state.pixi.vignetteGfx;
  g.clear();
  // Gritty dark vignette for post-Soviet courtyard atmosphere
  // Heavy edge darkening
  const edgeAlpha = 0.5;
  g.beginFill(0x0a0a0e, edgeAlpha);
  g.drawRect(0, 0, 100, WORLD_HEIGHT);
  g.endFill();
  g.beginFill(0x0a0a0e, edgeAlpha);
  g.drawRect(WORLD_WIDTH - 100, 0, 100, WORLD_HEIGHT);
  g.endFill();
  g.beginFill(0x0a0a0e, edgeAlpha * 0.9);
  g.drawRect(0, 0, WORLD_WIDTH, 70);
  g.endFill();
  g.beginFill(0x0a0a0e, edgeAlpha * 0.9);
  g.drawRect(0, WORLD_HEIGHT - 70, WORLD_WIDTH, 70);
  g.endFill();
  // Softer inner edges
  g.beginFill(0x0a0a0e, edgeAlpha * 0.5);
  g.drawRect(100, 0, 70, WORLD_HEIGHT);
  g.endFill();
  g.beginFill(0x0a0a0e, edgeAlpha * 0.5);
  g.drawRect(WORLD_WIDTH - 170, 0, 70, WORLD_HEIGHT);
  g.endFill();
  g.beginFill(0x0a0a0e, edgeAlpha * 0.35);
  g.drawRect(170, 0, 50, WORLD_HEIGHT);
  g.endFill();
  g.beginFill(0x0a0a0e, edgeAlpha * 0.35);
  g.drawRect(WORLD_WIDTH - 220, 0, 50, WORLD_HEIGHT);
  g.endFill();
}

function handleResize() {
  if (!state.pixi.app) return;
  const canvas = dom.battleCanvas;
  const parent = canvas.parentElement;
  if (!parent) return;
  const rect = parent.getBoundingClientRect();
  state.pixi.app.renderer.resize(rect.width, rect.height);
  // Scale stage to maintain WORLD_WIDTH x WORLD_HEIGHT logical size
  const scaleX = rect.width / WORLD_WIDTH;
  const scaleY = rect.height / WORLD_HEIGHT;
  state.pixi.app.stage.scale.set(scaleX, scaleY);
}

// ── INIT ──────────────────────────────────────────────────

async function init() {
  state.welcome = pick(WELCOME_MESSAGES);
  saveRoster();
  createKillFeedElement();
  bindEvents();

  // Initialize PixiJS
  const app = new PIXI.Application({
    view: dom.battleCanvas,
    width: WORLD_WIDTH,
    height: WORLD_HEIGHT,
    backgroundColor: 0x0a0608,
    antialias: true,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
    autoDensity: true,
    preserveDrawingBuffer: true,
  });
  state.pixi.app = app;

  // Load dwarf sprite textures (use embedded base64 if available, else file paths)
  state.pixi.spriteTextures = {};
  for (let i = 1; i <= 10; i++) {
    if (typeof SPRITE_DATA !== 'undefined' && SPRITE_DATA[i - 1]) {
      state.pixi.spriteTextures[i] = PIXI.Texture.from(SPRITE_DATA[i - 1]);
    } else {
      state.pixi.spriteTextures[i] = PIXI.Texture.from(`./assets/dwarf-sprite-${i}.png`);
    }
  }

  // Create layer hierarchy
  const camera = new PIXI.Container();
  state.pixi.camera = camera;
  app.stage.addChild(camera);

  // Create all layers
  state.pixi.bgLayer = new PIXI.Container();
  state.pixi.arenaLayer = new PIXI.Container();
  state.pixi.decalLayer = new PIXI.Container();
  state.pixi.underParticleGfx = new PIXI.Graphics();
  state.pixi.fighterLayer = new PIXI.Container();
  state.pixi.overParticleGfx = new PIXI.Graphics();
  state.pixi.glowGfx = new PIXI.Graphics();

  camera.addChild(
    state.pixi.bgLayer,
    state.pixi.arenaLayer,
    state.pixi.decalLayer,
    state.pixi.underParticleGfx,
    state.pixi.fighterLayer,
    state.pixi.overParticleGfx,
    state.pixi.glowGfx,
  );

  // Flash overlay (outside camera)
  state.pixi.flashGfx = new PIXI.Graphics();
  app.stage.addChild(state.pixi.flashGfx);

  // Vignette (outside camera)
  state.pixi.vignetteGfx = new PIXI.Graphics();
  app.stage.addChild(state.pixi.vignetteGfx);
  drawVignette();

  // Idle text
  state.pixi.idleText = new PIXI.Text("READY FOR AN OCTAGON RIOT", {
    fontFamily: "Arial Black",
    fontSize: 42,
    fontWeight: "900",
    fill: 0xffffff,
    align: "center",
  });
  state.pixi.idleText.anchor.set(0.5);
  state.pixi.idleText.position.set(CENTER_X, CENTER_Y - 28);
  state.pixi.idleText.alpha = 0.38;
  state.pixi.fighterLayer.addChild(state.pixi.idleText);

  state.pixi.idleSubText = new PIXI.Text("Add 2 to 50 names and let the tiny maniacs loose.", {
    fontFamily: "Trebuchet MS",
    fontSize: 20,
    fontWeight: "600",
    fill: 0xd7ccdb,
    align: "center",
  });
  state.pixi.idleSubText.anchor.set(0.5);
  state.pixi.idleSubText.position.set(CENTER_X, CENTER_Y + 16);
  state.pixi.idleSubText.alpha = 0.78;
  state.pixi.fighterLayer.addChild(state.pixi.idleSubText);

  // Draw static background and octagon
  drawBackground();
  drawOctagon();

  // Initialize Matter.js
  const engine = Matter.Engine.create({ gravity: { x: 0, y: 0 } });
  state.physics.engine = engine;
  createOctagonWalls();

  // Set up wall collision events
  Matter.Events.on(engine, "collisionStart", (event) => {
    for (const pair of event.pairs) {
      const isWallA = pair.bodyA.label === "wall";
      const isWallB = pair.bodyB.label === "wall";
      if (!isWallA && !isWallB) continue;

      const fighterBody = isWallA ? pair.bodyB : pair.bodyA;
      const fighter = state.fighters.find((f) => f.body === fighterBody);
      if (!fighter) continue;

      const speed = Math.hypot(fighterBody.velocity.x, fighterBody.velocity.y);
      if (speed > 3) {
        spawnWallSparks(fighter.x, fighter.y);
        state.camera.traumaShake = Math.min(1, state.camera.traumaShake + speed / 25);
        if (speed > 6) playWallHitSound();
      }
    }
  });

  // Game loop - use RAF with fallback for background tabs
  let lastFrame = 0;
  function gameLoop(timestamp) {
    if (!lastFrame) lastFrame = timestamp;
    const dt = Math.min((timestamp - lastFrame) / 1000, 0.034);
    lastFrame = timestamp;
    const now = performance.now();
    updateBattle(dt, now);
    renderScene(now / 1000);
    app.renderer.render(app.stage);
    requestAnimationFrame(gameLoop);
  }
  app.ticker.stop(); // We drive rendering manually
  requestAnimationFrame(gameLoop);

  renderGreeting();
  renderRoster();
  renderChampion();
  renderArenaHud();
  renderControls();
  updateSoundButton();

  if (state.participants.length > 0) {
    resetIdleArena(`${state.participants.length} generated dwarfs are ready for the next riot.`);
  }
  appendLog({
    type: "round",
    title: "Arena online",
    body: "Generated art loaded. Static browser chaos ready.",
    meta: "Add names and start the riot.",
  });

  window.addEventListener("resize", handleResize);
  // Initial resize
  handleResize();
}

// ── KILL FEED ─────────────────────────────────────────────

function createKillFeedElement() {
  const el = document.createElement("div");
  el.id = "killFeed";
  el.style.cssText = `
    position: absolute; top: 12px; right: 12px; z-index: 20;
    display: flex; flex-direction: column; gap: 6px; align-items: flex-end;
    pointer-events: none; max-width: 320px;
  `;
  const stage = document.querySelector(".arena-stage");
  if (stage) {
    stage.style.position = "relative";
    stage.appendChild(el);
  }
  dom.killFeed = el;
}

function addKillFeedEntry(killer, victim) {
  if (!dom.killFeed) return;
  const verb = pick(KILL_FEED_VERBS);
  const entry = document.createElement("div");
  entry.style.cssText = `
    background: rgba(140, 15, 15, 0.88); color: #ffd4d4; padding: 5px 12px;
    border-radius: 6px; font: 700 12px "Trebuchet MS", sans-serif;
    border-left: 3px solid #ff3a2a; backdrop-filter: blur(4px);
    animation: killFeedSlide 0.3s ease-out;
    white-space: nowrap; text-shadow: 0 1px 2px rgba(0,0,0,0.5);
  `;
  entry.innerHTML = `<span style="color:#ff9080">${escapeHtml(killer)}</span> ${verb} <span style="color:#ffcfcf">${escapeHtml(victim)}</span>`;
  dom.killFeed.appendChild(entry);
  state.killFeed.push({ el: entry, time: performance.now() });

  // Clean old entries
  const now = performance.now();
  state.killFeed = state.killFeed.filter((item) => {
    if (now - item.time > 4000) {
      item.el.remove();
      return false;
    }
    return true;
  });
}

// ── EVENT BINDING ─────────────────────────────────────────

function bindEvents() {
  dom.refreshGreetingBtn.addEventListener("click", () => {
    if (state.isRunning) return;
    state.welcome = pick(WELCOME_MESSAGES, state.welcome);
    renderGreeting();
  });

  dom.addForm.addEventListener("submit", (event) => {
    event.preventDefault();
    addNames(dom.nameInput.value);
    dom.nameInput.value = "";
    dom.nameInput.focus();
  });

  // bulkAddBtn removed - textarea handles both single and bulk input

  dom.seedNamesBtn.addEventListener("click", () => {
    addNames(SAMPLE_NAMES.join(", "));
  });

  dom.rerollDwarfsBtn.addEventListener("click", () => {
    if (state.isRunning || state.participants.length === 0) return;
    state.participants = state.participants.map((participant) => ({
      ...participant,
      seed: createSeed(),
    }));
    PROFILE_CACHE.clear();
    saveRoster();
    renderRoster();
    renderChampion();
    resetIdleArena("The lineup changed. The octagon is waiting for a fresh riot.");
    appendLog({
      type: "item",
      title: "Dwarfs re-rolled",
      body: "The roster kept the same names but every beard, weapon, and title just got scrambled.",
      meta: "Fresh chaos minted.",
    });
  });

  dom.soundToggleBtn.addEventListener("click", async () => {
    state.sound.enabled = !state.sound.enabled;
    if (state.sound.enabled) {
      await ensureAudioReady();
      playBellSound(0.45);
    }
    updateSoundButton();
  });

  dom.clearNamesBtn.addEventListener("click", () => {
    if (state.isRunning) return;
    state.participants = [];
    state.fighters = [];
    state.particles = [];
    state.decals = [];
    PROFILE_CACHE.clear();
    saveRoster();
    renderRoster();
    renderControls();
    state.champion = null;
    saveChampion();
    renderChampion();
    hideVictoryOverlay();
    // Clear physics bodies
    clearFighterBodies();
    // Clear pixi fighter layer
    clearFighterLayer();
    updateArenaText(
      "Octagon on standby",
      "No fighters moving yet",
      "The roster is empty. Even the crowd got quiet for a second.",
    );
    state.arena.intensity = 0;
    renderArenaHud();
    appendLog({
      type: "item",
      title: "Roster cleared",
      body: "The room is empty, the lights are still on, and the octagon feels personally offended.",
      meta: "Nothing remains but floor dust.",
    });
  });

  dom.startTournamentBtn.addEventListener("click", () => {
    void startBattle();
  });

  dom.speedSlider.addEventListener("input", () => {
    state.speedMultiplier = parseFloat(dom.speedSlider.value);
    dom.speedLabel.textContent = state.speedMultiplier.toFixed(1) + "×";
  });

  dom.rosterList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-id]");
    if (!button || state.isRunning) return;
    removeParticipant(button.dataset.removeId);
  });
}

// ── BATTLE START ──────────────────────────────────────────

function clearFighterBodies() {
  if (!state.physics.engine) return;
  const world = state.physics.engine.world;
  const oldBodies = Matter.Composite.allBodies(world).filter((b) => b.label === "fighter");
  if (oldBodies.length > 0) {
    Matter.Composite.remove(world, oldBodies);
  }
}

function clearFighterLayer() {
  if (!state.pixi.fighterLayer) return;
  // Remove all children except idle texts
  const toRemove = [];
  for (let i = 0; i < state.pixi.fighterLayer.children.length; i++) {
    const child = state.pixi.fighterLayer.children[i];
    if (child !== state.pixi.idleText && child !== state.pixi.idleSubText) {
      toRemove.push(child);
    }
  }
  for (const child of toRemove) {
    state.pixi.fighterLayer.removeChild(child);
    if (child.destroy) child.destroy({ children: true });
  }
}

async function startBattle() {
  if (state.isRunning || state.participants.length < 2) return;

  await ensureAudioReady();
  const profiles = state.participants.map((participant) => getProfile(participant));
  state.isRunning = true;
  state.logs = [];
  state.particles = [];
  state.decals = [];
  state.killFeed.forEach((item) => item.el.remove());
  state.killFeed = [];

  // Clear PixiJS decal layer
  const decalGfx = state.pixi.decalLayer;
  while (decalGfx.children.length > 0) {
    decalGfx.removeChildAt(0);
  }

  state.fighters = createCombatants(profiles);
  state.welcome = pick(WELCOME_MESSAGES, state.welcome);
  state.champion = null;
  saveChampion();
  state.battle.lastLogAt = 0;
  state.battle.lastAmbientAt = 0;
  state.battle.lastFireworkAt = 0;
  state.battle.finishedAt = 0;
  state.battle.lastDustAt = 0;
  state.arena.intensity = 0.16;
  state.arena.knockedOut = 0;
  state.camera.zoom = 1;
  state.camera.targetZoom = 1;
  state.camera.offsetX = 0;
  state.camera.offsetY = 0;
  state.camera.targetOffsetX = 0;
  state.camera.targetOffsetY = 0;
  state.camera.slowMo = 0;
  state.camera.flashAlpha = 0;
  state.camera.traumaShake = 0;
  hideVictoryOverlay();
  renderGreeting();
  renderChampion();
  renderControls();
  renderArenaHud();
  playBellSound(0.7);

  updateArenaText(
    "All fighters inside",
    `${profiles.length} dwarfs in the cage`,
    `${pick(ROUND_LINES)} The room is about to become a very loud geometry problem.`,
  );

  appendLog({
    type: "round",
    title: "Octagon riot started",
    body: `${profiles.length} generated dwarfs just entered at once. There is no bracket. There is no dignity.`,
    meta: `Speed: ${state.speedMultiplier.toFixed(1)}×`,
  });
}

// ── CREATE COMBATANTS ─────────────────────────────────────

function createCombatants(profiles) {
  // Clear old physics bodies
  clearFighterBodies();

  // Clear old PIXI fighter containers
  clearFighterLayer();

  // Hide idle text during battle
  state.pixi.idleText.visible = false;
  state.pixi.idleSubText.visible = false;

  const shuffled = shuffle(profiles);
  const world = state.physics.engine.world;

  return shuffled.map((profile, index) => {
    const angle = (index / shuffled.length) * Math.PI * 2 + Math.random() * 0.4;
    const radiusFactor = 0.22 + Math.sqrt((index + 0.5) / shuffled.length) * 0.66;
    const spawnR = 180 * radiusFactor;

    const x = CENTER_X + Math.cos(angle) * spawnR;
    const y = CENTER_Y + Math.sin(angle) * spawnR;
    const radius = 10 + profile.power * 0.44 + (profile.archetype.key === "butcher" ? 1.8 : profile.archetype.key === "tavern" ? 1 : 0);

    // Create Matter.js body
    const body = Matter.Bodies.circle(x, y, radius + 7, {
      restitution: 0.5,
      friction: 0.01,
      frictionAir: 0,
      frictionStatic: 0,
      label: "fighter",
    });
    Matter.Body.setMass(body, profile.archetype.mass || 1);
    Matter.Body.setVelocity(body, {
      x: Math.cos(angle + Math.PI * 0.5) * randomRange(-1.2, 1.2),
      y: Math.sin(angle + Math.PI * 0.5) * randomRange(-1.0, 1.0),
    });
    Matter.Composite.add(world, body);

    // Create PIXI container for this fighter (iso-projected Y)
    const container = new PIXI.Container();
    container.position.set(x, isoY(y));

    // Legs/body graphics layer (drawn BELOW sprite)
    const legsGfx = new PIXI.Graphics();
    container.addChild(legsGfx);

    // Main sprite from generated artwork (torso/head only, anchored higher)
    const spriteIdx = profile.portraitIndex || ((index % 10) + 1);
    const texture = state.pixi.spriteTextures[spriteIdx];
    const sprite = new PIXI.Sprite(texture);
    sprite.anchor.set(0.5, 0.92); // anchor near bottom so legs appear below
    sprite.scale.set(0.55);
    container.addChild(sprite);

    // Keep a graphics layer for effects (shadow, health bar, glow, etc.)
    const gfx = new PIXI.Graphics();
    container.addChild(gfx);
    container.zIndex = y;
    state.pixi.fighterLayer.addChild(container);
    state.pixi.fighterLayer.sortableChildren = true;

    return {
      ...profile,
      x,
      y,
      vx: body.velocity.x,
      vy: body.velocity.y,
      hp: profile.maxHp,
      alive: true,
      fade: 1,
      attackPulse: 0,
      hitPulse: 0,
      wobble: 0,
      damageFlash: 0,
      cooldown: randomRange(0.08, 0.34),
      radius,
      mobility: 1.6 + profile.agility * 0.19,
      eliminations: 0,
      facing: angle,
      spin: Math.random() * Math.PI * 2,
      seedJitter: randomRange(0, Math.PI * 2),
      koSpin: 0,
      koSpinSpeed: 0,
      walkPhase: 0,
      facingRight: Math.cos(angle) > 0,
      animState: 'idle',
      deathTilt: 0,
      totalDamageTaken: 0,
      hitStagger: 0,
      hitWobbleTime: 0,
      deathBounce: 0,
      deathVelY: 0,
      dmgNumbers: [],
      body,
      container,
      sprite,
      gfx,
      legsGfx,
      stepDustTimer: 0,
    };
  });
}

// ── UPDATE BATTLE ─────────────────────────────────────────

function updateBattle(dt, now) {
  const cam = state.camera;
  cam.zoom += (cam.targetZoom - cam.zoom) * dt * 3;
  cam.offsetX += (cam.targetOffsetX - cam.offsetX) * dt * 3;
  cam.offsetY += (cam.targetOffsetY - cam.offsetY) * dt * 3;
  cam.flashAlpha = Math.max(0, cam.flashAlpha - dt * 4);
  cam.traumaShake = Math.max(0, cam.traumaShake - dt * 2.8);
  cam.slowMo = Math.max(0, cam.slowMo - dt * 1.6);

  const slowMoFactor = 1 - cam.slowMo * 0.7;
  const effectiveDt = dt * slowMoFactor;

  // Rage timer: escalate damage as battle goes on to prevent stalemates
  state.battle.elapsed = (state.battle.elapsed || 0) + dt;

  updateParticles(effectiveDt);

  if (!state.isRunning) {
    state.arena.intensity = Math.max(0, state.arena.intensity - dt * 0.12);
    cam.targetZoom = 1;
    cam.targetOffsetX = 0;
    cam.targetOffsetY = 0;
    maybeCelebrate(now);
    // Still update physics for lingering bodies
    if (state.physics.engine && state.fighters.length > 0) {
      Matter.Engine.update(state.physics.engine, 16.666);
      syncFighterPositions();
    }
    return;
  }

  const timeScale = state.speedMultiplier;
  const simDt = effectiveDt * timeScale;
  state.arena.intensity = Math.max(0.12, state.arena.intensity - dt * 0.08);

  const alive = state.fighters.filter((f) => f.alive);
  state.arena.aliveCount = alive.length;
  state.arena.knockedOut = state.fighters.length - alive.length;
  renderArenaHud();

  if (alive.length <= 1) {
    finishBattle(alive[0] || null, now);
    return;
  }

  // Camera zoom for final fighters
  if (alive.length <= 3 && alive.length > 1) {
    const cx = alive.reduce((s, f) => s + f.x, 0) / alive.length;
    const cy = alive.reduce((s, f) => s + f.y, 0) / alive.length;
    cam.targetZoom = 1.25 + (3 - alive.length) * 0.15;
    cam.targetOffsetX = (CENTER_X - cx) * 0.3;
    cam.targetOffsetY = (CENTER_Y - cy) * 0.3;
  } else {
    cam.targetZoom = 1;
    cam.targetOffsetX = 0;
    cam.targetOffsetY = 0;
  }

  // Ambient chatter
  if (now - state.battle.lastAmbientAt > 2100 / timeScale) {
    const chatter = template(pick(AMBIENT_LINES), { fighter: pick(alive).alias });
    state.battle.lastAmbientAt = now;
    updateArenaText("Octagon riot in progress", `${alive.length} dwarfs still upright`, chatter);
  }

  // Dust particles from moving fighters
  if (now - state.battle.lastDustAt > 120) {
    state.battle.lastDustAt = now;
    for (const fighter of alive) {
      const speed = Math.hypot(fighter.body.velocity.x, fighter.body.velocity.y);
      if (speed > 2) {
        spawnDust(fighter.x, fighter.y + fighter.radius + 4, speed * 3);
      }
    }
  }

  // Update fighter timers
  for (const fighter of state.fighters) {
    fighter.attackPulse = Math.max(0, fighter.attackPulse - simDt * 3.8);
    fighter.hitPulse = Math.max(0, fighter.hitPulse - simDt * 4.5);
    fighter.wobble = Math.max(0, fighter.wobble - simDt * 4.6);
    fighter.fade = fighter.alive ? 1 : Math.max(0.08, fighter.fade - simDt * 0.18);
    fighter.cooldown = Math.max(0, fighter.cooldown - simDt);
    fighter.spin += simDt * 2.4;
    fighter.damageFlash = Math.max(0, (fighter.damageFlash || 0) - simDt * 5);
    fighter.hitStagger = Math.max(0, (fighter.hitStagger || 0) - simDt * 4);
    fighter.hitWobbleTime = (fighter.hitWobbleTime || 0) + (fighter.damageFlash > 0 ? simDt * 25 : 0);

    // Animation state updates
    const speed = Math.hypot(fighter.body.velocity.x, fighter.body.velocity.y);
    if (fighter.alive) {
      if (speed > 0.5) {
        fighter.walkPhase = (fighter.walkPhase || 0) + speed * simDt * 0.8;
        fighter.animState = 'walk';
      } else {
        fighter.animState = 'idle';
      }
      // Update facing based on velocity (horizontal component)
      if (Math.abs(fighter.body.velocity.x) > 0.3) {
        fighter.facingRight = fighter.body.velocity.x > 0;
      }
      // Attack overrides walk
      if (fighter.attackPulse > 0.3) {
        fighter.animState = 'attack';
      }
    }

    if (!fighter.alive) {
      fighter.koSpin = (fighter.koSpin || 0) + simDt * (fighter.koSpinSpeed || 0);
      fighter.koSpinSpeed = (fighter.koSpinSpeed || 0) * (1 - simDt * 1.2);
      fighter.animState = 'dead';
      fighter.deathTilt = Math.min(1.0, (fighter.deathTilt || 0) + simDt * 2.0);
      // Increase air friction for dead fighters
      fighter.body.frictionAir = 0.12;
    }
  }

  // AI steering - compute velocity changes like original, then set on Matter.js bodies
  for (const fighter of alive) {
    let nearest = null;
    let nearestDistance = Infinity;
    let pushX = 0;
    let pushY = 0;

    for (const other of alive) {
      if (other.id === fighter.id) continue;
      const dx = other.x - fighter.x;
      const dy = other.y - fighter.y;
      const distance = Math.hypot(dx, dy) || 0.0001;

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = other;
      }

      const overlap = fighter.radius + other.radius + 14 - distance;
      if (overlap > 0) {
        pushX -= (dx / distance) * overlap * 0.78;
        pushY -= (dy / distance) * overlap * 0.78;
      }
    }

    if (!nearest) continue;

    const dx = nearest.x - fighter.x;
    const dy = nearest.y - fighter.y;
    const distance = Math.hypot(dx, dy) || 0.0001;
    const desiredRange = fighter.reach + nearest.radius * 0.72;
    const jitterX = Math.sin(fighter.spin + fighter.seedJitter) * fighter.chaos * 0.14;
    const jitterY = Math.cos(fighter.spin * 1.17 + fighter.seedJitter) * fighter.chaos * 0.12;
    const tangentX = -dy / distance;
    const tangentY = dx / distance;

    let steerX = pushX * 1.8 + jitterX;
    let steerY = pushY * 1.8 + jitterY;

    if (distance > desiredRange) {
      // Chase target aggressively
      const chaseBoost = alive.length <= 4 ? 1.4 : 1.1;
      steerX += (dx / distance) * fighter.mobility * chaseBoost;
      steerY += (dy / distance) * fighter.mobility * chaseBoost * 0.9;
    } else {
      // In range - mostly face and fight, minimal orbiting
      const orbitForce = alive.length <= 3 ? 0.1 : 0.35;
      steerX += tangentX * orbitForce;
      steerY += tangentY * orbitForce;
      // Push slightly towards target to stay in melee range
      steerX += (dx / distance) * 0.3;
      steerY += (dy / distance) * 0.3;
      if (fighter.cooldown <= 0) {
        attack(fighter, nearest, now);
      }
    }

    // Center pull
    const centerDx = CENTER_X - fighter.x;
    const centerDy = CENTER_Y - fighter.y;
    steerX += centerDx * 0.0025;
    steerY += centerDy * 0.0019;

    fighter.facing = Math.atan2(nearest.y - fighter.y, nearest.x - fighter.x);

    // Apply steering as velocity change (matching original physics feel)
    let vx = fighter.body.velocity.x + steerX * simDt * 52;
    let vy = fighter.body.velocity.y + steerY * simDt * 52;

    // Damping
    vx *= 0.93;
    vy *= 0.93;

    if (!fighter.alive) {
      vx *= 0.9;
      vy *= 0.9;
    }

    Matter.Body.setVelocity(fighter.body, { x: vx, y: vy });
  }

  // Also damp dead fighters that aren't in the alive loop
  for (const fighter of state.fighters) {
    if (!fighter.alive) {
      const vx = fighter.body.velocity.x * 0.93 * 0.9;
      const vy = fighter.body.velocity.y * 0.93 * 0.9;
      Matter.Body.setVelocity(fighter.body, { x: vx, y: vy });
    }
  }

  // Update Matter.js physics (fixed timestep for collision detection)
  Matter.Engine.update(state.physics.engine, 16.666);

  // Sync positions from physics
  syncFighterPositions();
}

function clampVelocity(body, maxSpeed) {
  const vx = body.velocity.x;
  const vy = body.velocity.y;
  const speed = Math.hypot(vx, vy);
  if (speed > maxSpeed) {
    const scale = maxSpeed / speed;
    Matter.Body.setVelocity(body, { x: vx * scale, y: vy * scale });
  }
}

function syncFighterPositions() {
  const ARENA_R = 195; // more conservative: well inside WALL_R (220)
  const HARD_LIMIT = 220; // absolute safety: WALL_R
  for (const fighter of state.fighters) {
    fighter.x = fighter.body.position.x;
    fighter.y = fighter.body.position.y;

    // Hard boundary: push fighter back inside octagon if they escaped
    const dx = fighter.x - CENTER_X;
    const dy = fighter.y - CENTER_Y;
    const dist = Math.hypot(dx, dy);
    if (dist > ARENA_R) {
      const nx = dx / dist;
      const ny = dy / dist;
      const clampR = dist > HARD_LIMIT ? ARENA_R - 5 : ARENA_R;
      const newX = CENTER_X + nx * clampR;
      const newY = CENTER_Y + ny * clampR;
      Matter.Body.setPosition(fighter.body, { x: newX, y: newY });
      // Reflect velocity inward + damping to prevent repeated escape
      const vDot = fighter.body.velocity.x * nx + fighter.body.velocity.y * ny;
      if (vDot > 0) {
        Matter.Body.setVelocity(fighter.body, {
          x: (fighter.body.velocity.x - nx * vDot * 1.3) * 0.85,
          y: (fighter.body.velocity.y - ny * vDot * 1.3) * 0.85,
        });
      }
      fighter.x = newX;
      fighter.y = newY;
    }

    fighter.vx = fighter.body.velocity.x;
    fighter.vy = fighter.body.velocity.y;
  }
}

// ── ATTACK ────────────────────────────────────────────────

function attack(attacker, defender, now) {
  if (!attacker.alive || !defender.alive) return;

  // ── DODGE / BLOCK CHECK ──
  // Agility-based dodge chance (5-18%)
  const dodgeChance = 0.03 + defender.agility * 0.015;
  const isDodge = Math.random() < dodgeChance;
  if (isDodge) {
    const angle = Math.atan2(defender.y - attacker.y, defender.x - attacker.x);
    attacker.cooldown = Math.max(0.15, 0.55 - attacker.agility * 0.03 + Math.random() * 0.12);
    attacker.attackPulse = 0.6;

    // Show "MISS" text
    defender.dmgNumbers = defender.dmgNumbers || [];
    const missText = new PIXI.Text("MISS", {
      fontFamily: "Trebuchet MS, Arial",
      fontSize: 12,
      fontWeight: "900",
      fill: 0xaaaaaa,
      stroke: 0x000000,
      strokeThickness: 2,
      align: "center",
    });
    missText.anchor.set(0.5);
    missText.position.set(randomRange(-8, 8), -35);
    missText._dmgLife = 0.7;
    missText._dmgVelX = randomRange(-0.3, 0.3);
    missText._dmgVelY = -2.0;
    defender.container.addChild(missText);
    defender.dmgNumbers.push(missText);

    // Dodge movement - defender sidesteps
    const dodgeAngle = angle + (Math.random() > 0.5 ? Math.PI / 2 : -Math.PI / 2);
    Matter.Body.setVelocity(defender.body, {
      x: defender.body.velocity.x + Math.cos(dodgeAngle) * 3,
      y: defender.body.velocity.y + Math.sin(dodgeAngle) * 2,
    });
    return;
  }

  // ── DAMAGE CALCULATION ──
  // Base damage: weapon + power + randomness
  const baseDamage = attacker.power * 0.8 + attacker.weapon.power * 0.7 + randomInt(2, 7);

  // Damage variance: ±30% randomness for unpredictability
  const variance = 0.7 + Math.random() * 0.6;

  // Critical hit: higher chance with chaos stat
  const critChance = 0.08 + attacker.chaos * 0.015;
  const isCrit = Math.random() < critChance;
  const critMultiplier = isCrit ? (1.8 + Math.random() * 0.7) : 1.0;

  // Defender's toughness reduces damage (power acts as armor too)
  const defenseReduction = 0.85 - defender.power * 0.02;

  // Glancing blow chance: low damage hit (15% chance)
  const isGlancing = !isCrit && Math.random() < 0.15;
  const glancingMult = isGlancing ? 0.4 : 1.0;

  // Final damage formula
  let damage = baseDamage * variance * critMultiplier * defenseReduction * glancingMult;
  damage = Math.max(2, Math.round(damage));

  const angle = Math.atan2(defender.y - attacker.y, defender.x - attacker.x);
  attacker.cooldown = Math.max(0.15, 0.55 - attacker.agility * 0.03 + Math.random() * 0.15);
  attacker.attackPulse = 1;
  defender.hitPulse = 1;
  defender.wobble = isGlancing ? 0.4 : 1;
  defender.damageFlash = isGlancing ? 0.3 : 1;
  defender.hitStagger = isGlancing ? 0.3 : 1;
  defender.hitWobbleTime = 0;

  // Rage mechanic: damage slowly increases after 45s to prevent endless fights
  const rageFactor = Math.max(1, 1 + ((state.battle.elapsed || 0) - 45) * 0.025);
  const finalDamage = Math.round(damage * rageFactor);

  // Spawn damage number
  defender.dmgNumbers = defender.dmgNumbers || [];
  const dmgColor = isCrit ? 0xffcc00 : isGlancing ? 0x888888 : 0xff4444;
  const dmgSize = isCrit ? 18 : isGlancing ? 10 : 14;
  const dmgLabel = isGlancing ? finalDamage.toString() : finalDamage.toString();
  const dmgText = new PIXI.Text(dmgLabel, {
    fontFamily: "Trebuchet MS, Arial",
    fontSize: dmgSize,
    fontWeight: "900",
    fill: dmgColor,
    stroke: 0x000000,
    strokeThickness: 3,
    align: "center",
  });
  dmgText.anchor.set(0.5);
  dmgText.position.set(randomRange(-10, 10), -40);
  dmgText._dmgLife = 1.0;
  dmgText._dmgVelX = randomRange(-0.5, 0.5);
  dmgText._dmgVelY = -2.5;
  defender.container.addChild(dmgText);
  defender.dmgNumbers.push(dmgText);
  attacker.facing = angle;
  defender.facing = angle + Math.PI;

  // Mass-based knockback
  const defenderMass = defender.archetype.mass || 1;
  const attackerMass = attacker.archetype.mass || 1;
  const knockbackMultiplier = 1 / defenderMass;

  defender.hp = Math.max(0, defender.hp - finalDamage);

  // Apply knockback via velocity change (scaled to new damage range)
  const kbForce = isCrit ? finalDamage * 0.35 : finalDamage * 0.2;
  Matter.Body.setVelocity(defender.body, {
    x: defender.body.velocity.x + Math.cos(angle) * kbForce * knockbackMultiplier,
    y: defender.body.velocity.y + Math.sin(angle) * kbForce * 0.75 * knockbackMultiplier,
  });
  clampVelocity(defender.body, 30);
  // Attacker recoil
  Matter.Body.setVelocity(attacker.body, {
    x: attacker.body.velocity.x - Math.cos(angle) * 2.2 * (1 / attackerMass),
    y: attacker.body.velocity.y - Math.sin(angle) * 1.7 * (1 / attackerMass),
  });
  clampVelocity(attacker.body, 30);

  // Trauma shake proportional to damage
  state.camera.traumaShake = Math.min(1, state.camera.traumaShake + finalDamage / 50);
  state.arena.intensity = Math.min(1, state.arena.intensity + finalDamage / 80);

  // Blood particles + impact
  spawnImpact(defender.x, defender.y, attacker.visual.hat, isCrit);
  spawnBlood(defender.x, defender.y, angle, damage, isCrit);

  // Blood decal on arena floor
  if (finalDamage > 8 || isCrit) {
    state.decals.push({
      x: defender.x + Math.cos(angle) * randomRange(5, 20),
      y: defender.y + Math.sin(angle) * randomRange(5, 20),
      size: randomRange(4, isCrit ? 14 : 9),
      alpha: randomRange(0.15, 0.3),
      color: pick(BLOOD_COLORS),
    });
    if (state.decals.length > 120) state.decals.shift();
  }

  // Slow-mo on critical hits
  if (isCrit) {
    state.camera.slowMo = 0.6;
    state.camera.flashAlpha = 0.25;
    playImpactSound(true);
  }

  // Motion trail for attacker
  spawnMotionTrail(attacker.x, attacker.y, attacker.facing, attacker.visual.hat);

  const shouldLog = now - state.battle.lastLogAt > Math.max(150, 550 / state.speedMultiplier);
  const templateSet = isCrit ? CRIT_LINES : ATTACK_LINES;
  const attackBody = template(pick(templateSet), {
    attacker: attacker.alias,
    defender: defender.alias,
    weapon: attacker.weapon.name,
  });

  if (shouldLog) {
    state.battle.lastLogAt = now;
    playImpactSound(isCrit);
    appendLog({
      type: "item",
      title: `${attacker.personName} hits ${defender.personName}`,
      body: attackBody,
      meta: `${Math.round(defender.hp)} hp left for ${defender.personName}`,
    });
    updateArenaText(
      "Octagon riot in progress",
      `${state.arena.aliveCount} dwarfs still upright`,
      attackBody,
    );
  }

  if (defender.hp > 0) return;

  // KO!
  defender.alive = false;
  defender.fade = 1;
  defender.koSpin = 0;
  defender.koSpinSpeed = randomRange(4, 12) * (Math.random() > 0.5 ? 1 : -1);

  // Strong KO knockback
  Matter.Body.setVelocity(defender.body, {
    x: defender.body.velocity.x + Math.cos(angle) * 180 * knockbackMultiplier,
    y: defender.body.velocity.y + Math.sin(angle) * 120 * knockbackMultiplier,
  });
  clampVelocity(defender.body, 35);

  attacker.eliminations += 1;
  attacker.hp = Math.min(attacker.maxHp, attacker.hp + 20 + attacker.eliminations * 3);
  state.arena.knockedOut += 1;
  state.arena.intensity = Math.min(1, state.arena.intensity + 0.25);

  // Big camera effects on KO
  state.camera.traumaShake = Math.min(1, state.camera.traumaShake + 0.5);
  state.camera.flashAlpha = 0.4;
  state.camera.slowMo = 0.8;

  spawnKnockoutWave(defender.x, defender.y);
  spawnBloodExplosion(defender.x, defender.y);
  playKoSound();
  addKillFeedEntry(attacker.personName, defender.personName);

  // Big blood decal
  state.decals.push({
    x: defender.x,
    y: defender.y,
    size: randomRange(12, 22),
    alpha: randomRange(0.25, 0.45),
    color: pick(BLOOD_COLORS),
  });

  const koText = template(pick(KO_LINES), {
    winner: attacker.alias,
    loser: defender.alias,
  });

  appendLog({
    type: "ko",
    title: `${defender.personName} is out`,
    body: koText,
    meta: `${attacker.personName} now has ${attacker.eliminations} knockouts`,
  });

  updateArenaText(
    "Someone just dropped",
    `${state.fighters.filter((fighter) => fighter.alive).length} dwarfs still upright`,
    koText,
  );
}

// ── FINISH BATTLE ─────────────────────────────────────────

function finishBattle(winner, now) {
  state.isRunning = false;
  state.battle.finishedAt = now;

  if (!winner) {
    updateArenaText(
      "Everything collapsed",
      "No dwarf left standing",
      "The impossible happened. The octagon defeated every single participant.",
    );
    renderControls();
    return;
  }

  state.champion = {
    personName: winner.personName,
    alias: winner.alias,
    weapon: winner.weapon.name,
    weaponType: winner.weapon.type,
    archetype: winner.archetype,
    message: pick(CHAMPION_MESSAGES),
    visual: winner.visual,
    portraitIndex: winner.portraitIndex,
    power: winner.power,
    agility: winner.agility,
    chaos: winner.chaos,
    eliminations: winner.eliminations,
  };
  saveChampion();
  renderChampion();
  showVictoryOverlay(winner);
  playWinSound();

  updateArenaText(
    "Last dwarf standing",
    `${winner.personName} survived the octagon`,
    `${winner.alias} leaves as champion with ${winner.eliminations} knockouts and a weapon that probably needs to be hidden from the public.`,
  );

  appendLog({
    type: "round",
    title: `${winner.personName} wins the riot`,
    body: state.champion.message,
    meta: `${winner.alias} using ${winner.weapon.name}`,
  });

  renderControls();
  renderArenaHud();
}

// ── RENDER SCENE (PixiJS) ─────────────────────────────────

function renderScene(time) {
  // Update camera container transform
  const cam = state.camera;
  const shakeAmount = cam.traumaShake * cam.traumaShake * 8;
  const shakeX = Math.sin(time * 31.7) * shakeAmount + Math.cos(time * 23.3) * shakeAmount * 0.6;
  const shakeY = Math.cos(time * 27.1) * shakeAmount + Math.sin(time * 19.7) * shakeAmount * 0.6;

  const camera = state.pixi.camera;
  camera.pivot.set(CENTER_X, CENTER_Y);
  camera.position.set(CENTER_X + cam.offsetX + shakeX, CENTER_Y + cam.offsetY + shakeY);
  camera.scale.set(cam.zoom);

  // Update spotlight alphas
  updateSpotlights(time);

  // Update octagon border pulse
  updateOctagonPulse(time);

  // Update torch flames animation
  updateTorchFlames(time);

  // Draw blood decals
  drawDecals();

  // Draw particles (under layer)
  drawParticlesPixi(state.pixi.underParticleGfx, "under");

  // Draw fighters
  drawFightersPixi(time);

  // Draw particles (over layer)
  drawParticlesPixi(state.pixi.overParticleGfx, "over");

  // Draw foreground glow
  drawGlowPixi(time);

  // Draw flash overlay
  drawFlashPixi();

  // Update idle text visibility
  const showIdle = state.fighters.length === 0;
  state.pixi.idleText.visible = showIdle;
  state.pixi.idleSubText.visible = showIdle;
  if (showIdle) {
    state.pixi.idleText.alpha = 0.38 + Math.sin(time * 1.5) * 0.05;
  }
}

function updateSpotlights(time) {
  for (const spot of state.pixi.spotlights) {
    spot.gfx.alpha = 1.0 + Math.sin(time * spot.freq) * 0.3;
  }
}

function updateTorchFlames(time) {
  if (!state.pixi.torches || !state.pixi.torchFlameGfx) return;

  const fg = state.pixi.torchFlameGfx;
  fg.clear();

  const gg = state.pixi.torchGlowGfx;
  if (gg) gg.clear();

  for (const torch of state.pixi.torches) {
    // Flickering animation (slower, more subtle for streetlights)
    torch.flicker = Math.sin(time * 3 + torch.phase) * 0.15 + Math.sin(time * 7.3 + torch.phase * 1.5) * 0.1;
    const glowAlpha = 0.4 + torch.flicker * 0.2;
    const glowSize = 8 + torch.flicker * 2;

    // Streetlight glow: cold yellowish, no flame shape - just a dim bulb glow
    // Outer glow (dim yellow)
    fg.beginFill(0xccaa55, glowAlpha * 0.3);
    fg.drawEllipse(torch.x, torch.y, glowSize, glowSize * 0.7);
    fg.endFill();

    // Inner glow (brighter yellow-white)
    fg.beginFill(0xddcc77, glowAlpha * 0.5);
    fg.drawEllipse(torch.x, torch.y, glowSize * 0.5, glowSize * 0.35);
    fg.endFill();

    // Core (pale yellow)
    fg.beginFill(0xeeddaa, glowAlpha * 0.6);
    fg.drawEllipse(torch.x, torch.y, 2, 1.5);
    fg.endFill();

    // Streetlight glow circle on floor (cold yellow, pulsing)
    if (gg) {
      const glowPulse = 0.03 + torch.flicker * 0.01;
      gg.beginFill(0xccaa55, glowPulse);
      gg.drawEllipse(torch.x, torch.y + (state.pixi.pillarHeight || 30), 35 + torch.flicker * 6, 20 + torch.flicker * 3);
      gg.endFill();
    }
  }
}

function updateOctagonPulse(time) {
  const g = state.pixi.octagonBorderGfx;
  if (!g) return;
  const middle = state.pixi._middlePoly;
  if (!middle) return;

  g.clear();
  const borderIntensity = 0.12 + state.arena.intensity * 0.15;
  const alpha = borderIntensity + Math.sin(time * 2.6) * 0.04;
  g.lineStyle(3, 0x888866, alpha);
  g.drawPolygon(middle.flatMap((p) => [p.x, p.y]));
}

function drawDecals() {
  if (state.decals.length === 0) return;

  // Use a persistent Graphics object in decalLayer
  // Clear and redraw each frame (decals are cheap)
  const layer = state.pixi.decalLayer;
  // Remove old graphics, add new
  while (layer.children.length > 0) {
    layer.removeChildAt(0);
  }

  const g = new PIXI.Graphics();
  for (const decal of state.decals) {
    const color = cssColorToNum(decal.color);
    g.beginFill(color, decal.alpha);
    // Irregular blood splat shape with iso Y projection
    const drawX = decal.x;
    const drawY = isoY(decal.y);
    const s = decal.size;
    const pts = [];
    pts.push(drawX + s, drawY);
    for (let i = 1; i <= 8; i++) {
      const a = (Math.PI * 2 * i) / 8;
      const r = s * (0.6 + Math.sin(i * 2.7 + decal.x * 0.1) * 0.4);
      pts.push(drawX + Math.cos(a) * r, drawY + Math.sin(a) * r * ISO_SCALE);
    }
    g.drawPolygon(pts);
    g.endFill();
  }
  layer.addChild(g);
}

function drawParticlesPixi(gfx, layer) {
  gfx.clear();

  for (const particle of state.particles) {
    // Filter by layer
    if (layer === "under" && particle.kind !== "blood" && particle.kind !== "dust") continue;
    if (layer === "over" && (particle.kind === "blood" || particle.kind === "dust")) continue;

    const ratio = particle.life / particle.maxLife;
    const alpha = ratio * (particle.alpha || 1);

    // Apply isometric Y projection to particle positions
    const px = particle.x;
    const py = isoY(particle.y);

    if (particle.kind === "ring") {
      const lw = 2 + (1 - ratio) * 4;
      const ringColor = cssColorToNum(particle.color);
      const ringAlpha = cssAlpha(particle.color) * alpha;
      gfx.lineStyle(lw, ringColor, ringAlpha);
      gfx.drawCircle(px, py, particle.size * (2.5 - ratio * 1.5));
      gfx.lineStyle(0);
    } else if (particle.kind === "blood") {
      const bloodColor = cssColorToNum(particle.color);
      gfx.beginFill(bloodColor, alpha);
      // Y-scale compressed for iso floor
      gfx.drawEllipse(px, py, particle.size * (0.5 + ratio * 0.5), particle.size * (0.5 + ratio * 0.5) * ISO_SCALE);
      gfx.endFill();
    } else if (particle.kind === "dust") {
      const dustColor = cssColorToNum(particle.color);
      gfx.beginFill(dustColor, ratio * 0.4);
      gfx.drawEllipse(px, py, particle.size * ratio, particle.size * ratio * ISO_SCALE);
      gfx.endFill();
    } else if (particle.kind === "debris") {
      const debrisColor = cssColorToNum(particle.color);
      gfx.beginFill(debrisColor, alpha);
      const hs = particle.size / 2;
      const hw = particle.size * 0.3;
      gfx.drawRect(px - hs, py - hw, particle.size, particle.size * 0.6);
      gfx.endFill();
    } else if (particle.kind === "trail") {
      const trailColor = cssColorToNum(particle.color);
      gfx.beginFill(trailColor, ratio * 0.35);
      gfx.drawCircle(px, py, particle.size * ratio);
      gfx.endFill();
    } else {
      // spark
      const sparkColor = cssColorToNum(particle.color);
      const sparkAlpha = alpha;
      gfx.beginFill(sparkColor, sparkAlpha);
      const speed = Math.hypot(particle.vx, particle.vy);
      const elongation = Math.min(3, speed * 0.01 + 1);
      const sr = particle.size * ratio;
      if (elongation > 1.2 && speed > 5) {
        const ang = Math.atan2(particle.vy, particle.vx);
        const ex = Math.cos(ang) * sr * elongation;
        const ey = Math.sin(ang) * sr * elongation * ISO_SCALE;
        gfx.moveTo(px - ex, py - ey);
        gfx.lineTo(px + ex, py + ey);
        gfx.endFill();
        gfx.lineStyle(sr * 0.8, sparkColor, sparkAlpha);
        gfx.moveTo(px - ex, py - ey);
        gfx.lineTo(px + ex, py + ey);
        gfx.lineStyle(0);
      } else {
        gfx.drawCircle(px, py, sr);
        gfx.endFill();
      }
    }
  }
}

function drawFightersPixi(time) {
  if (state.fighters.length === 0) return;

  const fighters = [...state.fighters].sort((left, right) => left.y - right.y);
  const alive = fighters.filter((f) => f.alive);
  const finalShowLabels = alive.length <= 6;
  const leader = alive.reduce((best, fighter) => {
    if (!best || fighter.eliminations > best.eliminations || fighter.hp > best.hp) {
      return fighter;
    }
    return best;
  }, null);

  for (const fighter of fighters) {
    drawFighterPixi(fighter, time, finalShowLabels, leader && leader.id === fighter.id);
  }
}

function drawFighterPixi(fighter, time, showLabel, isLeader) {
  const alpha = fighter.alive ? 1 : fighter.fade;
  if (alpha < 0.09) {
    fighter.container.visible = false;
    return;
  }
  fighter.container.visible = true;

  const speed = Math.hypot(fighter.vx || 0, fighter.vy || 0);
  const walkCycle = (fighter.walkPhase || 0) * 6;
  const walkAmp = Math.min(1.0, speed * 0.15);

  // Isometric projection
  fighter.container.position.set(fighter.x, isoY(fighter.y));
  fighter.container.alpha = alpha;
  fighter.container.zIndex = fighter.y;

  // Perspective scaling — sprite is upper body only, smaller scale
  const perspScale = 0.88 + (fighter.y - (CENTER_Y - 220)) / 440 * 0.24;
  const baseScale = 0.42 * perspScale;

  // Direction — never flip the container, only flip individual elements
  const flipX = fighter.facingRight ? 1 : -1;

  const spr = fighter.sprite;
  const lg = fighter.legsGfx;
  const gfx = fighter.gfx;
  const animState = fighter.animState || 'idle';
  const attackPulse = fighter.attackPulse || 0;
  const damageFlash = fighter.damageFlash || 0;
  const hitStagger = fighter.hitStagger || 0;
  const hitWobbleTime = fighter.hitWobbleTime || 0;
  const deathTilt = fighter.deathTilt || 0;
  const seedJ = fighter.seedJitter || 0;

  // Colors from fighter's visual identity
  const bootColor = 0x3a2a1a;
  const legColor = 0x4a3828;
  const armColor = hexToNum(fighter.visual.skin || '#8b6f5f');
  const weaponColor = 0x888888;

  // Sizes relative to radius — legs are chunky and visible
  const R = fighter.radius;
  const legLen = R * 1.0;
  const legW = R * 0.45;
  const footW = R * 0.5;
  const footH = R * 0.25;
  const armLen = R * 0.8;
  const armW = R * 0.28;

  // ── BODY (SPRITE) state ──
  let bodyX = 0, bodyY = 0, bodyRot = 0;
  let bodySX = flipX * baseScale, bodySY = baseScale;
  let bodyTint = 0xffffff;

  // ── LEG animation vars ──
  let leftLegAngle = 0, rightLegAngle = 0;
  let bodyBob = 0;

  // ── ARM/WEAPON animation vars ──
  let weaponAngle = 0;  // weapon arm rotation
  let weaponExtend = 0; // how far weapon reaches out

  // ── LEGS GRAPHICS ──
  lg.clear();

  if (animState === 'dead') {
    // ══ DEATH ══
    bodyRot = deathTilt * 1.6 * flipX;
    bodyY = Math.min(0, -deathTilt * 4 + deathTilt * deathTilt * 6);
    const greyAmount = Math.min(1, deathTilt * 1.5);
    const greyVal = Math.floor(0x88 + (0xff - 0x88) * (1 - greyAmount));
    bodyTint = (greyVal << 16) | (greyVal << 8) | greyVal;
    bodySX = flipX * baseScale;
    bodySY = baseScale;

    // Collapsed legs — spread out as dwarf falls
    const spreadAngle = deathTilt * 0.8;
    drawLeg(lg, -5 * flipX, 2, -spreadAngle * flipX, legLen * 0.8, legW, footW, footH, legColor, bootColor, baseScale);
    drawLeg(lg, 5 * flipX, 2, spreadAngle * flipX, legLen * 0.8, legW, footW, footH, legColor, bootColor, baseScale);

    if (!fighter._deathDustSpawned && deathTilt > 0.8) {
      fighter._deathDustSpawned = true;
      for (let i = 0; i < 5; i++) {
        spawnDust(fighter.x + randomRange(-12, 12), fighter.y + R + 4, 6);
      }
    }

  } else if (animState === 'attack') {
    // ══ ATTACK ══
    // Legs brace/lunge
    if (attackPulse > 0.7) {
      // Wind-up: crouch, lean back
      const t = (attackPulse - 0.7) / 0.3;
      bodyY = t * 3; // crouch down
      bodyX = -t * 5 * flipX;
      bodyRot = -t * 0.15 * flipX;
      leftLegAngle = -t * 0.4 * flipX;
      rightLegAngle = t * 0.3 * flipX;
      weaponAngle = -t * 2.2; // pull weapon back
    } else if (attackPulse > 0.3) {
      // Strike: lunge forward
      const t = (attackPulse - 0.3) / 0.4;
      const ease = Math.sin(t * Math.PI);
      bodyX = ease * 12 * flipX;
      bodyY = -ease * 2;
      bodyRot = ease * 0.12 * flipX;
      leftLegAngle = ease * 0.5 * flipX;
      rightLegAngle = -ease * 0.3 * flipX;
      weaponAngle = ease * 1.8; // swing weapon forward
      weaponExtend = ease * 6;
      bodyTint = lerpColor(0xffffff, 0xffffaa, ease * 0.5);
    } else {
      // Recovery
      const t = attackPulse / 0.3;
      const bounce = Math.sin(t * Math.PI) * t;
      bodyX = bounce * 2 * flipX;
      weaponAngle = -bounce * 0.5;
    }

    // Draw legs in attack stance — wide braced
    drawLeg(lg, -5 * flipX, 2, leftLegAngle, legLen, legW, footW, footH, legColor, bootColor, baseScale);
    drawLeg(lg, 5 * flipX, 2, rightLegAngle, legLen, legW, footW, footH, legColor, bootColor, baseScale);

  } else if (animState === 'walk') {
    // ══ WALK — big stompy dwarf steps ══
    const stepAngle = Math.sin(walkCycle) * 0.7 * walkAmp;
    leftLegAngle = stepAngle * flipX;
    rightLegAngle = -stepAngle * flipX;

    // Body bob — big up/down from heavy dwarf steps
    bodyBob = Math.abs(Math.sin(walkCycle)) * 6 * walkAmp;
    bodyY = -bodyBob;

    // Body rocks side to side with each step
    bodyX = Math.sin(walkCycle) * 2.5 * walkAmp * flipX;
    bodyRot = Math.sin(walkCycle) * 0.08 * walkAmp * flipX;

    // Weapon swings with walk
    weaponAngle = Math.sin(walkCycle + Math.PI * 0.3) * 0.5 * walkAmp;

    // Draw walking legs with offset matching body sway
    drawLeg(lg, -4 * flipX, 2, leftLegAngle, legLen, legW, footW, footH, legColor, bootColor, baseScale);
    drawLeg(lg, 4 * flipX, 2, rightLegAngle, legLen, legW, footW, footH, legColor, bootColor, baseScale);

    // Step dust on each footfall
    fighter.stepDustTimer = (fighter.stepDustTimer || 0) + speed * 0.016;
    if (fighter.stepDustTimer > 0.35) {
      fighter.stepDustTimer = 0;
      spawnDust(fighter.x + randomRange(-6, 6), fighter.y + R + 6, speed * 2);
    }

  } else {
    // ══ IDLE — combat stance, weight shifting ══
    const shift = Math.sin(time * 1.5 + seedJ) * 0.2;
    leftLegAngle = (shift + 0.15) * flipX;  // slightly spread
    rightLegAngle = (-shift - 0.15) * flipX;

    // Visible breathing
    const breathe = Math.sin(time * 2.5 + seedJ) * 0.025;
    bodySX = flipX * baseScale * (1 + breathe);
    bodySY = baseScale * (1 + breathe * 0.7);

    // Combat stance sway
    bodyX = Math.sin(time * 1.8 + seedJ) * 1.8;
    bodyY = Math.sin(time * 3 + seedJ) * 0.8; // subtle up/down
    bodyRot = Math.sin(time * 2.1 + seedJ) * 0.025 * flipX;

    // Weapon ready — slight bob
    weaponAngle = Math.sin(time * 2 + seedJ) * 0.4 - 0.2;

    drawLeg(lg, -5 * flipX, 2, leftLegAngle, legLen, legW, footW, footH, legColor, bootColor, baseScale);
    drawLeg(lg, 5 * flipX, 2, rightLegAngle, legLen, legW, footW, footH, legColor, bootColor, baseScale);
  }

  // ── HIT/DAMAGE overlay ──
  if (damageFlash > 0 && fighter.alive) {
    bodyX += -hitStagger * 6 * flipX;
    bodyX += Math.sin(hitWobbleTime) * hitStagger * 4;
    if (damageFlash > 0.5) {
      const sq = (damageFlash - 0.5) * 2;
      bodySY *= (1 - sq * 0.08);
    }
    bodyTint = lerpColor(0xffffff, 0xff2200, damageFlash);
  }

  // Apply body transforms
  spr.x = bodyX;
  spr.y = bodyY;
  spr.rotation = bodyRot;
  spr.scale.set(bodySX, bodySY);
  spr.tint = bodyTint;

  // ── DAMAGE NUMBERS ──
  fighter.dmgNumbers = fighter.dmgNumbers || [];
  for (let i = fighter.dmgNumbers.length - 1; i >= 0; i--) {
    const dn = fighter.dmgNumbers[i];
    dn._dmgLife -= 0.018;
    dn.x += dn._dmgVelX;
    dn.y += dn._dmgVelY;
    dn._dmgVelY += 0.04;
    dn.alpha = Math.max(0, dn._dmgLife);
    if (dn._dmgLife <= 0) {
      fighter.container.removeChild(dn);
      dn.destroy();
      fighter.dmgNumbers.splice(i, 1);
    }
  }

  // === OVERLAY GRAPHICS (gfx layer on top) ===
  gfx.clear();

  // Shadow
  gfx.beginFill(0x000000, 0.3);
  gfx.drawEllipse(0, 8, R * 1.3, R * 0.4);
  gfx.endFill();

  // ── WEAPON ARM (drawn via gfx, on top of sprite) ──
  if (fighter.alive && animState !== 'dead') {
    const weaponPivotX = bodyX + 6 * flipX;
    const weaponPivotY = bodyY - R * 0.5;
    const wAngle = (weaponAngle * flipX) - Math.PI * 0.25 * flipX;
    const wLen = armLen + weaponExtend + 4;

    // Arm
    gfx.lineStyle(armW, armColor, 0.9);
    gfx.moveTo(weaponPivotX, weaponPivotY);
    const elbowX = weaponPivotX + Math.cos(wAngle + Math.PI * 0.5) * armLen * 0.5;
    const elbowY = weaponPivotY + Math.sin(wAngle + Math.PI * 0.5) * armLen * 0.5;
    gfx.lineTo(elbowX, elbowY);
    gfx.lineStyle(0);

    // Weapon (line from elbow outward)
    const wpTipX = elbowX + Math.cos(wAngle + Math.PI * 0.5) * wLen * 0.6;
    const wpTipY = elbowY + Math.sin(wAngle + Math.PI * 0.5) * wLen * 0.6;
    gfx.lineStyle(Math.max(2, armW * 0.7), weaponColor, 0.85);
    gfx.moveTo(elbowX, elbowY);
    gfx.lineTo(wpTipX, wpTipY);
    gfx.lineStyle(0);

    // Weapon tip glow during strike
    if (animState === 'attack' && attackPulse > 0.3 && attackPulse <= 0.7) {
      const strikeT = Math.sin(((attackPulse - 0.3) / 0.4) * Math.PI);
      gfx.beginFill(0xffdd44, strikeT * 0.5);
      gfx.drawCircle(wpTipX, wpTipY, 4 + strikeT * 3);
      gfx.endFill();

      // Slash trail arc
      const slashColor = hexToNum(fighter.visual.hat);
      gfx.lineStyle(2, slashColor, strikeT * 0.5);
      for (let s = 0; s <= 8; s++) {
        const a = wAngle + Math.PI * 0.2 + (s / 8) * Math.PI * 0.8 * flipX;
        const pr = wLen * 0.6 + 4;
        const px = elbowX + Math.cos(a + Math.PI * 0.5) * pr;
        const py = elbowY + Math.sin(a + Math.PI * 0.5) * pr;
        if (s === 0) gfx.moveTo(px, py); else gfx.lineTo(px, py);
      }
      gfx.lineStyle(0);
    }
  }

  // Attack glow
  if (attackPulse > 0.3) {
    const glowColor = hexToNum(fighter.visual.hat);
    gfx.beginFill(glowColor, attackPulse * 0.12);
    gfx.drawCircle(bodyX * 0.5, -R, R * 2.2);
    gfx.endFill();
  }

  // Damage flash glow
  if (damageFlash > 0.1) {
    gfx.beginFill(0xff2814, damageFlash * 0.18);
    gfx.drawCircle(bodyX * 0.3, -R, R * 1.8);
    gfx.endFill();
  }

  // Leader ring
  if (isLeader && fighter.alive) {
    gfx.lineStyle(2.5, 0xffbe2f, 0.35 + Math.sin(time * 6) * 0.1);
    gfx.drawCircle(0, -R * 0.5, R * 1.6);
    gfx.lineStyle(0);
  }

  // Health bar
  const barY = -R * 3.2;
  const barW = 36;
  const hpRatio = Math.max(0, fighter.hp / fighter.maxHp);
  gfx.beginFill(0x080a0e, 0.72);
  gfx.drawRect(-barW / 2, barY, barW, 4);
  gfx.endFill();
  const rv = hpRatio < 0.5 ? 255 : Math.floor(255 * (1 - hpRatio) * 2);
  const gv = hpRatio > 0.5 ? 200 : Math.floor(200 * hpRatio * 2);
  const hpColor = (rv << 16) | (gv << 8) | 40;
  gfx.beginFill(hpColor);
  gfx.drawRect(-barW / 2, barY, barW * hpRatio, 4);
  gfx.endFill();
  if (damageFlash > 0.5) {
    gfx.beginFill(0xffffff, (damageFlash - 0.5) * 2);
    gfx.drawRect(-barW / 2, barY, barW * hpRatio, 4);
    gfx.endFill();
  }

  // Name label (never flips — drawn via gfx which doesn't flip)
  if (showLabel && fighter.alive) {
    const labelY = barY - 14;
    gfx.beginFill(0x070a10, 0.8);
    gfx.drawRoundedRect(-44, labelY, 88, 14, 3);
    gfx.endFill();

    if (!fighter._nameText) {
      fighter._nameText = new PIXI.Text(fighter.personName, {
        fontFamily: "Trebuchet MS",
        fontSize: 10,
        fontWeight: "700",
        fill: 0xfff5dc,
        align: "center",
      });
      fighter._nameText.anchor.set(0.5);
      fighter.container.addChild(fighter._nameText);
    }
    fighter._nameText.visible = true;
    fighter._nameText.position.set(0, labelY + 7);
  } else if (fighter._nameText) {
    fighter._nameText.visible = false;
  }
}

// ── Draw a single chunky dwarf leg (thigh + shin + boot) ──
function drawLeg(gfx, hipX, hipY, angle, length, width, footW, footH, color, bootColor, scale) {
  const midLen = length * 0.55;
  const shinLen = length * 0.5;
  const kneeX = hipX + Math.sin(angle) * midLen;
  const kneeY = hipY + Math.cos(angle) * midLen;
  // Shin bends slightly opposite to thigh
  const shinAngle = angle * -0.3;
  const footX = kneeX + Math.sin(shinAngle) * shinLen;
  const footY = kneeY + Math.cos(shinAngle) * shinLen;

  // Thigh — thick
  gfx.lineStyle(width, color, 0.95);
  gfx.moveTo(hipX, hipY);
  gfx.lineTo(kneeX, kneeY);
  gfx.lineStyle(0);

  // Shin — slightly thinner
  gfx.lineStyle(width * 0.8, color, 0.9);
  gfx.moveTo(kneeX, kneeY);
  gfx.lineTo(footX, footY);
  gfx.lineStyle(0);

  // Knee joint
  gfx.beginFill(color, 0.85);
  gfx.drawCircle(kneeX, kneeY, width * 0.35);
  gfx.endFill();

  // Boot — chunky dwarf boot
  gfx.beginFill(bootColor, 1);
  gfx.drawRoundedRect(footX - footW * 0.45, footY - footH * 0.2, footW, footH * 1.3, 3);
  gfx.endFill();
  // Boot sole highlight
  gfx.beginFill(0x221a10, 0.6);
  gfx.drawRect(footX - footW * 0.4, footY + footH * 0.7, footW * 0.8, footH * 0.35);
  gfx.endFill();
}

function drawHealthBarPixi(gfx, fighter, shape) {
  // Now integrated into drawFighterPixi - this stub kept for compatibility
}

function drawNameLabelPixi(gfx, fighter, shape) {
  // Now integrated into drawFighterPixi - this stub kept for compatibility
}

function getArchetypeMetrics(fighter) {
  const archetype = fighter.archetype || ARCHETYPES[0];
  const base = fighter.radius;
  const S = base / 14;

  return {
    bodyW: 11 * S * archetype.bodyScale,
    bodyH: 10 * S * archetype.bodyScale,
    shoulders: base * archetype.shoulderScale,
    headR: 7 * S * archetype.headScale,
    headY: (10 * S * archetype.bodyScale) / 2 + (7 * S * archetype.headScale) * 0.7,
    legWidth: 4 * S,
    legHeight: 8 * S,
    legGap: base * (archetype.key === "stabber" ? 0.12 : 0.16),
    bootHeight: 3 * S,
    beardScale: archetype.beardScale,
  };
}

function drawWeaponPixi(gfx, type, radius, tint, pulse, handX, handY, armAngle, S) {
  // No-op: weapon rendering replaced by sprite-based fighters
}

function drawHatPixi(gfx, fighter, shape, deathTilt, tiltPivotY) {
  // Now integrated into drawFighterPixi - this stub kept for compatibility
}

function drawBeardPixi(gfx, fighter, shape, deathTilt, tiltPivotY) {
  // Now integrated into drawFighterPixi - this stub kept for compatibility
}

function drawGlowPixi(time) {
  const g = state.pixi.glowGfx;
  g.clear();

  const isoCY = isoY(CENTER_Y);

  // Warm glow at bottom (iso-adjusted)
  const glowAlpha = 0.03 + state.arena.intensity * 0.05;
  g.beginFill(0xc88c1e, glowAlpha);
  g.drawEllipse(CENTER_X, isoCY + 66, 300, 165);
  g.endFill();

  // Red tint when intensity is high
  if (state.arena.intensity > 0.5) {
    const redAlpha = (state.arena.intensity - 0.5) * 0.08;
    g.beginFill(0xb4140a, redAlpha);
    g.drawEllipse(CENTER_X, isoCY, 340, 187);
    g.endFill();
  }

  // Subtle floor line
  g.lineStyle(1, 0xffffff, 0.04 + Math.sin(time * 1.5) * 0.01);
  g.moveTo(0, WORLD_HEIGHT - 78);
  g.lineTo(WORLD_WIDTH, WORLD_HEIGHT - 78);
  g.lineStyle(0);
}

function drawFlashPixi() {
  const g = state.pixi.flashGfx;
  g.clear();

  const cam = state.camera;
  if (cam.flashAlpha > 0.01) {
    g.beginFill(0xffffff, cam.flashAlpha);
    g.drawRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    g.endFill();
  }
}

// ── PARTICLES ─────────────────────────────────────────────

function updateParticles(dt) {
  state.particles = state.particles
    .map((particle) => {
      particle.life -= dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;

      // Gravity for blood and debris
      if (particle.kind === "blood" || particle.kind === "debris") {
        particle.vy += 380 * dt;
        particle.vx *= 0.98;
        // Floor collision
        if (particle.y > CENTER_Y + ARENA_RY - 10) {
          particle.y = CENTER_Y + ARENA_RY - 10;
          particle.vy *= -0.3;
          particle.vx *= 0.7;
          if (Math.abs(particle.vy) < 20) {
            particle.vy = 0;
            particle.life = Math.min(particle.life, 0.3);
          }
        }
        if (particle.kind === "debris") {
          particle.rotation = (particle.rotation || 0) + dt * (particle.rotSpeed || 0);
        }
      } else {
        particle.vx *= 0.94;
        particle.vy *= 0.94;
      }

      return particle;
    })
    .filter((particle) => particle.life > 0);
}

function spawnImpact(x, y, color, isCrit) {
  const particleCount = isCrit ? 20 : 10;
  for (let index = 0; index < particleCount; index += 1) {
    const angle = (Math.PI * 2 * index) / particleCount + Math.random() * 0.4;
    const speed = randomRange(45, isCrit ? 160 : 100);
    state.particles.push({
      kind: "spark",
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: randomRange(0.2, 0.5),
      maxLife: 0.5,
      color,
      size: randomRange(2.5, 5),
    });
  }

  state.particles.push({
    kind: "ring",
    x,
    y,
    vx: 0,
    vy: 0,
    life: isCrit ? 0.6 : 0.3,
    maxLife: isCrit ? 0.6 : 0.3,
    color: isCrit ? "rgba(255,160,30,0.9)" : "rgba(200,200,255,0.6)",
    size: isCrit ? 22 : 14,
  });
}

function spawnBlood(x, y, angle, damage, isCrit) {
  const count = isCrit ? 14 : Math.min(8, Math.floor(damage / 6));
  for (let i = 0; i < count; i++) {
    const spread = randomRange(-0.8, 0.8);
    const speed = randomRange(40, isCrit ? 200 : 130);
    state.particles.push({
      kind: "blood",
      x: x + randomRange(-5, 5),
      y: y + randomRange(-8, 4),
      vx: Math.cos(angle + spread) * speed,
      vy: Math.sin(angle + spread) * speed - randomRange(30, 80),
      life: randomRange(0.5, 1.2),
      maxLife: 1.2,
      color: pick(BLOOD_COLORS),
      size: randomRange(1.5, isCrit ? 4.5 : 3),
    });
  }
}

function spawnBloodExplosion(x, y) {
  for (let i = 0; i < 24; i++) {
    const angle = (Math.PI * 2 * i) / 24 + Math.random() * 0.3;
    const speed = randomRange(60, 220);
    state.particles.push({
      kind: "blood",
      x: x + randomRange(-4, 4),
      y: y + randomRange(-6, 4),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - randomRange(40, 120),
      life: randomRange(0.6, 1.5),
      maxLife: 1.5,
      color: pick(BLOOD_COLORS),
      size: randomRange(2, 5),
    });
  }

  // Debris chunks
  for (let i = 0; i < 6; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = randomRange(50, 160);
    state.particles.push({
      kind: "debris",
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - randomRange(60, 140),
      life: randomRange(0.8, 1.6),
      maxLife: 1.6,
      color: pick(["#5a4030", "#3d2d20", "#6e5040", "#8a7060"]),
      size: randomRange(2, 4.5),
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: randomRange(-12, 12),
    });
  }
}

function spawnDust(x, y, intensity) {
  const count = Math.min(3, Math.ceil(intensity * 0.5));
  for (let i = 0; i < count; i++) {
    state.particles.push({
      kind: "dust",
      x: x + randomRange(-8, 8),
      y: y + randomRange(-2, 4),
      vx: randomRange(-15, 15),
      vy: randomRange(-20, -5),
      life: randomRange(0.3, 0.6),
      maxLife: 0.6,
      color: "rgba(180,170,150,0.5)",
      size: randomRange(3, 7),
    });
  }
}

function spawnMotionTrail(x, y, facing, color) {
  for (let i = 0; i < 3; i++) {
    state.particles.push({
      kind: "trail",
      x: x - Math.cos(facing) * (i * 6 + 4) + randomRange(-3, 3),
      y: y - Math.sin(facing) * (i * 6 + 4) + randomRange(-3, 3),
      vx: 0,
      vy: 0,
      life: 0.15 + i * 0.05,
      maxLife: 0.3,
      color,
      size: randomRange(4, 8),
    });
  }
}

function spawnWallSparks(x, y) {
  for (let i = 0; i < 8; i++) {
    const angle = Math.atan2(CENTER_Y - y, CENTER_X - x) + randomRange(-1, 1);
    const speed = randomRange(40, 120);
    state.particles.push({
      kind: "spark",
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: randomRange(0.15, 0.35),
      maxLife: 0.35,
      color: pick(["#ffbe2f", "#ff9020", "#ffffff", "#ffd080"]),
      size: randomRange(1.5, 3.5),
    });
  }
}

function spawnKnockoutWave(x, y) {
  state.particles.push({
    kind: "ring",
    x,
    y,
    vx: 0,
    vy: 0,
    life: 0.9,
    maxLife: 0.9,
    color: "rgba(255,50,30,0.95)",
    size: 34,
  });

  state.particles.push({
    kind: "ring",
    x,
    y,
    vx: 0,
    vy: 0,
    life: 0.6,
    maxLife: 0.6,
    color: "rgba(255,200,40,0.7)",
    size: 20,
  });

  for (let index = 0; index < 16; index += 1) {
    const angle = (Math.PI * 2 * index) / 16 + Math.random() * 0.2;
    const speed = randomRange(55, 130);
    state.particles.push({
      kind: "spark",
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: randomRange(0.4, 0.7),
      maxLife: 0.7,
      color: index % 3 === 0 ? "rgba(255,50,30,0.95)" : index % 3 === 1 ? "rgba(255,190,47,0.95)" : "rgba(255,255,255,0.9)",
      size: randomRange(3, 6),
    });
  }
}

// ── UI RENDER FUNCTIONS ───────────────────────────────────

function renderGreeting() {
  dom.welcomeMessage.textContent = state.welcome;
}

function renderControls() {
  dom.rosterCount.textContent = `${state.participants.length} / ${MAX_PARTICIPANTS}`;
  dom.startTournamentBtn.disabled = state.isRunning || state.participants.length < 2;
  dom.nameInput.disabled = state.isRunning || state.participants.length >= MAX_PARTICIPANTS;
  dom.seedNamesBtn.disabled = state.isRunning || state.participants.length >= MAX_PARTICIPANTS;
  dom.rerollDwarfsBtn.disabled = state.isRunning || state.participants.length === 0;
  dom.clearNamesBtn.disabled = state.isRunning || state.participants.length === 0;
  dom.refreshGreetingBtn.disabled = state.isRunning;

  // Speed slider is always usable, even during battle
  dom.speedSlider.value = state.speedMultiplier;
  dom.speedLabel.textContent = state.speedMultiplier.toFixed(1) + "×";
}

function updateSoundButton() {
  dom.soundToggleBtn.textContent = state.sound.enabled ? "Sound: On" : "Sound: Off";
  dom.soundToggleBtn.classList.toggle("is-active", state.sound.enabled);
}

function renderRoster() {
  const profiles = state.participants.map((participant) => getProfile(participant));
  dom.rosterEmptyState.hidden = profiles.length > 0;

  dom.rosterList.innerHTML = profiles
    .map((profile) => {
      return `
        <article class="roster-card">
          <div class="roster-card__top">
            <div>
              <h3 class="roster-card__name">${escapeHtml(profile.personName)}</h3>
              <p class="roster-card__alias">${escapeHtml(profile.alias)}</p>
              <p class="roster-card__weapon">${escapeHtml(profile.weapon.name)} • ${escapeHtml(profile.archetype.label)}</p>
            </div>
            <button
              class="remove-button"
              type="button"
              aria-label="Remove ${escapeHtml(profile.personName)}"
              data-remove-id="${profile.id}"
            >
              x
            </button>
          </div>
          <div class="roster-card__art">
            <img src="./assets/dwarf-portrait-${profile.portraitIndex}.jpg" alt="${escapeHtml(profile.personName)} portrait" style="width:100%;border-radius:12px;" />
          </div>
          <div class="roster-card__stats">
            <span class="stat-chip">Power ${profile.power}</span>
            <span class="stat-chip">Speed ${profile.agility}</span>
            <span class="stat-chip">Chaos ${profile.chaos}</span>
            <span class="stat-chip">${profile.weapon.name}</span>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderChampion() {
  if (!state.champion) {
    dom.championCard.classList.remove("is-visible");
    dom.championCard.innerHTML = "";
    dom.championEmptyState.hidden = false;
    return;
  }

  dom.championEmptyState.hidden = true;
  dom.championCard.classList.add("is-visible");
  dom.championCard.innerHTML = `
    <div class="champion-card__inner">
      <div class="champion-card__art">
        <img
          class="champion-card__seal"
          src="./assets/champion-seal.svg"
          alt="Champion seal"
        />
        <img src="./assets/dwarf-portrait-${state.champion.portraitIndex || 1}.jpg" alt="Champion portrait" style="width:100%;border-radius:12px;" />
      </div>
      <div class="champion-card__copy">
        <h3>${escapeHtml(state.champion.personName)}</h3>
        <p class="champion-card__alias">${escapeHtml(state.champion.alias)}</p>
        <p class="champion-card__line">${escapeHtml(state.champion.message)}</p>
        <p class="champion-card__weapon">${escapeHtml(state.champion.weapon)}</p>
        <div class="champion-card__stats">
          <span class="stat-chip">Power ${state.champion.power}</span>
          <span class="stat-chip">Speed ${state.champion.agility}</span>
          <span class="stat-chip">Chaos ${state.champion.chaos}</span>
          <span class="stat-chip">Knockouts ${state.champion.eliminations}</span>
        </div>
      </div>
    </div>
  `;
}

function resetIdleArena(status) {
  if (state.isRunning) return;

  hideVictoryOverlay();
  state.fighters = [];
  state.particles = [];
  state.decals = [];
  clearFighterBodies();
  clearFighterLayer();
  // Show idle text
  if (state.pixi.idleText) {
    state.pixi.idleText.visible = true;
    state.pixi.idleSubText.visible = true;
  }
  state.arena.intensity = Math.max(0.08, state.participants.length ? 0.14 : 0);
  renderArenaHud();
  updateArenaText(
    "Octagon on standby",
    state.participants.length ? `${state.participants.length} generated dwarfs ready` : "No fighters moving yet",
    status,
  );
}

function renderArenaHud() {
  const aliveCount = state.isRunning
    ? state.fighters.filter((fighter) => fighter.alive).length
    : state.fighters.filter((fighter) => fighter.alive).length || state.participants.length;
  const knockedOut = state.fighters.length > 0 ? state.fighters.length - aliveCount : 0;

  dom.aliveCount.textContent = String(aliveCount);
  dom.koCount.textContent = String(knockedOut);
  dom.intensityFill.style.width = `${Math.round(state.arena.intensity * 100)}%`;
  dom.intensityValue.textContent = `${Math.round(state.arena.intensity * 100)}%`;
}

function updateArenaText(headline, meta, status) {
  state.arena.headline = headline;
  state.arena.meta = meta;
  state.arena.status = status;
  dom.arenaHeadline.textContent = headline;
  dom.arenaMeta.textContent = meta;
  dom.arenaStatus.textContent = status;
}

function appendLog(entry) {
  state.logs = [entry, ...state.logs].slice(0, 160);
  dom.eventLog.innerHTML = state.logs
    .map((item) => {
      const className =
        item.type === "round"
          ? "event-log__round"
          : item.type === "ko"
            ? "event-log__ko"
            : "event-log__item";

      return `
        <article class="${className}">
          <p class="event-log__title">${escapeHtml(item.title)}</p>
          <div>${escapeHtml(item.body)}</div>
          <div class="event-log__meta">${escapeHtml(item.meta)}</div>
        </article>
      `;
    })
    .join("");
}

function addNames(rawValue) {
  if (state.isRunning) return;

  const names = parseNames(rawValue);
  if (names.length === 0) return;

  const existing = new Set(state.participants.map((participant) => participant.name.toLowerCase()));
  const incoming = [];

  names.forEach((name) => {
    const normalized = name.toLowerCase();
    if (!existing.has(normalized) && state.participants.length + incoming.length < MAX_PARTICIPANTS) {
      existing.add(normalized);
      incoming.push({
        id: createId(),
        name,
        seed: createSeed(),
      });
    }
  });

  if (incoming.length === 0) {
    appendLog({
      type: "item",
      title: "No one new added",
      body: "Either those names are already in the roster or the 50 fighter limit is already full.",
      meta: "The octagon still has standards.",
    });
    return;
  }

  state.participants = [...state.participants, ...incoming];
  saveRoster();
  renderRoster();
  renderControls();
  appendLog({
    type: "item",
    title: `${incoming.length} fighters added`,
    body: incoming.map((participant) => participant.name).join(", "),
    meta: "Fresh beards are entering the room.",
  });
  resetIdleArena("New names entered the building. The octagon is stretching its legs.");
}

function removeParticipant(id) {
  const removed = state.participants.find((participant) => participant.id === id);
  state.participants = state.participants.filter((participant) => participant.id !== id);
  saveRoster();
  renderRoster();
  renderControls();

  if (removed) {
    appendLog({
      type: "item",
      title: `${removed.name} left before the bell`,
      body: "A surprisingly wise career move.",
      meta: "Roster updated.",
    });
  }

  resetIdleArena("The roster shifted. The arena is waiting for the next bad idea.");
}

function normalizeParticipants(participants) {
  if (!Array.isArray(participants)) return [];
  return participants
    .map((participant) => {
      if (!participant || typeof participant.name !== "string") return null;
      return {
        id: participant.id || createId(),
        name: participant.name.trim(),
        seed: Number.isFinite(participant.seed) ? participant.seed : createSeed(),
      };
    })
    .filter(Boolean)
    .slice(0, MAX_PARTICIPANTS);
}

function getProfile(participant) {
  const cacheKey = `${participant.id}:${participant.seed}`;
  if (PROFILE_CACHE.has(cacheKey)) return PROFILE_CACHE.get(cacheKey);

  const rng = createSeededRandom(hashString(`${participant.name}:${participant.seed}`));
  const archetype = seededPick(rng, ARCHETYPES);
  const weaponPool = buildWeaponPool(archetype);
  const weapon = seededPick(rng, weaponPool);
  const power = seededInt(rng, 5, 10);
  const agility = seededInt(rng, 4, 10);
  const chaos = seededInt(rng, 4, 10);
  const alias = `${seededPick(rng, DWARF_PREFIXES)} ${seededPick(rng, DWARF_BASE_NAMES)} ${seededPick(rng, DWARF_SUFFIXES)}`;

  const profile = {
    id: participant.id,
    personName: participant.name,
    seed: participant.seed,
    alias,
    archetype,
    weapon,
    power,
    agility,
    chaos,
    maxHp: 150 + power * 8 + agility * 4,
    reach: weapon.reach,
    visual: {
      skin: seededPick(rng, SKIN_TONES),
      hat: seededPick(rng, HAT_COLORS),
      coat:
        archetype.key === "butcher"
          ? seededPick(rng, ["#6a7f3a", "#6f8a45", "#735327"])
          : archetype.key === "tavern"
            ? seededPick(rng, ["#5a3a22", "#6f4a28", "#74412f"])
            : seededPick(rng, COAT_COLORS),
      pants: seededPick(rng, PANTS_COLORS),
      beard: seededPick(rng, BEARD_COLORS),
      boots: seededPick(rng, ["#8d201b", "#692014", "#7c4021"]),
      belt: seededPick(rng, ["#44281d", "#36231d", "#50331f"]),
      fur: seededPick(rng, ["#c9b48b", "#9f7d59", "#e7d7bd", "#866747"]),
      trim: seededPick(rng, ["#1d1617", "#32221a", "#554030", "#241812"]),
      apron: seededPick(rng, ["#b18b35", "#a77c2b", "#8e6d2a"]),
      blood: seededPick(rng, ["#7f221e", "#5e1718", "#8a2b1f"]),
      eyeBag: seededInt(rng, 0, 2),
      toothMode: seededInt(rng, 0, 2),
      noseScale: 0.9 + rng() * 0.45,
      earScale: 0.9 + rng() * 0.5,
      browTilt: seededInt(rng, -2, 3),
      scar: seededInt(rng, 0, 2),
      beardStyle: seededInt(rng, 0, 2),
      hatBend: seededInt(rng, -8, 8),
      badge: seededInt(rng, 0, 1),
      grime: [rng(), rng(), rng()],
    },
    portraitIndex: seededInt(rng, 1, 10),
  };

  PROFILE_CACHE.set(cacheKey, profile);
  return profile;
}

function buildWeaponPool(archetype) {
  const favored = WEAPONS.filter((weapon) => archetype.weaponBias.includes(weapon.type));
  return [...WEAPONS, ...favored, ...favored];
}

// ── SVG BUST GENERATION (removed – now using static SVG assets from ./assets/dwarf-portrait-{N}.svg) ──

/*
  const W = 220, H = 220, CX = 110, CY = 110;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  // --- helpers ---
  function darken(hex, amt) {
    const r = Math.max(0, parseInt(hex.slice(1,3),16) - amt);
    const g = Math.max(0, parseInt(hex.slice(3,5),16) - amt);
    const b = Math.max(0, parseInt(hex.slice(5,7),16) - amt);
    return `rgb(${r},${g},${b})`;
  }
  function desaturate(hex, amt) {
    let r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    const avg = (r + g + b) / 3;
    r = Math.round(r + (avg - r) * amt);
    g = Math.round(g + (avg - g) * amt);
    b = Math.round(b + (avg - b) * amt);
    return `rgb(${r},${g},${b})`;
  }
  function hexToRgba(hex, a) {
    return `rgba(${parseInt(hex.slice(1,3),16)},${parseInt(hex.slice(3,5),16)},${parseInt(hex.slice(5,7),16)},${a})`;
  }
  function strokeShape(fn, fill, stroke, lw) {
    ctx.beginPath();
    fn();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 3; ctx.stroke(); }
  }
  function roundRect(x, y, w, h, r) {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
  }

  const outline = "#0a0604";
  const g1 = visual.grime[0], g2 = visual.grime[1], g3 = visual.grime[2];
  const headY = archetype.key === "butcher" ? 78 : archetype.key === "tavern" ? 80 : 74;
  const headR = (archetype.key === "stabber" ? 32 : 34) * (archetype.headScale || 1);
  const shoulderW = (archetype.key === "butcher" ? 52 : archetype.key === "tavern" ? 48 : 44) * (archetype.shoulderScale || 1);
  const bodyH = (archetype.key === "stabber" ? 54 : 60) * (archetype.bodyScale || 1);
  const browAngle = Math.max(3, visual.browTilt + 5);
  const skinDark = darken(visual.skin, 40);
  const skinMuted = desaturate(visual.skin, 0.25);
  const coatColor = desaturate(archetype.torsoStyle === "apron" ? visual.apron : visual.coat, 0.2);
  const hatColor = desaturate(visual.hat, 0.15);
  const beardColor = desaturate(visual.beard, 0.2);

  // ── BACKGROUND ──
  const bgGrad = ctx.createRadialGradient(CX, 88, 10, CX, CY, 130);
  bgGrad.addColorStop(0, "rgba(50,34,28,1)");
  bgGrad.addColorStop(0.5, "rgba(28,18,15,1)");
  bgGrad.addColorStop(1, "rgba(10,6,5,1)");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // rim light from hat color
  const rimGrad = ctx.createRadialGradient(CX, 60, 20, CX, CY, 120);
  rimGrad.addColorStop(0, hexToRgba(visual.hat, 0.18));
  rimGrad.addColorStop(1, "transparent");
  ctx.fillStyle = rimGrad;
  ctx.fillRect(0, 0, W, H);

  // circular clip
  ctx.save();
  ctx.beginPath();
  ctx.arc(CX, CY, 102, 0, Math.PI * 2);
  ctx.clip();

  // ── GROUND SHADOW ──
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.beginPath();
  ctx.ellipse(CX, 192, 58, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  // ── BODY / TORSO ──
  const bodyTop = 106;
  const bodyBot = bodyTop + bodyH;
  const sL = CX - shoulderW;
  const sR = CX + shoulderW;

  // fur collar / shoulders
  strokeShape(() => {
    ctx.moveTo(sL, bodyTop + 10);
    ctx.lineTo(sL + 14, bodyTop - 14);
    ctx.lineTo(CX, bodyTop - 6);
    ctx.lineTo(sR - 14, bodyTop - 14);
    ctx.lineTo(sR, bodyTop + 10);
    ctx.lineTo(sR - 16, bodyTop + 20);
    ctx.lineTo(sL + 16, bodyTop + 20);
    ctx.closePath();
  }, desaturate(visual.fur, 0.2), outline, 4);

  // fur texture lines
  ctx.strokeStyle = darken(visual.fur, 30);
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 8; i++) {
    const fx = sL + 18 + i * ((sR - sL - 36) / 7);
    ctx.beginPath();
    ctx.moveTo(fx, bodyTop - 8);
    ctx.lineTo(fx + (i % 2 ? 2 : -2), bodyTop + 14);
    ctx.stroke();
  }

  // main torso
  const torsoGrad = ctx.createLinearGradient(CX, bodyTop, CX, bodyBot);
  torsoGrad.addColorStop(0, coatColor);
  torsoGrad.addColorStop(1, darken(coatColor.replace("rgb(","").replace(")","").split(",").map(Number).reduce((a,v,i) => a + (i===0?"#":"") + ("0"+Math.max(0,v).toString(16)).slice(-2), ""), 25));
  strokeShape(() => {
    ctx.moveTo(sL + 2, bodyTop + 12);
    ctx.quadraticCurveTo(CX, bodyTop - 2, sR - 2, bodyTop + 12);
    ctx.lineTo(sR - 16, bodyBot);
    ctx.lineTo(sL + 16, bodyBot);
    ctx.closePath();
  }, coatColor, outline, 4);

  // torso shading
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  const torsoShade = ctx.createLinearGradient(sL, bodyTop, sR, bodyBot);
  torsoShade.addColorStop(0, "rgba(60,40,30,0.25)");
  torsoShade.addColorStop(0.5, "rgba(40,25,18,0.15)");
  torsoShade.addColorStop(1, "rgba(20,10,6,0.35)");
  ctx.fillStyle = torsoShade;
  ctx.beginPath();
  ctx.moveTo(sL + 2, bodyTop + 12);
  ctx.quadraticCurveTo(CX, bodyTop - 2, sR - 2, bodyTop + 12);
  ctx.lineTo(sR - 16, bodyBot);
  ctx.lineTo(sL + 16, bodyBot);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // archetype-specific torso overlays
  if (archetype.torsoStyle === "apron") {
    strokeShape(() => {
      ctx.moveTo(86, bodyTop + 14);
      ctx.lineTo(134, bodyTop + 14);
      ctx.lineTo(128, bodyBot + 4);
      ctx.lineTo(92, bodyBot + 4);
      ctx.closePath();
    }, desaturate(visual.apron, 0.15), outline, 3);
    // blood smears on apron
    ctx.strokeStyle = hexToRgba(visual.blood, 0.55);
    ctx.lineWidth = 5; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(96, bodyTop + 30); ctx.lineTo(114, bodyTop + 50); ctx.stroke();
    ctx.lineWidth = 3; ctx.strokeStyle = hexToRgba(visual.blood, 0.35);
    ctx.beginPath(); ctx.moveTo(106, bodyTop + 40); ctx.lineTo(122, bodyBot); ctx.stroke();
  } else if (archetype.torsoStyle === "vest") {
    ctx.strokeStyle = "rgba(180,160,140,0.4)";
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(98, bodyTop + 12); ctx.lineTo(CX, bodyTop + 32); ctx.lineTo(122, bodyTop + 12); ctx.stroke();
  }

  // center trim
  ctx.globalAlpha = 0.75;
  strokeShape(() => { roundRect(CX - 11, bodyTop + 6, 22, bodyH - 4, 7); }, desaturate(visual.trim, 0.2), null, 0);
  ctx.globalAlpha = 1;

  // belt
  strokeShape(() => { roundRect(84, bodyBot - 12, 52, 13, 6); }, desaturate(visual.belt, 0.15), outline, 3);
  // belt buckle
  ctx.fillStyle = "#a08030";
  ctx.fillRect(CX - 5, bodyBot - 10, 10, 9);
  ctx.strokeStyle = outline;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(CX - 5, bodyBot - 10, 10, 9);

  // body blood splatters
  ctx.fillStyle = hexToRgba(visual.blood, 0.25 + g2 * 0.2);
  ctx.beginPath();
  ctx.ellipse(96 + g1 * 20, bodyTop + 24 + g2 * 30, 4 + g3 * 6, 3 + g1 * 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = hexToRgba(visual.blood, 0.3 + g1 * 0.2);
  ctx.lineWidth = 1.5 + g3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(100 + g2 * 20, bodyTop + 19 + g3 * 15);
  ctx.lineTo(103 + g2 * 20 + g1 * 5, bodyTop + 27 + g3 * 15 + g2 * 12);
  ctx.stroke();

  // ── LEGS ──
  const legTop = bodyBot - 2;
  const legH = 28;
  strokeShape(() => { roundRect(82, legTop, 20, legH, 7); }, desaturate(visual.pants, 0.2), outline, 3);
  strokeShape(() => { roundRect(118, legTop, 20, legH, 7); }, desaturate(visual.pants, 0.2), outline, 3);

  // ── BOOTS ──
  const bootY = legTop + legH - 4;
  strokeShape(() => { roundRect(78, bootY, 28, 13, 5); }, desaturate(visual.boots, 0.2), outline, 3);
  strokeShape(() => { roundRect(116, bootY, 28, 13, 5); }, desaturate(visual.boots, 0.2), outline, 3);
  // boot highlight
  ctx.save();
  ctx.globalCompositeOperation = "overlay";
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fillRect(80, bootY + 1, 24, 4);
  ctx.fillRect(118, bootY + 1, 24, 4);
  ctx.restore();

  // ── EARS ──
  const earS = visual.earScale;
  // left ear
  strokeShape(() => {
    ctx.moveTo(78 - earS * 5, headY + 2);
    ctx.lineTo(68 - earS * 8, headY + 13);
    ctx.lineTo(79 - earS * 2, headY + 18);
    ctx.closePath();
  }, skinMuted, outline, 3);
  // right ear
  strokeShape(() => {
    ctx.moveTo(142 + earS * 5, headY + 2);
    ctx.lineTo(152 + earS * 8, headY + 13);
    ctx.lineTo(141 + earS * 2, headY + 18);
    ctx.closePath();
  }, skinMuted, outline, 3);

  // ── HEAD ──
  const headGrad = ctx.createRadialGradient(CX - 8, headY - 8, 4, CX, headY, headR);
  headGrad.addColorStop(0, visual.skin);
  headGrad.addColorStop(0.7, skinMuted);
  headGrad.addColorStop(1, skinDark);
  strokeShape(() => { ctx.arc(CX, headY, headR, 0, Math.PI * 2); }, headGrad, outline, 4);

  // head ambient shadow
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  const headShade = ctx.createRadialGradient(CX + 6, headY + 6, headR * 0.2, CX, headY, headR);
  headShade.addColorStop(0, "rgba(0,0,0,0)");
  headShade.addColorStop(0.7, "rgba(0,0,0,0.06)");
  headShade.addColorStop(1, "rgba(0,0,0,0.18)");
  ctx.fillStyle = headShade;
  ctx.beginPath();
  ctx.arc(CX, headY, headR - 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // wrinkles
  ctx.strokeStyle = "rgba(0,0,0,0.14)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(94, headY - 24);
  ctx.quadraticCurveTo(CX, headY - 28, 126, headY - 24);
  ctx.stroke();
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = "rgba(0,0,0,0.1)";
  ctx.beginPath();
  ctx.moveTo(96, headY - 20);
  ctx.quadraticCurveTo(CX, headY - 23, 124, headY - 20);
  ctx.stroke();

  // ── BEARD ──
  const bS = (archetype.beardScale || 1);
  ctx.save();
  ctx.translate(CX, headY + 15);
  ctx.scale(bS, bS);
  ctx.translate(-CX, -(headY + 15));

  strokeShape(() => {
    if (visual.beardStyle === 0) {
      ctx.moveTo(78, headY + 15);
      ctx.lineTo(CX, headY + 100);
      ctx.lineTo(142, headY + 15);
      ctx.closePath();
    } else if (visual.beardStyle === 1) {
      ctx.moveTo(76, headY + 14);
      ctx.lineTo(92, headY + 88);
      ctx.lineTo(CX, headY + 58);
      ctx.lineTo(128, headY + 88);
      ctx.lineTo(144, headY + 14);
      ctx.closePath();
    } else {
      ctx.moveTo(74, headY + 15);
      ctx.quadraticCurveTo(CX, headY + 108, 146, headY + 15);
      ctx.closePath();
    }
  }, beardColor, outline, 4);

  // beard strand texture
  ctx.strokeStyle = darken(visual.beard, 25);
  ctx.lineWidth = 1.2;
  ctx.globalAlpha = 0.5;
  const beardBot = visual.beardStyle === 1 ? headY + 75 : headY + 88;
  for (let i = 0; i < 12; i++) {
    const bx = 84 + i * 4.5;
    ctx.beginPath();
    ctx.moveTo(bx, headY + 18);
    ctx.quadraticCurveTo(bx + (i % 2 ? 3 : -3), (headY + 18 + beardBot) / 2, bx + (i % 3 - 1) * 2, beardBot - 6);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  // beard highlight
  ctx.save();
  ctx.globalCompositeOperation = "overlay";
  ctx.fillStyle = "rgba(255,255,240,0.06)";
  ctx.beginPath();
  ctx.ellipse(CX - 6, headY + 28, 16, 10, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // ── HAT ──
  if (archetype.hatStyle === "none") {
    // bald head ridge
    ctx.strokeStyle = outline;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(80, headY - 6);
    ctx.quadraticCurveTo(CX, headY - 34, 140, headY - 6);
    ctx.stroke();
  } else if (archetype.hatStyle === "cap") {
    const capGrad = ctx.createLinearGradient(CX, 30, CX, headY + 2);
    capGrad.addColorStop(0, hatColor);
    capGrad.addColorStop(1, darken(visual.hat, 35));
    strokeShape(() => {
      ctx.moveTo(74, headY + 2);
      ctx.quadraticCurveTo(CX, 26, 146, headY + 2);
      ctx.lineTo(146, headY + 12);
      ctx.lineTo(74, headY + 12);
      ctx.closePath();
    }, capGrad, outline, 4);
    // cap brim
    strokeShape(() => { roundRect(72, headY + 8, 76, 12, 6); }, hatColor, outline, 3);
    // cap wear lines
    ctx.strokeStyle = "rgba(0,0,0,0.1)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(82, headY - 10); ctx.quadraticCurveTo(CX, headY - 16, 138, headY - 10); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(86, headY - 2); ctx.quadraticCurveTo(CX, headY - 8, 134, headY - 2); ctx.stroke();
  } else if (archetype.hatStyle === "point") {
    const hatGrad = ctx.createLinearGradient(CX, 8 + visual.hatBend, CX, headY + 18);
    hatGrad.addColorStop(0, hatColor);
    hatGrad.addColorStop(1, darken(visual.hat, 40));
    strokeShape(() => {
      ctx.moveTo(68, headY + 12);
      ctx.lineTo(CX, 8 + visual.hatBend);
      ctx.lineTo(150, headY + 14);
      ctx.lineTo(124, headY + 30);
      ctx.lineTo(94, headY + 30);
      ctx.closePath();
    }, hatGrad, outline, 4);
    // hat crease lines
    ctx.strokeStyle = "rgba(200,180,150,0.3)";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(90, headY - 10); ctx.lineTo(100, headY + 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(CX, headY - 26); ctx.lineTo(118, headY - 8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(126, headY); ctx.lineTo(136, headY + 12); ctx.stroke();
  } else if (archetype.hatStyle === "hood") {
    const hoodGrad = ctx.createLinearGradient(CX, 20, CX, headY + 24);
    hoodGrad.addColorStop(0, hatColor);
    hoodGrad.addColorStop(1, darken(visual.hat, 50));
    strokeShape(() => {
      ctx.moveTo(64, headY + 16);
      ctx.quadraticCurveTo(CX, 16, 156, headY + 16);
      ctx.lineTo(148, headY + 32);
      ctx.quadraticCurveTo(CX, headY + 22, 72, headY + 32);
      ctx.closePath();
    }, hoodGrad, outline, 4);
    // hood shadow inside
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.beginPath();
    ctx.moveTo(74, headY + 20);
    ctx.quadraticCurveTo(CX, headY + 8, 146, headY + 20);
    ctx.lineTo(146, headY + 30);
    ctx.quadraticCurveTo(CX, headY + 20, 74, headY + 30);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // ── BROWS ──
  ctx.strokeStyle = "#1a0a08";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(90, headY - 10);
  ctx.lineTo(105, headY - 14 - browAngle);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(115, headY - 14 - browAngle);
  ctx.lineTo(130, headY - 10);
  ctx.stroke();

  // ── EYES ──
  // dark sockets
  ctx.fillStyle = "rgba(20,8,4,0.3)";
  ctx.beginPath(); ctx.ellipse(98, headY - 1, 9, 7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(122, headY - 1, 9, 7, 0, 0, Math.PI * 2); ctx.fill();
  // eyeballs
  ctx.fillStyle = "#1a0a06";
  ctx.beginPath(); ctx.arc(98, headY - 1, 5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(122, headY - 1, 5, 0, Math.PI * 2); ctx.fill();
  // iris
  ctx.fillStyle = "#4a1510";
  ctx.beginPath(); ctx.arc(97, headY - 2, 2.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(121, headY - 2, 2.2, 0, Math.PI * 2); ctx.fill();
  // specular
  ctx.fillStyle = "rgba(255,200,160,0.55)";
  ctx.beginPath(); ctx.arc(96.2, headY - 3, 1, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(120.2, headY - 3, 1, 0, Math.PI * 2); ctx.fill();
  // angry squint lines (upper lid)
  ctx.strokeStyle = skinDark;
  ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(90, headY - 2); ctx.quadraticCurveTo(98, headY - 7, 106, headY - 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(114, headY - 2); ctx.quadraticCurveTo(122, headY - 7, 130, headY - 2); ctx.stroke();

  // eye bags
  if (visual.eyeBag >= 1) {
    ctx.strokeStyle = "rgba(80,40,30,0.4)";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(90, headY + 6); ctx.quadraticCurveTo(98, headY + 12, 106, headY + 5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(114, headY + 5); ctx.quadraticCurveTo(122, headY + 12, 130, headY + 6); ctx.stroke();
  }
  if (visual.eyeBag >= 2) {
    ctx.strokeStyle = "rgba(60,25,18,0.3)";
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(92, headY + 9); ctx.quadraticCurveTo(98, headY + 14, 104, headY + 8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(116, headY + 8); ctx.quadraticCurveTo(122, headY + 14, 128, headY + 9); ctx.stroke();
  }

  // ── NOSE ──
  const nS = visual.noseScale;
  const noseGrad = ctx.createRadialGradient(CX + 2, headY + 8, 2, CX + 2, headY + 8, 10 * nS);
  noseGrad.addColorStop(0, "#c47060");
  noseGrad.addColorStop(0.5, "#a06050");
  noseGrad.addColorStop(1, skinDark);
  strokeShape(() => {
    ctx.moveTo(CX, headY - 4);
    ctx.quadraticCurveTo(CX + 8 * nS, headY + 2, 114 + nS * 9, headY + 10);
    ctx.quadraticCurveTo(CX + 4, headY + 16 * nS, 103, headY + 13);
    ctx.quadraticCurveTo(CX - 4, headY + 6, CX, headY - 4);
  }, noseGrad, outline, 3);
  // nostril
  ctx.fillStyle = "#3a1510";
  ctx.beginPath(); ctx.ellipse(CX + 1, headY + 10, 2.5, 1.5, 0.2, 0, Math.PI * 2); ctx.fill();
  // nose redness
  ctx.save();
  ctx.globalCompositeOperation = "overlay";
  ctx.fillStyle = "rgba(200,80,60,0.2)";
  ctx.beginPath(); ctx.ellipse(CX + 2, headY + 7, 6 * nS, 5 * nS, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // nose blood drip
  if (g1 > 0.5) {
    ctx.strokeStyle = hexToRgba(visual.blood, 0.55);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(CX + 3, headY + 11);
    ctx.quadraticCurveTo(CX + 5, headY + 18, CX + 1, headY + 23);
    ctx.stroke();
  }

  // ── MOUTH ──
  const mouthY = headY + 21;
  ctx.fillStyle = "#3a1810";
  ctx.beginPath();
  ctx.ellipse(CX + 1, mouthY + 1, 9, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  if (visual.toothMode === 0) {
    // snarl - uneven line
    ctx.strokeStyle = "#1a0a08";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(95, mouthY);
    ctx.lineTo(107, mouthY + 5);
    ctx.lineTo(115, mouthY + 4);
    ctx.lineTo(125, mouthY - 1);
    ctx.stroke();
    // two visible teeth
    ctx.fillStyle = "#e0d8b8";
    ctx.fillRect(99, mouthY, 5, 5);
    ctx.fillStyle = "#d8ccb0";
    ctx.fillRect(116, mouthY - 1, 5, 5);
    ctx.strokeStyle = "#8a7a60"; ctx.lineWidth = 0.8;
    ctx.strokeRect(99, mouthY, 5, 5);
    ctx.strokeRect(116, mouthY - 1, 5, 5);
  } else if (visual.toothMode === 1) {
    // teeth row
    ctx.strokeStyle = "#1a0a08";
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(94, mouthY + 1); ctx.lineTo(126, mouthY + 1); ctx.stroke();
    const teeth = [[97, 5, 7], [104, 5, 6], [113, 5, 7], [120, 5, 6]];
    teeth.forEach(([tx, tw, th]) => {
      ctx.fillStyle = (tw === 5 && th === 6) ? "#d0c4a0" : "#e0d8b8";
      ctx.fillRect(tx, mouthY + 1, tw, th);
      ctx.strokeStyle = "#8a7a60"; ctx.lineWidth = 0.7;
      ctx.strokeRect(tx, mouthY + 1, tw, th);
    });
  } else {
    // open snarl
    ctx.strokeStyle = "#1a0a08";
    ctx.lineWidth = 3.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(94, mouthY + 1);
    ctx.quadraticCurveTo(CX, mouthY + 14, 126, mouthY - 1);
    ctx.stroke();
    // crooked teeth
    ctx.save();
    ctx.translate(100, mouthY + 2);
    ctx.rotate(0.09);
    ctx.fillStyle = "#e0d8b8"; ctx.fillRect(0, 0, 4, 5);
    ctx.strokeStyle = "#8a7a60"; ctx.lineWidth = 0.7; ctx.strokeRect(0, 0, 4, 5);
    ctx.restore();
    ctx.save();
    ctx.translate(116, mouthY + 1);
    ctx.rotate(-0.09);
    ctx.fillStyle = "#e0d8b8"; ctx.fillRect(0, 0, 4, 5);
    ctx.strokeStyle = "#8a7a60"; ctx.lineWidth = 0.7; ctx.strokeRect(0, 0, 4, 5);
    ctx.restore();
  }

  // ── SCARS ──
  if (visual.scar >= 1) {
    ctx.strokeStyle = "rgba(106,26,20,0.65)";
    ctx.lineWidth = 2.8;
    ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(120, headY - 20); ctx.lineTo(130, headY + 10); ctx.stroke();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(94,21,16,0.45)";
    ctx.beginPath(); ctx.moveTo(92, headY + 4); ctx.lineTo(86, headY + 18); ctx.stroke();
    // scar tissue highlight
    ctx.strokeStyle = "rgba(220,200,190,0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(121, headY - 19); ctx.lineTo(131, headY + 9); ctx.stroke();
  }
  if (visual.scar >= 2) {
    ctx.strokeStyle = "rgba(216,200,184,0.5)";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(118, headY - 22); ctx.lineTo(132, headY + 12); ctx.stroke();
    ctx.strokeStyle = "rgba(208,192,176,0.4)";
    ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(124, headY - 8); ctx.lineTo(134, headY + 4); ctx.stroke();
    ctx.strokeStyle = "rgba(106,26,20,0.45)";
    ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(88, headY + 2); ctx.lineTo(80, headY + 16); ctx.stroke();
  }

  // ── STUBBLE TEXTURE on face ──
  ctx.fillStyle = "rgba(30,15,10,0.08)";
  for (let i = 0; i < 30; i++) {
    const sx = 88 + (g1 * 17 + i * 1.4) % 44;
    const sy = headY + 8 + (g2 * 13 + i * 1.7) % 18;
    ctx.beginPath();
    ctx.arc(sx, sy, 0.6 + (i % 3) * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── WEAPON ──
  const wx = 152, wy = 120;
  ctx.lineCap = "butt";
  ctx.lineJoin = "miter";

  function drawHandle(x, y, h) {
    strokeShape(() => { roundRect(x - 6, y, 12, h, 5); }, "#5d4130", outline, 3);
    // wood grain
    ctx.strokeStyle = "rgba(90,60,35,0.3)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(x - 3 + i * 2.5, y + 4);
      ctx.lineTo(x - 3 + i * 2.5, y + h - 4);
      ctx.stroke();
    }
  }

  if (weaponType === "pan") {
    drawHandle(wx, wy + 10, 58);
    const panGrad = ctx.createRadialGradient(wx + 2, wy - 2, 3, wx + 2, wy, 18);
    panGrad.addColorStop(0, "#5a6070");
    panGrad.addColorStop(1, "#7d8794");
    strokeShape(() => { ctx.arc(wx + 2, wy, 18, 0, Math.PI * 2); }, panGrad, outline, 3);
    ctx.fillStyle = "#3a404a";
    ctx.beginPath(); ctx.arc(wx + 2, wy, 11, 0, Math.PI * 2); ctx.fill();
    // dents
    ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(wx - 4, wy - 6, 4, 0.5, 2); ctx.stroke();
  } else if (weaponType === "axe") {
    drawHandle(wx, wy + 10, 58);
    const axeGrad = ctx.createLinearGradient(wx, wy - 8, wx + 30, wy + 8);
    axeGrad.addColorStop(0, "#c0c8d4");
    axeGrad.addColorStop(1, "#8a94a4");
    strokeShape(() => {
      ctx.moveTo(wx + 2, wy - 10);
      ctx.lineTo(wx + 32, wy + 4);
      ctx.lineTo(wx + 2, wy + 20);
      ctx.closePath();
    }, axeGrad, outline, 3);
    // edge highlight
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(wx + 28, wy + 2); ctx.lineTo(wx + 4, wy + 18); ctx.stroke();
    // blood on blade
    ctx.strokeStyle = hexToRgba(visual.blood, 0.3);
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(wx + 20, wy); ctx.lineTo(wx + 16, wy + 14); ctx.stroke();
  } else if (weaponType === "shovel") {
    drawHandle(wx, wy + 6, 62);
    strokeShape(() => {
      ctx.moveTo(wx - 2, wy);
      ctx.quadraticCurveTo(wx + 2, wy - 18, wx + 16, wy - 4);
      ctx.lineTo(wx + 16, wy + 24);
      ctx.quadraticCurveTo(wx + 2, wy + 36, wx - 12, wy + 24);
      ctx.lineTo(wx - 12, wy - 4);
      ctx.quadraticCurveTo(wx - 6, wy - 12, wx - 2, wy);
    }, "#a0aab8", outline, 3);
    // dirt on shovel
    ctx.fillStyle = "rgba(80,55,30,0.3)";
    ctx.beginPath(); ctx.ellipse(wx + 2, wy + 18, 8, 5, 0, 0, Math.PI * 2); ctx.fill();
  } else if (weaponType === "wrench") {
    drawHandle(wx, wy + 10, 58);
    strokeShape(() => {
      ctx.moveTo(wx - 6, wy - 10);
      ctx.lineTo(wx + 14, wy - 16);
      ctx.lineTo(wx + 28, wy - 2);
      ctx.lineTo(wx + 10, wy + 8);
      ctx.lineTo(wx + 22, wy + 20);
      ctx.lineTo(wx + 4, wy + 30);
      ctx.lineTo(wx - 12, wy + 10);
      ctx.lineTo(wx - 2, wy + 2);
      ctx.closePath();
    }, "#a4aeba", outline, 3);
  } else if (weaponType === "chair") {
    drawHandle(wx, wy + 6, 62);
    strokeShape(() => {
      ctx.moveTo(wx - 10, wy - 12);
      ctx.lineTo(wx + 24, wy - 12);
      ctx.lineTo(wx + 24, wy + 10);
      ctx.lineTo(wx - 10, wy + 10);
      ctx.closePath();
    }, "#7a5436", outline, 3.5);
    // chair legs dangling
    ctx.strokeStyle = "#6a4830";
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(wx - 6, wy + 10); ctx.lineTo(wx - 2, wy + 48); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(wx + 20, wy + 10); ctx.lineTo(wx + 16, wy + 48); ctx.stroke();
    ctx.strokeStyle = outline; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(wx - 6, wy + 10); ctx.lineTo(wx - 2, wy + 48); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(wx + 20, wy + 10); ctx.lineTo(wx + 16, wy + 48); ctx.stroke();
  } else if (weaponType === "knife") {
    drawHandle(wx, wy + 10, 58);
    const knifeGrad = ctx.createLinearGradient(wx, wy - 12, wx + 24, wy + 4);
    knifeGrad.addColorStop(0, "#e8eef6");
    knifeGrad.addColorStop(1, "#b0baca");
    strokeShape(() => {
      ctx.moveTo(wx + 2, wy - 12);
      ctx.lineTo(wx + 24, wy + 4);
      ctx.lineTo(wx + 2, wy + 12);
      ctx.closePath();
    }, knifeGrad, outline, 3);
    // blood on knife
    ctx.strokeStyle = hexToRgba(visual.blood, 0.45);
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(wx + 14, wy - 4); ctx.lineTo(wx + 8, wy + 8); ctx.stroke();
  } else if (weaponType === "hammer") {
    drawHandle(wx, wy + 10, 58);
    const hammerGrad = ctx.createLinearGradient(wx - 14, wy - 6, wx + 20, wy + 10);
    hammerGrad.addColorStop(0, "#a0aab8");
    hammerGrad.addColorStop(1, "#78828e");
    strokeShape(() => { roundRect(wx - 14, wy - 6, 34, 18, 4); }, hammerGrad, outline, 3);
    // hammer face dent
    ctx.strokeStyle = "rgba(0,0,0,0.12)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(wx + 14, wy + 3, 3, 0, Math.PI * 2); ctx.stroke();
  } else if (weaponType === "bat") {
    strokeShape(() => { roundRect(wx - 9, wy, 18, 70, 8); }, "#9a6a40", outline, 3);
    // bat grain
    ctx.strokeStyle = "rgba(60,35,15,0.2)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(wx - 5 + i * 3, wy + 6);
      ctx.lineTo(wx - 5 + i * 3, wy + 62);
      ctx.stroke();
    }
    // tape at bottom
    ctx.fillStyle = "#d8c8a0";
    strokeShape(() => { roundRect(wx - 5, wy + 62, 10, 8, 4); }, "#d8c8a0", null, 0);
    // dent marks
    ctx.fillStyle = "rgba(0,0,0,0.1)";
    ctx.beginPath(); ctx.ellipse(wx + 4, wy + 18, 3, 5, 0.3, 0, Math.PI * 2); ctx.fill();
  } else if (weaponType === "chain") {
    // chain links
    ctx.strokeStyle = "#a0a8b4";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    const links = [
      [wx - 2, wy - 2, wx + 24, wy + 2],
      [wx + 20, wy, wx + 14, wy + 24],
      [wx + 16, wy + 20, wx - 4, wy + 26],
      [wx - 2, wy + 22, wx + 6, wy + 44],
    ];
    links.forEach(([x1, y1, x2, y2]) => {
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      // link circle
      ctx.beginPath(); ctx.arc((x1 + x2) / 2, (y1 + y2) / 2, 6, 0, Math.PI * 2);
      ctx.strokeStyle = "#8a929e"; ctx.lineWidth = 4; ctx.stroke();
      ctx.strokeStyle = "#a0a8b4"; ctx.lineWidth = 6;
    });
    // handle
    drawHandle(wx, wy + 46, 24);
    // metallic highlight
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(wx + 10, wy); ctx.lineTo(wx + 18, wy + 8); ctx.stroke();
  } else if (weaponType === "mug") {
    drawHandle(wx, wy + 10, 58);
    const mugGrad = ctx.createLinearGradient(wx - 8, wy - 10, wx + 20, wy + 24);
    mugGrad.addColorStop(0, "#a87a40");
    mugGrad.addColorStop(1, "#7a5428");
    strokeShape(() => { roundRect(wx - 8, wy - 10, 28, 34, 5); }, mugGrad, outline, 3);
    // handle
    ctx.strokeStyle = "#d8c490";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(wx + 20, wy - 4);
    ctx.quadraticCurveTo(wx + 32, wy - 4, wx + 32, wy + 8);
    ctx.quadraticCurveTo(wx + 32, wy + 20, wx + 20, wy + 20);
    ctx.stroke();
    ctx.strokeStyle = outline; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(wx + 20, wy - 4);
    ctx.quadraticCurveTo(wx + 32, wy - 4, wx + 32, wy + 8);
    ctx.quadraticCurveTo(wx + 32, wy + 20, wx + 20, wy + 20);
    ctx.stroke();
    // foam
    ctx.fillStyle = "#efe0b0";
    strokeShape(() => { roundRect(wx - 6, wy - 12, 24, 8, 3); }, "#efe0b0", null, 0);
    // foam drip
    ctx.fillStyle = "#e8d8a8";
    ctx.beginPath(); ctx.ellipse(wx + 14, wy - 4, 3, 4, 0, 0, Math.PI * 2); ctx.fill();
  }

  // ── BADGE ──
  if (visual.badge) {
    const badgeGrad = ctx.createRadialGradient(124, bodyBot - 22, 1, 124, bodyBot - 22, 7);
    badgeGrad.addColorStop(0, "#e0c040");
    badgeGrad.addColorStop(1, "#a08020");
    strokeShape(() => { ctx.arc(124, bodyBot - 22, 7, 0, Math.PI * 2); }, badgeGrad, "#3a1a10", 2);
  }

  // ── BLOOD SPLATTERS (over everything) ──
  ctx.fillStyle = hexToRgba(visual.blood, 0.3 + g1 * 0.3);
  ctx.beginPath(); ctx.arc(55 + g1 * 30, 145 + g2 * 30, 4 + g3 * 6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = hexToRgba(visual.blood, 0.25 + g2 * 0.25);
  ctx.beginPath(); ctx.arc(145 + g2 * 20, 50 + g3 * 40, 3 + g1 * 5, 0, Math.PI * 2); ctx.fill();
  // blood drip
  ctx.strokeStyle = hexToRgba(visual.blood, 0.3 + g3 * 0.3);
  ctx.lineWidth = 2 + g3 * 2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(148 + g3 * 15, 155 + g1 * 20);
  ctx.quadraticCurveTo(151 + g3 * 15 + g2 * 4, 160 + g1 * 20 + g3 * 8, 146 + g3 * 15 + g1 * 6, 165 + g1 * 20 + g2 * 8);
  ctx.stroke();
  // blood ellipse
  ctx.fillStyle = hexToRgba(visual.blood, 0.2 + g2 * 0.2);
  ctx.beginPath(); ctx.ellipse(50 + g2 * 25, 170 + g1 * 15, 3 + g3 * 5, 2 + g1 * 3, 0, 0, Math.PI * 2); ctx.fill();

  // ── GRIME OVERLAYS ──
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  const grimeX1 = 60 + g1 * 100, grimeY1 = 50 + g1 * 60;
  const grimeX2 = 40 + g2 * 120, grimeY2 = 130 + g2 * 50;
  const grimeX3 = 70 + g3 * 80, grimeY3 = 100 + g3 * 40;
  ctx.fillStyle = `rgba(40,25,15,${0.1 + g1 * 0.15})`;
  ctx.beginPath(); ctx.ellipse(grimeX1, grimeY1, 8 + g2 * 12, 5 + g1 * 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = `rgba(50,30,10,${0.08 + g2 * 0.12})`;
  ctx.beginPath(); ctx.ellipse(grimeX2, grimeY2, 6 + g3 * 10, 4 + g2 * 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = `rgba(35,20,10,${0.09 + g3 * 0.12})`;
  ctx.beginPath(); ctx.ellipse(grimeX3, grimeY3, 5 + g1 * 8, 3 + g3 * 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // ── NOISE / GRAIN TEXTURE ──
  ctx.save();
  ctx.globalCompositeOperation = "overlay";
  ctx.globalAlpha = 0.04;
  for (let ny = 0; ny < H; ny += 4) {
    for (let nx = 0; nx < W; nx += 4) {
      const v = ((nx * 13 + ny * 7 + g1 * 255) % 255);
      ctx.fillStyle = `rgb(${v},${v},${v})`;
      ctx.fillRect(nx, ny, 4, 4);
    }
  }
  ctx.restore();

  // ── VIGNETTE ──
  const vigGrad = ctx.createRadialGradient(CX, CY, 50, CX, CY, 115);
  vigGrad.addColorStop(0, "rgba(0,0,0,0)");
  vigGrad.addColorStop(0.7, "rgba(0,0,0,0)");
  vigGrad.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = vigGrad;
  ctx.fillRect(0, 0, W, H);

  ctx.restore(); // end circular clip

  // ── FRAME ──
  // dark ring
  ctx.strokeStyle = "#0a0604";
  ctx.lineWidth = 7;
  ctx.beginPath(); ctx.arc(CX, CY, 98, 0, Math.PI * 2); ctx.stroke();

  if (championMode) {
    // gold champion ring
    ctx.strokeStyle = "rgba(255,160,20,0.55)";
    ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(CX, CY, 98, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = "rgba(255,100,20,0.2)";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(CX, CY, 94, 0, Math.PI * 2); ctx.stroke();
    // golden glow
    ctx.save();
    ctx.shadowBlur = 12;
    ctx.shadowColor = "rgba(255,140,20,0.3)";
    ctx.strokeStyle = "rgba(255,160,40,0.25)";
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(CX, CY, 100, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  } else {
    ctx.strokeStyle = "rgba(160,40,20,0.35)";
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(CX, CY, 98, 0, Math.PI * 2); ctx.stroke();
  }

  // mask corners outside circle
  ctx.save();
  ctx.globalCompositeOperation = "destination-in";
  ctx.beginPath();
  ctx.arc(CX, CY, 102, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  return `<img src="${canvas.toDataURL()}" width="220" height="220" style="width:100%;height:auto;" alt="" aria-hidden="true">`;
}
*/

// ── VICTORY OVERLAY ───────────────────────────────────────

function showVictoryOverlay(winner) {
  state.victory.visible = true;
  dom.victoryWinner.textContent = winner.personName;
  dom.victoryAlias.textContent = winner.alias;
  dom.victoryTagline.textContent = `${winner.weapon.name} • ${winner.eliminations} knockouts • pure trash fantasy authority`;
  dom.victoryOverlay.classList.add("is-visible");
  dom.victoryOverlay.setAttribute("aria-hidden", "false");
}

function hideVictoryOverlay() {
  state.victory.visible = false;
  dom.victoryOverlay.classList.remove("is-visible");
  dom.victoryOverlay.setAttribute("aria-hidden", "true");
}

// ── CELEBRATION / FIREWORKS ───────────────────────────────

function maybeCelebrate(now) {
  if (!state.victory.visible || !state.champion) return;
  if (now - state.battle.finishedAt > 6200) return;
  if (now - state.battle.lastFireworkAt < 320) return;

  state.battle.lastFireworkAt = now;
  spawnFireworkBurst(randomRange(190, 810), randomRange(80, 260));
  playFireworkSound();
  state.arena.intensity = Math.min(1, state.arena.intensity + 0.16);
  renderArenaHud();
}

function spawnFireworkBurst(x, y) {
  const colors = ["rgba(255,190,47,0.96)", "rgba(255,50,30,0.96)", "rgba(107,230,255,0.96)", "rgba(255,245,220,0.96)"];

  state.particles.push({
    kind: "ring",
    x,
    y,
    vx: 0,
    vy: 0,
    life: 0.9,
    maxLife: 0.9,
    color: pick(colors),
    size: randomRange(22, 34),
  });

  for (let index = 0; index < 20; index += 1) {
    const angle = (Math.PI * 2 * index) / 20 + Math.random() * 0.18;
    const speed = randomRange(72, 180);
    state.particles.push({
      kind: "spark",
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: randomRange(0.42, 0.78),
      maxLife: 0.78,
      color: pick(colors),
      size: randomRange(3.2, 6.2),
    });
  }
}

// ── AUDIO ─────────────────────────────────────────────────

async function ensureAudioReady() {
  if (!state.sound.enabled) return null;

  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) return null;

  if (!state.sound.context) {
    state.sound.context = new AudioCtor();
    state.sound.master = state.sound.context.createGain();
    state.sound.master.gain.value = 0.14;
    state.sound.master.connect(state.sound.context.destination);
  }

  if (state.sound.context.state === "suspended") {
    await state.sound.context.resume();
  }

  return state.sound.context;
}

function playBellSound(strength = 0.5) {
  const context = state.sound.context;
  if (!context || !state.sound.enabled) return;

  const time = context.currentTime;
  playTone(time, 620, 220, 0.34, "triangle", 0.2 * strength);
  playTone(time + 0.04, 930, 310, 0.28, "sine", 0.12 * strength);
}

function playImpactSound(isCrit) {
  const context = state.sound.context;
  if (!context || !state.sound.enabled) return;

  const time = context.currentTime;
  playTone(time, isCrit ? 220 : 180, 72, isCrit ? 0.18 : 0.11, "square", isCrit ? 0.1 : 0.07);
  playNoiseBurst(time, isCrit ? 0.22 : 0.12, isCrit ? 0.1 : 0.06, isCrit ? 2200 : 1400);
  if (isCrit) {
    playTone(time, 80, 35, 0.25, "sine", 0.15);
  }
}

function playKoSound() {
  const context = state.sound.context;
  if (!context || !state.sound.enabled) return;

  const time = context.currentTime;
  playTone(time, 170, 38, 0.5, "sawtooth", 0.18);
  playTone(time, 90, 30, 0.4, "sine", 0.2);
  playNoiseBurst(time + 0.02, 0.35, 0.12, 880);
}

function playWinSound() {
  const context = state.sound.context;
  if (!context || !state.sound.enabled) return;

  const time = context.currentTime;
  playTone(time, 392, 392, 0.22, "triangle", 0.1);
  playTone(time + 0.12, 523.25, 523.25, 0.26, "triangle", 0.12);
  playTone(time + 0.26, 659.25, 659.25, 0.42, "triangle", 0.13);
}

function playFireworkSound() {
  const context = state.sound.context;
  if (!context || !state.sound.enabled) return;

  const time = context.currentTime;
  playTone(time, randomRange(480, 820), randomRange(140, 240), 0.18, "triangle", 0.06);
  playNoiseBurst(time + 0.03, 0.2, 0.04, randomRange(1800, 2600));
}

function playWallHitSound() {
  const context = state.sound.context;
  if (!context || !state.sound.enabled) return;

  const time = context.currentTime;
  playTone(time, 140, 60, 0.15, "square", 0.08);
  playNoiseBurst(time, 0.12, 0.06, 1600);
}

function playTone(startTime, startFreq, endFreq, duration, type, gainValue) {
  const context = state.sound.context;
  if (!context || !state.sound.master) return;

  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(startFreq, startTime);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(30, endFreq), startTime + duration);
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, gainValue), startTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  oscillator.connect(gain);
  gain.connect(state.sound.master);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.02);
}

function playNoiseBurst(startTime, duration, gainValue, filterFreq) {
  const context = state.sound.context;
  if (!context || !state.sound.master) return;

  const buffer = context.createBuffer(1, Math.max(1, Math.floor(context.sampleRate * duration)), context.sampleRate);
  const channel = buffer.getChannelData(0);
  for (let index = 0; index < channel.length; index += 1) {
    channel[index] = (Math.random() * 2 - 1) * (1 - index / channel.length);
  }

  const source = context.createBufferSource();
  source.buffer = buffer;
  const filter = context.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(filterFreq, startTime);
  const gain = context.createGain();
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, gainValue), startTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(state.sound.master);
  source.start(startTime);
  source.stop(startTime + duration + 0.03);
}

// ── UTILITIES ─────────────────────────────────────────────

function createRegularPolygon(centerX, centerY, radius, sides, rotation) {
  const points = [];
  for (let index = 0; index < sides; index += 1) {
    const angle = rotation + (Math.PI * 2 * index) / sides;
    points.push({
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
    });
  }
  return points;
}

function parseNames(rawValue) {
  return String(rawValue)
    .split(/[\n,]+/g)
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, MAX_PARTICIPANTS);
}

function loadRoster() {
  try {
    const raw = window.localStorage.getItem(STORAGE_ROSTER);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRoster() {
  window.localStorage.setItem(STORAGE_ROSTER, JSON.stringify(state.participants));
}

function loadChampion() {
  try {
    const raw = window.localStorage.getItem(STORAGE_CHAMPION);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveChampion() {
  window.localStorage.setItem(STORAGE_CHAMPION, JSON.stringify(state.champion));
}

function createSeed() {
  return Math.floor(Math.random() * 1000000000);
}

function hashString(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createSeededRandom(seed) {
  let current = seed >>> 0;
  return () => {
    current += 0x6d2b79f5;
    let value = current;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function seededPick(rng, collection) {
  return collection[Math.floor(rng() * collection.length)];
}

function seededInt(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function createId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return `dwarf-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function pick(collection, notThis) {
  if (!Array.isArray(collection) || collection.length === 0) return null;
  if (collection.length === 1) return collection[0];

  let value = collection[randomInt(0, collection.length - 1)];
  while (value === notThis) {
    value = collection[randomInt(0, collection.length - 1)];
  }
  return value;
}

function template(text, values) {
  return text.replace(/\{(.*?)\}/g, (_, key) => values[key] ?? "");
}

function shuffle(input) {
  const array = [...input];
  for (let index = array.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(0, index);
    [array[index], array[swapIndex]] = [array[swapIndex], array[index]];
  }
  return array;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// ── INIT CALL ─────────────────────────────────────────────

init();
