# 🏗 Hangang-Flow Infrastructure Architecture

본 프로젝트는 OpenStack 클라우드 위에 구축된 엔터프라이즈급 가상자산 거래소 인프라 아키텍처를 따릅니다.

## 1. 인프라 계층 (Infrastructure Layer)
- **Cloud OS**: OpenStack (Compute, Network, Storage 가상화)
- **IaC**: **Terraform**을 통한 프로비저닝 (Master x1, Worker x2)
- **Security**: 전용 Security Group 설정을 통한 포트 제어 (SSH, API, NodePort, VXLAN)

## 2. 클러스터 계층 (Cluster Layer)
- **Container Runtime**: containerd
- **CNI**: **Flannel** (VXLAN 모드, UDP 8472 사용)
- **Orchestrator**: Kubernetes (v1.29+)
- **Config Management**: **Ansible**을 통한 자동화된 노드 설정 및 K8s 초기화

## 3. 빌드 및 배포 계층 (CI/CD Layer)
- **Build System**: **Bazel** (Monorepo 빌드 최적화, OCI 이미지 생성)
- **Bundler**: **esbuild** (Node.js 의존성 번들링)
- **CI**: GitHub Actions를 통한 Docker Hub 자동 푸시
- **CD**: Ansible 기반 Manifest 배포 및 kubectl 자동화

## 4. 애플리케이션 계층 (Application Layer)
- **Frontend**: Vite + React (served by Node.js Proxy Server)
- **Backend (Market)**: Node.js (Express)
- **Backend (Trading)**: Java 21 (Spring Boot + JPA)
- **Database**: H2 In-memory (Trading Domain)