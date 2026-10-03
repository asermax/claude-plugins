const BLOCKED_RETRY_MS = 2000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const prompt = async (target: string, message: string) => {
  const process = Bun.spawn(["herdr", "agent", "prompt", target, message], { stdout: "pipe", stderr: "pipe" });
  const [stdout, stderr, code] = await Promise.all([
    new Response(process.stdout).text(),
    new Response(process.stderr).text(),
    process.exited,
  ]);

  return { ok: code === 0, output: `${stdout}${stderr}` };
};

// Messages go straight into the agent's own input queue, one prompt per commit.
// The one exception is an agent blocked on an approval or question: herdr
// refuses the prompt then, since typing into that UI would answer it, so the
// message waits until the block clears.
export const createNotifier = (target: string | null) => {
  let chain = Promise.resolve();

  const send = async (message: string) => {
    if (target == null) {
      console.log(message);

      return;
    }

    for (;;) {
      const result = await prompt(target, message);

      if (result.ok) {
        return;
      }

      if (!result.output.includes("agent_blocked")) {
        console.error(`telepathy: could not reach the agent at ${target}: ${result.output.trim()}`);

        return;
      }

      await sleep(BLOCKED_RETRY_MS);
    }
  };

  return (message: string) => {
    chain = chain.then(() => send(message));

    return chain;
  };
};
