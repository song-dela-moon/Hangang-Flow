load("@aspect_rules_js//js:defs.bzl", "js_library")
load("@npm//:vite/package_json.bzl", vite_bin = "bin")

js_library(
    name = "exchange_web_lib",
    srcs = glob(["src/**/*.jsx", "src/**/*.js", "src/**/*.css"], allow_empty = True) + ["index.html", "vite.config.js"],
    deps = ["//:node_modules"],
)

# Dev server (bazel run //apps/exchange-web:dev)
vite_bin.vite_binary(
    name = "dev",
    args = [
        "dev",
        "apps/exchange-web",
        "--config",
        "apps/exchange-web/vite.config.js",
    ],
    data = [":exchange_web_lib"],
)
