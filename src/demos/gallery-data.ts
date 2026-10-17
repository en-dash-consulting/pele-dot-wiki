// One example per diagram type. "mermaid-docs" examples come from Mermaid's documentation (MIT), via Pele's test corpus.
export const GALLERY = [
 {
  "type": "flowchart",
  "name": "Flowchart",
  "key": "flowchart",
  "src": "flowchart LR\n  Text[Mermaid text] --> Parse[Parse]\n  Parse --> Layout{Fits?}\n  Layout -- yes --> SVG([SVG])\n  Layout -- no --> Flip[Run top-to-bottom]\n  Flip --> SVG",
  "from": "pele.wiki"
 },
 {
  "type": "sequence",
  "name": "Sequence",
  "key": "sequenceDiagram",
  "src": "sequenceDiagram\n  participant R as Rider\n  participant G as Gate\n  participant S as Server\n  R->>G: Tap card\n  G->>S: Check balance\n  S-->>G: OK, $2.90 fare\n  G-->>R: Gate opens",
  "from": "pele.wiki"
 },
 {
  "type": "class",
  "name": "Class",
  "key": "classDiagram",
  "src": "classDiagram\n  class Line {\n    +String name\n    +String colour\n    +stops() Station[]\n  }\n  class Station {\n    +String name\n    +bool interchange\n  }\n  class Train {\n    +int capacity\n    +depart()\n  }\n  Line \"1\" --> \"*\" Station : serves\n  Line \"1\" --> \"*\" Train : runs",
  "from": "pele.wiki"
 },
 {
  "type": "state",
  "name": "State",
  "key": "stateDiagram-v2",
  "src": "stateDiagram-v2\n  [*] --> Waiting\n  Waiting --> Boarding: train arrives\n  Boarding --> Moving: doors close\n  Moving --> Waiting: next station\n  Moving --> [*]: end of line",
  "from": "pele.wiki"
 },
 {
  "type": "er",
  "name": "Entity relationship",
  "key": "erDiagram",
  "src": "erDiagram\n  RIDER ||--o{ TRIP : takes\n  TRIP }o--|| STATION : starts_at\n  TRIP }o--|| STATION : ends_at\n  LINE ||--|{ STATION : serves",
  "from": "pele.wiki"
 },
 {
  "type": "gantt",
  "name": "Gantt",
  "key": "gantt",
  "src": "gantt\n  title New line opening\n  dateFormat YYYY-MM-DD\n  section Build\n    Dig tunnel :a1, 2026-01-05, 60d\n    Lay track :after a1, 30d\n  section Open\n    Test runs :2026-04-10, 14d\n    Opening day :milestone, 2026-04-30, 0d",
  "from": "pele.wiki"
 },
 {
  "type": "pie",
  "name": "Pie",
  "key": "pie",
  "src": "pie title Morning riders by line\n  \"Red\" : 42\n  \"Green\" : 31\n  \"Yellow\" : 18\n  \"Blue\" : 9",
  "from": "pele.wiki"
 },
 {
  "type": "gitGraph",
  "name": "Git graph",
  "key": "gitGraph",
  "src": "gitGraph\n  commit id: \"start\"\n  branch theme\n  checkout theme\n  commit id: \"css vars\"\n  checkout main\n  commit id: \"fix\"\n  merge theme\n  commit id: \"release\"",
  "from": "pele.wiki"
 },
 {
  "type": "mindmap",
  "name": "Mindmap",
  "key": "mindmap",
  "src": "mindmap\n  root((Pele))\n    Fast\n      Synchronous\n      Tiny bundle\n    Themeable\n      CSS variables\n    Safe\n      No scripts\n      Limits",
  "from": "pele.wiki"
 },
 {
  "type": "timeline",
  "name": "Timeline",
  "key": "timeline",
  "src": "timeline\n  title A diagram's day\n  Morning : Written in a note\n  A millisecond later : Rendered by Pele\n  Lunch : Theme switched to dark\n  Evening : Opened on a phone",
  "from": "pele.wiki"
 },
 {
  "type": "journey",
  "name": "User journey",
  "key": "journey",
  "src": "journey\n  title Morning commute\n  section Home\n    Leave the house: 4: Me\n  section Station\n    Wait on the platform: 2: Me\n    Find a seat: 5: Me\n  section Work\n    Walk to the office: 3: Me",
  "from": "pele.wiki"
 },
 {
  "type": "kanban",
  "name": "Kanban",
  "key": "kanban",
  "src": "kanban\n  todo[To do]\n    a[Write the docs]\n  doing[Doing]\n    b[Theme lab]\n  done[Done]\n    c[Typing race]",
  "from": "pele.wiki"
 },
 {
  "type": "xychart",
  "name": "XY chart",
  "key": "xychart",
  "src": "xychart\n  title \"Riders per hour\"\n  x-axis [6am, 7am, 8am, 9am, 10am]\n  y-axis \"Riders\" 0 --> 9000\n  bar [1200, 5400, 8800, 6100, 2600]\n  line [1200, 5400, 8800, 6100, 2600]",
  "from": "pele.wiki"
 },
 {
  "type": "quadrantChart",
  "name": "Quadrant chart",
  "key": "quadrantChart",
  "src": "quadrantChart\n  title Diagram tools\n  x-axis Hand-drawn --> From text\n  y-axis Slow --> Fast\n  quadrant-1 Text and fast\n  quadrant-2 Drawn and fast\n  quadrant-3 Drawn and slow\n  quadrant-4 Text and slow\n  Pele: [0.85, 0.9]\n  Whiteboard: [0.15, 0.6]",
  "from": "pele.wiki"
 },
 {
  "type": "requirement",
  "name": "Requirement",
  "key": "requirementDiagram",
  "src": "requirementDiagram\n  requirement checkout_req {\n    id: 1\n    text: Orders must be payable online.\n    risk: high\n    verifymethod: test\n  }\n  functionalRequirement payment_req {\n    id: 1.1\n    text: Card payments must be authorised.\n    risk: high\n    verifymethod: test\n  }\n  element checkout_service {\n    type: service\n  }\n  checkout_req - contains -> payment_req\n  checkout_service - satisfies -> payment_req\n",
  "from": "mermaid-docs"
 },
 {
  "type": "c4",
  "name": "C4",
  "key": "C4Context",
  "src": "C4Dynamic\n    title Dynamic diagram for Internet Banking System - API Application\n\n    ContainerDb(c4, \"Database\", \"Relational Database Schema\", \"Stores user registration information, hashed authentication credentials, access logs, etc.\")\n    Container(c1, \"Single-Page Application\", \"JavaScript and Angular\", \"Provides all of the Internet banking functionality to customers via their web browser.\")\n    Container_Boundary(b, \"API Application\") {\n      Component(c3, \"Security Component\", \"Spring Bean\", \"Provides functionality Related to signing in, changing passwords, etc.\")\n      Component(c2, \"Sign In Controller\", \"Spring MVC Rest Controller\", \"Allows users to sign in to the Internet Banking System.\")\n    }\n    Rel(c1, c2, \"Submits credentials to\", \"JSON/HTTPS\")\n    Rel(c2, c3, \"Calls isAuthenticated() on\")\n    Rel(c3, c4, \"select * from users where username = ?\", \"JDBC\")\n\n    UpdateRelStyle(c1, c2, $textColor=\"red\", $offsetY=\"-40\")\n    UpdateRelStyle(c2, c3, $textColor=\"red\", $offsetX=\"-40\", $offsetY=\"60\")\n    UpdateRelStyle(c3, c4, $textColor=\"red\", $offsetY=\"-40\", $offsetX=\"10\")\n\n",
  "from": "mermaid-docs"
 },
 {
  "type": "sankey",
  "name": "Sankey",
  "key": "sankey",
  "src": "sankey\n\nElectricity grid,Heating and cooling - homes,113.726\nElectricity grid,Industry,342.165\nElectricity grid,Losses,56.691\n",
  "from": "mermaid-docs"
 },
 {
  "type": "block",
  "name": "Block",
  "key": "block",
  "src": "block\n  blockArrowId<[\"Label\"]>(right)\n  blockArrowId2<[\"Label\"]>(left)\n  blockArrowId3<[\"Label\"]>(up)\n  blockArrowId4<[\"Label\"]>(down)\n  blockArrowId5<[\"Label\"]>(x)\n  blockArrowId6<[\"Label\"]>(y)\n  blockArrowId7<[\"Label\"]>(x, down)\n",
  "from": "mermaid-docs"
 },
 {
  "type": "packet",
  "name": "Packet",
  "key": "packet",
  "src": "packet\n0-15: \"Source Port\"\n16-31: \"Destination Port\"\n32-63: \"Sequence Number\"\n64-95: \"Acknowledgment Number\"\n96-99: \"Data Offset\"\n100-105: \"Reserved\"\n106: \"URG\"\n107: \"ACK\"\n108: \"PSH\"\n109: \"RST\"\n110: \"SYN\"\n111: \"FIN\"\n112-127: \"Window\"\n128-143: \"Checksum\"\n144-159: \"Urgent Pointer\"\n160-191: \"(Options and Padding)\"\n192-255: \"Data (variable length)\"\n",
  "from": "mermaid-docs"
 },
 {
  "type": "architecture",
  "name": "Architecture",
  "key": "architecture-beta",
  "src": "architecture-beta\n    group api(logos:aws-lambda)[API]\n\n    service db(logos:aws-aurora)[Database] in api\n    service disk1(logos:aws-glacier)[Storage] in api\n    service disk2(logos:aws-s3)[Storage] in api\n    service server(logos:aws-ec2)[Server] in api\n\n    db:L -- R:server\n    disk1:T -- B:server\n    disk2:T -- B:db\n",
  "from": "mermaid-docs"
 },
 {
  "type": "radar",
  "name": "Radar",
  "key": "radar-beta",
  "src": "radar-beta\n  title Restaurant Comparison\n  axis food[\"Food Quality\"], service[\"Service\"], price[\"Price\"]\n  axis ambiance[\"Ambiance\"]\n\n  curve a[\"Restaurant A\"]{4, 3, 2, 4}\n  curve b[\"Restaurant B\"]{3, 4, 3, 3}\n  curve c[\"Restaurant C\"]{2, 3, 4, 2}\n  curve d[\"Restaurant D\"]{2, 2, 4, 3}\n\n  graticule polygon\n  max 5\n\n",
  "from": "mermaid-docs"
 },
 {
  "type": "treemap",
  "name": "Treemap",
  "key": "treemap",
  "src": "treemap-beta\n\"Budget\"\n    \"Operations\"\n        \"Salaries\": 700000\n        \"Equipment\": 200000\n        \"Supplies\": 100000\n    \"Marketing\"\n        \"Advertising\": 400000\n        \"Events\": 100000\n",
  "from": "mermaid-docs"
 },
 {
  "type": "agentflow",
  "name": "Agent flow",
  "key": "agentflow-beta",
  "src": "agentflow-beta TB\n  flow intake[\"Intake\"]\n    receive[\"Receive request\"]@{ shape: input }\n  end\n\n  flow processing[\"Processing\"]\n    validate[\"Validate\"]@{ shape: task }\n    enrich[\"Enrich\"]@{ shape: task }\n    validate --> enrich\n  end\n  processing@{ view: \"collapsed\" }\n\n  flow output[\"Output\"]\n    publish[\"Publish\"]@{ shape: action }\n  end\n\n  receive --> validate\n  enrich --> publish\n",
  "from": "mermaid-docs"
 },
 {
  "type": "usecase",
  "name": "Use case",
  "key": "usecase-beta",
  "src": "usecase-beta\ndirection LR\nactor Customer\nBrowse(\"Browse catalog\")\nCustomer --> Browse\n",
  "from": "mermaid-docs"
 },
 {
  "type": "railroad",
  "name": "Railroad",
  "key": "railroad-beta",
  "src": "railroad-ebnf-beta\ntitle \"Arithmetic Expression Grammar\"\n\nexpression = term ( ( \"+\" | \"-\" ) term )* ;\nterm = factor ( ( \"*\" | \"/\" ) factor )* ;\nfactor = number | \"(\" expression \")\" ;\nnumber = digit+ ;\ndigit = \"0\" | \"1\" | \"2\" | \"3\" | \"4\" | \"5\" | \"6\" | \"7\" | \"8\" | \"9\" ;\n",
  "from": "mermaid-docs"
 },
 {
  "type": "treeView",
  "name": "Tree view",
  "key": "treeView-beta",
  "src": "treeView-beta\n    src/\n        App.tsx\n        utils.ts\n    Dockerfile\n    notes.txt\n    README.md\n",
  "from": "mermaid-docs"
 },
 {
  "type": "venn",
  "name": "Venn",
  "key": "venn-beta",
  "src": "venn-beta\n  title What makes a good feature\n  set Desirable\n  set Feasible\n  set Viable\n  union Desirable,Feasible[\"Buildable\"]\n  union Feasible,Viable[\"Sustainable\"]\n  union Desirable,Viable[\"Marketable\"]\n  union Desirable,Feasible,Viable[\"Ship it\"]\n",
  "from": "mermaid-docs"
 },
 {
  "type": "cynefin",
  "name": "Cynefin",
  "key": "cynefin-beta",
  "src": "cynefin-beta\n  title Strategy Categorization\n\n  complex\n    \"Market research\"\n\n  complicated\n    \"Competitive analysis\"\n\n  clear\n    \"Standard pricing\"\n\n  chaotic\n    \"Crisis management\"\n\n  complex --> complicated : \"Pattern identified\"\n  complicated --> clear : \"Best practice codified\"\n  clear --> chaotic : \"Complacency\"\n  chaotic --> complex : \"Stabilized\"\n",
  "from": "mermaid-docs"
 },
 {
  "type": "wardley",
  "name": "Wardley map",
  "key": "wardley-beta",
  "src": "wardley-beta\ntitle Sourcing Strategy\n\nanchor Customer [0.80, 0.95]\ncomponent Custom App [0.45, 0.85] (build)\ncomponent Off-the-shelf Tool [0.85, 0.65] (buy)\ncomponent Managed Service [0.60, 0.40] (outsource)\ncomponent Cloud Platform [0.95, 0.25] (market)\n\nCustomer -> Custom App\nCustom App -> Off-the-shelf Tool\nCustom App -> Managed Service\nOff-the-shelf Tool -> Cloud Platform\n",
  "from": "mermaid-docs"
 },
 {
  "type": "swimlane",
  "name": "Swimlane",
  "key": "swimlane-beta",
  "src": "swimlane-beta TB\n  subgraph Intake\n    collect[Collect request]\n    validate[Validate details]\n  end\n\n  subgraph Review\n    review[Review request]\n    decide{Ready?}\n  end\n\n  subgraph Delivery\n    schedule[Schedule work]\n    complete[Complete work]\n  end\n\n  collect --> validate --> review --> decide\n  decide -->|Yes| schedule --> complete\n  decide -->|No| collect\n",
  "from": "mermaid-docs"
 },
 {
  "type": "ishikawa",
  "name": "Ishikawa (fishbone)",
  "key": "ishikawa",
  "src": "ishikawa-beta\n    Blurry Photo\n    Process\n        Out of focus\n        Shutter speed too slow\n        Protective film not removed\n        Beautification filter applied\n    User\n        Shaky hands\n    Equipment\n        LENS\n            Inappropriate lens\n            Damaged lens\n            Dirty lens\n        SENSOR\n            Damaged sensor\n            Dirty sensor\n    Environment\n        Subject moved too quickly\n        Too dark\n",
  "from": "mermaid-docs"
 },
 {
  "type": "eventmodeling",
  "name": "Event modeling",
  "key": "eventmodeling",
  "src": "eventmodeling\n\ntf 01 ui CartUI\ntf 02 cmd AddItem [[AddItem01]]\ntf 03 evt ItemAdded [[ItemAdded]]\ntf 04 cmd AddItem [[AddItem02]]\ntf 05 evt ItemAdded [[ItemAdded]]\n\ndata AddItem01 {\n  description: 'john'\n  image: 'avatar_john'\n  price: 20.4\n}\n\ndata AddItem02 {\n  description: 'jack'\n  image: 'avatar_jack'\n  price: 12.5\n}\n\ndata ItemAdded {\n  description: string\n  image: string\n  price: number\n}\n",
  "from": "mermaid-docs"
 }
] as const
