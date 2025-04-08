package br.com.starosky.expensetracker.card.mapper;

import br.com.starosky.expensetracker.bank.model.BankOutputDto;
import br.com.starosky.expensetracker.card.model.CardEntity;
import br.com.starosky.expensetracker.card.model.CardOutputDto;
import br.com.starosky.expensetracker.infra.Mapper;
import org.springframework.stereotype.Component;

@Component
public class CardEntityToCardOutputDtoMapper implements Mapper<CardEntity, CardOutputDto> {

    @Override
    public CardOutputDto mapNonNull(CardEntity input) {
        BankOutputDto bankDto = new BankOutputDto();
        bankDto.setId(input.getBank() != null ? input.getBank().getId() : null);
        if (input.getBank() != null) {
            bankDto.setName(input.getBank().getName());
            bankDto.setBalance(input.getBank().getBalance());
        }

        CardOutputDto cardOutputDto = new CardOutputDto();
        cardOutputDto.setId(input.getId());
        cardOutputDto.setLimit(input.getLimit());
        cardOutputDto.setClosingDay(input.getClosingDay());
        cardOutputDto.setBank(bankDto);

        return cardOutputDto;
    }
}
