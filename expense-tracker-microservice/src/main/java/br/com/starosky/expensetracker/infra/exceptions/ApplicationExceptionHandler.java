package br.com.starosky.expensetracker.infra.exceptions;

import br.com.starosky.expensetracker.infra.exceptions.bundle.CrudException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@ControllerAdvice
public class ApplicationExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(CrudException.class)
    public ResponseEntity<?> handleException(Exception e) {
        DefaultError error = new DefaultError(HttpStatus.BAD_REQUEST.toString(), e.getMessage());
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    // @ExceptionHandler(AuthenticationAppException.class)
    // public ResponseEntity handleEmailNotFoundException(Exception e) {
    // DefaultError error = new DefaultError(HttpStatus.BAD_REQUEST.toString(),
    // e.getMessage());
    // return new ResponseEntity(error, HttpStatus.BAD_REQUEST);
    // }
}
