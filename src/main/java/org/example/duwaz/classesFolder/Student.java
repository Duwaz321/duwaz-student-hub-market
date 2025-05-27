
package org.example.duwaz.classesFolder;

import jakarta.persistence.*;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
public class Student {

    @Getter
    @GeneratedValue
    @Id
    private Long id;

    // Add other student properties

    @OneToMany(mappedBy = "student")
    private List<Business> businesses;
    private String getStudentName;
    @Getter
    @Setter
    private String studentName;
    @Getter
    @Setter
    private String studentNumber;

    public void setName(String testStudent) {
        this.studentName = testStudent;
    }

    public String getName() {
        return this.studentName;
    }

    public Student setId(long l) {
        this.id = l;
        return this;
    }


    // @OneToMany(mappedBy = "student")
   // private List<Order> orders;

    // Add constructors, getters, and setters
}
