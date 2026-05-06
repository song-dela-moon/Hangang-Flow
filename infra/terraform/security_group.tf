resource "openstack_networking_secgroup_v2" "k8s_sg" {
  name        = "k8s-security-group"
  description = "Security group for Kubernetes cluster nodes"
}

# 1. SSH (22) - 관리용
resource "openstack_networking_secgroup_rule_v2" "ssh" {
  direction         = "ingress"
  ethertype         = "IPv4"
  protocol          = "tcp"
  port_range_min    = 22
  port_range_max    = 22
  remote_ip_prefix  = "0.0.0.0/0"
  security_group_id = openstack_networking_secgroup_v2.k8s_sg.id
}

# 2. K8s API Server (6443) - 마스터 접속용
resource "openstack_networking_secgroup_rule_v2" "k8s_api" {
  direction         = "ingress"
  ethertype         = "IPv4"
  protocol          = "tcp"
  port_range_min    = 6443
  port_range_max    = 6443
  remote_ip_prefix  = "0.0.0.0/0"
  security_group_id = openstack_networking_secgroup_v2.k8s_sg.id
}

# 3. 모든 내부 통신 허용 (노드 간 자유로운 통신 필수)
resource "openstack_networking_secgroup_rule_v2" "internal_all" {
  direction         = "ingress"
  ethertype         = "IPv4"
  protocol          = "tcp"
  port_range_min    = 1
  port_range_max    = 65535
  remote_group_id   = openstack_networking_secgroup_v2.k8s_sg.id # 자기 자신(보안그룹 내 노드)끼리는 모두 허용
  security_group_id = openstack_networking_secgroup_v2.k8s_sg.id
}

# 4. NodePort 서비스 (30000-32767) - 외부 앱 접속용
resource "openstack_networking_secgroup_rule_v2" "nodeports" {
  direction         = "ingress"
  ethertype         = "IPv4"
  protocol          = "tcp"
  port_range_min    = 30000
  port_range_max    = 32767
  remote_ip_prefix  = "0.0.0.0/0"
  security_group_id = openstack_networking_secgroup_v2.k8s_sg.id
}
