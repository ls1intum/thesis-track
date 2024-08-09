package thesistrack.ls1.dto;

import thesistrack.ls1.entity.ThesisComment;

import java.time.Instant;
import java.util.UUID;

public record ThesisCommentDto (
        UUID commentId,
        String message,
        boolean hasFile,
        Instant createdAt,
        LightUserDto createdBy
) {
    public static ThesisCommentDto fromCommentEntity(ThesisComment comment) {
        if (comment == null) {
            return null;
        }

        return new ThesisCommentDto(
                comment.getId(),
                comment.getMessage(),
                comment.getFilename() != null,
                comment.getCreatedAt(),
                LightUserDto.fromUserEntity(comment.getCreatedBy())
        );
    }
}
