export const EXAMPLES: Record<string, string> = {
  flow: `flowchart LR
  Cart[Cart] --> Signed{Signed in?}
  Signed -- yes --> Pay[Payment]
  Signed -- no --> Login[Log in]
  Login --> Pay
  Pay --> Stock{In stock?}
  Stock -- yes --> Ship([Ship it])
  Stock -- no --> Notify[Email me later]`,
  seq: `sequenceDiagram
  participant U as You
  participant A as App
  participant S as Server
  U->>A: Tap "Log in"
  A->>S: POST /session
  S-->>A: 200 + token
  A-->>U: Welcome back
  Note over A,S: token kept for 30 days`,
  state: `stateDiagram-v2
  [*] --> Red
  Red --> Green: timer 30s
  Green --> Yellow: timer 25s
  Yellow --> Red: timer 5s
  Red --> Flashing: power fault
  Flashing --> Red: reset`,
}
