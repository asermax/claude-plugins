# Anatomy

A page that shows what one thing is made of and where each of its parts comes from.

## Centre

The centre is the most concrete artefact that puts every concept together, such as the screen where every concept is read back. It is the largest shape on the page. Every concept on the page explains one of its parts. Uses `central-image` and `concrete-under-abstract`.

## Layout

- **Each concept on its own, then combined.** A concept that makes sense alone gets its own diagram, tied with a close-up line to the part of the centre it explains. Concepts that only make sense together get one more diagram that combines them, and that diagram shows only what the combination adds.
- **Position by relation.** Concepts that feed the same combination sit on opposite sides of the centre, and each points to the combination with a black arrow. A concept that applies to the combination as a whole comes after it, with the arrow from the combination to it.
- **Behaviour over time as a trajectory.** A concept about time, such as a window that rolls, a buffer that drops old entries or a cut at one moment, is drawn whole along a time axis. Uses `trajectory` and `tape`.
- **Variants of a part as multiples.** The variants of one part of the centre, such as the states a panel shows, sit together in a dotted box tied to that part with a close-up line. Uses `small-multiples`.
- **How the thing is created as a storyboard.** The screens that create it go in a row, in their own dotted box, with a side-effect arrow from the box to the part of the centre they produce. What the process moves is drawn as objects under the screen of each moment, not as an arrow. Uses `storyboard` and `travelling-objects`.

## Leave out

- Where things are stored. On an anatomy page, storage does not explain what the thing is made of.
- States that do not explain a concept, such as closing a dialog or leaving the page.
