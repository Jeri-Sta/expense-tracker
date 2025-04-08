package br.com.starosky.expensetracker.resume.controller;

import br.com.starosky.expensetracker.resume.model.ResumeInputDto;
import br.com.starosky.expensetracker.resume.model.ResumeOutputDto;
import br.com.starosky.expensetracker.resume.service.ResumeService;
import lombok.AccessLevel;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/resume")
@FieldDefaults(level = AccessLevel.PRIVATE)
@Setter(onMethod_ = @Autowired)
public class ResumeController {

    ResumeService resumeService;

    @PostMapping
    public ResponseEntity<ResumeOutputDto> getResume(@RequestBody ResumeInputDto dto) {
        return ResponseEntity.ok(resumeService.getResume(dto));
    }
}
