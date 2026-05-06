# Hangang-Flow

> Bazel 기반 모노레포 + Kubernetes 배포 자동화를 검증하기 위한 최소화된 가상자산 거래소 프로젝트입니다.

---

## 서비스 구성

| 앱 | 언어/프레임워크 | 포트 | 역할 |
|---|---|---|---|
| `apps/exchange-be` | Java / Spring Boot | 8080 | 주문 CRUD REST API |
| `apps/exchange-fe` | JS / React + Vite | 3000 | 거래소 UI |
| `apps/core-be` | Node.js / Express | 9090 | 시세 관리 + 입출금 시뮬레이션 REST API |
| `apps/core-fe` | JS / React + Vite | 3001 | 시세 관리 대시보드 UI |

### REST API 요약

**exchange-be** (`localhost:8080`)
```
POST   /api/orders            # 주문 생성
GET    /api/orders            # 전체 주문 조회
GET    /api/orders/{id}       # 단건 조회
PATCH  /api/orders/{id}       # 수량/가격 수정
PATCH  /api/orders/{id}/cancel # 주문 취소
DELETE /api/orders/{id}       # 주문 삭제
```

**core-be** (`localhost:9090`)
```
POST   /api/external/prices       # 시세 추가
GET    /api/external/prices       # 전체 시세 조회
GET    /api/external/prices/:id   # 단건 시세 조회
PUT    /api/external/prices/:id   # 시세 업데이트
DELETE /api/external/prices/:id   # 시세 삭제
POST   /api/external/transfer     # 입출금 시뮬레이션
GET    /api/external/transfers    # 거래 이력 조회
```

---

## 사전 준비

- [Bazel](https://bazel.build/install) (권장: Bazelisk 사용)
- JDK 21+
- Node.js 20+

```bash
# Bazelisk 설치 (Bazel 버전 자동 관리)
npm install -g @bazel/bazelisk
```

---

## Bazel로 빌드하기

### 전체 빌드
```bash
# 모노레포 내 모든 타겟 빌드
bazel build //...
```

### 서비스별 개별 빌드

```bash
# exchange-be (Java): 실행 가능한 JAR 빌드
bazel build //apps/exchange-be:exchange_be

# exchange-be OCI 이미지 빌드
bazel build //apps/exchange-be:exchange_be_image

# core-be (Node.js): JS 번들 빌드
bazel build //apps/core-be:core_be

# exchange-fe (React): 라이브러리 빌드 타겟
bazel build //apps/exchange-fe:exchange_fe_lib

# core-fe (React): 라이브러리 빌드 타겟
bazel build //apps/core-fe:core_fe_lib
```

### Bazel 빌드 캐시 확인
```bash
# 변경된 파일 없이 재빌드 시 캐시 적중 확인
bazel build //... --explain=/tmp/bazel-explain.txt
```

---

## 로컬에서 실행하기

### exchange-be (Spring Boot)

**방법 1: Bazel로 직접 실행**
```bash
bazel run //apps/exchange-be:exchange_be
```

**방법 2: Maven/Gradle 없이 직접 실행 (JDK 환경)**
```bash
cd apps/exchange-be
# 빌드 후 생성된 JAR 실행
java -jar bazel-bin/apps/exchange-be/exchange_be.jar
```

→ `http://localhost:8080`에서 API 확인  
→ H2 콘솔: `http://localhost:8080/h2-console`

---

### core-be (Node.js)

```bash
cd apps/core-be
npm install
npm run dev      # node --watch (핫리로드)
# 또는
npm start
```

→ `http://localhost:9090`에서 API 확인

**Bazel로 실행:**
```bash
bazel run //apps/core-be:core_be
```

---

### exchange-fe (React)

```bash
cd apps/exchange-fe
npm install
npm run dev
```

→ `http://localhost:3000`에서 UI 확인  
→ exchange-be가 먼저 실행되어 있어야 주문 API가 동작합니다.

---

### core-fe (React)

```bash
cd apps/core-fe
npm install
npm run dev
```

→ `http://localhost:3001`에서 UI 확인  
→ core-be가 먼저 실행되어 있어야 시세 API가 동작합니다.

---

## 전체 서비스 한번에 실행 (로컬)

터미널 4개를 열어 각각 실행하거나, 아래 예시처럼 백그라운드로 실행:

```bash
# BE 먼저
bazel run //apps/exchange-be:exchange_be &
cd apps/core-be && npm install && npm start &

# FE
cd apps/exchange-fe && npm install && npm run dev &
cd apps/core-fe && npm install && npm run dev &
```

---

## 디렉토리 구조

```text
/ (Root)
├── MODULE.bazel          # Bzlmod - Bazel 패키지 관리
├── BUILD                 # 루트 빌드 파일
├── apps/
│   ├── exchange-be/      # [Java/Spring Boot] 거래소 백엔드
│   ├── exchange-fe/      # [React] 거래소 프론트엔드
│   ├── core-be/          # [Node.js] 시세/입출금 서비스
│   └── core-fe/          # [React] 시세 관리 대시보드
├── packages/             # 공유 라이브러리 (추후 확장)
├── infra/
│   ├── k8s/              # Kubernetes Manifests
│   └── terraform/        # OpenStack IaC
└── tools/                # Bazel 커스텀 룰
```

---

## 참고 문서

- [spec.md](./spec.md) - 프로젝트 설계 명세
- [infra.md](./infra.md) - 인프라 아키텍처 설계
