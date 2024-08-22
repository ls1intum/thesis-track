package thesistrack.ls1;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.ComponentScan;

@ComponentScan(basePackages = "thesistrack.ls1")
class MailTest {
    @Test
    void testGreet() {
        applicationRepository

        assertThat(result).isEqualTo("Hello, John!");
    }
}
