package thesistrack.ls1.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.Data;
import org.hibernate.validator.constraints.Length;
import thesistrack.ls1.model.enums.Gender;

import java.io.Serializable;
import java.util.UUID;

@Data
@Entity
@Table(uniqueConstraints = {@UniqueConstraint(columnNames = { "email" }) })
public class Student implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(length = 100)
    @Length(max = 100)
    private String firstName;

    @Column(length = 100)
    @Length(max = 100)
    private String lastName;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    @Column(length = 10)
    @Length(max = 10)
    private String nationality;

    @Email
    @Column(unique = true)
    private String email;

    @Column(length = 20)
    @Length(max = 20)
    private String tumId;

    @Column(length = 30)
    @Length(max = 30)
    private String matriculationNumber;

    private Boolean isExchangeStudent;
}
