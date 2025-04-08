package br.com.starosky.expensetracker.bank.mapper;

import br.com.starosky.expensetracker.bank.model.BankEntity;
import br.com.starosky.expensetracker.bank.model.BankInputDto;
import br.com.starosky.expensetracker.infra.Mapper;
import org.springframework.stereotype.Component;

@Component
public class BankInputDtoToBankEntityMapper implements Mapper<BankInputDto, BankEntity> {

    @Override
    public BankEntity mapNonNull(BankInputDto input) {
        BankEntity bankEntity = new BankEntity();
        bankEntity.setId(input.getId());
        bankEntity.setName(input.getName());
        bankEntity.setBalance(input.getBalance());
        return bankEntity;
    }
}
