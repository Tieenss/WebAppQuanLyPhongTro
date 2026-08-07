package com.example.boardinghouse.Modules.chat;

import com.example.boardinghouse.Modules.chat.dto.ChatMessageRequest;
import com.example.boardinghouse.Modules.chat.dto.ChatMessageResponse;
import com.example.boardinghouse.Modules.chat.dto.ConversationResponse;
import com.example.boardinghouse.Modules.chat.dto.CreateGroupRequest;
import com.example.boardinghouse.Modules.user.user.User;
import com.example.boardinghouse.Modules.user.user.UserRepository;
import com.example.boardinghouse.Modules.user.user.dto.UserResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
@Transactional
public class ChatController {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final ConversationParticipantRepository participantRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public ChatController(MessageRepository messageRepository,
                          ConversationRepository conversationRepository,
                          ConversationParticipantRepository participantRepository,
                          UserRepository userRepository,
                          SimpMessagingTemplate messagingTemplate) {
        this.messageRepository = messageRepository;
        this.conversationRepository = conversationRepository;
        this.participantRepository = participantRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/chat/{conversationId}")
    public void sendMessage(@DestinationVariable Long conversationId, @Payload ChatMessageRequest request) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        User sender = userRepository.findById(request.getSenderId())
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        // Xác thực xem user có trong nhóm chat không
        participantRepository.findByConversationIdAndUserId(conversationId, sender.getId())
                .orElseThrow(() -> new RuntimeException("User is not a participant of this conversation"));

        // Lưu tin nhắn vào DB
        Message message = Message.builder()
                .conversation(conversation)
                .sender(sender)
                .messageText(request.getMessageText())
                .imageUrl(request.getImageUrl())
                .isRead(false)
                .build();
        Message savedMessage = messageRepository.save(message);

        // Tăng unreadCount cho những người khác
        List<ConversationParticipant> allParticipants = participantRepository.findByConversationId(conversationId);
        for (ConversationParticipant p : allParticipants) {
            if (!p.getUser().getId().equals(sender.getId())) {
                p.setUnreadCount((p.getUnreadCount() != null ? p.getUnreadCount() : 0) + 1);
                participantRepository.save(p);
            }
        }

        // Chuyển đổi sang DTO để trả về
        ChatMessageResponse response = ChatMessageResponse.builder()
                .id(savedMessage.getId())
                .conversationId(conversationId)
                .senderId(sender.getId())
                .senderName(sender.getFullName())
                .messageText(savedMessage.getMessageText())
                .imageUrl(savedMessage.getImageUrl())
                .isRead(false)
                .createdAt(savedMessage.getCreatedAt())
                .build();

        // Broadcast tin nhắn
        messagingTemplate.convertAndSend("/topic/chat/" + conversationId, response);
    }

