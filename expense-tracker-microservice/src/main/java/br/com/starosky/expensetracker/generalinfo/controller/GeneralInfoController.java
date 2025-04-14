package br.com.starosky.expensetracker.generalinfo.controller;

import br.com.starosky.expensetracker.generalinfo.model.GeneralInfoInputDto;
import br.com.starosky.expensetracker.generalinfo.service.GeneralInfoService;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/general-info")
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
@Setter(onMethod_ = @Autowired)
public class GeneralInfoController {

    GeneralInfoService service;

    @PostMapping
    public void save(@RequestBody GeneralInfoInputDto inputDto) {
        service.setPaymentDate(inputDto);
    }
}
