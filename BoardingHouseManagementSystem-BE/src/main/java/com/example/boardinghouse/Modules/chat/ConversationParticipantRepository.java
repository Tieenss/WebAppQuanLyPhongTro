package com.example.boardinghouse.Modules.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationParticipantRepository extends JpaRepository<ConversationParticipant, Long> {
    
    // Lấy tất cả các conversation mà user tham gia
    List<ConversationParticipant> findByUserId(Long userId);
    
    // Tìm tham gia của 1 user trong 1 conversation
    Optional<ConversationParticipant> findByConversationIdAndUserId(Long conversationId, Long userId);
    
    // Lấy tất cả người tham gia trong 1 conversation
    List<ConversationParticipant> findByConversationId(Long conversationId);

    // Xóa tham gia
    void deleteByConversationIdAndUserId(Long conversationId, Long userId);
}
