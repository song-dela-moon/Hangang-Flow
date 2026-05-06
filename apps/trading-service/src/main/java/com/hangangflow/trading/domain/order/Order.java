package com.hangangflow.trading.domain.order;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private OrderType type;       // BUY | SELL

    private String asset;         // e.g. BTC, ETH

    private BigDecimal quantity;

    private BigDecimal price;     // market price at time of order (fetched from market-service)

    @Enumerated(EnumType.STRING)
    private OrderStatus status;   // PENDING | FILLED | CANCELLED

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
