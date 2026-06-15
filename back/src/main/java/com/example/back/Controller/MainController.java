package com.example.back.Controller;


import com.example.back.DTO.CardsDTO;
import com.example.back.DTO.MarketPlaceListingsDTO;
import com.example.back.Entity.CardsEntity;
import com.example.back.Entity.MarketPlaceListingsEntity;
import com.example.back.Entity.UserCollectionsEntity;
import com.example.back.Repository.CardsRepository;
import com.example.back.Repository.UserCollectionsRepository;
import com.example.back.Security.JwtTokenProvider;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;


@Slf4j
@RestController
@RequestMapping("/api/main")
public class MainController {

    private final CardsRepository cardsRepository;
    private final UserCollectionsRepository userCollectionsRepository;
    private final com.example.back.Repository.UsersRepository userRepository;
    private final JwtTokenProvider tokenProvider;

    public MainController(CardsRepository cardsRepository,
                          UserCollectionsRepository userCollectionsRepository,
                          com.example.back.Repository.UsersRepository userRepository,
                          JwtTokenProvider tokenProvider) {
        this.cardsRepository = cardsRepository;
        this.userCollectionsRepository = userCollectionsRepository;
        this.userRepository = userRepository;
        this.tokenProvider = tokenProvider;
    }

    @GetMapping("/ency")
    public ResponseEntity<List<CardsEntity>> getAllCardList() {

        // 서비스호출 -> 모든 리스트 가져오기(cards테이블 조인까지)
        List<CardsEntity> cardList = cardsRepository.findAll(); // 배열형태로 바꿔서 보내주기

        //잘 넘어오나 확인용 로그
        log.info("전송할 DTO 리스트 (카드정보 포함): {}", cardList);

        return ResponseEntity.ok(cardList);
    }

    @PostMapping("/ai")
    public ResponseEntity<?> recognizeCard(
            @RequestBody CardsDTO request,
            @RequestHeader(value = "Authorization", required = false) String token
    ) {
        log.info("인식된 OCR 텍스트: {}", request.getCardNumber());

        if (request.getCardNumber() == null || request.getCardNumber().isEmpty()) {
            return ResponseEntity.badRequest().body("인식된 텍스트가 없습니다.");
        }

        String[] parts = request.getCardNumber().split(",\\s*"); // 쉼표와 공백을 기준으로 분리
        Optional<CardsEntity> cardOpt = Optional.empty();

        for (String part : parts) { // 각 부분을 순회하면서 카드 번호 패턴이 있는지 확인
            String cleanPart = part.trim(); // 양쪽 공백 제거
            if (cleanPart.isEmpty()) continue;

            java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("\\d+/\\d+"); // 카드 번호 패턴 (예: 123/456)
            java.util.regex.Matcher matcher = pattern.matcher(cleanPart); 

            String targetPart = matcher.find() ? matcher.group() : cleanPart; // 패턴이 일치하는 부분이 있으면 그 부분을 사용, 없으면 원래 문자열 사용
            log.info("정제된 카드 번호: {}", targetPart);

            cardOpt = cardsRepository.findByCardNumber(targetPart);
            if (cardOpt.isPresent()) break;
        }

        if (cardOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new CardsDTO(null, "존재하지 않거나 인식할 수 없는 카드입니다."));
        }

        CardsEntity card = cardOpt.get();
        String officialImageUrl = card.getOfficialImageUrl();

        log.info("받은 헤더 토큰값: {}", token);
        // 1. 비로그인 상태 처리
        if (token == null || token.isEmpty() || !token.startsWith("Bearer ")) {
            log.warn("유효한 토큰이 헤더에 포함되지 않았습니다. (token: {})", token);
            return ResponseEntity.ok(new CardsDTO(officialImageUrl, "카드 인식 성공 (유저 정보를 찾을 수 없습니다.)"));
        }

        try {
            // 2. 토큰에서 loginId 추출
            String actualToken = token.substring(7);
            String loginId = tokenProvider.getLoginIdFromToken(actualToken);
            log.info("추출된 Login ID: {}", loginId);

            // 3. 유저 정보 조회 및 도감 처리
            return userRepository.findByLoginId(loginId)
                    .map(user -> {
                        boolean isAlreadyCollected = userCollectionsRepository.existsByUserIdAndCardId(user.getId(), card.getCardId());

                        if (isAlreadyCollected) {
                            return ResponseEntity.ok(new CardsDTO(officialImageUrl, "이미 도감에 등록된 카드입니다."));
                        } else {
                            // 도감에 새로 등록
                            UserCollectionsEntity newCollection = UserCollectionsEntity.builder()
                                    .userId(user.getId())
                                    .cardId(card.getCardId())
                                    .quantity(1)
                                    .conditionGrade("A")
                                    .acquiredMethod("PULL")
                                    .build();
                            userCollectionsRepository.save(newCollection);

                            log.info("유저 ID {} 의 도감에 카드 ID {} 등록 완료", user.getId(), card.getCardId());
                            CardsDTO cardsDTO = new CardsDTO(officialImageUrl, "새로운 카드 인식 성공");
                            return ResponseEntity.ok(cardsDTO);
                        }
                    })
                    .orElseGet(() -> {
                        log.warn("DB에서 해당 Login ID를 찾을 수 없음: {}", loginId);
                        return ResponseEntity.ok(new CardsDTO(officialImageUrl, "카드 인식 성공 (유저 정보를 찾을 수 없습니다.)"));
                    });
        } catch (Exception e) {
            log.error("토큰 검증 또는 처리 중 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity.ok(new CardsDTO(officialImageUrl, "카드 인식 성공 (유저 정보를 찾을 수 없습니다.)"));
        }
    }
}