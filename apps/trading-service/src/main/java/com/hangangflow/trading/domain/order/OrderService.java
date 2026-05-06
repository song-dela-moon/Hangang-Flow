package com.hangangflow.trading.domain.order;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderService {

    private final OrderRepository orderRepository;
    private final RestTemplate restTemplate;

    @Value("${market.service.url:http://localhost:9090}")
    private String marketServiceUrl;

    // ── CREATE: price is fetched from market-service ──────────
    @Transactional
    public Order createOrder(OrderRequest req) {
        BigDecimal marketPrice = fetchMarketPrice(req.getAsset());

        Order order = Order.builder()
                .type(req.getType())
                .asset(req.getAsset())
                .quantity(req.getQuantity())
                .price(marketPrice)               // auto-filled from market-service
                .status(OrderStatus.PENDING)
                .build();
        return orderRepository.save(order);
    }

    // ── READ (all) ───────────────────────────────────────────
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    // ── READ (one) ───────────────────────────────────────────
    public Order getOrder(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found: " + id));
    }

    // ── UPDATE (status change) ────────────────────────────────
    @Transactional
    public Order fillOrder(Long id) {
        Order order = getOrder(id);
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("Only PENDING orders can be filled.");
        }
        order.setStatus(OrderStatus.FILLED);
        return order;
    }

    // ── CANCEL ───────────────────────────────────────────────
    @Transactional
    public Order cancelOrder(Long id) {
        Order order = getOrder(id);
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("Only PENDING orders can be cancelled.");
        }
        order.setStatus(OrderStatus.CANCELLED);
        return order;
    }

    // ── DELETE ───────────────────────────────────────────────
    @Transactional
    public void deleteOrder(Long id) {
        orderRepository.deleteById(id);
    }

    // ── Internal: call market-service for price ───────────────
    @SuppressWarnings("unchecked")
    private BigDecimal fetchMarketPrice(String asset) {
        try {
            String url = marketServiceUrl + "/api/market/prices";
            List<Map<String, Object>> prices = restTemplate.getForObject(url, List.class);
            if (prices != null) {
                return prices.stream()
                        .filter(p -> asset.equalsIgnoreCase((String) p.get("asset")))
                        .map(p -> new BigDecimal(p.get("price").toString()))
                        .findFirst()
                        .orElse(BigDecimal.ZERO);
            }
        } catch (Exception e) {
            System.err.println("[trading-service] Failed to fetch price from market-service: " + e.getMessage());
        }
        return BigDecimal.ZERO;
    }
}
