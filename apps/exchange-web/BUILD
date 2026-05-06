load("@aspect_rules_js//js:defs.bzl", "js_library")
load("@rules_oci//oci:defs.bzl", "oci_image", "oci_push")
load("@aspect_bazel_lib//lib:tar.bzl", "tar")
load("@aspect_rules_esbuild//esbuild:defs.bzl", "esbuild")
load("@npm//:vite/package_json.bzl", vite_bin = "bin")

# 1. Vite Build
vite_bin.vite(
    name = "vite_build",
    srcs = glob(["src/**", "public/**"]) + [
        "index.html",
        "package.json",
        "vite.config.js",
        "//:node_modules",
    ],
    args = ["build", "--outDir", "dist"],
    out_dirs = ["dist"],
    chdir = package_name(),
)

# 2. Bundle the Static Server (CJS 사용)
esbuild(
    name = "bundle_server",
    entry_point = "server.js", # .js로 변경
    deps = ["//:node_modules/express"],
    platform = "node",
    target = "node20",
    format = "cjs", # CJS로 변경
    minify = True,
)

# 3. Packaging Layer
tar(
    name = "web_layer",
    srcs = [":vite_build", ":bundle_server"],
)

# 4. OCI image
oci_image(
    name = "exchange_web_image",
    base = "@distroless_nodejs",
    entrypoint = ["/nodejs/bin/node", "apps/exchange-web/bundle_server.js"],
    tars = [":web_layer"],
)

# 5. Push
oci_push(
    name = "push",
    image = ":exchange_web_image",
    repository = "docker.io/PLACEHOLDER/exchange-web",
    remote_tags = ["latest"],
)
