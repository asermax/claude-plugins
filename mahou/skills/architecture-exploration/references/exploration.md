# Exploring options

Each step adds drawings. Remove a drawing only when the user asks.

1. **Lay the options out as a grid.** When a change varies along independent dimensions, such as where the code runs and how deferred work runs, draw one square per combination: one dimension along the rows, the other along the columns, each square titled `<letter>. <value> + <value>`. Keep the same parts in the same places across the squares, so only the parts that differ move. Give each square a note on a consequence of that combination the diagram leaves out, such as a client library that cannot run on that runtime.

2. **The user narrows the grid.** A dropped option stays on the canvas unless the user asks to remove it. When the user changes one value of a dimension, apply the change to every square that has that value. For example, when the user asks for a separate consumer in one queue option, add it to every queue square.

3. **Draw a shared part step by step.** When several options share a part made of steps, such as a workflow or a pipeline, draw it once in its own square below the grid. Title it with the options it belongs to, and number each step, with the stores and services it reaches on the same row.

4. **Draw the chosen option whole.** In a new square, draw the option the user picks with the shared part drawn inline and the neighbouring subsystems it touches, so the user sees the whole system in one drawing.

5. **Redraw after each decision.** When a decision changes the chosen option, draw it again in a new square beside the earlier one, titled `Chosen: <option>`, and keep the earlier one. Leave out parts the user has not asked to see yet, such as a fallback. Update the note of every drawing the decision changes.

The exploration ends when the user says which drawing is the architecture.
