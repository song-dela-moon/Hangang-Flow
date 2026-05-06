load("@aspect_rules_js//js:defs.bzl", "js_binary", "js_library")
load("@rules_oci//oci:defs.bzl", "oci_image", "oci_push")
load("@aspect_bazel_lib//lib:tar.bzl", "tar")
load("@aspect_rules_esbuild//esbuild:defs.bzl", "esbuild")

# ── 1. Library ────────────────────────────────────────────────
js_library(
    name = "market_service_lib",
    srcs = glob(["src/**/*.js"]),
    deps = [
        "//:node_modules/express",
        "//:node_modules/uuid",
    ],
)

# ── 2. Bundle (코드를 하나로 합치기) ───────────────────────────
esbuild(
    name = "bundle",
    entry_point = "src/index.js",
    deps = [":market_service_lib"],
    platform = "node",
    target = "node20",
    minify = True,
)

# ── 3. Packaging Layer (번들된 파일 하나만 포함) ───────────────
tar(
    name = "market_service_layer",
    srcs = [":bundle"],
)

# ── 4. OCI image (실행 파일은 이제 bundle.js) ──────────────────
oci_image(
    name = "market_service_image",
    base = "@distroless_nodejs",
    entrypoint = ["/nodejs/bin/node", "apps/market-service/bundle.js"],
    tars = [":market_service_layer"],
)

# ── 5. Push to Registry ───────────────────────────────────────
oci_push(
    name = "push",
    image = ":market_service_image",
    repository = "docker.io/PLACEHOLDER/market-service",
    remote_tags = ["latest"],
)
