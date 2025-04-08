package br.com.starosky.expensetracker.bank.controller;

import br.com.starosky.expensetracker.bank.model.BankInputDto;
import br.com.starosky.expensetracker.bank.model.BankOutputDto;
import br.com.starosky.expensetracker.bank.service.BankService;
import br.com.starosky.expensetracker.infra.exceptions.bundle.CrudException;

import lombok.Setter;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/bank")
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
@Setter(onMethod_ = @Autowired)
public class BankController {

    BankService service;

    @GetMapping
    public ResponseEntity<Page<BankOutputDto>> list(Pageable pageable) {
        Page<BankOutputDto> page = service.list(pageable);
        return ResponseEntity.ok(page);
    }

    @GetMapping("/listAll")
    public ResponseEntity<List<BankOutputDto>> listAll() {
        return ResponseEntity.ok(service.listAll());
    }

    @PostMapping
    public ResponseEntity<BankOutputDto> create(@RequestBody BankInputDto inputDto) {
        BankOutputDto createdBank = service.save(inputDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdBank);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BankOutputDto> update(@PathVariable UUID id, @RequestBody BankInputDto inputDto)
            throws CrudException {
        BankOutputDto updatedBank = service.update(id, inputDto);
        return ResponseEntity.ok(updatedBank);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) throws CrudException {
        service.delete(id);
        return ResponseEntity.ok().build();
    }
}
