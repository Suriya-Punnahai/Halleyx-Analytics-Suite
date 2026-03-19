package com.halleyx.dashboard.service;

import com.halleyx.dashboard.model.CustomerOrder;
import com.halleyx.dashboard.repository.CustomerOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class CustomerOrderService {

    @Autowired
    private CustomerOrderRepository repository;

    public List<CustomerOrder> getAllOrders() {
        return repository.findAll();
    }

    public CustomerOrder createOrder(CustomerOrder order) {
        calculateTotalAmount(order);
        if (order.getStatus() == null || order.getStatus().isEmpty()) {
            order.setStatus("Pending");
        }
        return repository.save(order);
    }

    public CustomerOrder updateOrder(Long id, CustomerOrder orderDetails) {
        CustomerOrder order = repository.findById(id).orElseThrow(() -> new RuntimeException("Order not found mapping"));
        
        order.setStreetAddress(orderDetails.getStreetAddress());
        order.setCity(orderDetails.getCity());
        order.setStateProvince(orderDetails.getStateProvince());
        order.setPostalCode(orderDetails.getPostalCode());
        order.setCountry(orderDetails.getCountry());
        order.setProduct(orderDetails.getProduct());
        order.setQuantity(orderDetails.getQuantity());
        order.setUnitPrice(orderDetails.getUnitPrice());
        order.setStatus(orderDetails.getStatus());
        order.setCreatedBy(orderDetails.getCreatedBy());

        calculateTotalAmount(order);
        return repository.save(order);
    }

    public void deleteOrder(Long id) {
        repository.deleteById(id);
    }

    private void calculateTotalAmount(CustomerOrder order) {
        if (order.getQuantity() != null && order.getUnitPrice() != null) {
            order.setTotalAmount(order.getUnitPrice().multiply(BigDecimal.valueOf(order.getQuantity())));
        }
    }
}
