# 🏦 Hangang-Flow: Crypto Exchange MSA on OpenStack K8s

OpenStack 클라우드 위에 구축된 인프라 가상화 기반의 마이크로서비스 가상자산 거래소 플랫폼입니다.

## 🌟 Key Features
- **Infrastructure as Code**: Terraform을 이용한 오픈스택 자원 자동화
- **Automated Operations**: Ansible을 통한 K8s 클러스터 구성 및 앱 배포
- **Optimized Build**: Bazel 모노레포 빌드 시스템 도입
- **Robust Security**: Distroless 이미지를 활용한 컨테이너 보안 강화

## 🚀 Quick Start (Deployment)

### 1. Infrastructure Provisioning
```bash
cd infra/terraform
terraform init
terraform apply
```

### 2. Cluster Setup & App Deployment
```bash
cd infra/ansible
ansible-playbook -i inventory.ini setup-k8s.yml
ansible-playbook -i inventory.ini deploy-apps.yml
```

## 🔗 Access
- **Exchange UI**: http://172.21.33.221:30001
- **Admin UI**: http://172.21.33.221:30002
