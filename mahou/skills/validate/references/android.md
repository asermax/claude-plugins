# Android validation

Drives a mobile app on an Android device or emulator from this machine. Assumes `validate` has settled how the app's backend runs and which identity the run uses.

This reference covers Android only. Driving an iPhone needs macOS and Xcode, so an iOS pass stays manual and the user runs it.

## Prerequisites

- **A device to run on.** Ask the user whether to use a physical Android device or an emulator on this machine. A physical device needs Developer options and Wireless debugging (or USB debugging) enabled.
- **`adb`** on this machine. Pairing over wifi needs a version that supports `adb pair`.
- **The Android toolchain** the app builds with: a JDK and the Android SDK, both reachable through the environment the build reads (`ANDROID_HOME`).
- **The backend is up**, per the project's setup, for every base URL the app calls. Read the app's configuration for those URLs; each one maps to a service that must be running.

## Connecting the device

### Physical device

Connect over wifi, with the device and this machine on the same network. Ask the user for these values from the device's **Wireless debugging** screen:

1. The **pairing code and IP:port** from "Pair device with pairing code".
2. The **connect IP:port** shown on the main Wireless debugging screen. It is a different port from the pairing one.

```bash
adb pair <ip>:<pairing-port> <code>
adb connect <ip>:<connect-port>
adb devices -l
```

The pairing dialog times out quickly; if `adb pair` fails, ask for a fresh code. Pairing persists across reconnects, but the connect port changes whenever the user toggles Wireless debugging. A restarted `adb` daemon needs a new `adb connect`.

### Emulator

List the emulators this machine has with `emulator -list-avds`, ask the user which one to use, and start it with `emulator -avd <name>`. A running emulator appears in `adb devices` without pairing. Running the app, reaching the backend and driving the app work the same on an emulator as on a physical device.

## Running the app

Build and install a debug build the way the project's setup says. When the app is React Native served by Metro from this machine:

1. **Pick Metro's port.** Local containers may already hold Metro's default. Check `docker ps --format '{{.Names}}\t{{.Ports}}'` when the backend runs in Docker, and choose a free port.
2. **Start Metro** in the app's repository on that port, with the start script the project defines and its port flag.
3. **Build and install** with Metro already running, so the build does not try to start its own. For the React Native CLI that is `run-android --active-arch-only --no-packager`, through whatever script the project wraps it in. The first build on a machine takes several minutes.
4. **Tunnel Metro to the device** on the port the app expects: `adb reverse tcp:8081 tcp:<metro-port>`.

The build resets the device's reverse tunnels when it installs, so apply the tunnels **after** it finishes. A blank or red "Unable to load script" screen means the Metro tunnel is missing.

## Reaching the local backend

The device cannot resolve this machine's local hostnames, so the app reaches the backend through `adb reverse` onto this machine's loopback. Nothing is exposed on the local network.

1. **Point the app at localhost.** When the app reads its base URLs from a file tracked in the repository, capture a copy and its hash before editing it, and restore it byte for byte at the end. Set each base URL the validation needs to `http://localhost:<port>`. Edit it before starting the bundler and building.
2. **Tunnel each port**: `adb reverse tcp:<port> tcp:<port>` for every base URL pointed at localhost.
3. **Bridge services that publish no host port.** When a base URL targets a service whose container publishes no port on this machine, bridge it on loopback only, then tunnel that port:

   ```bash
   socat TCP-LISTEN:<port>,bind=127.0.0.1,fork,reuseaddr TCP:<service-host>:<service-port> &
   adb reverse tcp:<port> tcp:<port>
   ```

   Check the path too. A service called directly exposes its own routes, which can differ from the prefix a gateway puts in front of the same service.

Reverse tunnels do not survive an `adb` reconnect. After any reconnect, list them with `adb reverse --list` and apply them again.

## Authenticating

Log in through the app's own login screen with the identity the user gave. The app keeps its session token in its own persisted storage; reading or writing that storage is credential access, so do not inject a token there unless the user explicitly allows it.

## Reaching the screen under test

Check whether the app routes deep links before relying on one; when it does not, walk the navigation from the home screen. When the identity lacks what the screen sits behind, make it reachable with the mutation discipline in `validate`: capture, mutate, and revert.

When a screen shows an error, read the logs of the service behind the request the app made. A `502` from a gateway means the service behind that route is down or crash-looping.

## Driving the app

The helpers under `scripts/android/` drive the device through `adb` and read its UI through `uiautomator`:

- **`texts.sh`** prints every visible text and content description with its center, and whether the node is enabled and checked. Assert state from this, not from pixels.
- **`tap.sh "<text>" [index]`** taps the Nth visible node whose text or content description contains the text.
- **`wait-for.sh "<text>" [timeout]`** waits until a node with the text is visible.
- **`relaunch.sh <package> "<text>" [timeout]`** force-stops the app, launches it and waits for the text.

Rules that keep taps landing where intended:

- **Re-read the layout before every tap that follows typing.** The keyboard shifts the layout, so coordinates read before it opened point at other elements. `tap.sh` dumps the UI on every call for this reason.
- **Type with `adb shell input text`**, writing spaces as `%s`.
- **Wait on a condition**, a node appearing or a record being written, never on a fixed sleep.
- **Back (`adb shell input keyevent 4`) closes the keyboard** when it is open, and navigates back when it is not.

## Evidence

Every row leaves the evidence the report artifact in `validate` requires:

- **A screenshot at each meaningful moment**: `adb exec-out screencap -p > <row>-<nn>-<moment>.png`.
- **A recording for anything transient**, such as an animation or a state too short for a screenshot to catch reliably: `adb shell screenrecord --time-limit <seconds> /sdcard/<name>.mp4`, pulled with `adb pull`. Extract frames into a contact sheet to inspect them: `ffmpeg -i <name>.mp4 -vf "fps=4,scale=270:-1,tile=8x3" -frames:v 1 <name>-sheet.png`.
- **The UI state** from `texts.sh` at the decisive moment: which nodes are enabled and checked.
- **The request and the stored state**: the request line from the service logs, and the state read back through the API or the database afterwards, both trimmed to the fields the row is about.

## Leaving the device and the system as found

At the end of the run:

- Restore any tracked configuration file you edited and compare its hash against the capture.
- Remove the tunnels (`adb reverse --remove-all`) and stop the loopback bridges and the bundler.
- Revert every record the run mutated, as `validate` requires.
