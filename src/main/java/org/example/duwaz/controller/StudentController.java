package org.example.duwaz.controller;

import org.example.duwaz.classesFolder.Student;
import org.example.duwaz.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/Student")
@CrossOrigin(origins = "http://localhost:3000")
public class StudentController {
    @Autowired
    private StudentService service;

    @PostMapping("/create")
    public ResponseEntity<Student> create(@RequestBody Student student) {
        Student savedStudent = service.saveStudent(student);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedStudent);
    }

    @GetMapping("/read/{customerId}")
    public Student read(@PathVariable long studentId){
        return service.findStudentById(studentId);
    }

    @PostMapping("/update")
    public Student update(@RequestBody Student student){
        return service.updateStudent(student);
    }

    @DeleteMapping("/delete/{id}")
    public void delete(@PathVariable long id){
        service.deleteStudentById(id);
    }

    @GetMapping("/getall")
    public List<Student> getallStudent(){
        return service.getAllStudents();
    }



}