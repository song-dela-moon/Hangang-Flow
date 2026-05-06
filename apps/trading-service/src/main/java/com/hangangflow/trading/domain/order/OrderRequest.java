package com.hangangflow.trading.domain.order;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class OrderRequest {
    private OrderType type;
    private String asset;
    private BigDecimal quantity;
    // price is NOT provided by user - fetched from market-service automatically
}
