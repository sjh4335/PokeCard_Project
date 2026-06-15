package com.example.back.Config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // 클라이언트에서 웹소켓에 접속하는 엔드포인트
        registry.addEndpoint("/ws-stomp")
                .setAllowedOriginPatterns("*") //CORS 설정, 모든 도메인에서의 접속을 허용
                .withSockJS(); // SockJS 지원 (브라우저 호환성)
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // 메시지를 받을 때: /sub/chat/room/1 등으로 구독
        registry.enableSimpleBroker("/sub");
        // 메시지를 보낼 때: /pub/message 등으로 보냄
        registry.setApplicationDestinationPrefixes("/pub");
    }
}