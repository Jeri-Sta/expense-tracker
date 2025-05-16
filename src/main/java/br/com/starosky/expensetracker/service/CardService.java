package br.com.starosky.expensetracker.service;

import br.com.starosky.expensetracker.infra.exceptions.bundle.CrudException;
import br.com.starosky.expensetracker.mapper.Mapper;
import br.com.starosky.expensetracker.model.bank.BankEntity;
import br.com.starosky.expensetracker.model.card.CardEntity;
import br.com.starosky.expensetracker.model.card.CardInputDto;
import br.com.starosky.expensetracker.model.card.CardOutputDto;
import br.com.starosky.expensetracker.repository.CardRepository;
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
public class CardService {

    CardRepository repository;
    Mapper<CardEntity, CardInputDto, CardOutputDto> mapper;
    BankService bankService;

    public Page<CardOutputDto> list(Pageable pageable) {
        return repository.findAll(SpecificationBuilder.empty(), pageable).map(mapper::toDto);
    }

    public CardOutputDto save(CardInputDto dto) throws CrudException {
        BankEntity bankEntity = bankService.findById(dto.getBank().getId());
        CardEntity entity = mapper.toEntity(dto);
        entity.setBank(bankEntity);

        CardEntity savedEntity = repository.save(entity);
        return mapper.toDto(savedEntity);
    }

    public CardOutputDto update(UUID id, CardInputDto dto) throws CrudException {
        if (!repository.existsById(id)) {
            throw new CrudException("Cartão não encontrado");
        }
        dto.setId(id);
        return save(dto);
    }

    public boolean delete(UUID id) throws CrudException {
        if (!repository.existsById(id)) {
            throw new CrudException("Cartão não encontrado");
        }
        repository.deleteById(id);
        return true;
    }

    public CardEntity findById(UUID id) throws CrudException {
        return repository.findById(id).orElseThrow(() -> new CrudException("Cartão não encontrado"));
    }

    public List<CardOutputDto> listAll() {
        return repository.findAll(SpecificationBuilder.orderByJoin("bank", "name", true)).stream()
                .map(mapper::toDto)
                .toList();
    }
}
