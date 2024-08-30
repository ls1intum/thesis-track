# Mails

Mails can be customized if you upload own templates to `MAIL_TEMPLATE_FOLDER`.
By default, mail templates from the repository are used.

## Templates

| Template                                                                                              | TO                  | CC                    | BCC                   | Description                                                                  |
|-------------------------------------------------------------------------------------------------------|---------------------|-----------------------|-----------------------|------------------------------------------------------------------------------|
| [application-accepted.html](../server/mail-templates/application-accepted.html)                       | Application Student | Supervisor, Advisor   | `MAIL_BCC_RECIPIENTS` | Application was accepted with different advisor and supervisor               |
| [application-accepted-no-advisor.html](../server/mail-templates/application-accepted-no-advisor.html) | Application Student | Supervisor, Advisor   | `MAIL_BCC_RECIPIENTS` | Application was accepted with same advisor and supervisor                    |
| [application-created-chair.html](../server/mail-templates/application-created-chair.html)             | Chair Members       |                       |                       | All supervisors and advisors get a summary about a new application           |
| [application-created-student.html](../server/mail-templates/application-created-student.html)         | Application User    |                       |                       | Confirmation email to the applying student when application was submitted    |
| [application-rejected.html](../server/mail-templates/application-rejected.html)                       | Application User    |                       | `MAIL_BCC_RECIPIENTS` | Application was rejected                                                     |
| [application-reminder.html](../server/mail-templates/application-reminder.html)                       | Chair Members       |                       |                       | Weekly email if there are more than 10 unreviewed applications               |
| [thesis-assessment-added.html](../server/mail-templates/thesis-assessment-added.html)                 | Supervisors         |                       |                       | Assessment was added to a submitted thesis                                   |
| [thesis-closed.html](../server/mail-templates/thesis-closed.html)                                     | Students            | Supervisors, Advisors | `MAIL_BCC_RECIPIENTS` | Thesis was closed before completion                                          |
| [thesis-comment-posted.html](../server/mail-templates/thesis-comment-posted.html)                     | Students / Advisors | Supervisors, Advisors |                       | New comment on a thesis. TO depends whether its a student or advisor comment |
| [thesis-created.html](../server/mail-templates/thesis-created.html)                                   | Students            | Supervisors, Advisors | `MAIL_BCC_RECIPIENTS` | New thesis was created and assigned to a student                             |
| [thesis-final-grade.html](../server/mail-templates/thesis-final-grade.html)                           | Students            | Supervisors, Advisors | `MAIL_BCC_RECIPIENTS` | Final grade was added to a thesis                                            |
| [thesis-final-submission.html](../server/mail-templates/thesis-final-submission.html)                 | Advisors            | Supervisors           | `MAIL_BCC_RECIPIENTS` | Student submitted final thesis                                               |
| [thesis-presentation-deleted.html](../server/mail-templates/thesis-presentation-deleted.html)         | Students            | Supervisors, Advisors | `MAIL_BCC_RECIPIENTS` | Scheduled presentation was deleted                                           |
| [thesis-presentation-scheduled.html](../server/mail-templates/thesis-presentation-scheduled.html)     | Students            | Supervisors, Advisors | `MAIL_BCC_RECIPIENTS` | New presentation was scheduled                                               |
| [thesis-proposal-accepted.html](../server/mail-templates/thesis-proposal-accepted.html)               | Students            | Supervisors, Advisors |                       | Proposal was accepted                                                        |
| [thesis-proposal-uploaded.html](../server/mail-templates/thesis-proposal-uploaded.html)               | Advisors            | Supervisors           |                       | Student uploaded new proposal                                                |