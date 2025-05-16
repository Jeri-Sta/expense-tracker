package br.com.starosky.expensetracker.service;

import br.com.starosky.expensetracker.model.generalinfo.GeneralInfoEntity;
import br.com.starosky.expensetracker.repository.GeneralInfoRepository;
import br.com.starosky.expensetracker.utils.SpecificationBuilder;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class GeneralInfoService {

    @Autowired
    GeneralInfoRepository repository;

    public GeneralInfoEntity save(GeneralInfoEntity generalInfo) {
        return repository.save(generalInfo);
    }

    public int getPaymentDay() {
        GeneralInfoEntity entity = repository.findOne(SpecificationBuilder.empty()).orElseThrow(() -> new RuntimeException("General Info not found"));
        return entity.getPaymentDay();
    }
}
