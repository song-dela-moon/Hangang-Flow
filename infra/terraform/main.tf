# 1. Master Node (m1.large)
resource "openstack_compute_instance_v2" "master" {
  name            = "k8s-master"
  image_name      = "Ubuntu-22.04" # 실제 대시보드에 등록된 정확한 이미지 이름 확인 필요
  flavor_name     = "m1.large"
  key_pair        = "songdelamoon"
  security_groups = [openstack_networking_secgroup_v2.k8s_sg.name]

  network {
    name = "net-01"
  }
}

# 2. Worker Nodes (m1.medium * 2)
resource "openstack_compute_instance_v2" "workers" {
  count           = 2
  name            = "k8s-worker-${count.index + 1}"
  image_name      = "Ubuntu-22.04"
  flavor_name     = "m1.medium"
  key_pair        = "songdelamoon"
  security_groups = [openstack_networking_secgroup_v2.k8s_sg.name]

  network {
    name = "net-01"
  }
}

# ── Floating IP for Master ──────────────────────────────────
resource "openstack_networking_floatingip_v2" "master_fip" {
  pool = "external-net"
}

resource "openstack_compute_floatingip_associate_v2" "master_fip_assoc" {
  floating_ip = openstack_networking_floatingip_v2.master_fip.address
  instance_id = openstack_compute_instance_v2.master.id
}

# ── Floating IPs for Workers ────────────────────────────────
resource "openstack_networking_floatingip_v2" "worker_fips" {
  count = 2
  pool  = "external-net"
}

resource "openstack_compute_floatingip_associate_v2" "worker_fip_assocs" {
  count       = 2
  floating_ip = openstack_networking_floatingip_v2.worker_fips[count.index].address
  instance_id = openstack_compute_instance_v2.workers[count.index].id
}

# ── Outputs ──────────────────────────────────────────────────
output "master_floating_ip" {
  value = openstack_networking_floatingip_v2.master_fip.address
}

output "worker_floating_ips" {
  value = openstack_networking_floatingip_v2.worker_fips[*].address
}

output "master_internal_ip" {
  value = openstack_compute_instance_v2.master.access_ip_v4
}

output "worker_internal_ips" {
  value = openstack_compute_instance_v2.workers[*].access_ip_v4
}
