package br.com.starosky.authentication.group.repository;

import br.com.starosky.authentication.group.model.GroupEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface GroupRepository extends JpaRepository<GroupEntity, UUID> {

    GroupEntity findByOwnerEmail(String ownerEmail);
}
