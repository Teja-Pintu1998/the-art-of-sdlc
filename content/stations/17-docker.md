---
id: 17
slug: docker
where: "The pull request passed CI and merged (#15). Static analysis (#16) unlocks later. Now the tested code is packaged so it runs the same everywhere."
next: "The image is built and tagged. Stations #18 to #25 (registry, environments, QA and UAT) unlock later. Next, the change request that asks permission to release."
---

## What it is

**Docker** packages an application with everything it needs to run (the runtime, libraries and configuration defaults) into a single **image**. Run that image anywhere, on a laptop, a test server or production, and it behaves the same.

The core ideas:

- **Dockerfile:** a recipe of steps that builds the image.
- **Image:** the built, read-only package. It never changes once built.
- **Container:** a running copy of an image.
- **Tag:** a label on an image, such as `quickbite-api:3f9c2ab`.
- **Registry:** where images are stored and shared: Docker Hub, Amazon ECR, Google Artifact Registry or GitHub Container Registry.

Containers aren't virtual machines: they share the host's operating system kernel, so they start in seconds and use far less memory.

## Why it exists

- **"It works on my machine" disappears.** The exact same image runs in every environment.
- **Build once, deploy many times.** The image tested in staging is the very same one released to production, byte for byte.
- **Fast, repeatable deployments and rollbacks.** Rolling back means running the previous image.
- **Standard packaging.** Kubernetes, Cloud Run, ECS and most platforms run containers, whatever language is inside.

## How it works in big companies

- **CI builds the image** after the tests pass on `main`, and pushes it to a private registry.
- **Tags are immutable and traceable:**
  - each image is tagged with the **Git commit SHA** (`:3f9c2ab`), so you always know exactly which code is running
  - releases may also get a version tag (`:1.4.0`)
  - **`:latest` is never used for deployments**, because it changes silently
- **Small, secure images:**
  - **multi-stage builds:** one stage compiles the code, and a slim final stage contains only what's needed to run it
  - a minimal base image (Alpine, distroless or a slim variant)
  - the app runs as a **non-root user**
- **Scanning:** tools such as Trivy, Snyk or the registry's own scanner check images for known vulnerabilities, and block releases with critical ones.
- **No secrets in images.** Configuration and secrets are injected at runtime by the platform, so the same image works in every environment.
- **Layer caching:** the Dockerfile copies dependency files and installs them before copying the source code, so a code change doesn't reinstall every dependency.

## Real-world example

Sam's slot-picker PR merges into QuickBite's `main`. The pipeline continues:

1. **Build** the API image with a multi-stage Dockerfile: stage 1 installs dependencies and compiles the TypeScript; stage 2 copies only the compiled output and production dependencies onto a slim Node.js image, running as a non-root user.
2. **Result:** the image shrinks from **1.1 GB to 180 MB**, so deployments are faster and there's less to attack.
3. **Tag** it `quickbite-api:3f9c2ab` (the commit SHA) and push it to the registry.
4. **Scan:** the scanner finds a **critical** vulnerability in an old OpenSSL library in the base image. The release is blocked until the base image is updated; the rebuilt image passes.
5. **Promote** the same image through test, staging and production. Only the configuration changes: database address, payment keys and the feature flag for scheduling.

Two days after release, a bug appears. Because every environment shows the image tag, the team knows **exactly** which commit is running, and rolls back by redeploying the previous tag in under two minutes.

## Common problems and how seniors handle them

- **Huge images** with compilers and test tools inside. Seniors use multi-stage builds and slim base images.
- **Deploying `:latest`.** Nobody knows what's running, and rollbacks are guesswork. Seniors tag with the commit SHA.
- **Secrets baked into images.** Anyone who pulls the image can read them. Seniors inject secrets at runtime.
- **Rebuilding for each environment.** Then production runs something staging never tested. Seniors build once and promote the same image.
- **Running as root.** Seniors run as a non-root user and scan every image.

## Say this in your interview

"I use Docker so that what we test is exactly what we release. CI builds one image after the tests pass, tags it with the Git commit SHA, scans it for vulnerabilities and pushes it to a private registry. Then that same image is promoted through test, staging and production; only the configuration changes between environments. We never rebuild per environment, and we never deploy `:latest`, because then nobody knows what's actually running.

I keep images small and secure. A multi-stage build compiles in one stage and copies only the runtime output into a slim base image, which often takes an image from over a gigabyte to under two hundred megabytes. The app runs as a non-root user, and secrets are injected at runtime, never baked into the image.

The SHA tag pays off during incidents: we can see exactly which commit is running, and rolling back is just redeploying the previous tag, which takes minutes. And a scan that blocks critical vulnerabilities stops known security holes before they reach production."

## Interview questions you'll get

### What's the difference between an image and a container?

An image is the built, read-only package. A container is a running instance of that image. You can run many containers from one image.

### How is a container different from a virtual machine?

A VM includes a whole guest operating system on virtualised hardware. Containers share the host's kernel and isolate only processes, so they're much lighter and start in seconds, with weaker isolation than a VM.

### What is a multi-stage build, and why use it?

A Dockerfile with several stages: one builds the app with all the tools, and the final stage copies only the output into a slim image. The result is smaller, faster to deploy and has less to attack.

### How should images be tagged?

With something immutable and traceable, usually the Git commit SHA, plus an optional release version. Avoid deploying `:latest`, which changes silently and makes rollbacks unreliable.

### How do you handle configuration and secrets with containers?

Keep them out of the image. Inject configuration through environment variables and secrets from a secret manager at runtime, so one image runs in every environment.

## How we did it in this project

Containerising this app is planned for the release sprint (task AOS-1.6, moved there by a PO decision to reach visible features sooner). Until then, our Definition of Done uses a local production build check instead. The plan:

- **A multi-stage Dockerfile:** install, build Next.js in standalone mode, and copy only the output onto a slim Node.js image running as a non-root user.
- **Tagged with the commit SHA,** pushed to Google Artifact Registry, scanned, then promoted unchanged to the Cloud Run environments (AOS-1.7).

This section will be updated with the real numbers (image size, scan results) once AOS-1.6 is done.
