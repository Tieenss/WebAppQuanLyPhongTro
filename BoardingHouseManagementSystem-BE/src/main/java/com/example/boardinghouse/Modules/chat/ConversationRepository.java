package com.example.boardinghouse.Modules.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    
    // Tìm cuộc hội thoại giữa 2 người (để tái sử dụng nếu đã chat rồi)
    Optional<Conversation> findByGuestIdAndLandlordId(Long guestId, Long landlordId);
    
    // Tìm tất cả các hội thoại của chủ trọ
    List<Conversation> findByLandlordId(Long landlordId);
    
    // Tìm tất cả các hội thoại của khách
    List<Conversation> findByGuestId(Long guestId);
}
