package com.example.back.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_collections")
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
public class UserCollectionsEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "collection_id")
    private Long collectionId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "card_id", nullable = false)
    private Long cardId;

    @Column(name = "quantity")
    private Integer quantity;

    @Column(name = "condition_grade", length = 5)
    private String conditionGrade;

    @Column(name = "acquired_method", length = 20)
    private String acquiredMethod;

    @Column(name = "added_at", updatable = false)
    private LocalDateTime addedAt;

    //JPQL을 위한 필드
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private UsersEntity user;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "card_id", insertable = false, updatable = false)
    private CardsEntity card;

    @PrePersist
    public void prePersist() { // 엔티티가 처음 저장되기 전에 실행되는 메서드
        this.addedAt = LocalDateTime.now();
        if (this.quantity == null) this.quantity = 1;
        if (this.conditionGrade == null) this.conditionGrade = "A";
    }
}