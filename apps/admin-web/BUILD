load("@aspect_rules_js//js:defs.bzl", "js_library")
load("@npm//:vite/package_json.bzl", vite_bin = "bin")

js_library(
    name = "admin_web_lib",
    srcs = glob(["src/**/*.jsx", "src/**/*.js", "src/**/*.css"], allow_empty = True) + ["index.html", "vite.config.js"],
    deps = ["//:node_modules"],
)

# Dev server (bazel run //apps/admin-web:dev)
vite_bin.vite_binary(
    name = "dev",
    args = [
        "dev",
        "apps/admin-web",
        "--config",
        "apps/admin-web/vite.config.js",
    ],
    data = [":admin_web_lib"],
)
