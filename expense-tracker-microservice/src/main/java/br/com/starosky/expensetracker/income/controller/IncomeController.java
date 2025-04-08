package br.com.starosky.expensetracker.income.controller;

import br.com.starosky.expensetracker.income.model.IncomeInputDto;
import br.com.starosky.expensetracker.income.model.IncomeOutputDto;
import br.com.starosky.expensetracker.income.service.IncomeService;
import br.com.starosky.expensetracker.infra.exceptions.bundle.CrudException;

import lombok.Setter;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/income")
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
@Setter(onMethod_ = @Autowired)
public class IncomeController {

    IncomeService service;

    @GetMapping
    public ResponseEntity<List<IncomeOutputDto>> list(@RequestParam(required = true) LocalDate referenceDate) {
        List<IncomeOutputDto> result = service.list(referenceDate);
        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<IncomeOutputDto> create(@RequestBody IncomeInputDto inputDto) {
        IncomeOutputDto createdIncome = service.save(inputDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdIncome);
    }

    @PutMapping("/{id}")
    public ResponseEntity<IncomeOutputDto> update(@PathVariable UUID id, @RequestBody IncomeInputDto inputDto)
            throws CrudException {
        IncomeOutputDto updatedIncome = service.update(id, inputDto);
        return ResponseEntity.ok(updatedIncome);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) throws CrudException {
        service.delete(id);
        return ResponseEntity.ok().build();
    }
}
