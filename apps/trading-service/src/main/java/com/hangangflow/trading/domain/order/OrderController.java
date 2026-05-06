package com.hangangflow.trading.domain.order;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;

    /** CREATE: POST /api/orders */
    @PostMapping
    public ResponseEntity<Order> create(@RequestBody OrderRequest req) {
        return ResponseEntity.ok(orderService.createOrder(req));
    }

    /** READ all: GET /api/orders */
    @GetMapping
    public List<Order> getAll() {
        return orderService.getAllOrders();
    }

    /** READ one: GET /api/orders/{id} */
    @GetMapping("/{id}")
    public Order getOne(@PathVariable Long id) {
        return orderService.getOrder(id);
    }

    /** UPDATE (fill order): PATCH /api/orders/{id}/fill */
    @PatchMapping("/{id}/fill")
    public Order fill(@PathVariable Long id) {
        return orderService.fillOrder(id);
    }

    /** CANCEL: PATCH /api/orders/{id}/cancel */
    @PatchMapping("/{id}/cancel")
    public Order cancel(@PathVariable Long id) {
        return orderService.cancelOrder(id);
    }

    /** DELETE: DELETE /api/orders/{id} */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }
}
