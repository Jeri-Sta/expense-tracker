package br.com.starosky.expensetracker.controller;

import br.com.starosky.expensetracker.infra.exceptions.bundle.CrudException;

import br.com.starosky.expensetracker.model.card.CardInputDto;
import br.com.starosky.expensetracker.model.card.CardOutputDto;
import br.com.starosky.expensetracker.service.CardService;
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
@RequestMapping("/card")
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
@Setter(onMethod_ = @Autowired)
public class CardController {

    CardService service;

    @GetMapping
    public ResponseEntity<Page<CardOutputDto>> list(Pageable pageable) {
        Page<CardOutputDto> page = service.list(pageable);
        return ResponseEntity.ok(page);
    }

    @GetMapping("/listAll")
    public ResponseEntity<List<CardOutputDto>> listAll() {
        return ResponseEntity.ok(service.listAll());
    }

    @PostMapping
    public ResponseEntity<CardOutputDto> create(@RequestBody CardInputDto inputDto) throws CrudException {
        CardOutputDto createdCard = service.save(inputDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdCard);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CardOutputDto> update(@PathVariable UUID id, @RequestBody CardInputDto inputDto)
            throws CrudException {
        CardOutputDto updatedCard = service.update(id, inputDto);
        return ResponseEntity.ok(updatedCard);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) throws CrudException {
        service.delete(id);
        return ResponseEntity.ok().build();
    }
}
