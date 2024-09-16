package thesistrack.ls1.utility;

import thesistrack.ls1.dto.LightUserDto;
import thesistrack.ls1.entity.User;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class DataFormatter {
    public static String formatDate(Object time) {
        if (!(time instanceof Instant)) {
            return "";
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy")
                .withZone(ZoneId.systemDefault());

        return formatter.format((Instant) time);
    }

    public static String formatDateTime(Object time) {
        if (!(time instanceof Instant)) {
            return "";
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm:ss z")
                .withZone(ZoneId.systemDefault());

        return formatter.format((Instant) time);
    }

    public static String formatEnum(Object value) {
        if (!value.getClass().isEnum()) {
            return "";
        }

        return formatConstantName(((Enum<?>) value).name());
    }

    public static String formatUsers(Object value) {
        List<LightUserDto> users = new ArrayList<>();

        if (value instanceof List) {
            for (Object element : (List<?>) value) {
                if (element instanceof LightUserDto) {
                    users.add((LightUserDto) element);
                }
            }
        }

        return String.join(" and ", users.stream().map(user -> user.firstName() + " " + user.lastName()).toList());
    }

    public static String formatConstantName(Object value) {
        if (!(value instanceof String text)) {
            return "";
        }

        String[] words = text.split("_");
        StringBuilder capitalizedSentence = new StringBuilder();

        for (String word : words) {
            if (!word.isEmpty()) {
                capitalizedSentence.append(Character.toUpperCase(word.charAt(0)))
                        .append(word.substring(1).toLowerCase())
                        .append(" ");
            }
        }

        return capitalizedSentence.toString().trim();
    }

    public static String formatOptionalString(Object value) {
        if (!(value instanceof String text)) {
            return "Not available";
        }

        if (text.isBlank()) {
            return "Not available";
        }

        return text;
    }

    public static String formatSemester(Object value) {
        if (!(value instanceof Instant)) {
            return "";
        }

        long monthsBetween = ChronoUnit.DAYS.between((Instant) value, Instant.now());

        return String.valueOf(monthsBetween / (365 / 2));
    }
}
