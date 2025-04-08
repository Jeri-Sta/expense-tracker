package br.com.starosky.expensetracker.bank.mapper;

import br.com.starosky.expensetracker.bank.model.BankEntity;
import br.com.starosky.expensetracker.bank.model.BankOutputDto;
import br.com.starosky.expensetracker.infra.Mapper;
import org.springframework.stereotype.Component;

@Component
public class BankEntityToBankOutputDtoMapper implements Mapper<BankEntity, BankOutputDto> {

    @Override
    public BankOutputDto mapNonNull(BankEntity input) {
        BankOutputDto bankOutputDto = new BankOutputDto();
        bankOutputDto.setId(input.getId());
        bankOutputDto.setName(input.getName());
        bankOutputDto.setBalance(input.getBalance());
        return bankOutputDto;
    }
}
