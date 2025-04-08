package br.com.starosky.authentication.group.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Entity
@Table(name = "groups")
@Data
public class GroupEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @NotNull
    private UUID id;

    @NotBlank
    @Column(unique = true)
    private String ownerEmail;

    @NotBlank
    @Column(unique = true)
    private String schemaName;

}
