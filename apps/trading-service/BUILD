load("@rules_java//java:defs.bzl", "java_binary", "java_library", "java_plugin")
load("@rules_oci//oci:defs.bzl", "oci_image", "oci_push")
load("@rules_pkg//pkg:tar.bzl", "pkg_tar")

# ── Lombok Plugin ─────────────────────────────────────────────
java_plugin(
    name = "lombok_plugin",
    processor_class = "lombok.launch.AnnotationProcessorHider$AnnotationProcessor",
    deps = ["@maven//:org_projectlombok_lombok"],
)

# ── 1. Library ────────────────────────────────────────────────
java_library(
    name = "trading_service_lib",
    srcs = glob(["src/main/java/**/*.java"]),
    deps = [
        "@maven//:org_springframework_boot_spring_boot_starter_web",
        "@maven//:org_springframework_boot_spring_boot_starter_data_jpa",
        "@maven//:com_h2database_h2",
        "@maven//:org_projectlombok_lombok",
        "@maven//:jakarta_persistence_jakarta_persistence_api",
        "@maven//:org_springframework_boot_spring_boot",
        "@maven//:org_springframework_boot_spring_boot_autoconfigure",
        "@maven//:org_springframework_data_spring_data_jpa",
        "@maven//:org_springframework_spring_context",
        "@maven//:org_springframework_spring_tx",
        "@maven//:org_springframework_spring_web",
        "@maven//:org_springframework_spring_beans",
    ],
    plugins = [":lombok_plugin"],
    resources = glob(["src/main/resources/**"]),
)

# ── 2. Runnable binary ────────────────────────────────────────
java_binary(
    name = "trading_service",
    main_class = "com.hangangflow.trading.TradingApplication",
    runtime_deps = [":trading_service_lib"],
)

# ── 3. Packaging Layer ────────────────────────────────────────
pkg_tar(
    name = "trading_service_layer",
    srcs = [":trading_service_deploy.jar"],
    package_dir = "/app",
)

# ── 4. OCI image ─────────────────────────────────────────────
oci_image(
    name = "trading_service_image",
    base = "@distroless_java",
    entrypoint = ["java", "-jar", "/app/trading_service_deploy.jar"],
    tars = [":trading_service_layer"],
)

# ── 5. Push to Registry ───────────────────────────────────────
oci_push(
    name = "push",
    image = ":trading_service_image",
    repository = "docker.io/PLACEHOLDER/trading-service",
    remote_tags = ["latest"],
)
