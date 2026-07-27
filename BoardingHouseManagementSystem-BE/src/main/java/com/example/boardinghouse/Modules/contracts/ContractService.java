package com.example.boardinghouse.Modules.contracts;

import com.example.boardinghouse.Modules.contracts.dto.ContractRequest;
import com.example.boardinghouse.Modules.contracts.dto.ContractResponse;
import com.example.boardinghouse.Modules.room.Room;
import com.example.boardinghouse.Modules.room.RoomRepository;
import com.example.boardinghouse.Modules.user.user.User;
import com.example.boardinghouse.Modules.user.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ContractService {

    private final ContractRepository contractRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;

    @Autowired
    public ContractService(ContractRepository contractRepository, RoomRepository roomRepository, UserRepository userRepository) {
        this.contractRepository = contractRepository;
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
    }

    public List<ContractResponse> getAllContracts() {
        return contractRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ContractResponse getContractById(Long id) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contract not found"));
        return mapToResponse(contract);
    }

    public ContractResponse createContract(ContractRequest request) {
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found"));
        User tenant = userRepository.findById(request.getTenantId())
                .orElseThrow(() -> new RuntimeException("Tenant not found"));

        Contract contract = Contract.builder()
                .room(room)
                .tenant(tenant)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .deposit(request.getDeposit())
                .rentalPrice(request.getRentalPrice())
                .contractPdfUrl(request.getContractPdfUrl())
                .appointmentId(request.getAppointmentId())
                .status("active")
                .build();

        // Update room status
        room.setStatus("rented");
        roomRepository.save(room);

        return mapToResponse(contractRepository.save(contract));
    }

    public ContractResponse updateContract(Long id, ContractRequest request) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contract not found"));

        if (!contract.getRoom().getId().equals(request.getRoomId())) {
            Room room = roomRepository.findById(request.getRoomId())
                    .orElseThrow(() -> new RuntimeException("Room not found"));
            contract.setRoom(room);
        }

        if (!contract.getTenant().getId().equals(request.getTenantId())) {
            User tenant = userRepository.findById(request.getTenantId())
                    .orElseThrow(() -> new RuntimeException("Tenant not found"));
            contract.setTenant(tenant);
        }

        contract.setStartDate(request.getStartDate());
        contract.setEndDate(request.getEndDate());
        contract.setDeposit(request.getDeposit());
        contract.setRentalPrice(request.getRentalPrice());
        contract.setContractPdfUrl(request.getContractPdfUrl());
        contract.setAppointmentId(request.getAppointmentId());

        return mapToResponse(contractRepository.save(contract));
    }

    public ContractResponse terminateContract(Long id) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contract not found"));

        contract.setStatus("terminated");
        contractRepository.save(contract);

        // Giải phóng phòng
        Room room = contract.getRoom();
        room.setStatus("available");
        roomRepository.save(room);

        return mapToResponse(contract);
    }

    public void deleteContract(Long id) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contract not found"));
        contractRepository.delete(contract);
    }

    private ContractResponse mapToResponse(Contract contract) {
        return ContractResponse.builder()
                .id(contract.getId())
                .roomId(contract.getRoom().getId())
                .roomNumber(contract.getRoom().getRoomNumber())
                .tenantId(contract.getTenant().getId())
                .tenantName(contract.getTenant().getFullName())
                .startDate(contract.getStartDate())
                .endDate(contract.getEndDate())
                .deposit(contract.getDeposit())
                .rentalPrice(contract.getRentalPrice())
                .deposit(contract.getDeposit())
                .status(contract.getStatus())
                .appointmentId(contract.getAppointmentId())
                .createdAt(contract.getCreatedAt())
                .build();
    }
}
