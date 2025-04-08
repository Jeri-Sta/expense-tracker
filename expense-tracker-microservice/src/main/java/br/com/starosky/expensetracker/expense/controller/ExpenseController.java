package br.com.starosky.expensetracker.expense.controller;

import br.com.starosky.expensetracker.expense.model.ExpenseInputDto;
import br.com.starosky.expensetracker.expense.model.ExpenseOutputDto;
import br.com.starosky.expensetracker.expense.service.ExpenseService;
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
@RequestMapping("/expense")
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
@Setter(onMethod_ = @Autowired)
public class ExpenseController {

    ExpenseService service;

    @GetMapping
    public ResponseEntity<List<ExpenseOutputDto>> list(@RequestParam(required = true) LocalDate referenceDate) {
        List<ExpenseOutputDto> result = service.list(referenceDate);
        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<ExpenseOutputDto> create(@RequestBody ExpenseInputDto inputDto) throws CrudException {
        ExpenseOutputDto createdExpense = service.save(inputDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdExpense);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExpenseOutputDto> update(@PathVariable UUID id, @RequestBody ExpenseInputDto inputDto)
            throws CrudException {
        ExpenseOutputDto updatedExpense = service.update(id, inputDto);
        return ResponseEntity.ok(updatedExpense);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) throws CrudException {
        service.delete(id);
        return ResponseEntity.ok().build();
    }
}
