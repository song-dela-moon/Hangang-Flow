# 📊 Hangang-Flow Service Specifications

## 🌐 외부 접속 정보 (Public Endpoints)
모든 서비스는 마스터 노드 IP(`172.21.33.221`) 또는 워커 노드 IP를 통해 접속 가능합니다.

| 서비스명 | 포트 (NodePort) | 설명 |
| :--- | :--- | :--- |
| **Exchange Web** | `30001` | 사용자 거래 인터페이스 (React) |
| **Admin Web** | `30002` | 관리자 대시보드 |
| **Market API** | `30080` | 시세 데이터 제공 API |
| **Trading API** | `30081` | 주문 처리 API |

## 📦 마이크로서비스 상세

### 1. Exchange Web (Frontend)
- **Base Image**: `gcr.io/distroless/nodejs20-debian12`
- **Internal Port**: 8080
- **Features**: API Proxying (to Market/Trading services)

### 2. Admin Web (Frontend)
- **Base Image**: `gcr.io/distroless/nodejs20-debian12`
- **Internal Port**: 8080

### 3. Market Service (Backend)
- **Base Image**: `gcr.io/distroless/nodejs20-debian12`
- **Port**: 9090
- **Tech**: Node.js, Express

### 4. Trading Service (Backend)
- **Base Image**: `gcr.io/distroless/java21-debian12`
- **Port**: 8080
- **Tech**: Java 21, Spring Boot, Spring Data JPA
