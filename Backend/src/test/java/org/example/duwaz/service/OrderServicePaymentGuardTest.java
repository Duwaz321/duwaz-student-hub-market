package org.example.duwaz.service;

import org.example.duwaz.classesFolder.Order;
import org.example.duwaz.repo.OrderRepository;
import org.example.duwaz.repo.ProductRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServicePaymentGuardTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private OrderService orderService;

    @Test
    void shouldNotAdvanceUnpaidOnlineOrderToConfirmed() {
        Order order = new Order();
        order.setId(99L);
        order.setPaymentMethod("YOCO");
        order.setPaymentStatus(Order.PaymentStatus.PENDING);
        order.setStatus(Order.OrderStatus.PENDING);

        when(orderRepository.findById(99L)).thenReturn(Optional.of(order));

        assertThrows(RuntimeException.class, () ->
                orderService.updateStatus(99L, Order.OrderStatus.CONFIRMED, null));

        verify(orderRepository, never()).save(any(Order.class));
    }
}
