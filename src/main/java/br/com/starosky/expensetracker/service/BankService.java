package br.com.starosky.expensetracker.service;

import br.com.starosky.expensetracker.infra.exceptions.bundle.CrudException;
import br.com.starosky.expensetracker.mapper.Mapper;
import br.com.starosky.expensetracker.model.bank.BankEntity;
import br.com.starosky.expensetracker.model.bank.BankInputDto;
import br.com.starosky.expensetracker.model.bank.BankOutputDto;
import br.com.starosky.expensetracker.repository.BankRepository;
import br.com.starosky.expensetracker.utils.SpecificationBuilder;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
@Setter(onMethod_ = @Autowired)
public class BankService {

    BankRepository repository;
    Mapper<BankEntity, BankInputDto, BankOutputDto> mapper;

    public Page<BankOutputDto> list(Pageable pageable) {
        Page<BankEntity> entityPage = repository.findAll(SpecificationBuilder.empty(), pageable);
        return entityPage.map(mapper::toDto);
    }

    public List<BankOutputDto> listAll() {
        List<BankEntity> bankEntities = repository.findAll(SpecificationBuilder.orderBy("name", true));
        return bankEntities.stream()
                .map(mapper::toDto)
                .toList();
    }

    public BankOutputDto save(BankInputDto dto) {
        BankEntity entity = mapper.toEntity(dto);
        BankEntity savedEntity = repository.save(entity);
        return mapper.toDto(savedEntity);
    }

    public BankOutputDto update(UUID id, BankInputDto dto) throws CrudException {
        if (!repository.existsById(id)) {
            throw new CrudException("Banco não encontrado");
        }
        dto.setId(id);
        return this.save(dto);
    }

    public boolean delete(UUID id) throws CrudException {
        if (!repository.existsById(id)) {
            throw new CrudException("Banco não encontrado");
        }
        repository.deleteById(id);
        return true;
    }

    public BankEntity findById(UUID id) throws CrudException {
        return repository.findById(id).orElseThrow(() -> new CrudException("Banco não encontrado"));
    }
}
