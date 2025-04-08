package br.com.starosky.expensetracker.generalinfo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Entity
@Table(name = "general_info")
@Data
public class GeneralInfoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @NotNull
    private UUID id;

    @NotNull
    private int paymentDay = 7;
}
