[Modern Cloud Native Infrastructure Architecture]
1. 인프라 하위 계층: Infrastructure Provisioning (Bare Metal to VM)
Physical Layer: 베어메탈 서버 및 네트워크 스위치
Cloud OS (OpenStack): 물리 자원을 가상화하여 Compute(Nova), Storage(Cinder), Network(Neutron)로 관리.
IaC (Terraform): 엔지니어가 코드로 "Master VM 3대, Worker VM 10대, Load Balancer 1개"를 선언하면 오픈스택 API를 호출하여 자동으로 프로비저닝합니다.
2. 클러스터 관리 계층: Cluster Configuration (VM to K8s)
Config Management (Ansible): 생성된 VM들에 접속하여 Docker(혹은 containerd), kubelet 등을 설치하고 OS 보안 설정을 수행합니다. (Kubespray 등을 활용)
Orchestrator (Kubernetes): 오픈스택 VM들 위에서 컨테이너를 관리하는 통합 플랫폼이 완성됩니다.
3. 플랫폼 서비스 계층: Shared Services (The Missing Pieces)
쿠버네티스만 있다고 끝이 아닙니다. 안정적 운영을 위한 필수 컴포넌트들입니다.

Secret Management (HashiCorp Vault): DB 비밀번호, API 키 등을 코드에 넣지 않고 중앙에서 암호화하여 관리합니다.
Service Mesh (Istio): 마이크로서비스 간 통신을 암호화(mTLS)하고, 트래픽을 세밀하게 제어(Canary 배포 등)합니다.
Observability (Prometheus, Grafana, ELK/EFK Stack):
Prometheus/Grafana: 서버의 CPU, 메모리 상태 및 앱 성능 지표 시각화.
ELK/EFK (Elasticsearch, Fluentd, Kibana): 수많은 컨테이너에서 쏟아지는 로그를 중앙으로 수집하고 검색.
4. 배포 계층: Continuous Delivery (GitOps)
Manifest Repository (Git): K8s의 상태를 정의한 YAML 파일들이 저장된 곳.
CD Tool (ArgoCD): Manifest 레포와 K8s 클러스터를 동기화합니다. (Pull 방식)
Ingress Controller (Nginx Ingress / Gateway API): 외부 사용자의 요청을 받아서 내부의 적절한 서비스(지자체 앱, 은행 목업 등)로 연결해 주는 입구 역할을 합니다.
5. 빌드 계층: Continuous Integration (CI)
Source Code Repository (Git - Monorepo): 개발자가 코드를 올리는 곳.
Build System (Bazel / Turborepo): 변경된 모듈만 감지하여 초고속으로 테스트하고 빌드합니다.
CI Orchestrator (GitHub Actions / Jenkins): Bazel을 실행하고 결과물을 레지스트리에 푸시한 뒤, 4번의 Manifest 레포를 업데이트합니다.
Artifact Registry (Docker Registry / Harbor): 빌드된 컨테이너 이미지를 저장하는 보안 창고입니다.
6. 최상위 계층: Application Layer (Runtime)
Business Domains: 지자체 앱(Main), 시민 앱, 은행망(Mock) 등이 각각 독립된 컨테이너로 구동됩니다.
API Gateway: 모든 앱 서비스 앞단에서 인증(Auth), 속도 제한(Rate Limiting), 공통 헤더 처리를 담당합니다.