    @GetMapping("/{conversationId}/messages")
    public List<ChatMessageResponse> getMessages(@PathVariable Long conversationId) {
        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId)
                .stream().map(msg -> ChatMessageResponse.builder()
                        .id(msg.getId())
                        .conversationId(msg.getConversation().getId())
                        .senderId(msg.getSender().getId())
                        .senderName(msg.getSender().getFullName())
                        .messageText(msg.getMessageText())
                        .imageUrl(msg.getImageUrl())
                        .isRead(msg.getIsRead())
                        .createdAt(msg.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @GetMapping("/{conversationId}/participants")
    public List<UserResponse> getConversationParticipants(@PathVariable Long conversationId) {
        return participantRepository.findByConversationId(conversationId)
                .stream().map(p -> {
                    User user = p.getUser();
                    return UserResponse.builder()
                            .id(user.getId())
                            .username(user.getUsername())
                            .fullName(user.getFullName())
                            .phone(user.getPhone())
                            .email(user.getEmail())
                            .avatarUrl(user.getAvatarUrl())
                            .role(user.getRole())
                            .createdAt(user.getCreatedAt())
                            .build();
                })
                .collect(Collectors.toList());
    }

    @GetMapping("/user/{userId}")
    public List<ConversationResponse> getUserConversations(@PathVariable Long userId) {
        List<ConversationParticipant> participants = participantRepository.findByUserId(userId);
        
        return participants.stream().map(p -> {
            Conversation c = p.getConversation();
            String chatName = c.getChatName();
            String chatImage = c.getChatImage();
            
            // Nếu là chat 1-1, lấy tên và avatar của người kia
            if (!c.getIsGroupChat()) {
                List<ConversationParticipant> otherParticipants = participantRepository.findByConversationId(c.getId())
                        .stream().filter(op -> !op.getUser().getId().equals(userId))
                        .collect(Collectors.toList());
                if (!otherParticipants.isEmpty()) {
                    User otherUser = otherParticipants.get(0).getUser();
                    chatName = otherUser.getFullName();
                    // chatImage = otherUser.getAvatar() ... 
                }
            }

            // Lấy tin nhắn cuối cùng
            String lastMessage = "No messages";
            List<Message> msgs = messageRepository.findByConversationIdOrderByCreatedAtAsc(c.getId());
            if (!msgs.isEmpty()) {
                Message lastMsg = msgs.get(msgs.size() - 1);
                if (lastMsg.getMessageText() != null && !lastMsg.getMessageText().trim().isEmpty()) {
                    lastMessage = lastMsg.getMessageText();
                } else if (lastMsg.getImageUrl() != null) {
                    lastMessage = "[Hình ảnh]";
                }
            }

            return ConversationResponse.builder()
                    .id(c.getId())
                    .chatName(chatName)
                    .isGroupChat(c.getIsGroupChat())
                    .chatImage(chatImage)
                    .lastMessage(lastMessage)
                    .unreadCount(p.getUnreadCount() != null ? p.getUnreadCount().longValue() : 0L)
                    .build();
        }).collect(Collectors.toList());
    }

    @PostMapping("/1on1")
    public ConversationResponse getOrCreate1on1(@RequestParam Long userId) {
        String currentUserIdStr = SecurityContextHolder.getContext().getAuthentication().getName();
        Long currentUserId = Long.valueOf(currentUserIdStr);

        Optional<Conversation> existingOpt = conversationRepository.findOneToOneConversation(currentUserId, userId);
        
        Conversation conversation;
        if (existingOpt.isPresent()) {
            conversation = existingOpt.get();
        } else {
            conversation = Conversation.builder()
                    .isGroupChat(false)
                    .build();
            conversation = conversationRepository.save(conversation);
            
            User u1 = userRepository.findById(currentUserId).orElseThrow();
            User u2 = userRepository.findById(userId).orElseThrow();
            
            participantRepository.save(ConversationParticipant.builder().conversation(conversation).user(u1).build());
            participantRepository.save(ConversationParticipant.builder().conversation(conversation).user(u2).build());
        }
        
        return ConversationResponse.builder()
                .id(conversation.getId())
                .isGroupChat(false)
                .build();
    }
    
    @PostMapping("/group")
    public ConversationResponse createGroup(@RequestBody CreateGroupRequest request) {
        // Lấy userId của người đang gọi API từ JWT Context
        String currentUserIdStr = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findById(Long.valueOf(currentUserIdStr)).orElseThrow(() -> new RuntimeException("Unauthorized"));
        
        if (!"LANDLORD".equalsIgnoreCase(currentUser.getRole())) {
            throw new RuntimeException("Only landlords can create group chats.");
        }

        Conversation conversation = Conversation.builder()
                .isGroupChat(true)
                .chatName(request.getChatName())
                .chatImage(request.getChatImage())
                .build();
        conversation = conversationRepository.save(conversation);
        
        // Add current user (Landlord) as Admin
        participantRepository.save(ConversationParticipant.builder()
                .conversation(conversation)
                .user(currentUser)
                .role("ADMIN")
                .build());

        // Add other members
        for (Long userId : request.getMemberIds()) {
            if (userId.equals(currentUser.getId())) continue;
            User u = userRepository.findById(userId).orElseThrow();
            participantRepository.save(ConversationParticipant.builder()
                    .conversation(conversation)
                    .user(u)
                    .role("MEMBER")
                    .build());
        }
        
        return ConversationResponse.builder()
                .id(conversation.getId())
                .isGroupChat(true)
                .chatName(conversation.getChatName())
                .chatImage(conversation.getChatImage())
                .build();
    }

    @PutMapping("/{id}/read")
    public void markAsRead(@PathVariable Long id) {
        String currentUserIdStr = SecurityContextHolder.getContext().getAuthentication().getName();
        Long currentUserId = Long.valueOf(currentUserIdStr);
        participantRepository.findByConversationIdAndUserId(id, currentUserId).ifPresent(p -> {
            p.setUnreadCount(0);
            participantRepository.save(p);
        });
    }

    private void verifyGroupAdmin(Long conversationId) {
        String currentUserIdStr = SecurityContextHolder.getContext().getAuthentication().getName();
        Long currentUserId = Long.valueOf(currentUserIdStr);
        ConversationParticipant participant = participantRepository.findByConversationIdAndUserId(conversationId, currentUserId)
                .orElseThrow(() -> new RuntimeException("You are not a member of this conversation"));
        if (!"ADMIN".equalsIgnoreCase(participant.getRole())) {
            throw new RuntimeException("Only group admin can perform this action");
        }
    }

    @PutMapping("/group/{id}/avatar")
    public void updateGroupAvatar(@PathVariable Long id, @RequestBody java.util.Map<String, String> payload) {
        verifyGroupAdmin(id);
        Conversation conversation = conversationRepository.findById(id).orElseThrow();
        conversation.setChatImage(payload.get("imageUrl"));
        conversationRepository.save(conversation);
    }

    @PostMapping("/group/{id}/members")
    public void addMembers(@PathVariable Long id, @RequestBody java.util.Map<String, List<Long>> payload) {
        verifyGroupAdmin(id);
        Conversation conversation = conversationRepository.findById(id).orElseThrow();
        List<Long> memberIds = payload.get("memberIds");
        if (memberIds != null) {
            for (Long userId : memberIds) {
                // Kiểm tra xem đã có trong nhóm chưa
                if (participantRepository.findByConversationIdAndUserId(id, userId).isEmpty()) {
                    User u = userRepository.findById(userId).orElseThrow();
                    participantRepository.save(ConversationParticipant.builder()
                            .conversation(conversation)
                            .user(u)
                            .role("MEMBER")
                            .build());
                }
            }
        }
    }

    @DeleteMapping("/group/{id}/members/{userId}")
    public void removeMember(@PathVariable Long id, @PathVariable Long userId) {
        verifyGroupAdmin(id);
        ConversationParticipant participant = participantRepository.findByConversationIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Member not found in conversation"));
        if ("ADMIN".equalsIgnoreCase(participant.getRole())) {
            throw new RuntimeException("Cannot remove the admin of the group");
        }
        participantRepository.delete(participant);
    }
}
