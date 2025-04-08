package br.com.starosky.expensetracker.category.controller;

import br.com.starosky.expensetracker.category.model.CategoryInputDto;
import br.com.starosky.expensetracker.category.model.CategoryOutputDto;
import br.com.starosky.expensetracker.category.service.CategoryService;
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
@RequestMapping("/category")
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
@Setter(onMethod_ = @Autowired)
public class CategoryController {

    CategoryService service;

    @GetMapping
    public ResponseEntity<Page<CategoryOutputDto>> list(Pageable pageable) {
        Page<CategoryOutputDto> page = service.list(pageable);
        return ResponseEntity.ok(page);
    }

    @GetMapping("/listAll")
    public ResponseEntity<List<CategoryOutputDto>> listAll() {
        return ResponseEntity.ok(service.listAll());
    }

    @PostMapping
    public ResponseEntity<CategoryOutputDto> create(@RequestBody CategoryInputDto inputDto) {
        CategoryOutputDto createdCategory = service.save(inputDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdCategory);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryOutputDto> update(@PathVariable UUID id, @RequestBody CategoryInputDto inputDto)
            throws CrudException {
        CategoryOutputDto updatedCategory = service.update(id, inputDto);
        return ResponseEntity.ok(updatedCategory);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) throws CrudException {
        service.delete(id);
        return ResponseEntity.ok().build();
    }
}
