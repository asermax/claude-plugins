# Cloudflare Containers: access, sizes and pricing

verified: 2026-10-04

Answers how an existing container image runs on Cloudflare, how traffic and bindings reach it, its sizes and sleep behaviour, and what it costs. Distilled from documentation while weighing a move of a Python API image onto Cloudflare; nothing was run.

## Knowledge

- Containers have been GA since 2026-04-13 and need Workers Paid. Any Linux image runs, so native libraries and gRPC clients work.
- A container is reached only through a Durable Object, with `getContainer(env.X, id)` or `ctx.container` inside the object, so every request to it goes through a Worker and a Durable Object.
- Bindings (D1, R2, KV, Durable Objects) do not reach the container directly. Its outbound HTTP goes through outbound handlers, programmable egress proxies mapped per host with `outboundByHost`. Code inside the container reaches D1 through its REST API or a Worker acting as a proxy, and R2 through its S3 API.
- Instance types run from lite (1/16 vCPU, 256 MiB, 2 GB disk) through basic (1/4, 1 GiB, 4 GB), standard-1 (1/2, 4 GiB, 8 GB), standard-2 (1, 6 GiB, 12 GB) and standard-3 (2, 8 GiB, 16 GB) to standard-4 (4, 12 GiB, 20 GB). The image cannot exceed the instance disk. Each account has 50 GB of image storage.
- Cold starts are "often 1-3 s". The container sleeps after `sleepAfter`, 10 min by default. Disk is ephemeral and resets on each start. Shutdown sends SIGTERM, then SIGKILL up to 15 min later.
- Pricing is per 10 ms of active running. Workers Paid includes 25 GiB-hours of memory, 375 vCPU-minutes and 200 GB-hours of disk a month; beyond that $0.0000025 per GiB-second, $0.000020 per active vCPU-second and $0.00000007 per GB-second of disk. Egress is $0.025/GB in North America and Europe with 1 TB included. An always-on 1 GiB instance comes to about $7 a month; one that sleeps most of the time fits inside the included hours.

## Sources

- https://developers.cloudflare.com/containers/
- https://developers.cloudflare.com/containers/platform-details/limits/
- https://developers.cloudflare.com/containers/platform-details/outbound-traffic/
- https://developers.cloudflare.com/containers/pricing/
