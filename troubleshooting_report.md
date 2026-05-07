# 🛠 Troubleshooting Report: Crypto Exchange MSA Deployment

본 문서는 OpenStack 기반 Kubernetes 클러스터에 가상자산 거래소 마이크로서비스를 배포하는 과정에서 발생한 주요 장애와 해결 과정을 기록합니다.

## 1. 노드 간 통신 및 Flannel CNI 장애
- **증상**: 모든 포드가 `Running` 상태임에도 불구하고, 노드 간 핑(Ping) 및 포드 간 통신이 불가능함.
- **원인**: OpenStack 보안 그룹(Security Group)에서 **UDP 8472(VXLAN)** 포트가 누락됨. Flannel은 노드 간 터널링을 위해 UDP를 사용하는데, 기존 설정은 TCP만 허용되어 있었음.
- **해결**: Terraform의 `security_group.tf`에 내부 통신용 UDP 및 ICMP 허용 규칙을 추가하고 적용함.

## 2. Distroless 이미지 권한 및 포드 크래시
- **증상**: 프론트엔드 포드가 `CrashLoopBackOff` 상태에 빠짐.
- **원인**: `distroless/nodejs` 이미지는 보안을 위해 **non-root** 사용자로 실행됨. 리눅스에서 1024번 이하 포트(80)는 루트 권한이 필요하여 서버 실행이 거부됨.
- **해결**: 프론트엔드 서버 포트를 **8080**으로 변경하고, K8s Service의 `targetPort`를 이에 맞춰 수정함.

## 3. 프론트엔드 프록시 경로 매칭 오류 (404 Not Found)
- **증상**: 화면은 뜨지만 데이터(시세, 주문)가 표시되지 않음. 브라우저에서 API 호출 시 404 에러 발생.
- **원인**: Express 프록시 설정 시 `req.url`을 사용하여 전달함. `app.use('/api/market', ...)` 내부에서 `req.url`은 `/api/market`이 제거된 뒷부분만 남게 되어, 백엔드가 인식하지 못하는 주소로 요청이 전달됨.
- **해결**: `req.url` 대신 전체 경로를 유지하는 **`req.originalUrl`**을 사용하도록 프록시 로직을 수정함.

## 4. 백엔드 포트 불일치 (9090 vs 8080)
- **증상**: 마켓 서비스 API 호출 시 계속해서 응답 대기 상태 발생.
- **원인**: `market-service`는 내부적으로 **9090** 포트에서 대기 중이었으나, 프론트엔드 프록시는 **8080**으로 패킷을 보내고 있었음.
- **해결**: 프론트엔드 `server.js` 내의 `MARKET_URL` 포트를 9090으로 수정함.

---
**최종 상태**: 모든 서비스 정상 통신 확인 (NodePort 30001, 30002를 통해 접근 가능)
