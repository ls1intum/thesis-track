package thesistrack.ls1.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import thesistrack.ls1.constants.ThesisRoleName;
import thesistrack.ls1.entity.Thesis;
import thesistrack.ls1.entity.ThesisRole;
import thesistrack.ls1.entity.User;
import thesistrack.ls1.entity.key.ThesisRoleId;
import thesistrack.ls1.repository.ThesisRoleRepository;

import java.time.Instant;

@Service
public class ThesisService {
    private final ThesisRoleRepository thesisRoleRepository;

    @Autowired
    public ThesisService(ThesisRoleRepository thesisRoleRepository) {
        this.thesisRoleRepository = thesisRoleRepository;
    }

    public ThesisRole saveThesisRole(Thesis thesis, User assigner, User user, ThesisRoleName role) {
        ThesisRole thesisRole = new ThesisRole();
        ThesisRoleId thesisRoleId = new ThesisRoleId();

        thesisRoleId.setThesisId(thesis.getId());
        thesisRoleId.setUserId(user.getId());
        thesisRoleId.setRole(role);

        thesisRole.setId(thesisRoleId);
        thesisRole.setUser(user);
        thesisRole.setAssignedBy(assigner);
        thesisRole.setAssignedAt(Instant.now());
        thesisRole.setThesis(thesis);

        return thesisRoleRepository.save(thesisRole);
    }
}
