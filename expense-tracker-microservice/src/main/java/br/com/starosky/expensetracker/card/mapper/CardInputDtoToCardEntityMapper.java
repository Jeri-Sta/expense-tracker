package br.com.starosky.expensetracker.card.mapper;

import br.com.starosky.expensetracker.bank.model.BankEntity;
import br.com.starosky.expensetracker.card.model.CardEntity;
import br.com.starosky.expensetracker.card.model.CardInputDto;
import br.com.starosky.expensetracker.infra.Mapper;
import org.springframework.stereotype.Component;

@Component
public class CardInputDtoToCardEntityMapper implements Mapper<CardInputDto, CardEntity> {

    @Override
    public CardEntity mapNonNull(CardInputDto input) {
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
