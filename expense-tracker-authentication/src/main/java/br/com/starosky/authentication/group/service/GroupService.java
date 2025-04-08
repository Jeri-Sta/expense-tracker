package br.com.starosky.authentication.group.service;

import br.com.starosky.authentication.group.model.GroupEntity;
import br.com.starosky.authentication.group.repository.GroupRepository;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class GroupService {

    @Autowired
    GroupRepository repository;

    public GroupEntity getSchemaByOwnerEmail(String ownerEmail) {
        return repository.findByOwnerEmail(ownerEmail);
    }

    public void createGroup(String email, String schema) {
        GroupEntity groupEntity = new GroupEntity();
        groupEntity.setOwnerEmail(email);
        groupEntity.setSchemaName(schema);
        repository.save(groupEntity);
    }
}
