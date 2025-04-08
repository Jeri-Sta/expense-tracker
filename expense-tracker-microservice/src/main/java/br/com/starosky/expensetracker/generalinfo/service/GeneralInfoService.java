package br.com.starosky.expensetracker.generalinfo.service;

import br.com.starosky.expensetracker.generalinfo.model.GeneralInfoEntity;
import br.com.starosky.expensetracker.generalinfo.repository.GeneralInfoRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GeneralInfoService {

    private final GeneralInfoRepository repository;
    private final JdbcTemplate jdbcTemplate;

    public GeneralInfoService(GeneralInfoRepository repository, JdbcTemplate jdbcTemplate) {
        this.repository = repository;
        this.jdbcTemplate = jdbcTemplate;
    }

    public int getPaymentDay() {
        GeneralInfoEntity entity = repository.findAll().get(0);
        return entity.getPaymentDay();
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void setPaymentDate(String schemaName, int day) {
        GeneralInfoEntity generalInfoEntity = new GeneralInfoEntity();
        generalInfoEntity.setPaymentDay(day);

        jdbcTemplate.execute("SET search_path TO " + schemaName);

        repository.save(generalInfoEntity);
    }
}
