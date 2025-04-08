package br.com.starosky.expensetracker.bank.service;

import br.com.starosky.expensetracker.bank.model.BankEntity;
import br.com.starosky.expensetracker.bank.model.BankInputDto;
import br.com.starosky.expensetracker.bank.model.BankOutputDto;
import br.com.starosky.expensetracker.bank.repository.BankRepository;
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
public class BankService {

    BankRepository repository;
    Mapper<BankEntity, BankOutputDto> bankEntityBankOutputDtoMapper;
    Mapper<BankInputDto, BankEntity> bankInputDtoBankEntityMapper;

    public Page<BankOutputDto> list(Pageable pageable) {
        Page<BankEntity> entityPage = repository.findAll(pageable);
        return entityPage.map(bankEntityBankOutputDtoMapper::mapNonNull);
    }

    public List<BankOutputDto> listAll() {
        List<BankEntity> bankEntities = repository.findAllByOrderByNameAsc();
        return bankEntities.stream()
                .map(bankEntityBankOutputDtoMapper::mapNonNull)
                .toList();
    }

    public BankOutputDto save(BankInputDto dto) {
        BankEntity entity = bankInputDtoBankEntityMapper.mapNonNull(dto);
        BankEntity savedEntity = repository.save(entity);
        return bankEntityBankOutputDtoMapper.mapNonNull(savedEntity);
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
