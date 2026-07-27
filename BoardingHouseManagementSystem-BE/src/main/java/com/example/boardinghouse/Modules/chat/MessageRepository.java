package com.example.boardinghouse.Modules.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    // Lấy toàn bộ tin nhắn của 1 phiên chat, sắp xếp cũ -> mới
    List<Message> findByConversationIdOrderByCreatedAtAsc(Long conversationId);
    
    // Đếm số tin nhắn chưa đọc của 1 phiên chat
    long countByConversationIdAndIsReadFalse(Long conversationId);
}
