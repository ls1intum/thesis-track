# ThesisTrack

ThesisTrack is a web-based thesis management system designed to streamline the thesis process in academic institutions by integrating essential stages into a single platform. 
Developed to address challenges in managing large volumes of theses, it facilitates seamless interactions between students, advisors, and supervisors. 
Key features include a centralized application process, guided workflows for thesis writing, automated notifications, and a comprehensive Gantt chart for tracking progress. 
By consolidating communication, feedback, and file management, ThesisTrack enhances transparency, reduces administrative burdens, and fosters efficient thesis supervision and assessment.

ThesisTrack was developed as part of this [bachelor's thesis](docs/files/ba-thesis-fabian-emilius.pdf).

## User Documentation

A short description and a demo video of the most important functionality of the platform.
The videos are grouped by the roles student, advisor and supervisor.

#### Student

- [Submit Thesis Application](https://live.rbg.tum.de/w/artemisintro/53606)  
  Allows students to apply for available thesis topics. Students can choose a topic, provide relevant personal details, and submit a motivation letter. This structured process helps reduce application stress by offering clear guidance on required steps.

- [Edit Thesis Application](https://live.rbg.tum.de/w/artemisintro/53607)  
  Enables students to modify their submitted application details before it is reviewed by an advisor. This feature allows for adjustments to personal information and application motivation to ensure accuracy.

- [Upload Proposal](https://live.rbg.tum.de/w/artemisintro/53608)  
  Facilitates the initial submission of the thesis proposal document. Students can submit proposals for review, and advisors can provide feedback directly through the platform, helping improve proposal quality.

- [Upload Thesis Files](https://live.rbg.tum.de/w/artemisintro/53609)  
  Allows students to upload their completed thesis documents and presentations. This section supports version history and locks file uploads after final submission, ensuring that no changes are made post-submission.

- [Create Presentation Draft](https://live.rbg.tum.de/w/artemisintro/53604)  
  Provides students with a section to draft their presentation, which can be reviewed and adjusted by advisors. Finalizing this draft ensures that the presentation aligns with thesis requirements and is accessible to invited attendees.

- [Manage User Settings](https://live.rbg.tum.de/w/artemisintro/53605)  
  Enables students to configure their account settings, including personal information such as study program and contact details, ensuring all details are up-to-date.

#### Advisor

- [Create Thesis Topic](https://live.rbg.tum.de/w/artemisintro/53599)  
  Allows advisors to create new thesis topics with relevant details, enabling students to browse and apply for them. This feature helps streamline the matching of students to research-aligned topics.

- [Review Applications](https://live.rbg.tum.de/w/artemisintro/53601)  
  Provides advisors with tools to review student applications. Advisors can assess motivation letters, academic backgrounds, and make an informed decision on each applicant.

- [Review Proposal](https://live.rbg.tum.de/w/artemisintro/53602)  
  Enables advisors to review submitted proposals, provide structured feedback, and help students refine their project objectives and approach before starting full thesis work.

- [Add Comments](https://live.rbg.tum.de/w/artemisintro/53600)  
  Lets advisors post comments and attach relevant files as milestones or feedback for students. This ensures key information is documented and easily referenced during the thesis process.

- [Schedule Presentation](https://live.rbg.tum.de/w/artemisintro/53603)  
  Provides a scheduling feature for thesis presentations, allowing advisors to set dates and invite relevant attendees, ensuring that students have a formal opportunity to present their work.

- [Submit Thesis Assessment](https://live.rbg.tum.de/w/artemisintro/53598)  
  Enables advisors to submit an evaluation of the thesis, including a recommended grade. This assessment informs the final grading and captures key feedback for student growth.

#### Supervisor

- [Add Final Grade + Complete Thesis](https://live.rbg.tum.de/w/artemisintro/53610)  
  Allows supervisors to add the final grade and officially mark the thesis as complete. This feature consolidates all feedback and grading, ensuring the thesis lifecycle is fully documented.

## Developer Documentation

1. [Production Setup](docs/PRODUCTION.md)
2. [Configuration](docs/CONFIGURATION.md)
3. [Customizing E-Mails](docs/MAILS.md)
4. [Development Setup](docs/DEVELOPMENT.md)
5. [Database Changes](docs/DATABASE.md)

## Features

The following flowchart diagrams provide a visual overview of the thesis processes implemented in ThesisTrack. 
These diagrams illustrate the step-by-step workflows involved, from thesis topic selection and application submission to the final grading and completion stages. 
They highlight key actions, decision points, and interactions between students, advisors, and supervisors, clarifying how tasks are sequenced and managed within the system. 
These flowcharts offer a quick reference for understanding how each role engages in the thesis process, ensuring transparency and consistency in task progression and responsibilities across different stages.

#### Thesis Application Flowchart
![Thesis Application Flowchart](docs/files/thesis-application-flowchart.svg)

#### Thesis Writing Flowchart
![Thesis Writing Flowchart](docs/files/thesis-writing-flowchart.svg)
