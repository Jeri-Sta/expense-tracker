package br.com.starosky.expensetracker.resume.model;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResumeInputDto {
    @NotNull
    private LocalDate currentDate;
}
