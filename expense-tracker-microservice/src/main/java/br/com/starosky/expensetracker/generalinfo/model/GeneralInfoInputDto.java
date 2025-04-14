package br.com.starosky.expensetracker.generalinfo.model;

import lombok.Data;

@Data
public class GeneralInfoInputDto {
    String schemaName;
    Integer paymentDay;
}
