package thesistrack.ls1;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ThesisTrackApplication implements ApplicationRunner {
	private static final Logger logger = LoggerFactory.getLogger(ThesisTrackApplication.class);

	public static void main(String[] args) {
		SpringApplication.run(ThesisTrackApplication.class, args);
	}

	@Override
	public void run(ApplicationArguments applicationArguments) {
		logger.info("Service running...");
	}
}
