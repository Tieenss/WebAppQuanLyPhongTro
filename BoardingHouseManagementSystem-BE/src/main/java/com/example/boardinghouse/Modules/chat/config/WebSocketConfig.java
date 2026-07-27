package com.example.boardinghouse.Modules.chat.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * Cấu hình WebSocket (Sử dụng giao thức STOMP).
 * Chịu trách nhiệm thiết lập đường ống để Frontend kết nối Real-time.
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Frontend kết nối vào URL này (vd: ws://localhost:8080/ws-chat) để thiết lập WebSocket
        registry.addEndpoint("/ws-chat").setAllowedOriginPatterns("*").withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Tiền tố gửi tin nhắn từ Client -> Server
        registry.setApplicationDestinationPrefixes("/app");
        // Tiền tố gửi tin nhắn từ Server -> Client (Subscribe)
        registry.enableSimpleBroker("/topic", "/queue");
    }
}
