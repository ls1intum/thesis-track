package thesistrack.ls1.utility;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import thesistrack.ls1.dto.LightUserDto;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;

class DataFormatterTest {

    private enum TestEnum {
        FIRST_VALUE,
        SECOND_VALUE,
        SIMPLE
    }

    private LightUserDto createTestUser(String firstName, String lastName) {
        return new LightUserDto(
                UUID.randomUUID(),
                "avatar.jpg",
                "uni123",
                "m12345",
                firstName,
                lastName,
                firstName + "@example.com",
                "Bachelor",
                "Computer Science",
                new HashMap<>(),
                Instant.now(),
                Arrays.asList("admin", "supervisor")
        );
    }

    @Test
    void formatDate_WithValidInstant_ReturnsFormattedDate() {
        Instant instant = Instant.parse("2024-01-15T10:00:00Z");

        String result = DataFormatter.formatDate(instant);

        assertTrue(result.matches("\\d{2}\\.\\d{2}\\.\\d{4}"));
    }

    @Test
    void formatDate_WithNonInstantValue_ReturnsEmptyString() {
        String invalidInput = "not an instant";

        String result = DataFormatter.formatDate(invalidInput);

        assertEquals("", result);
    }

    @Test
    void formatDateTime_WithValidInstant_ReturnsFormattedDateTime() {
        Instant instant = Instant.parse("2024-01-15T10:00:00Z");

        String result = DataFormatter.formatDateTime(instant);

        assertTrue(result.matches("\\d{2}\\.\\d{2}\\.\\d{4} \\d{2}:\\d{2}:\\d{2} \\w+"));
    }

    @Test
    void formatDateTime_WithNonInstantValue_ReturnsEmptyString() {
        String invalidInput = "not an instant";

        String result = DataFormatter.formatDateTime(invalidInput);

        assertEquals("", result);
    }

    @Test
    void formatEnum_WithValidEnum_ReturnsFormattedString() {
        TestEnum enumValue = TestEnum.FIRST_VALUE;

        String result = DataFormatter.formatEnum(enumValue);

        assertEquals("First Value", result);
    }

    @Test
    void formatEnum_WithNonEnumValue_ReturnsEmptyString() {
        String nonEnumValue = "not an enum";

        String result = DataFormatter.formatEnum(nonEnumValue);

        assertEquals("", result);
    }

    @Test
    void formatUsers_WithValidUserList_ReturnsFormattedString() {
        List<LightUserDto> users = Arrays.asList(
                createTestUser("John", "Doe"),
                createTestUser("Jane", "Smith")
        );

        String result = DataFormatter.formatUsers(users);

        assertEquals("John Doe and Jane Smith", result);
    }

    @Test
    void formatUsers_WithSingleUser_ReturnsFormattedString() {
        List<LightUserDto> users = Collections.singletonList(
                createTestUser("John", "Doe")
        );

        String result = DataFormatter.formatUsers(users);

        assertEquals("John Doe", result);
    }

    @Test
    void formatUsers_WithEmptyList_ReturnsEmptyString() {
        List<LightUserDto> emptyList = Collections.emptyList();

        String result = DataFormatter.formatUsers(emptyList);

        assertEquals("", result);
    }

    @Test
    void formatUsers_WithNonUserList_ReturnsEmptyString() {
        List<String> invalidList = Arrays.asList("Not", "A", "User");

        String result = DataFormatter.formatUsers(invalidList);

        assertEquals("", result);
    }

    @Test
    void formatUsers_WithNullInput_ReturnsEmptyString() {
        String result = DataFormatter.formatUsers(null);

        assertEquals("", result);
    }

    @ParameterizedTest
    @MethodSource("provideConstantNameTestCases")
    void formatConstantName_WithVariousInputs_ReturnsExpectedResults(String input, String expected) {
        String result = DataFormatter.formatConstantName(input);

        assertEquals(expected, result);
    }

    private static Stream<Arguments> provideConstantNameTestCases() {
        return Stream.of(
                Arguments.of("HELLO_WORLD", "Hello World"),
                Arguments.of("SIMPLE_TEXT", "Simple Text"),
                Arguments.of("SINGLE", "Single"),
                Arguments.of("", ""),
                Arguments.of("___", ""),
                Arguments.of("MULTIPLE_WORD_TEST", "Multiple Word Test"),
                Arguments.of("CAMEL_CASE_TEST", "Camel Case Test")
        );
    }

    @Test
    void formatConstantName_WithNonStringValue_ReturnsEmptyString() {
        Integer nonStringValue = 123;

        String result = DataFormatter.formatConstantName(nonStringValue);

        assertEquals("", result);
    }

    @ParameterizedTest
    @MethodSource("provideOptionalStringTestCases")
    void formatOptionalString_WithVariousInputs_ReturnsExpectedResults(String input, String expected) {
        String result = DataFormatter.formatOptionalString(input);

        assertEquals(expected, result);
    }

    private static Stream<Arguments> provideOptionalStringTestCases() {
        return Stream.of(
                Arguments.of("Valid Text", "Valid Text"),
                Arguments.of("", "Not available"),
                Arguments.of("   ", "Not available"),
                Arguments.of(null, "Not available")
        );
    }

    @Test
    void formatOptionalString_WithNonStringValue_ReturnsNotAvailable() {
        Integer nonStringValue = 123;

        String result = DataFormatter.formatOptionalString(nonStringValue);

        assertEquals("Not available", result);
    }

    @Test
    void formatSemester_WithValidInstant_ReturnsExpectedSemester() {
        Instant sixMonthsAgo = Instant.now().minus(182, ChronoUnit.DAYS);

        String result = DataFormatter.formatSemester(sixMonthsAgo);

        int semester = Integer.parseInt(result);
        assertTrue(semester >= 0 && semester <= 2, "Semester should be approximately 1");
    }

    @Test
    void formatSemester_WithNonInstantValue_ReturnsEmptyString() {
        String invalidInput = "not an instant";

        String result = DataFormatter.formatSemester(invalidInput);

        assertEquals("", result);
    }
}