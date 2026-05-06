load("@aspect_rules_js//js:defs.bzl", "js_binary", "js_library")
load("@rules_oci//oci:defs.bzl", "oci_image", "oci_push")
load("@rules_pkg//pkg:tar.bzl", "pkg_tar")

# ── 1. Library ────────────────────────────────────────────────
js_library(
    name = "market_service_lib",
    srcs = glob(["src/**/*.js"]),
    deps = [
        "//:node_modules/express",
        "//:node_modules/uuid",
    ],
)

# ── 2. Runnable binary ────────────────────────────────────────
js_binary(
    name = "market_service",
    entry_point = "src/index.js",
    data = [":market_service_lib"],
)

# ── 3. Packaging Layer ────────────────────────────────────────
pkg_tar(
    name = "market_service_layer",
    srcs = glob(["src/**/*.js"]) + ["package.json"],
    package_dir = "/app",
)

# ── 4. OCI image ─────────────────────────────────────────────
oci_image(
    name = "market_service_image",
    base = "@distroless_nodejs",
    entrypoint = ["node", "/app/src/index.js"],
    tars = [":market_service_layer"],
)

# ── 5. Push to Registry ───────────────────────────────────────
oci_push(
    name = "push",
    image = ":market_service_image",
    repository = "docker.io/PLACEHOLDER/market-service",
    remote_tags = ["latest"],
)
