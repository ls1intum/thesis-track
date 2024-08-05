package thesistrack.ls1.dto;

import org.springframework.data.domain.Page;

import java.util.List;

public record PaginationDto<T> (
        List<T> content,
        int pageNumber,
        int pageSize,
        long totalElements,
        int totalPages,
        boolean last
) {
    public static <E> PaginationDto<E> fromSpringPage(Page<E> page) {
        if (page == null) {
            return null;
        }

        return new PaginationDto<E>(
            page.getContent(),
            page.getNumber(),
            page.getSize(),
            page.getTotalElements(),
            page.getTotalPages(),
            page.isLast()
        );
    }
}