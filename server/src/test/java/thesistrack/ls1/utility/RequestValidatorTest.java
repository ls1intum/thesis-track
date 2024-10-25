package thesistrack.ls1.utility;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import thesistrack.ls1.exception.request.ResourceInvalidParametersException;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;

class RequestValidatorTest {
    @ParameterizedTest
    @ValueSource(strings = {"test", "short", "exactly10c"})
    void validateStringMaxLength_WithValidString_ReturnsString(String input) {
        int maxLength = 10;
        assertEquals(input, RequestValidator.validateStringMaxLength(input, maxLength));
    }

    @Test
    void validateStringMaxLength_WithNullString_ThrowsException() {
        assertThrows(ResourceInvalidParametersException.class,
                () -> RequestValidator.validateStringMaxLength(null, 10)
        );
    }

    @ParameterizedTest
    @ValueSource(strings = {"This string is too long", "Another long string"})
    void validateStringMaxLength_WithTooLongString_ThrowsException(String input) {
        int maxLength = 10;
        assertThrows(ResourceInvalidParametersException.class,
                () -> RequestValidator.validateStringMaxLength(input, maxLength)
        );
    }

    @ParameterizedTest
    @ValueSource(strings = {"test", "short", "exactly10c"})
    void validateStringMaxLengthAllowNull_WithValidString_ReturnsString(String input) {
        int maxLength = 10;
        assertEquals(input, RequestValidator.validateStringMaxLengthAllowNull(input, maxLength));
    }

    @ParameterizedTest
    @NullAndEmptySource
    void validateStringMaxLengthAllowNull_WithNullOrEmptyString_ReturnsNull(String input) {
        assertNull(RequestValidator.validateStringMaxLengthAllowNull(input, 10));
    }

    @Test
    void validateStringSetItemMaxLength_WithValidSet_ReturnsSet() {
        Set<String> input = new HashSet<>(Set.of("test1", "test2", "test3"));
        int maxLength = 10;
        assertEquals(input, RequestValidator.validateStringSetItemMaxLength(input, maxLength));
    }

    @Test
    void validateStringSetItemMaxLength_WithNullSet_ThrowsException() {
        assertThrows(ResourceInvalidParametersException.class,
                () -> RequestValidator.validateStringSetItemMaxLength(null, 10)
        );
    }

    @Test
    void validateStringSetItemMaxLength_WithTooLongString_ThrowsException() {
        Set<String> input = new HashSet<>(Set.of("test1", "this string is too long"));
        int maxLength = 10;
        assertThrows(ResourceInvalidParametersException.class,
                () -> RequestValidator.validateStringSetItemMaxLength(input, maxLength)
        );
    }

    @Test
    void validateStringSetItemMaxLengthAllowNull_WithValidSet_ReturnsSet() {
        Set<String> input = new HashSet<>(Set.of("test1", "test2", "test3"));
        int maxLength = 10;
        assertEquals(input, RequestValidator.validateStringSetItemMaxLengthAllowNull(input, maxLength));
    }

    @Test
    void validateStringSetItemMaxLengthAllowNull_WithNullSet_ReturnsNull() {
        assertNull(RequestValidator.validateStringSetItemMaxLengthAllowNull(null, 10));
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "test@example.com",
            "test.name@example.com",
            "test+label@example.com",
            "test@subdomain.example.com"
    })
    void validateEmail_WithValidEmails_ReturnsEmail(String email) {
        assertEquals(email, RequestValidator.validateEmail(email));
    }

    @Test
    void validateEmail_WithNullEmail_ThrowsException() {
        assertThrows(ResourceInvalidParametersException.class,
                () -> RequestValidator.validateEmail(null)
        );
    }

    @ParameterizedTest
    @ValueSource(strings = {"not-an-email", "@missinguser.com"})
    void validateEmail_WithInvalidEmail_ThrowsException(String invalidEmail) {
        assertThrows(ResourceInvalidParametersException.class,
                () -> RequestValidator.validateEmail(invalidEmail)
        );
    }

    @Test
    void validateEmail_WithTooLongEmail_ThrowsException() {
        String longEmail = "a".repeat(190) + "@example.com";
        assertThrows(ResourceInvalidParametersException.class,
                () -> RequestValidator.validateEmail(longEmail)
        );
    }

    @ParameterizedTest
    @ValueSource(strings = {"test@example.com", "another@test.org"})
    void validateEmailAllowNull_WithValidEmail_ReturnsEmail(String email) {
        assertEquals(email, RequestValidator.validateEmailAllowNull(email));
    }

    @ParameterizedTest
    @NullAndEmptySource
    void validateEmailAllowNull_WithNullOrEmptyEmail_ReturnsNull(String email) {
        assertNull(RequestValidator.validateEmailAllowNull(email));
    }

    @ParameterizedTest
    @MethodSource("provideValidNotNullValues")
    <T> void validateNotNull_WithValidValue_ReturnsValue(T input) {
        assertEquals(input, RequestValidator.validateNotNull(input));
    }

    private static Stream<Arguments> provideValidNotNullValues() {
        return Stream.of(
            Arguments.of("test string"),
            Arguments.of(42),
            Arguments.of(new CustomTestObject("test"))
        );
    }

    @Test
    void validateNotNull_WithNullValue_ThrowsException() {
        assertThrows(ResourceInvalidParametersException.class,
                () -> RequestValidator.validateNotNull(null)
        );
    }

    private static class CustomTestObject {
        public final String value;

        CustomTestObject(String value) {
            this.value = value;
        }
    }
}
