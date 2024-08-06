package thesistrack.ls1.dto;

import thesistrack.ls1.entity.ThesisProposal;

import java.time.Instant;

public record ThesisProposalDto(
    Instant createdAt,
    LightUserDto createdBy,
    Instant approvedAt,
    LightUserDto approvedBy
) {
    public static ThesisProposalDto fromProposalEntity(ThesisProposal proposal) {
        if (proposal == null) {
            return null;
        }

        return new ThesisProposalDto(
            proposal.getCreatedAt(),
            LightUserDto.fromUserEntity(proposal.getCreatedBy()),
            proposal.getApprovedAt(),
            LightUserDto.fromUserEntity(proposal.getApprovedBy())
        );
    }
}
