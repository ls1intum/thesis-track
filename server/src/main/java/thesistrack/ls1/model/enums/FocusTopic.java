package thesistrack.ls1.model.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum FocusTopic {
    COMPETENCIES("Competencies"),
    TEAM_BASED_LEARNING("Team-based Learning"),
    AUTOMATIC_ASSESSMENT("Automatic Assessment"),
    LEARNING_PLATFORMS("Learning Platforms"),
    MACHINE_LEARNING("Machine Learning"),
    DEI("Diversity, Equity & Inclusion"),
    LEARNING_ANALYTICS("Learning Analytics"),
    ADAPTIVE_LEARNING("Adaptive Learning"),
    K12_SCHOOLS("K12 / Schools"),
    SECURITY("Security"),
    INFRASTRUCTURE("Infrastructure"),
    AGILE_DEVELOPMENT("Agile Development"),
    MOBILE_DEVELOPMENT("Mobile Development"),
    CONTINUOUS("Continuous *"),
    MODELING("Modeling"),
    INNOVATION("Innovation"),
    PROJECT_COURSES("Project Courses"),
    DISTRIBUTED_SYSTEMS("Distributed Systems"),
    DEPLOYMENT("Deployment"),
    DEV_OPS("DevOps"),
    INTERACTION_DESIGN("Interaction Design"),
    USER_INVOLVEMENT("User Involvement"),
    USER_EXPERIENCE("User Experience"),
    CREATIVITY("Creativity"),
    USER_MODEL("User Model"),
    INTERACTIVE_TECHNOLOGY("Interactive Technology"),
    MOCK_UPS("Mock-ups"),
    PROTOTYPING("Prototyping"),
    EMBEDDED_SYSTEMS("Embedded Systems"),
    DUCKIETOWN("Duckietown"),
    AUTONOMOUS_DRIVING("Autonomous Driving"),
    COMMUNICATION("Communication"),
    DISTRIBUTED_CONTROL("Distributed Control"),
    LEARNING_AUTONOMY("Learning Autonomy"),
    HW_SW_CO_DESIGN("HW/SW Co-Design");

    private String value;
}
