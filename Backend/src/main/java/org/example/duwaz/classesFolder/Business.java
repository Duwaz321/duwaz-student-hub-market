package org.example.duwaz.classesFolder;

import jakarta.persistence.Id;
import jakarta.persistence.Entity;
import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import lombok.Getter;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Getter
@Setter
public class Business {

    public Business() {
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "business_name")
    private String businessName;

    @Column(name = "description")
    private String description;

    @ManyToOne
    @JoinColumn(name = "student_id")
    @JsonIgnoreProperties("businesses")
    private Student student;

    public void setName(String doas) {
        this.businessName = doas;
    }
}