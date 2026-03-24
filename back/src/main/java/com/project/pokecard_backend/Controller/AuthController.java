package com.project.pokecard_backend.Controller;


import com.project.pokecard_backend.DTO.LoginRequest;
import com.project.pokecard_backend.DTO.LoginResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {

        // 가짜 DB 체크 (테스트용)
        String testId = "123";
        String testPw = "123";

        if (testId.equals(loginRequest.getUsername()) && testPw.equals(loginRequest.getPassword())) {
            // 로그인 성공: 가짜 토큰 발행
            LoginResponse response = new LoginResponse("mock-jwt-token-abc-123", "로그인에 성공했습니다.");
            return ResponseEntity.ok(response);
        } else {
            // 로그인 실패: 401 Unauthorized 에러 반환
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("아이디 또는 비밀번호가 틀렸습니다.");
        }
    }
}