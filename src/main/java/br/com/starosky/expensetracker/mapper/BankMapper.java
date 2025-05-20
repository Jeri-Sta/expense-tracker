package br.com.starosky.expensetracker.mapper;

import br.com.starosky.expensetracker.model.bank.BankEntity;
import br.com.starosky.expensetracker.model.bank.BankInputDto;
import br.com.starosky.expensetracker.model.bank.BankOutputDto;
import org.springframework.stereotype.Component;

@Component
public class BankMapper implements Mapper<BankEntity, BankInputDto, BankOutputDto> {

    @Override
    public BankOutputDto toDto(BankEntity input) {
        BankOutputDto bankOutputDto = new BankOutputDto();
        bankOutputDto.setId(input.getId());
        bankOutputDto.setName(input.getName());
        bankOutputDto.setBalance(input.getBalance());
        bankOutputDto.setCreatedAt(input.getCreatedAt());
        bankOutputDto.setUpdatedAt(input.getUpdatedAt());
        bankOutputDto.setCreatedBy(input.getCreatedBy());
        bankOutputDto.setLastModifiedBy(input.getLastModifiedBy());
        return bankOutputDto;
    }

    @Override
    public BankEntity toEntity(BankInputDto input) {
        BankEntity bankEntity = new BankEntity();
        bankEntity.setId(input.getId());
        bankEntity.setName(input.getName());
        bankEntity.setBalance(input.getBalance());
        bankEntity.setCreatedAt(input.getCreatedAt());
        bankEntity.setUpdatedAt(input.getUpdatedAt());
        bankEntity.setCreatedBy(input.getCreatedBy());
        bankEntity.setLastModifiedBy(input.getLastModifiedBy());
        return bankEntity;
    }
}
