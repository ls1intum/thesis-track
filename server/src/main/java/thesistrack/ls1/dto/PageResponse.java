package thesistrack.ls1.dto;

import lombok.Getter;
import org.springframework.data.domain.Page;

import java.io.Serializable;
import java.util.List;

@Getter
public class PageResponse<T> implements Serializable {
    private final List<T> content;
    private final int pageNumber;
    private final int pageSize;
    private final long totalElements;
    private final int totalPages;
    private final boolean last;

    public PageResponse(Page<T> page) {
        this.content = page.getContent();
        this.pageNumber = page.getNumber();
        this.pageSize = page.getSize();
        this.totalElements = page.getTotalElements();
        this.totalPages = page.getTotalPages();
        this.last = page.isLast();
    }
}