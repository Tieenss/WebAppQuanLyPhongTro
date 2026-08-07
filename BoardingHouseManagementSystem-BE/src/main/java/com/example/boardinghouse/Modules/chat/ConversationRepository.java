package com.example.boardinghouse.Modules.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    
    // Tìm cuộc hội thoại 1-1 giữa 2 user
    @Query("SELECT c FROM Conversation c " +
           "JOIN ConversationParticipant cp1 ON c.id = cp1.conversation.id " +
           "JOIN ConversationParticipant cp2 ON c.id = cp2.conversation.id " +
           "WHERE c.isGroupChat = false " +
           "AND cp1.user.id = :user1Id " +
           "AND cp2.user.id = :user2Id")
    Optional<Conversation> findOneToOneConversation(@Param("user1Id") Long user1Id, @Param("user2Id") Long user2Id);
}
