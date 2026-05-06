# Virtual Asset Exchange Project Specification (Bazel + K8s)

이 프로젝트는 가상자산 거래소와 핵심 연동 서비스의 흐름을 구현하며, Bazel을 통한 멀티 언어(Java, JS) 빌드 최적화와 Kubernetes 기반의 자동화된 배포를 검증하는 것을 주 목적으로 합니다. 모든 도메인은 REST API 기반의 CRUD 기능을 실질적으로 수행합니다.

## 1. Directory Structure (Bazel Monorepo)

Bazel을 사용하여 Java(Backend)와 JS(Frontend)를 단일 레포지토리에서 관리합니다.

```text
/ (Root)
├── WORKSPACE             # Bazel 외부 종속성 및 환경 설정
├── MODULE.bazel          # Bzlmod (최신 Bazel 패키지 관리)
├── BUILD                 # 루트 빌드 파일
├── apps/                 # 서비스 애플리케이션
│   ├── exchange-be/      # [Java/Spring Boot] 거래소 백엔드 서비스
│   │   ├── BUILD
│   │   └── src/
│   ├── exchange-fe/      # [JS/React] 거래소 프론트엔드
│   │   ├── BUILD
│   │   └── src/
│   ├── core-be/          # [Java or Node.js] 기초 자산 및 시세 관리 서비스
│   │   ├── BUILD
│   │   └── src/
│   └── core-fe/          # [JS/React] 시세 및 자산 관리 대시보드
│       ├── BUILD
│       └── src/
├── packages/             # 공유 라이브러리
│   ├── shared-proto/     # (선택) Java/JS 공통 인터페이스 (Protobuf 등)
│   │   └── BUILD
│   └── shared-types/     # 공통 타입 정의
│       └── BUILD
├── infra/                # 인프라 자동화 코드
│   ├── k8s/              # Kubernetes Manifests (Helm/Kustomize)
│   │   ├── base/
│   │   └── overlays/
│   └── terraform/        # OpenStack 자원 관리
└── tools/                # Bazel 커스텀 룰 (rules_java, rules_js, rules_oci)
```

## 2. Service Logic & CRUD Specification

모든 앱은 REST API 기반의 CRUD 기능을 포함하며, 비즈니스 로직을 가집니다.

### A. Exchange Domain (거래소 서비스 - Java 기반)
거래소의 핵심 주문 및 사용자 자산 관리를 담당합니다.
- **Backend (Spring Boot)**:
    - `POST /api/orders`: 새로운 매수/매도 주문 생성 (Create)
    - `GET /api/orders`: 주문 내역 및 상태 조회 (Read)
    - `PATCH /api/orders/{id}`: 주문 취소 또는 수량 변경 (Update)
    - `DELETE /api/orders/{id}`: 미체결 주문 데이터 삭제 (Delete)
- **Frontend (React)**:
    - 주문 입력 폼, 주문 내역 리스트(수정/삭제 버튼 포함), 실시간 자산 현황 UI

### B. Core Domain (기초 자산 서비스 - Node.js 또는 Java)
거래소에 시세 정보를 제공하고 기초 자산 데이터를 관리합니다.
- **Backend**:
    - `POST /api/external/prices`: 가상자산 시세 정보 생성 (Create)
    - `GET /api/external/prices`: 현재 시세 및 이력 조회 (Read)
    - `PUT /api/external/prices/{id}`: 특정 자산 시세 업데이트 (Update)
    - `DELETE /api/external/prices/{id}`: 관리 대상 자산 삭제 (Delete)
- **Frontend (React)**:
    - 자산 관리 대시보드 (자산 추가/시세 수정/삭제 버튼)

## 3. Build & Delivery Strategy (Bazel focus)

### Bazel Build Path
- **Multi-Language Support**: `rules_java`와 `rules_js`를 사용하여 서로 다른 언어의 프로젝트를 하나의 빌드 그래프로 관리.
- **OCI Images**: `rules_oci`를 사용하여 Java Jar와 JS 번들을 각각 컨테이너 이미지로 빌드.
- **Incremental Build**: 소스 코드가 변경된 모듈 및 그에 의존하는 모듈만 선별적 빌드.

### K8s Deployment (GitOps)
1. **CI**: Bazel이 빌드 후 이미지를 Registry에 푸시하고 신규 이미지 태그를 생성.
2. **CD**: ArgoCD가 `infra/k8s`의 변화를 감지하여 OpenStack 기반 K8s 클러스터에 배포.

## 4. 핵심 검증 포인트
1. **Multi-Language Build Integration**: Java와 JS 환경이 Bazel 내에서 충돌 없이 병렬 빌드되는지 확인.
2. **RESTful CRUD Integrity**: 서비스 간(Exchange <-> Core) REST 통신을 통한 데이터 정합성 확인.
3. **K8s Service Mesh/Ingress**: 각 서비스가 적절한 경로(Ingress)를 통해 외부 및 내부 통신을 수행하는지 확인.
