package com.example.boardinghouse.Modules.chat;

import com.example.boardinghouse.Modules.chat.dto.ChatMessageRequest;
import com.example.boardinghouse.Modules.chat.dto.ChatMessageResponse;
import com.example.boardinghouse.Modules.user.user.User;
import com.example.boardinghouse.Modules.user.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;
    
    // Công cụ dùng để chủ động đẩy dữ liệu (push notification) qua WebSocket
    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public ChatController(MessageRepository messageRepository,
                          ConversationRepository conversationRepository,
                          UserRepository userRepository,
                          SimpMessagingTemplate messagingTemplate) {
        this.messageRepository = messageRepository;
        this.conversationRepository = conversationRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }
    /**
     * Hàm này sẽ nhận, lưu DB, rồi broadcast tin nhắn đó ra cho những ai đang theo dõi conversation này.
     */
    @MessageMapping("/chat/{conversationId}")
    public void sendMessage(@DestinationVariable Long conversationId, @Payload ChatMessageRequest request) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        User sender = userRepository.findById(request.getSenderId())
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        // Lưu tin nhắn vào DB
        Message message = Message.builder()
                .conversation(conversation)
                .sender(sender)
                .messageText(request.getMessageText())
                .imageUrl(request.getImageUrl())
                .isRead(false)
                .build();
        Message savedMessage = messageRepository.save(message);

        // Chuyển đổi sang DTO để trả về
        ChatMessageResponse response = ChatMessageResponse.builder()
                .id(savedMessage.getId())
                .conversationId(conversationId)
                .senderId(sender.getId())
                .senderName(sender.getFullName())
                .messageText(savedMessage.getMessageText())
                .imageUrl(savedMessage.getImageUrl())
                .isRead(false)
                .createdAt(savedMessage.getCreatedAt()) // Lấy thời gian chuẩn xác vừa được DB tạo
                .build();

        // Gửi trả lại tin nhắn cho TẤT CẢ client đang Subscribe vào URL: /topic/chat/{conversationId}
        messagingTemplate.convertAndSend("/topic/chat/" + conversationId, response);
    }
    // API lấy lịch sử tin nhắn của 1 phiên chat
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
}
