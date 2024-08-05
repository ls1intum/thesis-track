package thesistrack.ls1.exception;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;
import thesistrack.ls1.dto.ErrorDto;
import thesistrack.ls1.exception.request.AccessDeniedException;
import thesistrack.ls1.exception.request.ResourceInvalidParametersException;
import thesistrack.ls1.exception.request.ResourceNotFoundException;

import java.text.ParseException;

@ControllerAdvice
public class ResponseExceptionHandler extends ResponseEntityExceptionHandler {
    @ExceptionHandler({ ResourceNotFoundException.class })
    protected ResponseEntity<Object> handleNotFound(RuntimeException ex, WebRequest request) {
        return handleExceptionInternal(ex, ErrorDto.fromRuntimeError(ex), new HttpHeaders(), HttpStatus.NOT_FOUND, request);
    }

    @ExceptionHandler({
            ParseException.class,
            ResourceInvalidParametersException.class,
            JsonParseException.class,
            JsonProcessingException.class,
    })
    protected ResponseEntity<Object> handleBadRequest(RuntimeException ex, WebRequest request) {
        return handleExceptionInternal(ex, ErrorDto.fromRuntimeError(ex), new HttpHeaders(), HttpStatus.BAD_REQUEST, request);
    }

    @ExceptionHandler({ AccessDeniedException.class })
    protected ResponseEntity<Object> handleAccessDenied(RuntimeException ex, WebRequest request) {
        return handleExceptionInternal(ex, ErrorDto.fromRuntimeError(ex), new HttpHeaders(), HttpStatus.FORBIDDEN, request);
    }

    @ExceptionHandler({ MailingException.class, UploadException.class })
    protected ResponseEntity<Object> handleServerError(RuntimeException ex, WebRequest request) {
        return handleExceptionInternal(ex, ErrorDto.fromRuntimeError(ex), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR, request);
    }
}
