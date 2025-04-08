package br.com.starosky.expensetracker.generalinfo.repository;

import br.com.starosky.expensetracker.generalinfo.model.GeneralInfoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface GeneralInfoRepository extends JpaRepository<GeneralInfoEntity, UUID> {
}
