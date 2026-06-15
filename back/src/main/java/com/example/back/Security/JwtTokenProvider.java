package com.example.back.Security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenProvider {/* 신분증 발급 및 진위 판독기 */

    private final Key key;
    private final long expirationTime;

    public JwtTokenProvider(@Value("${jwt.secret:default-secret-key-12345678901234567890123456789012}") String secret,
                            @Value("${jwt.expiration:86400000}") long expirationTime) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes()); /* 입력한 문자열을 안전한 암호 형태로 키에 저장 */
        this.expirationTime = expirationTime;
    }

    /** 로그인한 사용자의 id를 받아 토큰만들기 */
    public String generateToken(String loginId) {
        Date now = new Date(); /* 현재 시간 선언*/
        Date expiryDate = new Date(now.getTime() + expirationTime); /* 만료 시간 선언 */

        return Jwts.builder() /* 암호화 */
                .setSubject(loginId) /* 토큰에 사용자 이름 담기 */
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /** 토큰받아서 사용자 id리턴 */
    public String getLoginIdFromToken(String token) {

        return Jwts.parserBuilder() /* 복호화 */
                .setSigningKey(key) /* 비교를 위해 원본 키 불러오기 */
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    /** 토큰 유효검사 */
    public boolean validateToken(String token) { /* JwtAuthenticationFilter에서 유효한지 호출 */
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token); //setSigningKey(key): 토큰 생성 시 사용한 것과 같은 비밀키를 설정함, 키가 일치해야만 토큰을 열어볼 수 있음.
            return true; //.parseClaimsJws(token) 주어진 토큰을 열어보고 유효성을 검사
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

}