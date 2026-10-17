# Pele vs Excalidraw

> Pele vs Excalidraw: a text-to-diagram renderer vs a hand-drawn whiteboard. When each fits, how they differ for docs, diffs, AI and theming.

Source: https://pele.wiki/pages/pele-vs-excalidraw.html · Last updated 2026-10-17

Excalidraw is a whiteboard: you draw and arrange shapes by hand, in a sketchy style. Pele turns text into a diagram automatically. They solve different problems, and many teams use both.

## Side by side

| Question | Pele | Excalidraw |
| --- | --- | --- |
| You make a diagram by | Writing Mermaid text | Drawing and dragging shapes |
| Saved as | Text, easy to review in git | A JSON scene file |
| Layout | Automatic | Wherever you put things |
| Look | Clean, follows your CSS | Hand-drawn |
| AI can write it | Yes, models write Mermaid well | Harder: positions and shapes |
| Best for | Docs, apps, generated diagrams | Brainstorming, sketches, explaining live |

## Choose Excalidraw when

you're thinking out loud, in a meeting or on your own, and want to place every box yourself.

## Choose Pele when

the diagram should live next to code or notes, change with them, be reviewed in a pull request, or be generated. Excalidraw can import some Mermaid diagrams too, which makes a nice path: start in text with Pele, move to the whiteboard when you need to sketch around it.

Learn more at [excalidraw.com](https://excalidraw.com).
