package br.com.starosky.expensetracker.card.service;

import br.com.starosky.expensetracker.card.model.CardEntity;
import br.com.starosky.expensetracker.card.model.CardInputDto;
import br.com.starosky.expensetracker.card.model.CardOutputDto;
import br.com.starosky.expensetracker.card.repository.CardRepository;
import br.com.starosky.expensetracker.bank.service.BankService;
import br.com.starosky.expensetracker.infra.Mapper;
import br.com.starosky.expensetracker.infra.exceptions.bundle.CrudException;
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
    Mapper<CardEntity, CardOutputDto> cardEntityCardOutputDtoMapper;
    Mapper<CardInputDto, CardEntity> cardInputDtoCardEntityMapper;
    BankService bankService;

    public Page<CardOutputDto> list(Pageable pageable) {
        return repository.findAll(pageable).map(cardEntityCardOutputDtoMapper::mapNonNull);
    }

    public CardOutputDto save(CardInputDto dto) throws CrudException {
        var bankEntity = bankService.findById(dto.getBank().getId());
        CardEntity entity = cardInputDtoCardEntityMapper.mapNonNull(dto);
        entity.setBank(bankEntity);

        CardEntity savedEntity = repository.save(entity);
        return cardEntityCardOutputDtoMapper.mapNonNull(savedEntity);
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
        return repository.findAllByOrderByBankNameAsc().stream()
                .map(cardEntityCardOutputDtoMapper::mapNonNull)
                .toList();
    }
}
