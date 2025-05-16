package br.com.starosky.expensetracker.mapper;

import br.com.starosky.expensetracker.model.bank.BankEntity;
import br.com.starosky.expensetracker.model.bank.BankOutputDto;
import br.com.starosky.expensetracker.model.card.CardEntity;
import br.com.starosky.expensetracker.model.card.CardInputDto;
import br.com.starosky.expensetracker.model.card.CardOutputDto;
import org.springframework.stereotype.Component;

@Component
public class CardMapper implements Mapper<CardEntity, CardInputDto, CardOutputDto> {

    @Override
    public CardOutputDto toDto(CardEntity input) {
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

    @Override
    public CardEntity toEntity(CardInputDto input) {
        BankEntity bankEntity = new BankEntity();
        bankEntity.setId(input.getBank().getId());

        CardEntity cardEntity = new CardEntity();
        cardEntity.setId(input.getId());
        cardEntity.setLimit(input.getLimit());
        cardEntity.setClosingDay(input.getClosingDay());
        cardEntity.setBank(bankEntity);

        return cardEntity;
    }
}
