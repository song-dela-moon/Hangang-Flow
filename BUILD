load("@npm//:defs.bzl", "npm_link_all_packages")
load("@bazel_skylib//rules:common_settings.bzl", "string_flag")

npm_link_all_packages(name = "node_modules")

# 플래그 정의: 외부에서 --//:docker_repo=xxx 로 값을 넘길 수 있음
string_flag(
    name = "docker_repo",
    build_setting_default = "PLACEHOLDER",
)

package(default_visibility = ["//visibility:public"])
