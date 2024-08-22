package thesistrack.ls1.utility;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

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

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm:ss")
                .withZone(ZoneId.systemDefault());

        return formatter.format((Instant) time);
    }

    public static String formatEnum(Object value) {
        if (!value.getClass().isEnum()) {
            return "";
        }

        return ((Enum<?>) value).name();
    }
}
